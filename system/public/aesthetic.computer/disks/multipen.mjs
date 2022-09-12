// Multipen, 22.09.04.16.18
// A basic example of multi-touch / multiple tracked
// cursors from one client.

// TODO
// - [?] Draw a point for one cursor, and a line for two.

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

let sx;
let sy;
let color = [0];

// 🎨 Paint (Executes every display frame)
function paint({ wipe, pen }) {
  // Draw a gray background and a line from the 1st -> 2nd pen / finger.
  wipe(128).ink(color).line(pen.x, pen.y, sx, sy);

  // Ideally the API on `pen` would be like... 22.09.12.04.30
  //wipe(128).ink(0).line(pen?.second.x, pen?.second.y, pen.x, pen.y);
}

// ✒ Act (Runs once per user interaction)
function act({ event: e }) {
  if (e.is("touch") && !e.isPrimary) {
    console.log("Non-primary touch:", e.index, e.id);
  }

  // TODO: Should e.index be e.pointer or e.pointerCount? 22.09.12.04.55
  if (e.is("touch") && e.index === 1) {
    sx = e.x;
    sy = e.y;
    color = [255, 0, 0];
    console.log("Secondary touch:", e.index, e.id);
  }

  if (e.is("draw") && e.index === 1) {
    sx = e.x;
    sy = e.y;
    console.log("Secondary draw:", e.index, e.id);
  }

  // TODO: How to actually get touch information here?

  // console.log(event);
}

// 💗 Beat (Runs once per bpm, starting when the audio engine is activated.)
function beat($api) {
  // TODO: Play a sound here!
}

// 📚 Library (Useful functions used throughout the piece)
// ...

export { boot, sim, paint, act, beat };
