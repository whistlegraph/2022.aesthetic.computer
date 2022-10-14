// 3D Line, 22.10.05.11.01
// A test for developing software (and hardware) rasterized 3D lines
// and other geometry.

let cam, dolly; // Camera system.
let floor, cross, tri, lines, tie; // Geometry.
let prevCamCenter;
let end, end2;

let lazyCursorPos;
// let lazyCursorSpeed = 1;
let lazyCursorSpeed = 20;
let cursorSize = 1;
let lazyDist = 0;
let lazyCursorLast;
let distConst = 0.005;

// 🥾 Boot
function boot({ painting: p, Camera, Dolly, Form, QUAD, TRI, LINE }) {
  cam = new Camera(80, { z: 4 }); // camera with fov
  dolly = new Dolly(cam); // moves the camera
  prevCamCenter = cam.center;

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

  lines = new Form(LINE, { pos: [0, 1, 1] });

  tie = new Form({ type: "line:buffered" }, { color: [255, 255, 255], alpha: 0.8 });
}

// 🎨 Paint (Executes every display frame)
function paint({
  pen,
  ink,
  wipe,
  Form,
  screen,
  paintCount,
  num: { vec4, randIntRange: rr },
}) {
  if (pen.drawing && pen.device === "mouse" && pen.button === 0) {

    const maxd = distConst * cursorSize;

    if (lazyDist >= maxd) {
      // Is it possible to add color here?
      tie.addPoints([lazyCursorLast, lazyCursorPos]);
      lazyDist -= maxd; // Hold onto extra distance for better normalization!
      lazyCursorLast = lazyCursorPos;
    }

    end = new Form(
      { type: "line", positions: [lazyCursorLast, lazyCursorPos] },
      { alpha: 1 }
    );

    end2 = new Form(
      { type: "line", positions: [lazyCursorPos, cam.center] },
      { alpha: 1 }
    );

    /*
    if (vec4.dist(prevCamCenter, cam.center) > maxd) {
      // Is it possible to add color here?
      tie.addPoints([prevCamCenter, cam.centerCached]);
      prevCamCenter = cam.centerCached;
    } else {
      end = new Form(
        { type: "line", positions: [prevCamCenter, cam.centerCached] },
        { alpha: 1 }
      );
    }
    */

  }

  // The lines & the furnitue.
  ink(255, 0, 0, 255).form([tie, floor, cross, tri, lines], cam);

  // Crosshair
  // TODO: Do a dirty box wipe here / use this to test the new compositor? 🤔
  // const radius = 9;
  const radius = 9 * cursorSize;
  wipe(10, 0)
    .ink(200, 0, 0, 255)
    .circle(...screen.center, radius);

  // Tip of drawn line.
  // if (paintCount % 2 === 0) ink(0, 255, 0).form(end, cam, { cpu: true });
     ink(255, 0, 0).form(end, cam, { keep: false });
     ink(255, 255, 0).form(end2, cam, { keep: false });
}

let W, S, A, D, UP, DOWN, LEFT, RIGHT;

// 🧮 Sim(ulate) (Runs once per logic frame (120fps locked)).
function sim({num: { vec4 }}) {
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

  dolly.sim();

  // Object rotation.
  tri.turn({ y: -0.25 });
  lines.turn({ x: -0.5, y: 0.5, z: 0.2 });

  // Move lazy cursor towards cam.center according to a multiplier.
  // (And track the distance traveled.)
  if (lazyCursorPos) {
    const newlazyCursorPos = vec4.lerp(vec4.create(), lazyCursorPos, cam.center, 0.01 * lazyCursorSpeed);
    lazyDist += vec4.dist(lazyCursorPos, newlazyCursorPos);
    lazyCursorPos = newlazyCursorPos;
  }
}

// ✒ Act (Runs once per user interaction)
function act({ event: e, num: { vec4 } }) {
  // 🖱️ Mouse
  //Look around while dragging.
  if (e.is("draw")) {
    cam.rotY -= e.delta.x / 3.5;
    cam.rotX -= e.delta.y / 3.5;
  }

  // Start a mark.
  if (e.is("touch") && e.device === "mouse") {
    prevCamCenter = cam.center;
    lazyCursorPos = vec4.clone(cam.centerCached);
    lazyCursorLast = vec4.clone(cam.centerCached);
    tie.gpuFlush = true;
  }

  // Finish a mark.
  if (e.is("lift") && e.device === "mouse") {
    // Add the last bit of the line to the tie.

    // With smoothing...
    /*
    if (lazyDist > 0) {
      tie.addPoints([lazyCursorLast, lazyCursorPos]);
      lazyCursorLast = lazyCursorPos;
      lazyDist = 0;
    }
    */
    lazyDist = 0;

    // Without smoothing...
    // if (vec4.dist(prevCamCenter, cam.center) > 0) {
    //   tie.addPoints([prevCamCenter, cam.centerCached]);
    // }

    end = undefined;
    end2 = undefined;
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

// 💗 Beat (Runs once per bpm, starting when the audio engine is activated.)
function beat($api) {
  // Make sound here.
}

// 👋 Leave (Runs once before the piece is unloaded)
function leave($api) {
  // Pass data to the next piece here.
}

export { boot, sim, paint, act, beat, leave };

// 📚 Library (Useful functions used throughout the piece)
