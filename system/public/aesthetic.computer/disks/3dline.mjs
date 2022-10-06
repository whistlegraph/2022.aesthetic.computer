// 3D Line, 22.10.05.11.01
// A test for developing software rasterized 3D lines.

let cam, tri, l3d, dolly;

// 🥾 Boot (Runs once before first paint and sim)
function boot({ resize, painting, Form, Camera, TRIANGLE, SEGMENT, screen }) {
  // Perform basic setup here.
  // resize(50, 20); // Add a custom resolution.
  //resize(320, 240);

  tri = new Form(
    TRIANGLE,
    { texture: painting(16, 16, (p) => p.wipe(0, 0, 255, 150)) },
    [0, 0, 5], // x, y, z
    [0, 0, 0], // rotation
    [1, 1, 1] // scale
  );

  l3d = new Form(
    SEGMENT,
    [0, 0, 3], // x, y, z
    [0, 0, 0], // rotation
    [1, 1, 1] // scale
  );

  cam = new Camera(80); // camera with fov
  cam.z = 1;

  dolly = new Dolly(); // moves the camera 
}

// 🧮 Sim(ulate) (Runs once per logic frame (120fps locked)).
function sim($api) {

  // Object rotation.
  //tri.rotation[1] = (tri.rotation[1] - 0.5) % 360; // Rotate Y axis.
  //l3d.rotation[1] = (l3d.rotation[1] + 1.5) % 360; // Rotate Y axis.
  //l3d.rotation[0] = (l3d.rotation[0] - 0.1) % 360; // Rotate Y axis.
  //l3d.rotation[2] = (l3d.rotation[2] + 0.2) % 360; // Rotate Y axis.

  // Camera controls.
  dolly.sim();
  cam.x += dolly.xVel;
  cam.y += dolly.yVel;
  cam.z += dolly.zVel;

  if (wHeld) dolly.push({ z: -0.001 });
  if (sHeld) dolly.push({ z: 0.001 });
  if (aHeld) dolly.push({ x: 0.001 });
  if (dHeld) dolly.push({ x: -0.001 });

}

// 🎨 Paint (Executes every display frame)
function paint({ ink, screen, num: { randIntRange } }) {
  ink(0, 30).box(0, 0, screen.width, screen.height).form(l3d, cam);
}

class Dolly {
  xVel = 0;
  yVel = 0;
  zVel = 0;
  dec = 0.90;

  constructor() {
  }

  sim () {
    this.xVel *= this.dec;
    this.yVel *= this.dec;
    this.zVel *= this.dec;
  }

  push ({x, y, z}) {
    this.xVel += x || 0;
    this.yVel += y || 0;
    this.zVel += z || 0;
  }

}

let wHeld, sHeld, aHeld, dHeld;

// ✒ Act (Runs once per user interaction)
function act({ event }) {
  if (event.is("keyboard:down:w")) wHeld = true;
  if (event.is("keyboard:down:s")) sHeld = true;
  if (event.is("keyboard:down:a")) aHeld = true; 
  if (event.is("keyboard:down:d")) dHeld = true; 

  if (event.is("keyboard:up:w")) wHeld = false;
  if (event.is("keyboard:up:s")) sHeld = false;
  if (event.is("keyboard:up:a")) aHeld = false; 
  if (event.is("keyboard:up:d")) dHeld = false; 

  // Respond to user input here.
  if (event.is("draw")) {
    //cam.rotation[1] += event.delta.x; // Look left and right.
     cam.rotX += event.delta.y;
     cam.rotY += event.delta.x;
    //cam.rotation[3] += event.delta.x; // Look up and down.
  }

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
