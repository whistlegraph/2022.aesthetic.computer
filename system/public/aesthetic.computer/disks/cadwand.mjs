// ️🪄 Cadwand, 22.11.05.00.30 ⚙️
// A laboratory for designing the procedural geometry in `wand`.

// TODO
// - [] Make a turtle that can move the tube forward and generate a path over time.
// ... media break
// - [] Reload last camera position on refresh.
// - [] Record some GIFs.
// ... gpu time!
// - [] Render line geometry onto the GPU.
// - [] Render triangulated geometry onto the GPU.
// - [] Integrate into `wand`.
//   - [] Hook it up to the cursor via race.
//   - [] Bring that code into `wand`.
// + Later
// - [] There should be an "inner" and "outer" triangulation option.
//       - [] Inner ONLY for complexity 1 and 2.
//       - [] Optional elsewhere.
// - [] Draw the cursor again.
//      const cDepth = 1;
//      const cPos = cam.ray(pen.x, pen.y, cDepth, true);
//      const cRot = cam.rotation.slice();
//      form(segment({ Form, num }, cPos, cRot, 0.1, 0.1, sides), cam, { cpu: true });
// + Done
// - [x] Clean up this file.
// - [x] Abstract the FPS camera so it's easier to scaffold environments like this.
// - [x] Draw diagonals in sections.
//   - [x] Dynamically limit the number of sides with special edge cases.
//        for sides 1->4 to prevent over-drawing.
// - [x] Add the depth buffer back.
// - [x] Draw start and end cap lines for the triangles.
//   - [x] Start
//   - [x] End
// - [x] Refactor geometry generation into a dynamic `Tube` class.
// - [x] Add color support to path.
// - [x] Make vertex gradients optional.

import { CamDoll } from "../lib/cam-doll.mjs";

const { max, cos, sin } = Math;

let cd, floor;

// Values specific to `Tube`.
let tube,
  rot = 0,
  rotSpeed = 0.5,
  yw = 8,
  sides = 6,
  radius = 0.2,
  limiter = 0;

function boot({ Camera, Dolly, Form, QUAD, painting, num }) {
  cd = new CamDoll(Camera, Dolly, { z: 0.8 });

  floor = new Form(
    QUAD,
    { tex: painting(2, 2, (g) => g.wipe(0, 0, 70)) },
    { rot: [-90, 0, 0] }
  );
}

function paint({ wipe, ink, screen, Form, form, num, wiggle }) {
  wipe(0, 0, 50); // Clear the background...
  //ink(0, 1).box(0, 0, screen.width, screen.height); // Or use a fade effect.

  tube = new Tube({ Form, num, wiggle }, radius); // Make a new tube.
  tube.form.limiter = limiter; // Copy over its limiter.
  tube?.start(radius, sides); // Start a gesture.
  tube?.goto(
    [
      [0.05, 0.4, 0.05],
      [0, 255, 0, 255],
      [0, rot, 10],
    ],
    [
      [0, 0.6, 0],
      [255, 0, 0, 255],
      [0, rot, 0],
    ],
    [
      [0, 0.7, 0],
      [255, 255, 255, 255],
      [0, rot, 0],
    ],
    [
      [0.1, 0.9, 0],
      [255, 255, 255, 255],
      [-10, rot, 10],
    ]
  ); // Continue a gesture.
  tube?.stop(); // Finish a gesture.

  form([floor, tube?.form], cd.cam, { cpu: true }); // Draw the tube and floor.
}

function sim({ wiggle }) {
  yw = wiggle(8); // 🎡 Some dynamics for each frame
  rot += rotSpeed;
  cd.sim();
}

