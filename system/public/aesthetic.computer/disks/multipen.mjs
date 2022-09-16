// Multipen, 22.09.04.16.18
// A basic example of multi-touch / multiple tracked
// cursors from one client.

// TODO
// - [x] Draw a point for one cursor, and a line for two.

// 🥾 Boot (Runs once before first paint and sim)
function boot({ resize }) {
  // TODO: Runs only once!
  // resize(50, 20);
}

// 🧮 Sim(ulate) (Runs once per logic frame (120fps locked)).
function sim($api) {
  // TODO: Move a ball here!
  //console.log($api);
}

// TODO: Eliminate the need for sx and sy here.
let color = [0];

// 🎨 Paint (Executes every display frame)
function paint({ wipe, pen, pens, ink, circle }) {
  // Draw a gray background and a line from the 1st -> 2nd pen / finger.

  // TODO: How to know if no more fingers are down here?
  wipe(128).ink(color).line(pens(1).x, pens(1).y, pens(2).x, pens(2).y);
  ink(0, 0, 255).circle(pens(1).x, pens(1).y, 16);
  ink(0, 255, 255).circle(pens(2).x, pens(2).y, 16);
}

// ✒ Act (Runs once per user interaction)
function act({ event: e }) {
  // The "2" allows us to filter for the 2nd pointer / finger,
  // toggling the color of the connecting line.
  if (e.is("touch:2")) color = [255, 0, 0];
  if (e.is("lift:2")) color = [0];
}

// 💗 Beat (Runs once per bpm, starting when the audio engine is activated.)
function beat($api) {
  // TODO: Play a sound here!
}

// 📚 Library (Useful functions used throughout the piece)
// ...

export { boot, sim, paint, act, beat };
