// Gap Density, 22.09.29.10.11 
// This piece is a test to make sure `resize`, `gap`, and `density` all work
// synchronously.

// 🥾 Boot (Runs once before first paint and sim)
function boot({ resize, wipe, screen, ink, gap}) {
  wipe(255, 0, 0);
  for(let i = 8; i < 64; i += 8) {
    resize(i);
    ink(255, 0, 0, 10).box(0, 0, screen.width, screen.height);
    ink(0, 255, 0).line(screen.width - 1, 0, 0, screen.height - 1);
    ink(0, 0, 255).line(0, 0, screen.width - 1, screen.height - 1);
  }
}

// 🧮 Sim(ulate) (Runs once per logic frame (120fps locked)).
function sim($api) {
  // TODO: Move a ball here!
  //console.log($api);
}

// 🎨 Paint (Executes every display frame)
function paint({ wipe, gap, paintCount, screen }) {
  return false; // Only once.
}

// ✒ Act (Runs once per user interaction)
function act({ event }) {}

// 💗 Beat (Runs once per bpm, starting when the audio engine is activated.)
function beat($api) {
  // TODO: Play a sound here!
}

// 📚 Library (Useful functions used throughout the piece)
// ...

export { boot, sim, paint, act, beat };
