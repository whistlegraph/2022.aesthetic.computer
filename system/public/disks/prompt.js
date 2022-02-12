// Prompt, 2021.11.28.03.13
// This is for working on font rendering and making a global disk chooser.

// TODO: Fix mouse movement not working in prompt / other pieces. (due to DirtyBox)

// TODO: Make a basic prompt.
//       1. Prevent non-printable characters from causing an extra backspace.
//       2. The iOS app would add a small ESC or arrow overlay button in Swift
//          to make this work properly.

// TODO: Generate or pretty print docs (made from the APIs) inside this disk.
//       - This would allow people to have a reference while writing disks.

const { entries } = Object;
const { floor } = Math;

import { font1 } from "./common/fonts.js";

let glyphs = {};
let text = "aesthetic.computer";

let blink; // block cursor blink timer
let flash; // error flash timer
let showBlink = true;
let showFlash = false;
let errorPresent = false;
let canType = false;

// 🥾 Boot (Runs once before first paint and sim)
function boot({ cursor, net: { preload }, pieceCount, glaze }) {
  // Preload all glyphs.
  entries(font1).forEach(([glyph, location]) => {
    preload(`disks/drawings/font-1/${location}.json`).then((res) => {
      glyphs[glyph] = res;
    });
  });

  if (pieceCount > 0) {
    canType = true;
    text = "";
  }

  // Enable glaze.
  glaze({ on: true });
}

// 🧮 Sim(ulate) (Runs once per logic frame (120fps locked)).
function sim({ seconds, needsPaint, gizmo: { Hourglass } }) {
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

  if (canType) blink.step();
  if (errorPresent) flash.step();
}

// 🎨 Paint (Runs once per display refresh rate)
function paint({ wipe, screen, ink }) {
  //console.log("paint");

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

  if (canType) {
    ink(0, 0, 255, 64).line(prompt.gutter, 0, prompt.gutter, screen.height); // Ruler
    ink(127).box(0, 0, screen.width, screen.height, "inline"); // Focus
    if (showBlink) ink(200, 30, 100).box(prompt.pos); // Draw blinking cursor.
  }

  // Trigger a red screen flash with a timer.
  if (showFlash) ink(255, 0, 0).box(0, 0, screen.width, screen.height);

  // Return false if we are yet to load every glyph.
  // TODO: This causes some extra paints on startup.
  return !(Object.keys(glyphs).length === Object.keys(font1).length);
}

// ✒ Act (Runs once per user interaction, after boot.)
function act({ event: e, needsPaint, load }) {
  //needsPaint(); // Why do things get jittery when this is not here? (Windows, Chrome) 2022.01.31.01.14

  if (e.is("move")) {
    needsPaint();
  }

  if (e.is("keyboard:down")) {
    if (canType === false) {
      canType = true;
      text = "";
    }

    // Printable keys.
    else if (e.key.length === 1 && e.ctrl === false) text += e.key;
    // Other keys.
    else {
      if (e.key === "Backspace") text = text.slice(0, -1);

      if (e.key === "Enter") {
        // TODO: Should I allow named parameters when running disks?
        //       What about switches?

        // Tokenize text.
        const tokens = text.split(" ");
        const params = tokens.slice(1);
        load(
          "disks/" + tokens[0],
          undefined,
          params.length ? params : undefined
        );
      }

      if (e.key === "Escape") {
        text = "";
      }
    }

    blink.flip(true);
  }

  if (e.is("typing-input-ready")) {
    canType = true;
    text = "";
    blink.flip(true);
  }

  // TODO: Do I still need these events?
  // if (e.is("keyboard:open")) blink.flip(true);

  if (e.is("keyboard:close")) {
    canType = false;
    needsPaint();
  }

  if (e.is("defocus")) {
    canType = false;
    needsPaint();
  }

  if (e.is("load-error")) {
    errorPresent = true;
    showFlash = true;
    text = "";
    needsPaint();
  }
}

// 📚 Library (Useful classes & functions used throughout the piece)

// TODO: Refactor this into "Text" so it can be used in Tracker

class Prompt {
  top = 0;
  left = 0;

  scale = 1;
  blockWidth = 6;
  blockHeight = 10;
  letterWidth = this.blockWidth * this.scale;
  letterHeight = this.blockHeight * this.scale;

  colWidth = 48; // Maximum width of each line before wrapping.

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
