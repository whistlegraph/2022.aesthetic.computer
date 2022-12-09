// BGM, 22.12.07.12.56

// 🥾 Boot (Runs once before first paint and sim)
function boot({ resize, wipe, bgm, params }) {
  // Perform basic setup here.
  //resize(50, 20); // Add a custom resolution.
  params = params.map((str) => parseInt(str));
  bgm.set(params[0]);
  wipe(0, 0, 100);
}

// 🎨 Paint (Executes every display frame)
function paint({
  Camera,
  Form,
  TRI,
  form,
  line,
  wipe,
  bgm,
  ink,
  screen,
  painting: p,
  noise16DIGITPAIN,
}) {

  wipe(bgm.data.amplitude);

  // TODO: Radiate lines out from the center?
  let x = 0;
  bgm.data.sample.forEach((smp) => {
    ink(smp, 0, 0);
    line(x, screen.height, x, screen.height - smp);
    x += 1;
  });

  //noise16DIGITPAIN();
}

// PS... I enjoy using `destructuring` to access the APIs!
// This is the same as the above:
// function paint({ wipe }) {
//  wipe(255, 200, 200); // Draw a pink background
//  return false; // You can return false to draw only once!
// }

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
