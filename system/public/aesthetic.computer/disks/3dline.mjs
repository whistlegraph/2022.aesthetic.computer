// 3D Line, 22.10.05.11.01 
// A test for developing software rasterized 3D lines.

let cam, tri;

// 🥾 Boot (Runs once before first paint and sim)
function boot({ resize, painting, Form, Camera, TRIANGLE, screen }) {
  // Perform basic setup here.
  // resize(50, 20); // Add a custom resolution. 
  //resize(320, 240);

  tri = new Form(
    TRIANGLE,
    { texture: painting(16, 16, (p) => p.wipe(64)) },
    [0, 0, 3], // x, y, z
    [0, 0, 0], // rotation
    [1, 1, 1], // scale
  );

  cam = new Camera(80); // fov
  cam.z = 8;
}

// 🧮 Sim(ulate) (Runs once per logic frame (120fps locked)).
function sim($api) {
  tri.rotation[1] = (tri.rotation[1] + 1) % 360; // Rotate Y axis.
  // console.log("Triangle Y Rotation:", tri.rotation[1]);
}

// 🎨 Paint (Executes every display frame)
function paint($api) {
  $api.wipe(0); // Draw a black background. (RGBA)
  $api.form(tri, cam);
  //return false; // You can return false to draw only once!
}

// ✒ Act (Runs once per user interaction)
function act({ event }) {
  if (event.is("keyboard:down:w")) {
    cam.z -= 1;
  }
  if (event.is("keyboard:down:s")) {
    cam.z += 1;
  }
  // Respond to user input here.
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