function act({ event: e }) {
  // Increase model complexity.
  if (e.is("keyboard:down:k")) {
    sides += 1;
    limiter = 0;
  }

  if (e.is("keyboard:down:j")) {
    sides = max(0, sides - 1);
    limiter = 0;
  }

  if (e.is("wheel") && e.dir > 0) {
    limiter += 1;
    tube.form.limiter = limiter;
  }

  if (e.is("wheel") && e.dir < 0) {
    limiter -= 1;
    if (limiter < 0) limiter = tube.form.vertices.length / 2;
    tube.form.limiter = limiter;
  }

  cd.act(e);
}

export { boot, paint, sim, act };

// 📑 Library

// Here we build a path out of points, which draws
// tubular segments by adding them to a geometric form.

// It does this by producing a cookie cutter shape that gets
// extruded in a transformed direction according to the path data.

class Tube {
  $; // api
  path = []; // Set up points for a path / gesture.
  lastPathP;
  shape;
  form;
  positions = [];
  colors = [];
  sides;

  constructor($) {
    this.$ = $; // Hold onto the API.

    // Make the buffered geometry form.
    this.form = new $.Form(
      { type: "line", gradients: false },
      { color: [255, 255, 0, 255] },
      { scale: [1, 1, 1] }
    );
    //  Note: It would be cool to add per vertex gradient support.
    //        Maybe if a gradients array was passed of trues and falses that
    //        matched positions?
    // Note: I could eventually add behavioral data into these vertices that
    //       animate things / turn on or off certain low level effects etc.
  }

  start(radius, sides) {
    this.sides = sides;
    //if (complexity === 1) this.sides = 2;
    //else this.sides = complexity + 1;

    // Create an initial position in the path and generate points in the shape.
    this.shape = this.#segmentShape(radius, this.sides);
    const startPath = [
      this.#pathp([0, 0.0, 0.01], [0, 0, 255, 255], [0, rot, 0]),
      this.#pathp([0, 0.3, 0], [255, 0, 0, 255], [0, rot, 0]),
    ];
    this.lastPathP = startPath[0]; // Store an inital lastPath.

    // 1. Transform the first shape and add an end cap. Draw triangle ring.
    this.#transformShape(startPath[0]);
    if (this.sides > 1) this.#cap(startPath[0]);

    // 2. Transform second shape and then consume the point. Draw bars.
    this.#transformShape(startPath[1]);
    this.#consumePath(startPath[1]);
  }

  goto() {
    // Add new points to the path.
    const path = [...arguments].map((p) => this.#pathp(...p));

    // Extrude shape points from and in the direction of each path vertex.
    path.forEach((p) => this.#transformShape(p));
    this.#consumePath(...path);
  }

  stop() {
    this.#cap(this.lastPathP, false);
  }

  // Takes a starting position, direction and length.
  // Projects out a center core along with from there...
  // Produces a circle yet at low complexity makes
  // - lines, planes, prisms, and boxes.
  #segmentShape(radius, sides) {
    const positions = [];

    // 🅰️ Define a core line for this segment shape, based around the z axis.
    positions.push([0, 0, 0, 1]);

    // 🅱️ Circumnavigate points around the center core..
    const PI2 = Math.PI * 2;
    for (var i = 0; i < sides; i += 1) {
      const angle = (i / sides) * PI2;
      positions.push([sin(angle) * radius, 0, cos(angle) * radius, 1]);
    }

    return positions;
  }

  // Generate a path point with room for shape positions.
  #pathp(pos, color, angle) {
    return { pos, color, angle, shape: [] };
  }

  // Generate a start or end (where ring === false) cap to the tube.
  #cap(pathP, ring = true) {
    if (this.sides > 2) {
      for (let i = 0; i < pathP.shape.length; i += 1) {
        // Pie: Radiate out from core point
        if (i > 0 && this.sides > 4) {
          this.form.addPoints({
            positions: [pathP.shape[0], pathP.shape[i]],
            colors: [pathP.color, pathP.color],
            // [255, 0, 0, 255], [255, 0, 0, 255]
          });
        }

        // Single diagonal for a quad.
        if (i === 0 && this.sides === 4) {
          this.form.addPoints({
            positions: [pathP.shape[1], pathP.shape[3]],
            colors: [pathP.color, pathP.color],
            //[255, 0, 0, 255], [255, 0, 0, 255],
          });
        }

        // Ring: Skip core point
        if (i > 1 && ring) {
          this.form.addPoints({
            positions: [pathP.shape[i - 1], pathP.shape[i]],
            colors: [pathP.color, pathP.color],
            // [0, 100, 0, 255], [0, 100, 0, 255],
          });
        }
      }
    }

