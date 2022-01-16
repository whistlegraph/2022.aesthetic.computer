// Tracker, ...
// A tool for composing, playing, and following along with 12 tones.
// Designed in collaboration w/ Oliver Laumann + Mija Milovic

// https://github.com/uNetworking/uWebSockets

// Add play button.

// TODO: Implement small and big square tools.
//       - Small Square (quiet)
//       - Big Square (loud)

// TODO: Code up a modal tool system for switching tools, then start implementing
//       them.

// TODO: Make a data structure and interaction to plot squares in the grid.

// TODO: Implement older tools:
//       - %: Add / toggle separator (single bpm notes into held notes)
//       - -(line)-: Background color change / all together.
//       - BPM: Adds a thick line to the grid and puts a new number on the right.

const { max, min } = Math;

// Data
const noteList = "abcdefghijkl";
const scoreData = []; // A 2 dimensional array for storing note info.

// Design
const colors = {
  notes: {
    a: [10, 115, 0], // [255, 0, 0] // Red
    b: [136, 255, 0],
    c: [115, 155, 0],
    d: [255, 163, 10],
    e: [115, 5, 0],
    f: [255, 0, 230],
    g: [100, 0, 115],
    h: [0, 5, 120],
    i: [0, 5, 250],
    j: [5, 120, 255],
    k: [10, 115, 115],
    l: [10, 250, 190],
  },
};
const style = {};

// Layout
let notes;

let score;
let scrolling = false;

const buttons = {};
let toolbar;
let currentTool = 0;

const { entries } = Object;
import { font1 } from "./common/fonts.js";
let glyphs = {};

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

  const toolCount = 2;
  toolbar = new Grid(3, 3, 1, toolCount, scale);

  // Add toolbar buttons.
  buttons.tools = {};
  buttons.tools.small = new Button(...toolbar.get(0, 0), toolbar.scale);
  buttons.tools.big = new Button(...toolbar.get(0, 1), toolbar.scale);

  // Preload all glyphs.
  entries(font1).forEach(([glyph, location]) => {
    preload(`disks/drawings/font-1/${location}.json`).then((res) => {
      glyphs[glyph] = res;
    });
  });
}

// 🎨 Paint (Runs once per display refresh rate)
function paint({ wipe, ink, layer, printLine, screen, num: { vec2 } }) {
  wipe(10); // Make the background black.

  // ✔ 1. Top Row: for knowing what notes each column represents, and
  //               being able to toggle columns.

  // Draw colored boxes according to notes grid, with overlaying letters.
  layer(1);

  [...noteList].forEach((note, i) => {
    ink(colors.notes[note]).box(...notes.get(i, 0), notes.scale);
  });

  ink(50, 120, 200, 128).printLine(
    noteList.toUpperCase(),
    glyphs,
    notes.box.x,
    notes.box.y,
    notes.scale,
    1,
    2
  );

  // ✔ 2. Composition: for placing and removing notes. Scrollable.
  layer(0);

  ink(255).grid(score);
  // wipe(r(255), r(255), r(255)).ink(0).line(0, 0, screen.width, screen.height);

  // Render scoreData

  layer(1);

  scoreData.forEach((row, x) => {
    const color = colors.notes[noteList[x]];
    row.forEach((column, y) => {
      if (column === "small") {
        ink(color).box(...score.center(x, y), score.scale / 3, "fill*center");
      } else if (column === "big") {
        ink(color).box(...score.center(x, y), score.scale / 2, "fill*center");
      }
    });
  });

  // ✔ 2a. Scrolling UI
  // TODO: Maybe the mouse cursor should default to a scrolling one when
  //       it is over the background?

  // ✔ 2b. Plus / Minus Rows
  ink(255, 0, 0, 50).box(buttons.minus.box);
  ink(0, 255, 0, 50).box(buttons.add.box);

  // ✔ 3. Toolbar
  ink(255, 255, 0).grid(toolbar);

  // Small square tool (Quiet)
  ink(0, 180, 0, 100).box(
    ...toolbar.center(0, 0),
    toolbar.scale / 3,
    "fill*center"
  );

  // Big square (Loud)
  ink(0, 180, 0, 100).box(
    ...toolbar.center(0, 1),
    toolbar.scale / 2,
    "fill*center"
  );

  // Current Tool Highlight
  ink(255, 255, 0, 80).box(
    ...toolbar.get(0, currentTool),
    toolbar.scale,
    "inline"
  );

  /*
  // % - Add / toggle separator (single bpm notes into held notes)
  ink(0, 180, 0, 100).draw(
    glyphs["%"],
    ...vec2.add([], toolbar.get(0, 2), [1, -1])
  );

  // - Line: background color change / all together.
  ink(0, 180, 0, 100).line(
    ...vec2.add([], toolbar.get(0, 3), [1, toolbar.scale / 2 - 1]),
    ...vec2.add([], toolbar.get(0, 3), [
      toolbar.scale - 2,
      toolbar.scale / 2 - 1,
    ])
  );

  // - BPM - Adds a thick line to the grid and puts a new number on the right.
  ink(0, 180, 0, 100).draw(
    glyphs["B"],
    ...vec2.add([], toolbar.get(0, 4), [2, 0])
  );
  */
}

// ✒ Act (Runs once per user interaction)
function act({ event: e }) {
  // Scrolling the score.
  if (e.is("touch")) {
    // Hit-test every region to make sure we are dragging on the background.
    scrolling =
      notes.scaled.misses(e) &&
      score.scaled.misses(e) &&
      toolbar.scaled.misses(e) &&
      buttons.minus.box.misses(e) &&
      buttons.add.box.misses(e);
  }
  if (e.is("draw") && scrolling) scrollY(e.delta.y);
  if (e.is("lift")) scrolling = false;

  // Switching tools.
  buttons.tools.small.act(e, () => (currentTool = 0));
  buttons.tools.big.act(e, () => (currentTool = 1));

  // Automatically grows a 2 dimensional array to represent the score..
  function affectScore(x, y, entry) {
    if (scoreData[x]?.[y] === entry) {
      scoreData[x][y] = undefined; // Clear an entry.
      // And the whole row if it is empty.
      if (scoreData[x].length === 0) scoreData[x] = undefined;
    } else {
      // Make this row if it doesn't exist.
      if (scoreData[x] === undefined) {
        scoreData[x] = [];
      }
      scoreData[x][y] = entry;
    }
  }

  // Affecting the score.
  if (e.is("touch")) {
    score.under(e, (sq) => {
      if (currentTool === 0) {
        affectScore(sq.gx, sq.gy, "small");
      } else if (currentTool === 1) {
        affectScore(sq.gx, sq.gy, "big");
      }
      console.log("Touched within score:", scoreData);
    });
  }

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
