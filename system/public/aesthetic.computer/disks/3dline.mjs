// 3D Line, 22.10.05.11.01
// A test for developing software (and hardware) rasterized 3D lines
// and other geometry.

import { vec2 } from "../lib/num.mjs";
let cam, tri, ground, plane, l3d, dolly;

// 🥾 Boot (Runs once before first paint and sim)
function boot({
  painting,
  Form,
  Camera,
  TRIANGLE,
  SEGMENT,
  SQUARE,
}) {

  tri = new Form(
    TRIANGLE,
    { texture: painting(1, 8, (p) => p.noise16DIGITPAIN()) },
    [0, 0, 1], // x, y, z
    [0, 0, 0], // rotation
    [1, 1, 1] // scale
  );

  tri.alpha = 0.75;

  ground = new Form(
    SQUARE,
    {
      texture: painting(16, 16, (p) => {
        p.ink(255, 0, 0).line(0, 0, 16, 16).line(16, 0, 0, 16);
      }),
    },
    [0, -0.99, 1], // x, y, z
    [-90, 0, 0], // rotation
    [1, 1, 1] // scale
  );

  plane = new Form(
    SQUARE,
    {
      texture: painting(2, 2, (p) => p.wipe(0, 0, 100)),
    },
    [0, -1, 1], // x, y, z
    [-90, 0, 0], // rotation
    [3, 3, 3] // scale
  );

  l3d = new Form(
    SEGMENT,
    undefined, // No fill is set, so a default would be used.
    [0, 1, 1], // x, y, z // TODO: These positions don't work yet...
    [0, 0, 0], // rotation
    [1, 1, 1] // scale
  );

  cam = new Camera(80); // camera with fov

  cam.z = 4;

  dolly = new Dolly(); // moves the camera
}

// 🧮 Sim(ulate) (Runs once per logic frame (120fps locked)).
function sim($api) {
  // Object rotation.
  tri.rotation[1] = (tri.rotation[1] - 0.25) % 360; // Rotate Y axis.
  l3d.rotation[0] = (l3d.rotation[0] - 0.5) % 360; // Rotate X axis.
  l3d.rotation[1] = (l3d.rotation[1] + 0.5) % 360; // Rotate Y axis.
  l3d.rotation[2] = (l3d.rotation[2] + 0.2) % 360; // Rotate Z axis.

  // Camera controls.
  dolly.sim();

  //cam.y += dolly.yVel;

  cam.x += dolly.xVel;
  cam.z += dolly.zVel;

  let fForce = 0,
    hForce = 0;
  if (wHeld) fForce = -0.004;
  if (sHeld) fForce = 0.004;

  // This works for my renderer
  //if (aHeld) hForce = 0.004;
  //if (dHeld) hForce = -0.004;

  // This works for Three.js
  if (aHeld) hForce = -0.004;
  if (dHeld) hForce = 0.004;

  if (wHeld || sHeld || aHeld || dHeld) {
    //const dir = radians(cam.rotY); // This works for my renderer.
    const dir = radians(-cam.rotY); // This works for Three JS.

    const v2 = vec2.rotate(
      vec2.create(),
      vec2.fromValues(hForce, fForce),
      vec2.fromValues(0, 0),
      dir
    );
    dolly.push({ x: v2[0], z: v2[1] });
  }

  if (auHeld) cam.rotX += 1;
  if (adHeld) cam.rotX -= 1;
  if (alHeld) cam.rotY += 1;
  if (arHeld) cam.rotY -= 1;
}

// 🎨 Paint (Executes every display frame)
function paint({ wipe, ink, form, screen }) {
  // Render via software rasterizer.
  //wipe(0);
  //form(plane, cam);
  //form(ground, cam);
  //form(l3d, cam);
  //form(tri, cam);

  // Render in Three.js
  form([plane, tri, ground, l3d], cam);

  wipe(0, 0);
  ink(255, 30).box(screen.width / 2, screen.height / 2, 7, 7, "fill*center");
  ink(255, 0, 0, 50).box(screen.width / 2, screen.height / 2, 15, 15, "fill*center");

  //return false;
}

class Dolly {
  xVel = 0;
  yVel = 0;
  zVel = 0;
  dec = 0.9;

  constructor() {}

  sim() {
    this.xVel *= this.dec;
    this.yVel *= this.dec;
    this.zVel *= this.dec;
  }

  push({ x, y, z }) {
    this.xVel += x || 0;
    this.yVel += y || 0;
    this.zVel += z || 0;
  }
}

let wHeld, sHeld, aHeld, dHeld;
let auHeld, adHeld, alHeld, arHeld;

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

  if (event.is("keyboard:down:arrowup")) auHeld = true;
  if (event.is("keyboard:down:arrowdown")) adHeld = true;
  if (event.is("keyboard:down:arrowleft")) alHeld = true;
  if (event.is("keyboard:down:arrowright")) arHeld = true;

  if (event.is("keyboard:up:arrowup")) auHeld = false;
  if (event.is("keyboard:up:arrowdown")) adHeld = false;
  if (event.is("keyboard:up:arrowleft")) alHeld = false;
  if (event.is("keyboard:up:arrowright")) arHeld = false;

  // Respond to user input here.
  if (event.is("draw")) {
    cam.rotY -= event.delta.x / 3.5;
    cam.rotX -= event.delta.y / 3.5;
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
function radians(deg) {
  return deg * (Math.PI / 180);
}

export { boot, sim, paint, act, beat, leave };
