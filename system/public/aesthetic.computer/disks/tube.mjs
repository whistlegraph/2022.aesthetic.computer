// Tube, 22.11.05.00.30
// Designing some good triangulated geometry for wand marks.

// TODO
// - [] Add dolly with controls here.
// - [] Draw wireframe triangles, lines, and points.
// - [] Make a turtle that can move the tube forward.

let cam, dolly;
let W, S, A, D, UP, DOWN, LEFT, RIGHT;

function boot({ Camera, Dolly }) {
  cam = new Camera(80, { z: 2, y: -1, scale: [1, 1, 1] });
  dolly = new Dolly(cam); // moves the camera
}

function paint({ wipe, Camera, Form, QUAD, TRI, LINE, painting: p, form }) {
  wipe(0);

  /*
  const tri = new Form(
    TRI,
    { tex: p(1, 8, (g) => g.noise16DIGITPAIN()), alpha: 0.75 },
    { pos: [0, 0, 0], scale: [1, 1, 1], rot:  [0, 0, 0] }
  );
  */

  const floor = new Form(
    QUAD,
    { tex: p(2, 2, (g) => g.wipe(0, 0, 100)) },
    { pos: [0, 0, 0], rot: [-90, 0, 0], scale: [8, 8, 8] }
  );

  form(floor, cam, { cpu: true });

  // Create a segment...

  // Define a core center.
  const centerLine = new Form(
    LINE,
    { color: [255, 255, 0, 255] },
    { pos: [0, 0, 0], scale: [1, 0.5, 1], rot: [0, 0, 0] }
  );

  // Circumnavigate points.
  const surroundingPoints = [];
  const thickness = 0.2;
  const PI2 = Math.PI * 2;
  const sides = 10;
  for (var i = 0; i < sides; i++) {
    const angle = (i / sides) * PI2;
    surroundingPoints.push([
      Math.sin(angle) * thickness,
      0,
      Math.cos(angle) * thickness,
    ]);
  }

  const surroundingForms = [];

  surroundingPoints.forEach((sp) => {
    surroundingForms.push(
      new Form(
        LINE,
        { color: [0, 255, 0, 100] },
        { pos: sp, scale: [1, 0.5, 1], rot: [0, 0, 0] }
      )
    );
  });

  form([centerLine, ...surroundingForms], cam, { cpu: true });

}

function sim() {
  // 🔫 FPS style camera movement.
  let forward = 0,
    strafe = 0;
  if (W) forward = -0.002;
  if (S) forward = 0.002;
  if (A) strafe = -0.002;
  if (D) strafe = 0.002;
  if (W || S || A || D) dolly.push({ x: strafe, z: forward });
  if (UP) cam.rotX += 1;
  if (DOWN) cam.rotX -= 1;
  if (LEFT) cam.rotY += 1;
  if (RIGHT) cam.rotY -= 1;
  dolly.sim();
}

function act({ event: e }) {
  // 👀 Look around if 2nd mouse button is held.
  if (e.is("draw") && e.button === 2) {
    cam.rotX -= e.delta.y / 3.5;
    cam.rotY -= e.delta.x / 3.5;
  }

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

export { boot, paint, sim, act };
