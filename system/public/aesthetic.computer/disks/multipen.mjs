// Multipen, 22.09.04.16.18 
// A basic example of multi-touch / multiple tracked
// cursors from one client.

// TODO
// - [] Draw a point for one cursor, and a line for two.

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

// 🎨 Paint (Executes every display frame)
function paint({ wipe, ink, pen }) {
  wipe(128); // Draw a gray background


  ink(0).line(0, 0, pen.x || 0, pen.y || 0);
  console.log(pen.x, pen.y);
}

// ✒ Act (Runs once per user interaction)
function act({ event }) {

  if (event)
  console.log(event);
  // console.log(event);
}

// 💗 Beat (Runs once per bpm, starting when the audio engine is activated.)
function beat($api) {
  // TODO: Play a sound here!
}

// 📚 Library (Useful functions used throughout the piece)
// ...

export { boot, sim, paint, act, beat };
