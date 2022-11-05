// Tube, 22.11.05.00.30
// Designing some good triangulated geometry for wand marks.

// TODO
// - [] Add dolly with controls here.
// - [] Draw wireframe triangles, lines, and points.
// - [] Make a turtle that can move the tube forward.

let cam, dolly;
let W, S, A, D, UP, DOWN, LEFT, RIGHT;

function boot({ Camera, Dolly }) {
  cam = new Camera(80, { z: 2, y: -0.5, scale: [1, 1, 1] });
  dolly = new Dolly(cam); // moves the camera
}

let rot = 0;

function paint({ wipe, pen, Form, num, QUAD, painting: p, form }) {
  wipe(0, 0);

  /*
  const tri = new Form(
    TRI,
    { tex: p(1, 8, (g) => g.noise16DIGITPAIN()), alpha: 0.75 },
    { pos: [0, 0, 0], scale: [1, 1, 1], rot:  [0, 0, 0] }
  );
  */

  // Floor
  const floor = new Form(
    QUAD,
    { tex: p(2, 2, (g) => g.wipe(0, 0, 100)) },
    { pos: [0, 0, 0], rot: [-90, 0, 0], scale: [8, 8, 8] }
  );

  form(floor, cam, { cpu: true });

  rot += 0.5;

  const cursorDepth = 1;
  const cursorPosition = cam.ray(pen.x, pen.y, cursorDepth, true);
  const cursorRotation = cam.rotation.slice();
  //cursorRotation[1] += rot;
  //cursorRotation[0] -= rot;

  form(segment({ Form, num }, cursorPosition, cursorRotation, 0.5), cam, {
    cpu: true,
  });

  const size = 0.25;

  form(segment({ Form, num }, [0, 0, 0], [-90, 0, rot], size), cam, {
    cpu: true,
  });

  const y = size + 0.1;

  form(segment({ Form, num }, [0, y, 0], [-90, 10, rot], size), cam, {
    cpu: true,
  });
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

// 📑 Library

const { cos, sin } = Math;

// Create a segment...
function segment({ Form, num }, position, rotation, length) {
  // 🅰️ Define a core line for this segment, based around the z axis.

  const ZLINE = {
    type: "line",
    positions: [
      // Center line.
      [0, 0, 0, 1],
      [0, 0, length, 1],
    ],
    colors: [
      [100, 0, 0, 255],
      [255, 255, 255, 255]
    ]
  };

  // 🅱️ Circumnavigate points around the center core..
  //const surroundingPoints = [];

  const thickness = 0.3;
  const PI2 = Math.PI * 2;
  const sides = 32; // TODO: Add auto triangulation for N sides.
  for (var i = 0; i < sides; i += 1) {
    const angle = (i / sides) * PI2;

    // TODO: These need to be rotated and pushed out on the Z axis also...
    // TODO: Why aren't these getting pushed out?

    ZLINE.positions.push(
      [sin(angle) * thickness, cos(angle) * thickness, 0, 1],
      [sin(angle) * thickness, cos(angle) * thickness, length, 1]
    );

    ZLINE.colors.push(
      [0, 100, 0, 255],
      [255, 255, 0, 255]
    );

  }

  const wireframeSeg = new Form(
    ZLINE,
    { color: [255, 255, 0, 255] },
    { scale: [1, 1, 1] }
  );

  wireframeSeg.position = position;
  wireframeSeg.rotation = rotation;

  return wireframeSeg;


  /*
  const surroundingForms = [];
  surroundingPoints.forEach((sp) => {
    //sp[0] += position[0];
    //sp[1] += position[1];
    //sp[2] += position[2];

    surroundingForms.push(
      new Form(
        ZLINE,
        { color: [0, 255, 0, 100] },
        { pos: sp, scale: [1, 1, length] }
      )
    );
  });
  */

  // Transform all points.

  //const forms = [centerLine, ...surroundingForms];

  forms.forEach((f) => {
    // Get identity.
    const mat = num.mat4.create();

    // Translate object position to world position.
    //num.mat4.translate(mat, mat, centerLine.position);

    // Rotate object to world rotation.
    num.mat4.translate(mat, mat, [...f.position, 1]);

    num.mat4.rotateX(mat, mat, num.radians(rotation[0])); // Rotate X.
    num.mat4.rotateY(mat, mat, num.radians(rotation[1])); // Rotate Y.
    num.mat4.rotateZ(mat, mat, num.radians(rotation[2])); // Rotate Z.

    // Translate identity to object position.
    num.mat4.translate(mat, mat, position);

    // Translate origin to object.
    const pos = num.vec4.transformMat4(
      num.vec4.create(),
      [0, 0, 0, 1],
      //[...f.position, 1],
      mat
    );

    f.position[0] = pos[0];
    f.position[1] = pos[1];
    f.position[2] = pos[2];

    const rot = rotation.slice();

    if (f === centerLine) {
      //rot[1] *= -1;
    }

    // TODO: Each object is being rotated individually here by it's own axis.
    //       But their positions need to transform around the core position.

    // And I don't have support for nested transforms?
    //f.rotation = rot;


    //console.log("X", position[0], pos[0]);
    //console.log("Y", position[1], pos[1]);
    //console.log("Z", position[2], pos[2]);
  });

  return forms;
}
