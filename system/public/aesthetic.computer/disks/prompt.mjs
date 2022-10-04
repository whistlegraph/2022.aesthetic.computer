// Prompt, 2021.11.28.03.13
// This is for working on font rendering and making a global disk chooser.

// TODO: Make a basic prompt.
//       1. Prevent non-printable characters from causing an extra backspace.
//       2. The iOS app would add a small ESC or arrow overlay button in Swift
//          to make this work properly.

// TODO: Generate or pretty print docs (made from the APIs) inside this disk.
//       - This would allow people to have a reference while writing disks.

export const desc =
  "A global text prompt for accessing any aesthetic.computer piece.";

const { entries } = Object;
const { floor } = Math;

import { parse } from "../lib/parse.mjs";
import { font1 } from "./common/fonts.mjs";

let glyphs = {};

const motd =
  `hi i'm not quite there yet                      ` +
  `  but try                                       ` +
  `    typing...                                   ` +
  `                                                ` +
  `bleep, bubble, line, rect,                      ` +
  `melody, tracker, metronome,                     ` +
  `microphone, wg idni,                            ` +
  `@niki/spinline, @artur/i,                       ` +
  `@reas/bland                                     ` +
  `                                                ` +
  `mail@aesthetic.computer                         `;

let input = motd;
let blink; // block cursor blink timer
let flash; // error flash timer
let showBlink = true;
let showFlash = false;
let flashColor = [];
let flashPresent = false;
let canType = false;

// 🥾 Boot (Runs once before first paint and sim)
function boot({
  cursor,
  net: { preload },
  pieceCount,
  glaze,
  resize,
  density,
  screen,
}) {
  glaze({ on: true }); // TODO: Every glaze triggers `frame` in `disk`, this could be optimized. 2022.04.24.04.25

  // Preload all glyphs.
  entries(font1).forEach(([glyph, location]) => {
    preload(`aesthetic.computer/disks/drawings/font-1/${location}.json`).then(
      (res) => {
        glyphs[glyph] = res;
      }
    );
  });

  if (pieceCount > 0) {
    canType = true;
    input = "";
  }
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
        flashPresent = false;
        needsPaint();
      },
      autoFlip: true,
    });

  if (canType) blink.step();
  if (flashPresent) flash.step();
}

// 🎨 Paint (Runs once per display refresh rate)
function paint({ box, screen, wipe, ink, paste, store }) {
  //console.log("paint");

  if (store["painting"]) {
    paste(store["painting"]);
    ink(70, 50, 100, 127).box(screen); // Backdrop
    //wipe(70, 50, 100);
  } else {
    wipe(70, 50, 100);
  }

  const prompt = new Prompt(6, 6);

  // Print `text` to the prompt one letter at time.
  for (const char of input) {
    //ink(255, 255, 0, 20).box(prompt.pos); // Paint a highlight background.
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

  // Trigger a red or green screen flash with a timer.
  if (showFlash) ink(flashColor).box(0, 0, screen.width, screen.height);

  // Return false if we are yet to load every glyph.
  // TODO: This causes some extra paints on startup.
  return !(Object.keys(glyphs).length === Object.keys(font1).length);
}

let promptHistoryDepth = 0;

// ✒ Act (Runs once per user interaction, after boot.)
async function act({ event: e, needsPaint, load, store, download }) {
  //needsPaint(); // Why do things get jittery when this is not here? (Windows, Chrome) 2022.01.31.01.14

  //if (e.is("move")) needsPaint();

  if (e.is("keyboard:down")) {
    if (canType === false) {
      canType = true;
      input = "";
    }

    // Printable keys.
    else if (e.key.length === 1 && e.ctrl === false) input += e.key;
    // Other keys.
    else {
      if (e.key === "Backspace") input = input.slice(0, -1);

      const key = "prompt:history";

      if (e.key === "Enter") {
        // Make a history stack if one doesn't exist already.
        store[key] = store[key] || [];

        // Push input to a history stack, avoiding repeats.
        if (store[key][0] !== input) store[key].unshift(input);

        console.log("📚 Stored history:", store[key]);

        store.persist(key); // Persist the history stack across tabs.

        // 🍎 In-prompt commands...
        if (input === "dl" || input === "download") {
          if (store["painting"]) {
            download("image.png", store["painting"]);
            // Show a green flash if we succesfully download the file.
            flashColor = [0, 255, 0];
          } else {
            flashColor = [255, 0, 0]; // Show a red flash otherwise.
          }
          flashPresent = true;
          showFlash = true;
          input = "";
          needsPaint();
        } else if (input === "painting:reset") {
          const deleted = await store.delete("painting", "local:db");

          if (deleted) {
            flashColor = [0, 0, 255]; // Blue for succesful deletion.
          } else {
            flashColor = [255, 0, 0]; // Red if delete failed.
          }

          flashPresent = true;
          showFlash = true;
          input = "";
          needsPaint();
        } else {
          // 🟠 Local and remote pieces...
          load(parse(input.replaceAll(" ", "~"))); // Execute the current command.
        }
      }

      if (e.key === "Escape") input = "";

      if (e.key === "ArrowUp") {
        const promptHistory = (await store.retrieve(key)) || [""];
        input = promptHistory[promptHistoryDepth];
        promptHistoryDepth = (promptHistoryDepth + 1) % promptHistory.length;
      }

      if (e.key === "ArrowDown") {
        const promptHistory = (await store.retrieve(key)) || [""];
        input = promptHistory[promptHistoryDepth];
        promptHistoryDepth -= 1;
        if (promptHistoryDepth < 0)
          promptHistoryDepth = promptHistory.length - 1;
      }
    }

    blink.flip(true);
  }

  if (e.is("typing-input-ready")) {
    canType = true;
    input = "";
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
    input = motd;
    needsPaint();
  }

  if (e.is("load-error")) {
    flashPresent = true;
    showFlash = true;
    flashColor = [255, 0, 0];
    input = "";
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
