// Prompt, 2021.11.28.03.13
// This is for working on font rendering and making a global disk chooser.

// TODO: Make a basic prompt.
//       *CURRENT*
//       1. Add a global ability to quit any disk with the ESC key...?
//          or maybe add a prompt overlay or ":ex" commands a la vim?

// Developer service:
// Generate docs (made from the APIs) inside this disk.

import { font1 } from "./common/fonts.js";
const { entries } = Object;
const { floor } = Math;

let glyphs = {};
let writeLetter;
// let text = "aesthetic.computer";
let text = "";

// 🥾 Boot (Runs once before first paint and sim)
function boot({ net: { preload } }) {
  // Preload all glyphs.
  entries(font1).forEach(([glyph, location]) => {
    preload(`disks/drawings/font-1/${location}.json`).then((res) => {
      glyphs[glyph] = res;
    });
  });
}

const blink = { paint: true, sims: 0 };
const focus = { paint: false };

// 🧮 Sim(ulate) (Runs once per logic frame (120fps locked)).
function sim({ seconds, needsPaint, inFocus }) {
  if (blink.sims >= seconds(0.75)) {
    blink.sims = 0;
    blink.paint = !blink.paint;
    if (inFocus) needsPaint();
  }
  blink.sims += 1;
}

// 🎨 Paint (Runs once per display refresh rate)
function paint({ wipe, screen, ink, num: { multiply }, inFocus }) {
  const cursor = { x: 0, y: 0 };
  const blockWidth = 6;
  const blockHeight = 10;
  const colWidth = 24;

  const gutter = (colWidth + 1) * blockWidth;

  wipe(70, 50, 100); // Backdrop

  if (inFocus) {
    ink(0, 0, 255, 64).line(gutter, 0, gutter, screen.height); // Ruler
    ink(127).box(0, 0, screen.width, screen.height, "inline"); // Focus
  }

  const top = 6;
  const left = 6;
  const scale = 1;
  const letterWidth = blockWidth * scale;
  const letterHeight = blockHeight * scale;

  writeLetter = (letter) => {
    // TODO: Write an X character if letter is not present rather than returning.
    const x = top + cursor.x * letterWidth;
    const y = left + cursor.y * letterHeight;

    // Silently pass through if letter is not present.
    // TODO: Should this still print a section or not?
    if (letter === undefined) return;

    //ink(255, 255, 0, 20).box(x, y, ...letter.resolution.map((n) => n * scale));
    // TODO: How to write...
    ink(255, 255, 0, 20).box(x, y, ...multiply(letter.resolution, scale));
    ink(255, 100).draw(letter, x, y, scale);

    cursor.x = (cursor.x + 1) % colWidth;
    if (cursor.x === 0) cursor.y += 1;
  };

  // Write all letters.
  for (const char of text) writeLetter(glyphs[char]); // Add space to glyphs?

  // Draw blinking cursor.
  if (inFocus && blink.paint) {
    const x = top + cursor.x * letterWidth;
    const y = left + cursor.y * letterHeight;
    ink(200, 30, 100).box(x, y, letterWidth, letterHeight);
  }

  // Return false if we are yet to load every glyph.
  return !(Object.keys(glyphs).length === Object.keys(font1).length);
}

// ✒ Act (Runs once per user interaction)
function act({ event: e, needsPaint, load }) {
  if (e.is("keyboard:down")) {
    // Printable keys.
    if (e.key.length === 1) text += e.key;
    else {
      // Other keys.
      console.log("Key:", e.key);
      if (e.key === "Backspace") {
        text = text.slice(0, -1);
      }

      if (e.key === "Enter") {
        console.log(text);
        load("disks/" + text);
      }
    }
    blink.sims = 0;
    blink.paint = true;
    needsPaint();
  }

  if (e.is("focus")) {
    focus.paint = true;
    blink.sims = 0;
    blink.paint = true;
    needsPaint();
  }

  if (e.is("defocus")) {
    focus.paint = false;
    needsPaint();
  }
}

// 📚 Library (Useful functions used throughout the program)
// ...

export { boot, sim, paint, act };
