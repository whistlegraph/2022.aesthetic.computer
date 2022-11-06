// ️🪄 Cadwand, 22.11.05.00.30 ⚙️
// A laboratory for designing the procedural geometry in `wand`.

// TODO
// - [] Draw all wireframe geometry.
// - [] Make a turtle that can move the tube forward / generate a path over time.
// - [] Then it up to the cursor via race.
// - [] There should be an "inner" and "outer" triangulation option.
//       - [] Inner ONLY for complexity 1 and 2.
//       - [] Optional elsewhere.

const { cos, sin } = Math;

let cam, dolly, floor;
let W, S, A, D, UP, DOWN, LEFT, RIGHT;

let rot = 0;
let sides = 8;
let limiter = 0;

function boot({ Camera, Dolly, Form, QUAD, painting, fps }) {
  cam = new Camera(80, { z: 1, y: -0.5, scale: [1, 1, 1] });
  dolly = new Dolly(cam); // moves the camera
  floor = new Form(
    QUAD,
    { tex: painting(2, 2, (g) => g.wipe(0, 0, 100)) },
    { rot: [-90, 0, 0] }
  );
}

function paint({ wipe, pen, wiggle, Form, num, QUAD, painting: p, form }) {
  wipe(0, 0); // Background.

  form(floor, cam, { cpu: true }); // Floor

  // 🌛 Segments: Here we pass a path of vertices through several segments.

  // Add 
  rot += 0.25;
  let yw = wiggle(8);

  // TODO: Generate path.

  const path = [
    { vertex: [0, 0.1, 0], angle: [0, -yw + rot, 0], points: [] },
    { vertex: [0, 0.2, 0], angle: [0, yw + rot, 0], points: [] },
    { vertex: [0, 0.3, 0], angle: [0, -yw + rot, 0], points: [] },
    { vertex: [0, 0.4, 0], angle: [0, yw + rot, 0], points: [] },
    { vertex: [0, 0.5, 0], angle: [0, -yw + rot, 0], points: [] },
  ];

  // Generate all the points in the "model"
  const shape = segmentShape({ Form, num }, 0.21, sides);

  // Copy each point in the shape and transform it by a path position and angle.
  const { vec4, mat4, radians } = num;
  const positions = [],
    colors = [];

  let lastPathPoint = path[0];

  // Generate path segments for each vertex around the shape.
  path.forEach((pathP, pi) => {
    shape.forEach((shapePos, si) => {
      // ... by position
      const panned = mat4.fromTranslation(mat4.create(), pathP.vertex);
      // ... and around angle.
      const rotX = mat4.fromXRotation( mat4.create(), radians(pathP.angle[0]));
      const rotY = mat4.fromYRotation( mat4.create(), radians(pathP.angle[1]));
      const rotZ = mat4.fromZRotation( mat4.create(), radians(pathP.angle[2]));
      // Note: Would switching to quaternions make this terse? 22.11.05.23.34
      //       Should also be done in the `Camera` and `Form` class inside `graph.mjs`.
      const rotatedX = mat4.mul(mat4.create(), panned, rotX);
      const rotatedY = mat4.mul(mat4.create(), rotatedX, rotY);
      const rotatedZ = mat4.mul(mat4.create(), rotatedY, rotZ);
      const matrix = rotatedZ;

      pathP.points.push(
        vec4.transformMat4(vec4.create(), [...shapePos, 1], matrix)
      );

      // Draw the outer points.
      if (pi > 0) {
        positions.push(lastPathPoint.points[si], pathP.points[si]);
        // Add separate color for the core.
        colors.push([255, si > 0 ? 0 : 255, 0, 255], [255, 255, 255, 255]);
      }
    });

    lastPathPoint = pathP;
  }); // See `Archives` for path ordered vertices.

  // Add a limiter to positions and colors in order to know our drawing order...
  let pos = positions,
    cols = colors;

  let posLimitMax = positions.length / 2;
  let posLimit = limiter % posLimitMax;
  // let posLimit = posLimitMax - ((limiter % posLimitMax) + 1);
  if (posLimit > 0) {
    pos = positions.slice(0, -2 * posLimit);
    cols = colors.slice(0, -2 * posLimit);
  }

  // TODO: Add triangulation / type "triangle" also.
  const tube = new Form(
    { type: "line", positions: pos, colors: cols },
    { color: [255, 255, 0, 255] },
    { scale: [1, 1, 1] }
  );

  // TODO: Draw the cursor again.
  // Cursor
  // const cDepth = 1;
  // const cPos = cam.ray(pen.x, pen.y, cDepth, true);
  // const cRot = cam.rotation.slice();
  //form(segment({ Form, num }, cPos, cRot, 0.1, 0.1, sides), cam, { cpu: true });

  form([tube], cam, { cpu: true });
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
  // Increase complexity (Primary mouse button)
  if (e.is("touch") && e.button === 0) sides += 1;

  // Limit vertices (Secondary mouse button)
  if (e.is("touch") && e.button === 2) limiter += 1;

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

// Takes a starting position, direction and length.
// Projects out a center core along with from there...
// Eventually produces a circle.
function segmentShape(
  { Form, num },
  //position,
  //direction,
  //length,
  radius,
  sides
) {
  const positions = [];

  // 🅰️ Define a core line for this segment shape, based around the z axis.
  positions.push([0, 0, 0, 1]);

  // 🅱️ Circumnavigate points around the center core..
  const PI2 = Math.PI * 2;
  for (var i = 0; i < sides; i += 1) {
    const angle = (i / sides) * PI2;
    positions.push([sin(angle) * radius, 0, cos(angle) * radius, 1]);
  }

  // 🔥 TODO: Add a flag for triangulation of end caps.

  return positions;
}

// 💀 Archives

// Here the vertices ordered through each side as a path. 
// This is probably not ideal but I'm leaving the code here just in case. 22.11.06.01.29 
// Draw a line through the path for every side.
// for (let i = 0; i < sides + 1; i += 1) {
//   // Order the positions as segments... [0, 1] -> [1, 2] -> [2, 3]
//   for (let p = 1; p < path.length; p += 1) {
//     positions.push(path[p - 1].points[i], path[p].points[i]);
//     colors.push([255, 0, 0, 255], [255, 255, 255, 255]);
//   }
// }
