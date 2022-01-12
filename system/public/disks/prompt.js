// Prompt, 2021.11.28.03.13
// This is for working on font rendering and making a global disk chooser.

// TODO: Make a basic prompt.
//       *CURRENT*
//       1. (Detour) fix frame-caching.
//       2. Add the ability to load any disk by name.
//       3. Add a global ability to quit any disk with the ESC key...?
//          or maybe add a prompt overlay or ":ex" commands a la vim?

import { font1 } from "./common/fonts.js"

let glyphs = {};

let text = "aesthetic.computer";

// 🥾 Boot (Runs once before first paint and sim)
function boot({ net: { preload } }) {
  // TODO: $api.type.write("Hello", {x: 0, y: 0, scale: {x: 1, y: 1}});

  // Preload all glyphs.
  Object.entries(font1).forEach(([glyph, location]) => {
    preload(`disks/drawings/font-1/${location}.json`).then((res) => {
      glyphs[glyph] = res;
    });
  });
}

let writeLetter;
let textChanged = false;

// 🎨 Paint (Runs once per display refresh rate)
function paint({ wipe, screen, ink }) {
  wipe(70, 50, 100);

  const cursor = { x: 0, y: 0 };
  const blockWidth = 6;
  const blockHeight = 10;

  const colWidth = 24;

  ink(0, 0, 255, 64).line(colWidth * blockWidth, 0, colWidth * blockWidth, screen.height);

  writeLetter = (letter) => {
    // Silently pass through if letter is not present.
    // TODO: Should this still print a section or not?
    if (letter === undefined) return;

    const top = 6;
    const left = 6;
    const scale = 1;
    const letterWidth = blockWidth * scale;
    const letterHeight = blockHeight * scale;
    const x = top + cursor.x * letterWidth;
    const y = left + cursor.y * letterHeight;

    ink(255, 255, 0, 20).box(x, y, ...letter.resolution.map((n) => n * scale));
    ink(255).draw(letter, x, y, scale);

    cursor.x = (cursor.x + 1) % colWidth;
    if (cursor.x === 0) cursor.y += 1;
  }

  for (const char of text) writeLetter(glyphs[char]);

  // Return false if we are yet to load every glyph.

  // *Special*
  // TODO: Why is this even here?
  // TODO: If return false happens once... then needsPaint() must be called
  //       in order for paint to be run again.

  // console.log("paint")
  // return !(Object.keys(glyphs).length === Object.keys(font1).length);
}

// ✒ Act (Runs once per user interaction)
function act({ event: e }) {
  if (e.is("keyboard:down") && e.key.length === 1) {
    text += e.key;
  }
}

// 📚 Library (Useful functions used throughout the program)
// ...

export { boot, paint, act };
