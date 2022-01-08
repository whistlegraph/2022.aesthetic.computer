// Tracker,  ...
// A tool for composing, playing, and following along with 12 tones.
// Designed in collaboration w/ Oliver Laumann + Mija Milovic

// https://github.com/uNetworking/uWebSockets

// *Current*
// TODO: Make drawings for the toolbar and button symbols and set them.
//       +-
//       ABCDEFGHIJKL, 0-9
//       * Toolbar Contents*
//       - Small Square (quiet)
//       - Big Square (loud)
//       - % - Add / toggle separator (single bpm notes into held notes)
//       - -- Line: background color change / all together.
//       - BPM - Adds a thick line to the grid and puts a new number on the right.

// TODO: Code up a modal tool system for switching tools, then start implementing
//       them.

// TODO: Make a data structure and interaction to plot squares in the grid.

// TODO: Preload and add all these symbols.

const { max, min } = Math;

// Design
const colors = {
  notes: {
    a: [10], // [255, 0, 0] // Red
    b: [30],
    c: [50],
    d: [70],
    e: [90],
    f: [110],
    g: [130],
    h: [150],
    i: [170],
    j: [200],
    k: [230],
    l: [255],
  },
};
const style = {};

// Layout
let notes;
let score;
const buttons = {};
let toolbar;

// Typography
let numbers = [];

// 🥾 Boot (Runs once before first paint and sim)
function boot({
  resize,
  geo: { Box, Grid },
  ui: { Button },
  net: { preload },
}) {
  resize(160, 90); // 16x9
  const scale = 9;
  style.addMinusHeight = scale;

  notes = new Grid(scale * 3, 0, 12, 1, scale);
  score = new Grid(scale * 3, scale, 12, 1, scale);

  buttons.minus = new Button(0, 0, score.scaled.w / 2, style.addMinusHeight);
  buttons.add = new Button(buttons.minus.box);

  addMinusLayout();

  toolbar = new Grid(3, 3, 1, 6, scale);

  // Preload 0-9 symbols.
  // TODO: How to know when every preload finishes? 2021.12.16.18.55
  // TODO: Move these drawings into a system folder?
  [
    "0 - 2021.12.16.18.28.06",
    "1 - 2021.12.16.17.56.44",
    "2 - 2021.12.16.17.59.01",
    "3 - 2021.12.16.17.59.52",
    "4 - 2021.12.16.18.00.56",
    "5 - 2021.12.16.18.01.27",
    "6 - 2021.12.16.18.02.26",
    "7 - 2021.12.16.18.02.50",
    "8 - 2021.12.16.18.03.31",
    "9 - 2021.12.16.18.04.15",
  ].forEach((number, i) => {
    preload(`disks/drawings/numbers/${number}.json`).then((r) => {
      numbers[i] = r;
    });
  });
}

// 🎨 Paint (Runs once per display refresh rate)
function paint({ wipe, ink, layer, screen, resize }) {
  resize(140, 80);
  wipe(0); // Make the background black.

  // 0. *TEST* Write a test row of numbers.
  // TODO: Extract this into a "write" or "print" method for graph. 2021.12.16.18.55
  {
    const startX = 3;
    const width = 6;
    const scale = 2;
    const startY = screen.height - 11 * scale;

    numbers.forEach((number, i) => {
      ink(255).draw(number, startX + width * scale * i, startY, scale);
    });
  }

  // ✔ 1. Top Row: for knowing what notes each column represents, and
  //             being able to toggle columns.

  // Draw colored boxes according to notes grid, with letters overlayed.
  layer(1);
  [..."abcdefghijkl"].forEach((note, i) => {
    ink(colors.notes[note]).box(...notes.get(i, 0), notes.scale);
  });

  // ✔ 2. Composition: for placing and removing notes. Scrollable.
  layer(0);

  ink(255).grid(score);
  // wipe(r(255), r(255), r(255)).ink(0).line(0, 0, screen.width, screen.height);

  // ✔ 2a. Scrolling UI
  // TODO: Maybe the mouse cursor should default to a scrolling one when
  //       it is over the background?

  // ✔ 2b. Plus / Minus Rows
  ink(255, 0, 0, 50).box(buttons.minus.box);
  ink(0, 255, 0, 50).box(buttons.add.box);

  // ✔ 3. Toolbar
  ink(255, 255, 0).grid(toolbar);

  // Toolbar Contents:
  // - Small Square (quiet)
  // - Big Square (loud)
  // - % - Add / toggle separator (single bpm notes into held notes)
  // - -- Line: background color change / all together.
  // - BPM - Adds a thick line to the grid and puts a new number on the right.
}

let scrolling = false;

// ✒ Act (Runs once per user interaction)
function act({ event: e }) {
  // Scrolling the score.
  if (e.is("touch")) {
    // Hit-test every `Box` to make sure we are dragging on the background.
    scrolling =
      notes.scaled.misses(e) &&
      score.scaled.misses(e) &&
      toolbar.scaled.misses(e) &&
      buttons.minus.box.misses(e) &&
      buttons.add.box.misses(e);
  }
  if (e.is("draw") && scrolling) scrollY(e.delta.y);
  if (e.is("lift")) scrolling = false;

  // Adding and removing rows from the score.
  buttons.add.act(e, () => {
    score.box.h += 1;
    addMinusLayout();
  });

  buttons.minus.act(e, () => {
    score.box.h = max(score.box.h - 1, 1);
    if (score.scaled.bottom - style.addMinusHeight <= notes.scaled.bottom) {
      score.box.y = notes.scaled.bottom - (score.scaled.h - score.scale);
    }
    addMinusLayout();
  });
}

// 🧮 Simulate (Runs once per logic frame (120fps)).
// function sim($api) {
// TODO: Move a ball here!
// }

// 💗 Beat (Runs once per bpm)
function beat($api) {
  // TODO: Play a sound here!
}

// 📚 Library (Useful functions used throughout the program)
function scrollY(y) {
  score.box.y = min(notes.scale, score.box.y + y);
  const scrollHeight = score.scaled.h - score.scale - style.addMinusHeight;
  if (score.box.y < -scrollHeight) score.box.y = -scrollHeight;
  addMinusLayout();
}

// Positions the `add` and `minus` buttons in relationship to the score.
function addMinusLayout() {
  buttons.minus.box.x = score.scaled.x;
  buttons.minus.box.y = score.scaled.bottom;
  buttons.add.box.x = score.scaled.x + score.scaled.w / 2;
  buttons.add.box.y = score.scaled.bottom;
}

export { boot, paint, act, beat };