    // Ring: add final point
    if (ring) {
      this.form.addPoints({
        positions: [pathP.shape[1], pathP.shape[pathP.shape.length - 1]],
        colors: [pathP.color, pathP.color],
        // [255, 100, 0, 255], [255, 100, 0, 255],
      });
    }
  }

  #transformShape(pathP) {
    const { mat4, radians, vec4 } = this.$.num;
    this.shape.forEach((shapePos) => {
      // ... by position
      const panned = mat4.fromTranslation(mat4.create(), pathP.pos);
      // ... and around angle.
      const rotX = mat4.fromXRotation(mat4.create(), radians(pathP.angle[0]));
      const rotY = mat4.fromYRotation(mat4.create(), radians(pathP.angle[1]));
      const rotZ = mat4.fromZRotation(mat4.create(), radians(pathP.angle[2]));
      // Note: Would switching to quaternions make this terse? 22.11.05.23.34
      //       Should also be done in the `Camera` and `Form` class inside `graph.mjs`.
      const rotatedX = mat4.mul(mat4.create(), panned, rotX);
      const rotatedY = mat4.mul(mat4.create(), rotatedX, rotY);
      const rotatedZ = mat4.mul(mat4.create(), rotatedY, rotZ);
      const matrix = rotatedZ;

      pathP.shape.push(
        vec4.transformMat4(vec4.create(), [...shapePos, 1], matrix)
      );
    });
  }

  // Copy each point in the shape, transforming it by the added path positions
  // and angles to `positions` and `colors` which can get added to the `form`.
  #consumePath() {
    const positions = [];
    const colors = [];

    [...arguments].forEach((pathP, pi) => {
      for (let si = 0; si < pathP.shape.length; si += 1) {
        if (si === 0) {
          positions.push(this.lastPathP.shape[si], pathP.shape[si]); // 1. Core
          colors.push(this.lastPathP.color, this.lastPathP.color);
          // [255, 255, 0, 255], [255, 255, 255, 255]
        }

        if (this.sides === 1) return;

        if (si > 0) {
          positions.push(this.lastPathP.shape[si], pathP.shape[si]); // 2. Vertical
          colors.push(this.lastPathP.color, pathP.color);
        }

        if (si > 1) {
          positions.push(pathP.shape[si], pathP.shape[si - 1]); // 3. Across
          colors.push(pathP.color, pathP.color);
          // [255, 180, 180, 255], [255, 180, 180, 255]
        }

        if (si > 0 && si < pathP.shape.length - 1) {
          positions.push(this.lastPathP.shape[si + 1], pathP.shape[si]); // 4. Diagonal
          colors.push(this.lastPathP.color, this.lastPathP.color);
          // [0, 180, 180, 255], [0, 180, 180, 255]
        }
      }

      // 5. Final diagonal
      if (this.sides > 2) {
        positions.push(
          this.lastPathP.shape[1],
          pathP.shape[pathP.shape.length - 1]
        );
        colors.push(this.lastPathP.color, this.lastPathP.color);
        // [200, 100, 0, 255], [200, 100, 0, 255]

        // 6. Final across
        positions.push(pathP.shape[1], pathP.shape[pathP.shape.length - 1]);
        colors.push(pathP.color, pathP.color);
        // [255, 180, 180, 255], [255, 180, 180, 255]
      }

      this.lastPathP = pathP;
    });

    if (positions.length > 0) this.form.addPoints({ positions, colors });
  }
}
