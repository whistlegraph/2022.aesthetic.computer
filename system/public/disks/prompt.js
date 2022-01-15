// Prompt, 2021.11.28.03.13
// This is for working on font rendering and making a global disk chooser.

// TODO: Make a basic prompt.
//       1. Add mobile keyboard open and close and a version of the ESC key
//          for mobile users.
//          - Add input tag buffer with window.event that can get called via
//            a message? Or track changes in input and message them to the prompt?
//       2. Generate docs (made from the APIs) inside this disk.
//          - This would allow people to have a reference while writing disks.

const { entries } = Object;
const { floor } = Math;

import { font1 } from "./common/fonts.js";

let glyphs = {};
let text = ""; //"aesthetic.computer";

let blink; // block cursor blink timer
let flash; // error flash timer
let showBlink = true;
let showFlash = false;
let errorPresent = false;

// 🥾 Boot (Runs once before first paint and sim)
function boot({ size, screen, net: { preload } }) {
  // Preload all glyphs.
  entries(font1).forEach(([glyph, location]) => {
    preload(`disks/drawings/font-1/${location}.json`).then((res) => {
      glyphs[glyph] = res;
    });
  });
}

// 🧮 Sim(ulate) (Runs once per logic frame (120fps locked)).
function sim({ seconds, inFocus, needsPaint, gizmo: { Hourglass } }) {
  // Setup hourglasses for cursor blinking and a error flash.
  blink =
    blink ||
    new Hourglass(seconds(0.75), {
      flipped: (showBlinkOverride) => {
        if (showBlinkOverride !== undefined) showBlink = showBlinkOverride;
        else showBlink = !showBlink;
        needsPaint();
      },
      autoFlip: true,
    });

  flash =
    flash ||
    new Hourglass(seconds(0.1), {
      flipped: () => {
        showFlash = false;
        errorPresent = false;
        needsPaint();
      },
      autoFlip: true,
    });

  if (inFocus) blink.step();
  if (errorPresent) flash.step();
}

// 🎨 Paint (Runs once per display refresh rate)
function paint({ wipe, screen, ink, inFocus }) {
  wipe(70, 50, 100); // Backdrop

  const prompt = new Prompt(6, 6);

  // Print `text` to the prompt one letter at time.
  for (const char of text) {
    ink(255, 255, 0, 20).box(prompt.pos); // Paint a highlight background.
    // And the letter if it is present.
    const pic = glyphs[char];
    if (pic) ink(255, 100).draw(pic, prompt.pos.x, prompt.pos.y, prompt.scale);
    // Only move the cursor forward if we matched a character or typed a space.
    if (pic || char === " ") prompt.forward();
  }

  if (inFocus) {
    ink(0, 0, 255, 64).line(prompt.gutter, 0, prompt.gutter, screen.height); // Ruler
    ink(127).box(0, 0, screen.width, screen.height, "inline"); // Focus
    if (showBlink) ink(200, 30, 100).box(prompt.pos); // Draw blinking cursor.
  }

  // Trigger a red screen flash with a timer.
  if (showFlash) ink(255, 0, 0).box(0, 0, screen.width, screen.height);

  // Return false if we are yet to load every glyph.
  return !(Object.keys(glyphs).length === Object.keys(font1).length);
}

// ✒ Act (Runs once per user interaction)
function act({ event: e, needsPaint, load }) {
  if (e.is("keyboard:down")) {
    // Printable keys.
    if (e.key.length === 1) text += e.key;
    // Other keys.
    else {
      if (e.key === "Backspace") text = text.slice(0, -1);
      if (e.key === "Enter") load("disks/" + text);

      console.log("Key down:", e.key);
    }

    blink.flip(true);
  }

  if (e.is("focus")) blink.flip(true);
  if (e.is("defocus")) needsPaint();

  if (e.is("load-error")) {
    errorPresent = true;
    showFlash = true;
    needsPaint();
  }
}

// 📚 Library (Useful classes & functions used throughout the piece)
class Prompt {
  top = 0;
  left = 0;

  scale = 1;
  blockWidth = 6;
  blockHeight = 10;
  letterWidth = this.blockWidth * this.scale;
  letterHeight = this.blockHeight * this.scale;

  colWidth = 24; // Maximum width of each line before wrapping.

  cursor = { x: 0, y: 0 };

  gutter = (this.colWidth + 1) * this.blockWidth;

  constructor(top = 0, left = 0) {
    this.top = top;
    this.left = left;
  }

  get pos() {
    const x = this.top + this.cursor.x * this.letterWidth;
    const y = this.left + this.cursor.y * this.letterHeight;
    return { x, y, w: this.letterWidth, h: this.letterHeight };
  }

  forward() {
    this.cursor.x = (this.cursor.x + 1) % this.colWidth;
    if (this.cursor.x === 0) this.cursor.y += 1;
  }
}

export { boot, sim, paint, act };
