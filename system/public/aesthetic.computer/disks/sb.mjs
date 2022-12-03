// sb, 22.12.03.00.38
// A session-server backend test piece.

async function boot({ resize, wipe, net }) {
  const sesh = await net.session();
  console.log("Sesh:", sesh);
  // Perform basic setup here.
  // resize(50, 20); // Add a custom resolution.
}

// 🎨 Paint (Executes every display frame)
function paint({ Camera, Form, TRI, form, painting: p }) {}

// ✒ Act (Runs once per user interaction)
function act({ event }) {
  // Respond to user input here.
}

// 🧮 Sim(ulate) (Runs once per logic frame (120fps locked)).
function sim($api) {
  // Crunch numbers outside of rendering here.
}

// 💗 Beat (Runs once per bpm, starting when the audio engine is activated.)
function beat($api) {
  // Make sound here.
}

// 👋 Leave (Runs once before the piece is unloaded)
function leave($api) {
  // Pass data to the next piece here.
}

// 📚 Library (Useful functions used throughout the piece)
// ...

export { boot, sim, paint, act, beat, leave };
