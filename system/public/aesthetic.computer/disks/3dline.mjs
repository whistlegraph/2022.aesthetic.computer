// 3D Line, 22.10.05.11.01
// A test for developing software (and hardware) rasterized 3D lines
// and other geometry.

let cam, dolly; // Camera system.
let floor, cross, tri, triTop, drawing; // Geometry.
let race, tail, tail2; // Lazy line control with preview lines.

// These values can be parametrically adjusted to change
// the step size of the line and the speed of the lazy cursor.
const step = 0.005;
const smoothing = true;
const speed = 20; // Only used if smoothing is true.

let colorParams;

let W, S, A, D, UP, DOWN, LEFT, RIGHT;

// 🥾 Boot
function boot({
  painting: p,
  Camera,
  Dolly,
  Form,
  QUAD,
  TRI,
  LINE,
  geo: { Race, Quantizer },
  params,
}) {
  // Grab params for color.
  colorParams = params.map((str) => parseInt(str));

  cam = new Camera(80, { z: 4 }); // camera with fov
  dolly = new Dolly(cam); // moves the camera

  race =
    smoothing === true ? new Race({ step, speed }) : new Quantizer({ step });

  floor = new Form(
    QUAD,
    { tex: p(2, 2, (g) => g.wipe(0, 0, 100)) },
    { pos: [0, -1, 1], rot: [-90, 0, 0], scale: [3, 3, 3] }
  );

  cross = new Form(
    QUAD,
    { tex: p(4, 4, (g) => g.noise16DIGITPAIN()) },
    { pos: [0, -0.99, 1], rot: [-90, 0, 0] }
  );

  tri = new Form(
    TRI,
    { tex: p(1, 8, (g) => g.noise16DIGITPAIN()), alpha: 0.75 },
    { pos: [0, 0, 1] }
  );

  triTop = new Form(LINE, { pos: [0, 1, 1] });

  // An empty buffer that gets populated in `sim()`.
  drawing = new Form(
    { type: "line:buffered" },
    { color: [255, 255, 255, 255] }
  );
}

// 🎨 Paint (Executes every display frame)
function paint({ ink, wipe, screen }) {
  // The lines & the furnitue.
  ink(0, 255, 0, 255).form([floor, cross, tri, triTop, drawing], cam);

  // Crosshair
  // TODO: Do a dirty box wipe here / use this to test the new compositor? 🤔
  wipe(10, 0)
    .ink(200, 0, 0, 255)
    .circle(...screen.center, 9);

  // Tip of drawn line.
  ink(255, 255, 0).form(tail, cam, { keep: false });
  ink(255, 0, 0).form(tail2, cam, { keep: false });
}

// 🧮 Sim(ulate) (Runs once per logic frame (120fps locked)).
function sim({ pen, Form, color, num: { dist3d, randIntRange: rr } }) {
  // First person camera controls.
  let forward = 0,
    strafe = 0;

  if (W) forward = -0.004;
  if (S) forward = 0.004;
  if (A) strafe = -0.004;
  if (D) strafe = 0.004;
  if (W || S || A || D) dolly.push({ x: strafe, z: forward });

  if (UP) cam.rotX += 1;
  if (DOWN) cam.rotX -= 1;
  if (LEFT) cam.rotY += 1;
  if (RIGHT) cam.rotY -= 1;

  dolly.sim(); // Move the camera.

  // Rotate some scenery.
  tri.turn({ y: -0.25 });
  triTop.turn({ x: -0.5, y: 0.5, z: 0.2 });

  // 🖱️ Add to the drawing.
  if (pen.drawing && pen.device === "mouse" && pen.button === 0) {
    const preview = race.to(cam.center);
    if (!preview) return;

    if (preview.add) {
      let vertexColor = color(...colorParams);
      drawing.addPoints(
        {
          positions: [preview.last, preview.current],
          colors: [vertexColor, vertexColor]
        }
      );
    }

    // Preview from last to current.
    if (dist3d(preview.current, preview.last)) {
      tail = new Form(
        { type: "line", positions: [preview.last, preview.current] },
        { alpha: 1 }
      );
    }

    // Preview from current camera cursor / pointer.
    if (dist3d(preview.current, cam.centerCached)) {
      tail2 = new Form(
        { type: "line", positions: [preview.current, cam.centerCached] },
        { alpha: 1 }
      );
    }
  }
}

// ✒ Act
function act({ event: e, num: { vec4 } }) {
  // 🖱️ Mouse
  //Look around while dragging.
  if (e.is("draw")) {
    cam.rotX -= e.delta.y / 3.5;
    cam.rotY -= e.delta.x / 3.5;
  }

  // Start a mark.
  if (e.is("touch") && e.device === "mouse") {
    race.start(cam.center);
    drawing.gpuFlush = true;
  }

  // End a mark.
  if (e.is("lift") && e.device === "mouse") {
    race.reset?.();
    tail = tail2 = undefined; // Stop rendering tails when a mark ends.
  }

  // 🖖 Touch
  // Two fingers for move forward.
  if (e.is("touch:2")) W = true;
  if (e.is("lift:2")) W = false;

  // Three fingers for moving backward.
  if (e.is("touch:3")) S = true;
  if (e.is("lift:3")) S = false;

  // 💻️ Keyboard: WASD for movement, arrows for looking.
  if (e.is("keyboard:down:w")) W = true;
  if (e.is("keyboard:down:s")) S = true;
  if (e.is("keyboard:down:a")) A = true;
  if (e.is("keyboard:down:d")) D = true;

  if (e.is("keyboard:up:w")) W = false;
  if (e.is("keyboard:up:s")) S = false;
  if (e.is("keyboard:up:a")) A = false;
  if (e.is("keyboard:up:d")) D = false;

  if (e.is("keyboard:down:arrowup")) UP = true;
  if (e.is("keyboard:down:arrowdown")) DOWN = true;
  if (e.is("keyboard:down:arrowleft")) LEFT = true;
  if (e.is("keyboard:down:arrowright")) RIGHT = true;

  if (e.is("keyboard:up:arrowup")) UP = false;
  if (e.is("keyboard:up:arrowdown")) DOWN = false;
  if (e.is("keyboard:up:arrowleft")) LEFT = false;
  if (e.is("keyboard:up:arrowright")) RIGHT = false;

  if (e.is("keyboard:down:k")) cursorSize += 0.1;
  if (e.is("keyboard:down:j")) cursorSize -= 0.1;
}

// 💗 Beat
function beat($api) {
  // Make sound here.
}

// 👋 Leave
function leave($api) {
  // Pass data to the next piece here.
}

export { boot, sim, paint, act, beat, leave };

// 📚 Library
