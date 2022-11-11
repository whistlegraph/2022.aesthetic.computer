// ️🪄 Cadwand, 22.11.05.00.30 ⚙️
// A laboratory / development piece for designing the procedural geometry in `wand`.

// TODO
// - [-] Integrate into `wand` and VR.
//   - [] Should I bring this code into `wand` or bring wand code into here?
//   - [] Get it working with wands by replacing lines.
// * Optimization
//  - [] Two sided triangle optimization.
//    - [-] Flip any inverted triangles. Check to see if enabling two sided triangles flip anything.
//      - [x] 5 sides or greater
//    - [] Double up the vertices in the exception (Ribbon / 2 sided Tube)
//    - [] Add a "fake" end cap while drawing.
//    - [] Re-enable THREE.FrontSide.
//    - [] Better curve fitting.
// + Later
// - [] Reload last camera position on refresh.
// - [] Record some GIFs.
// - [] There should be an "inner" and "outer" triangulation option.
//       - [] Inner ONLY for complexity 1 and 2.
//       - [] Optional elsewhere.
// - [] Draw an interactive cursor again using the end cap.
//      const cDepth = 1;
//      const cPos = cam.ray(pen.x, pen.y, cDepth, true);
//      const cRot = cam.rotation.slice();
//      form(segment({ Form, num }, cPos, cRot, 0.1, 0.1, sides), cam, { cpu: true });
// + Done
// - [x] Get kinks out of middle section? https://stackoverflow.com/questions/1171849/finding-quaternion-representing-the-rotation-from-one-vector-to-another
// - [x] Remove starting kink.
// - [x] Prevent the tube's circle from twisting on its Y axis.
//   - [x] Implement this algorithm:
//     - [x] https://vimeo.com/251091418

import { CamDoll } from "../lib/cam-doll.mjs";
const { max, acos, cos, sin } = Math;

let cd, stage; // Camera and floor.
let spi, // Crawls in 3D and creates a path.
  spiStart;
//tubeGoto = [];
let tube,
  tube2, // Tube geometry that surrounds the spider's path at even increments.
  //  rot = 0,
  //  yw = 8,
  rotSpeed = 0.5,
  //sides = 16,
  sides = 16,
  // radius = 1,
  radius = 0.25,
  step = 0.05,
  limiter = 0,
  limiter2 = 0;

const rayDist = 1.2;

let race;

//let step = 0.05;
//let microstep = 0.05;
let growing = false;

function boot({
  Camera,
  Dolly,
  Form,
  QUAD,
  painting,
  num,
  debug,
  wiggle,
  geo: { Race },
}) {
  cd = new CamDoll(Camera, Dolly, { z: 1.4, y: 0.5 }); // FPS style camera controls.

  // Make a floor platform.
  stage = new Form(
    QUAD,
    { tex: painting(2, 2, (g) => g.wipe(0, 0, 70)) },
    { rot: [-90, 0, 0] }
  );

  // Create a spider and set its starting state and orientation.
  race = new Race({ speed: 15 });

  // Create a buffered tube to follow our gesture.
  //tube = new Tube({ Form, painting, num, wiggle }, "triangles"); // Make a new tube.
  tube2 = new Tube({ Form, painting, num, wiggle }, "lines"); // Make a new tube.
}

const racePoints = [],
  diffPoints = [],
  diffColors = [];
let trackerPoints = [],
  trackerColors = [];

function sim({
  wiggle,
  simCount,
  pen, pen3d,
  Form,
  num: { vec3, randIntRange: rr, dist3d, degrees, mat4, mat3, quat, radians },
  help,
}) {
  //yw = wiggle(8); // 🎡 Some dynamics for each frame
  //rot += rotSpeed;
  cd.sim(); // Update the camera + dolly.

  // Create geometry by racing towards the cursor from the center point.
  if (growing && simCount % 10n === 0n) {

    if (pen3d) {
      race.to(pen3d.pos); // Race towards current position using VR controller.
    } else {
      const ray = cd.cam.ray(pen.x, pen.y, 0.1, true);
      race.to(ray); // Race towards current position.
    }



    racePoints.push(race.pos);

    const d = dist3d(spi.state.position, race.pos); // vec3's distance was innacurate.

    const diff = vec3.normalize(
      vec3.create(),
      vec3.sub(vec3.create(), race.pos, spi.state.position)
    );
    const scaledDiff = vec3.scale(vec3.create(), diff, 2);

    trackerPoints = [
      spi.state.position,
      vec3.add(vec3.create(), spi.state.position, scaledDiff),
      spi.state.position,
      vec3.add(vec3.create(), spi.state.position, spi.state.direction),
    ];

    let dot = vec3.dot(diff, spi.state.direction);
    console.log(dot);

    if (dot > 0.5) {
      trackerColors = [
        [255, 0, 0, 255],
        [255, 0, 0, 255],
        [255, 255, 0, 255],
        [255, 255, 0, 255],
      ];
    } else {
      trackerColors = [
        [0, 255, 0, 255],
        [0, 255, 0, 255],
        [255, 255, 0, 255],
        [255, 255, 0, 255],
      ];
    }

    // if (d > step * 1.5 && (dot > 0.5 || dot === 0)) {
    if (d > step && (dot > 0.5 || dot === 0)) {
      //if (dot > 0.5 || dot === 0) {
      spi.rotateTowards(race.pos, dot / 2); // 1 is a tightness fit.
      //}

      spi.crawl(step / 2);

      //tube.goto(spi.state);
      tube2.goto(spi.state);
      spi.ink(rr(100, 255), rr(100, 255), rr(100, 255), 255); // Set the color.
    }
    //}
  }
}

let spiderForm;
let trackerForm;

function paint({ wipe, Form, form, num, wiggle }) {
  wipe(0, 0, 0, 0); // Clear the background...
  //ink(0, 1).box(0, 0, screen.width, screen.height); // Or use a fade effect.

  // Draw the spider's path so far.
  if (spi) {
    const spiderPositions = [];
    const spiderColors = [];

    for (let s = 0; s < spi.path.length - 1; s += 1) {
      spiderPositions.push(spi.path[s].position, spi.path[s + 1].position);
      spiderColors.push([255, 255, 255, 255], [0, 0, 0, 255]);
      //spiderColors.push(spi.path[s + 1].color, spi.path[s + 1].color);
    }

    spiderForm = new Form(
      {
        type: "line",
        positions: spiderPositions,
        colors: spiderColors,
        gradients: true,
        keep: false,
      },
      { color: [255, 255, 255, 255] },
      { scale: [1, 1, 1] }
    );
  }

  const racePositions = [];
  const raceColors = [];

  for (let r = 0; r < racePoints.length - 1; r += 1) {
    racePositions.push(racePoints[r], racePoints[r + 1]);
    raceColors.push([127, 0, 127, 255], [127, 0, 127, 255]);
  }

  // Draw the path of the race.
  const raceForm = new Form(
    {
      type: "line",
      positions: racePositions,
      colors: raceColors,
      gradients: true,
      keep: false,
    },
    { color: [255, 255, 255, 255] },
    { scale: [1, 1, 1] }
  );

  // Draw some measurement lines.
  const diffPositions = [];
  const diffCol = [];

  for (let d = 0; d < diffPoints.length - 1; d += 2) {
    diffPositions.push([...diffPoints[d], 1], [...diffPoints[d + 1], 1]);
    diffCol.push(diffColors[d], diffColors[d + 1]);
  }

  const diffForm = new Form(
    {
      type: "line",
      positions: diffPositions,
      colors: diffColors,
      gradients: false,
      keep: false,
    },
    { color: [255, 0, 0, 255] },
    { scale: [1, 1, 1] }
  );

  // Draw some cursor measurement lines.
  trackerForm = new Form(
    {
      type: "line",
      positions: trackerPoints,
      colors: trackerColors,
      gradients: true,
      keep: false,
    },
    { color: [255, 255, 255, 255] },
    { scale: [1, 1, 1] }
  );

  //form([raceForm, spiderForm, tube.form], cd.cam, { cpu: true });
  //form([stage, tube.form, tube2.form], cd.cam, { cpu: true });
  //form([stage, tube2.form, raceForm, diffForm, spiderForm], cd.cam);
  if (noTube) {
    form([stage, trackerForm, raceForm, spiderForm, diffForm], cd.cam);
  } else {
    form(
      [stage, trackerForm, tube2.form, raceForm, spiderForm, diffForm],
      cd.cam
    );
  }
}

let noTube = false;

function act({
  event: e,
  pen,
  gpu,
  num,
  debug,
  num: { vec3, quat, randIntRange: rr },
}) {
  // Grow model.
  if (e.is("touch") && e.button === 0 && pen && pen.x && pen.y) {
    const ray = cd.cam.ray(pen.x, pen.y, rayDist, true);
    const rayb = cd.cam.ray(pen.x, pen.y, rayDist / 4, true);

    const diff = [...vec3.sub(vec3.create(), rayb, ray)];
    const spiderOrientation = vec3.normalize(vec3.create(), diff);

    let firstNormal = [0, 0, 1];

    const helper = vec3.normalize(
      vec3.create(),
      vec3.cross(vec3.create(), firstNormal, spiderOrientation)
    );

    const rn = vec3.normalize(
      vec3.create(),
      vec3.cross(vec3.create(), spiderOrientation, helper)
    );

    //  Helper
    //diffPoints.push( ray, vec3.add( vec3.create(), ray, vec3.scale(vec3.create(), helper, 0.5)));
    //diffColors.push([255, 255, 0, 255], [255, 255, 0, 255]);
    // rn
    //diffPoints.push( ray, vec3.add( vec3.create(), ray, vec3.scale(vec3.create(), rn, 0.5)));
    //diffColors.push([0, 255, 0, 255], [0, 255, 0, 255]);
    // Tangent
    //diffPoints.push( ray, vec3.add( vec3.create(), ray, vec3.scale(vec3.create(), spiderOrientation, 0.5)));
    //diffColors.push([0, 0, 255, 255], [0, 0, 255, 255]);

    const q = quat.rotationTo(quat.create(), [0, 0, 1], spiderOrientation);

    // console.log("Spider Orientation", q);

    spi = new Spider({ num, debug }, rayb, ray, spiderOrientation, [
      rr(100, 255),
      rr(100, 255),
      rr(100, 255),
      255,
    ]);

    //spi.lastPosition = ray;

    spiStart = spi.state;
    race.start(spi.state.position);
    racePoints.push(race.pos);
    //tube.start(spiStart, radius, sides); // Start a gesture.
    tube2.start(spiStart, radius, sides); // Start a gesture.
    growing = true;
  }

  if (e.is("keyboard:down:t")) noTube = !noTube; // TODO: Why can't this toggle on?

  if (e.is("lift") && e.button === 0) {
    growing = false;
    //tube.stop();
    tube2.stop();
  }

  if (e.is("keyboard:down:enter")) {
    gpu.message({ type: "export-scene" });
  }

  // Increase model complexity.
  if (e.is("keyboard:down:k")) {
    sides += 1;
    limiter = 0;
    limiter2 = 0;
  }

  if (e.is("keyboard:down:j")) {
    sides = max(1, sides - 1);
    limiter = 0;
    limiter2 = 0;
  }

  if (e.is("wheel") && e.dir > 0 && tube) {
    limiter += 1;
    tube.form.limiter = limiter;
  }

  if (e.is("wheel") && e.dir < 0 && tube) {
    limiter -= 1;
    if (limiter < 0) limiter = tube.form.vertices.length / 2;
    tube.form.limiter = limiter;
  }

  if (e.is("keyboard:down:[")) {
    limiter2 += 1;
    tube2.form.limiter = limiter2;
  }

  if (e.is("keyboard:down:]")) {
    limiter2 -= 1;
    if (limiter2 < 0) limiter2 = tube2.form.vertices.length / 2;
    tube2.form.limiter = limiter2;
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

  gesture = []; // Set up points on a path / gesture. (Resets on each gesture.)
  // Used for triangulation logic.

  lastPathP;
  shape;
  form;
  positions = [];
  colors = [];
  sides;

  geometry = "triangles"; // or "lines"

  constructor($, geometry) {
    this.$ = $; // Hold onto the API.

    this.geometry = geometry;

    // Make the buffered geometry form, given the geometry type.
    this.form = new $.Form(
      {
        type:
          this.geometry === "triangles" ? "triangle:buffered" : "line:buffered",
        keep: true,
        //this.geometry === "triangles" ? "triangle" : "line", // Toggle this for testing full form updates.
        //keep: false,
        gradients: false,
      },
      //{ type: "line:buffered", gradients: false },
      //{ tex: this.$.painting(2, 2, (g) => g.wipe(0, 0, 70)) },
      { color: [255, 255, 255, 255] }, // If vertices are passed then this number blends down.
      { scale: [1, 1, 1] }
    );

    const totalLength = 1;
    this.form.MAX_POINTS = totalLength * 2 * 32000; // Must be a multiple of two for "line".
    //  Note: It would be cool to add per vertex gradient support.
    //        Maybe if a gradients array was passed of trues and falses that
    //        matched positions?
    // Note: I could eventually add behavioral data into these vertices that
    //       animate things / turn on or off certain low level effects etc.
  }

  // Creates an initial position, orientation and end cap geometry.
  start(p, radius, sides) {
    this.sides = sides;
    if (this.sides === 1) this.sides = 0;

    // Create an initial position in the path and generate points in the shape.
    this.shape = this.#segmentShape(radius, this.sides);
    const start = this.#pathp(p);
    this.lastPathP = start; // Store an inital lastPath.

    // 1. Transform the first shape and add an end cap. Draw triangle ring.

    this.#transformShape(start);
    if (this.sides > 1) this.#cap(start);
  }

  // Adds additonal points as as args in [position, rotation, color] format.
  goto() {
    // Add new points to the path.
    const path = [...arguments].map((p) => this.#pathp(p));

    // Extrude shape points from and in the direction of each path vertex.
    path.forEach((p) => this.#transformShape(p));
    this.#consumePath(...path);
  }

  stop() {
    this.#cap(this.lastPathP, false); // no cap
    this.gesture.length = 0;
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
      positions.push([sin(angle) * radius, cos(angle) * radius, 0, 1]);
    }

    return positions;
  }

  // Generate a path point with room for shape positions.
  #pathp({ position, direction, color, quat }) {
    return { pos: position, direction, color, quat, shape: [] };
  }

  // Generate a start or end (where ring === false) cap to the tube.
  #cap(pathP, ring = true) {
    const tris = this.geometry === "triangles";

    // 📐 Triangles

    if (tris) {
      // 2️⃣ Two Sides
      if (this.sides === 2) {
        if (ring) {
          this.form.addPoints({
            positions: [pathP.shape[1], pathP.shape[pathP.shape.length - 1]],
            colors: [pathP.color, pathP.color],
            // [255, 100, 0, 255], [255, 100, 0, 255],
          });
        }
      }

      // 3️⃣ Three Sides
      if (this.sides === 3) {
        // Start cap.
        if (ring) {
          for (let i = 0; i < pathP.shape.length; i += 1) {
            if (i > 1) {
              this.form.addPoints({
                positions: [pathP.shape[i]],
                colors: [pathP.color],
                // [0, 100, 0, 255], [0, 100, 0, 255],
              });
            }
          }

          this.form.addPoints({
            positions: [pathP.shape[1]],
            //colors: [pathP.color],
            colors: [
              [0, 50, 255, 255],
              [0, 50, 255, 255],
            ],
            // [255, 100, 0, 255], [255, 100, 0, 255],
          });
        } else {
          // End cap.
          this.form.addPoints({
            positions: [pathP.shape[1], pathP.shape[2], pathP.shape[3]],
            colors: [pathP.color, pathP.color, pathP.color],
            // [255, 100, 0, 255], [255, 100, 0, 255],
          });
        }
      }

      // 4️⃣ Four sides.
      if (this.sides === 4) {
        this.form.addPoints({
          positions: [
            pathP.shape[1],
            pathP.shape[2],
            pathP.shape[3],
            pathP.shape[3],
            pathP.shape[4],
            pathP.shape[1],
          ],
          colors: [
            pathP.color,
            pathP.color,
            pathP.color,
            pathP.color,
            pathP.color,
            pathP.color,
          ],
          // [255, 100, 0, 255], [255, 100, 0, 255],
        });
      }

      // This is a general case now.
      if (this.sides >= 5) {
        const center = pathP.shape[0]; // Hold onto center point.

        // Radiate around each point, plotting a triangle towards the center,
        // between this and the next point, skipping the last.
        for (let i = 1; i < pathP.shape.length - 1; i += 1) {
          if (!ring) {
            this.form.addPoints({
              positions: [center, pathP.shape[i], pathP.shape[i + 1]],
              colors: [
                [255, 0, 0, 255],
                [0, 255, 0, 255],
                [0, 255, 0, 255],
              ],
            });
          } else {
            this.form.addPoints({
              positions: [center, pathP.shape[i + 1], pathP.shape[i]],
              colors: [
                [255, 0, 0, 255],
                [0, 255, 0, 255],
                [0, 255, 0, 255],
              ],
            });
          }
        }

        if (!ring) {
          // And wrap around to the beginning for the final point.
          this.form.addPoints({
            positions: [
              center,
              pathP.shape[pathP.shape.length - 1],
              pathP.shape[1],
            ],
            colors: [
              [255, 0, 0, 255],
              [0, 255, 0, 255],
              [0, 255, 0, 255],
            ],
          });
        } else {
          this.form.addPoints({
            positions: [
              center,
              pathP.shape[1],
              pathP.shape[pathP.shape.length - 1],
            ],
            colors: [
              [255, 0, 0, 255],
              [0, 255, 0, 255],
              [0, 255, 0, 255],
            ],
          });
        }
      }
    } else {
      // 📈 Lines (TODO: This branch could be simplified and broken down)

      if (this.sides > 2) {
        for (let i = 0; i < pathP.shape.length; i += 1) {
          // Pie: Radiate out from core point
          if (i > 0 && this.sides > 4) {
            this.form.addPoints({
              positions: [pathP.shape[0], pathP.shape[i]],
              // colors: [pathP.color, pathP.color],
              colors: [
                [255, 0, 0, 255],
                [255, 0, 0, 255],
              ],
            });
          }

          // Single diagonal for a quad.
          if (i === 0 && this.sides === 4) {
            this.form.addPoints({
              positions: [pathP.shape[1], pathP.shape[3]],
              // colors: [pathP.color, pathP.color],
              colors: [
                [255, 0, 0, 255],
                [255, 0, 0, 255],
              ],
            });
          }

          // Ring: Skip core point
          if (i > 1 && ring) {
            this.form.addPoints({
              positions: [pathP.shape[i - 1], pathP.shape[i]],
              // colors: [pathP.color, pathP.color],
              colors: [
                [0, 100, 0, 255],
                [0, 100, 0, 255],
              ],
            });
          }
        }
      }

      // Ring: add final point
      if (ring) {
        this.form.addPoints({
          positions: [pathP.shape[1], pathP.shape[pathP.shape.length - 1]],
          // colors: [pathP.color, pathP.color],
          colors: [
            [255, 100, 0, 255],
            [255, 100, 0, 255],
          ],
        });
      }
    }
  }

  #transformShape(pathP) {
    const { quat, mat4, vec4, vec3, radians } = this.$.num;

    //const lastDir = this.lastPathP.direction;
    //console.log(dir, lastDir);
    //const sq = quat.rotationTo(quat.create(), lastDir, dir);
    //const finalDir = vec3.transformQuat(vec3.create(), lastDir, sq);
    // const nd = vec3.scale(vec3.create(), finalDir, -1);

    // Method 1: Using normalized orientation vector.
    //const nd = vec3.scale(vec3.create(), dir, -1);

    // console.log(pathP.quat);

    //const dir = pathP.direction;

    //const rm = mat4.targetTo(mat4.create(), [0, 0, 0], dir, [0, 1, 0]);

    const rm = mat4.fromRotationTranslationScaleOrigin(
      mat4.create(),
      pathP.quat,
      pathP.pos,
      [1, 1, 1],
      [0, 0, 0]
    );

    // console.log(this.gesture.length, pathP.quat)

    //const sq = quat.rotationTo(quat.create(), normDir, steppedDir);
    //const finalDir = vec3.transformQuat(vec3.create(), normDir, sq);

    //const panned = mat4.fromTranslation(mat4.create(), pathP.pos);
    //const finalMat = mat4.mul(mat4.create(), panned, rm);

    this.shape.forEach((shapePos) => {
      pathP.shape.push(
        vec4.transformMat4(vec4.create(), [...shapePos, 1], rm)
        //vec4.transformQuat(vec3.create(), [...shapePos, 1], pathP.quat)
      );
    });
  }

  // Copy each point in the shape, transforming it by the added path positions
  // and angles to `positions` and `colors` which can get added to the `form`.
  #consumePath() {
    const positions = [];
    const colors = [];
    const tris = this.geometry === "triangles";

    //[...arguments].forEach((pathP, pi) => {

    const args = [...arguments];

    for (let pi = 0; pi < args.length; pi += 1) {
      const pathP = args[pi];

      this.gesture.push(pathP);
      // console.log("Number of sections so far:", this.gesture.length);

      for (let si = 0; si < pathP.shape.length; si += 1) {
        if (si === 0) {
          //positions.push(this.lastPathP.shape[si], pathP.shape[si]); // 1. Core line
          //colors.push(pathP.color, pathP.color);
          // colors.push([127, 127, 127, 255], [127, 127, 127, 255]);
        }

        if (this.sides === 1) return;

        // 2. Vertical
        if (si > 0) {
          // 📐
          if (tris) {
            // Two Sides
            if (this.sides === 2) {
              // This may *not* only be a sides 2 thing...

              if (this.gesture.length > 1) {
                positions.push(this.lastPathP.shape[si]); // First tri complete for side length of 2.
                colors.push(pathP.color);
              }

              //positions.push(pathP.shape[si]);
              //colors.push([255, 0, 0, 255]);

              if (si > 1) {
                positions.push(this.lastPathP.shape[si]);
                positions.push(pathP.shape[si - 1]);
                positions.push(pathP.shape[si]);
                colors.push([255, 0, 0, 200]);
                colors.push([0, 255, 0, 200]);
                colors.push([0, 0, 255, 200]);

                //if (positions.length > 0)
                //  this.form.addPoints({ positions, colors });
                //return;
              }
            }

            // Three Sides
            if (this.sides === 3) {
              positions.push(pathP.shape[si]);

              if (si === 3) {
                colors.push([0, 255, 0, 100]);
              } else {
                colors.push([255, 0, 0, 255]);
              }
            }

            // Four Sides
            if (this.sides === 4) {
              if (si === 1) {
                positions.push(this.lastPathP.shape[si]);
                positions.push(pathP.shape[si]);
                colors.push([255, 0, 0, 200]);
                colors.push([0, 255, 0, 200]);
              }

              if (si === 2) {
                positions.push(this.lastPathP.shape[si]);
                positions.push(pathP.shape[si]);
                colors.push([0, 0, 255, 200]);
                colors.push([0, 0, 255, 200]);
              }

              if (si === 3) {
                positions.push(this.lastPathP.shape[si]);
                positions.push(pathP.shape[si]);
                colors.push([255, 0, 0, 200]);
                colors.push([255, 0, 0, 200]);
              }

              if (si === 4) {
                positions.push(this.lastPathP.shape[si]);
                positions.push(pathP.shape[si]);
                colors.push([255, 255, 0, 200]);
                colors.push([255, 255, 0, 200]);
              }
              // colors.push(pathP.color);
              // colors.push(pathP.color);
            }

            if (this.sides >= 5) {
              if (si === 1) {
                positions.push(pathP.shape[si]);
                positions.push(this.lastPathP.shape[si]);
                positions.push(this.lastPathP.shape[si + 1]);
                colors.push([255, 255, 255, 255]);
                colors.push([255 / si, 0, 0, 200]);
                colors.push([0, 0, 255 / si, 200]);
              } else {
                positions.push(this.lastPathP.shape[si]);
                positions.push(pathP.shape[si]);
                colors.push([255 / si, 0, 0, 200]);
                colors.push([0, 0, 255 / si, 200]);
              }
            }
          } else {
            // 📈 Lines
            positions.push(this.lastPathP.shape[si], pathP.shape[si]);
            colors.push(pathP.color, pathP.color);
          }
        }

        // 3. Across (We skip the first shape points here.)
        if (si > 1) {
          // 📐
          if (tris) {
            if (this.sides === 2) {
              //positions.push(pathP.shape[si - 1]);
              //colors.push(pathP.color);
              //   if (positions.length > 0)
              //     this.form.addPoints({ positions, colors });
              //   return;
            }

            if (this.sides === 3) {
              positions.push(pathP.shape[si - 1]);
              colors.push(pathP.color);

              positions.push(this.lastPathP.shape[si]);
              colors.push(pathP.color);
            }

            if (this.sides === 4) {
              // if (positions.length > 0) this.form.addPoints({ positions, colors });
              // return;

              //colors.push(pathP.color);
              if (si === 2) {
                positions.push(pathP.shape[si - 1]);
                colors.push([0, 0, 255, 255]);
              }

              if (si === 3) {
                positions.push(pathP.shape[si - 1]);
                colors.push([255, 0, 0, 255]);
              }

              if (si === 4) {
                positions.push(pathP.shape[si - 1]);
                colors.push([255, 255, 0, 255]);
              }
            }

            if (this.sides >= 5) {
              positions.push(pathP.shape[si - 1]);
              colors.push([255, 255, 0, 255]);
            }
          } else {
            // 📈 Lines
            positions.push(pathP.shape[si], pathP.shape[si - 1]);
            colors.push(pathP.color, pathP.color);
          }
          // [255, 180, 180, 255], [255, 180, 180, 255]
        }

        // 4. Diagonal
        if (si > 0 && si < pathP.shape.length - 1) {
          // 📐
          if (tris) {
            // Two sided
            if (sides === 2) {
              if (si === 1) {
                positions.push(pathP.shape[si]);
                colors.push([0, 255, 0, 255]);
              }

              //colors.push(pathP.color);
            }

            // 3️⃣
            // Three sided
            if (this.sides === 3) {
              if (si === 1) {
                positions.push(this.lastPathP.shape[si + 1]);
                colors.push([255, 255, 255, 255]);

                positions.push(this.lastPathP.shape[si]);
                colors.push([255, 0, 255, 100]);
              } else if (si === 2) {
                // positions.push(pathP.shape[si]);
                // colors.push([0, 255, 0, 100]);
                positions.push(
                  this.lastPathP.shape[si],
                  this.lastPathP.shape[si + 1],
                  pathP.shape[si]
                );
                colors.push(
                  [255, 0, 0, 255],
                  [0, 255, 0, 255],
                  [0, 0, 255, 255]
                );
              }
            }

            // 4️⃣
            // Four sided
            if (this.sides === 4) {
              if (si === 1) {
                // positions.push(this.lastPathP.shape[si + 1], pathP.shape[si]);

                positions.push(this.lastPathP.shape[si + 1]);
                colors.push([255, 255, 255, 255]);

                //  if (positions.length > 0) this.form.addPoints({ positions, colors });
                //  return;
              }
              if (si === 2) {
                positions.push(
                  this.lastPathP.shape[si],
                  this.lastPathP.shape[si + 1],
                  pathP.shape[si]
                );
                colors.push([0, 255, 0, 255]);
                colors.push([0, 255, 0, 255]);
                colors.push([0, 255, 0, 255]);

                // if (positions.length > 0) this.form.addPoints({ positions, colors });
                // return;
              }
              if (si === 3) {
                positions.push(
                  this.lastPathP.shape[si],
                  this.lastPathP.shape[si + 1],
                  pathP.shape[si]
                );
                colors.push([0, 255, 255, 255]);
                colors.push([0, 255, 255, 255]);
                colors.push([0, 255, 255, 255]);
              }
            }

            if (this.sides >= 5) {
              if (si === 1) {
                //positions.push(this.lastPathP.shape[si + 1]);
                //colors.push([255, 255, 255, 255]);
              } else {
                positions.push(
                  this.lastPathP.shape[si],
                  this.lastPathP.shape[si + 1],
                  pathP.shape[si]
                );
                colors.push([0, 255, 255, 255]);
                colors.push([0, 255, 255, 255]);
                colors.push([0, 255, 255, 255]);
              }
            }
          } else {
            // 📈 Lines
            positions.push(this.lastPathP.shape[si + 1], pathP.shape[si]);
            colors.push([255, 0, 0, 255], [255, 0, 0, 255]);
            //colors.push(pathP.color, pathP.color);
          }
          // [0, 180, 180, 255], [0, 180, 180, 255]
        }
      }

      // 5. Final side / diagonal

      // Triangles
      if (tris) {
        if (sides === 2) {
          //if (positions.length > 0)
          //  this.form.addPoints({ positions, colors });
          //return;
          /*
          positions.push(
            this.lastPathP.shape[1],
            pathP.shape[pathP.shape.length - 1]
          );

          //colors.push(pathP.color, pathP.color);
          colors.push([0, 0, 255, 255], [0, 0, 255, 255]);

          positions.push(this.lastPathP.shape[3]);
          colors.push([255, 255, 0, 255]);

          console.log(positions);
          */
        }

        if (this.sides === 3) {
          positions.push(
            pathP.shape[pathP.shape.length - 1],
            this.lastPathP.shape[1],
            this.lastPathP.shape[pathP.shape.length - 1]
          );

          //colors.push(pathP.color, pathP.color);
          colors.push(
            [255, 255, 255, 255],
            [255, 255, 255, 255],
            [255, 255, 255, 255]
          );

          // 6. Final across
          //positions.push(pathP.shape[1], pathP.shape[pathP.shape.length - 1]);
          //colors.push(pathP.color, pathP.color);
          //colors.push([255, 180, 180, 255], [255, 180, 180, 255]);

          //positions.push(this.lastPathP.shape[1]);
          //colors.push([0, 0, 0, 255]);

          positions.push(
            pathP.shape[pathP.shape.length - 1],
            this.lastPathP.shape[1],
            pathP.shape[1]
          );

          colors.push([255, 0, 0, 255], [0, 255, 0, 255], [0, 0, 255, 255]);

          //if (positions.length > 0) this.form.addPoints({ positions, colors });
          //return;
        }

        if (this.sides === 4) {
          // First closer.
          positions.push(
            pathP.shape[pathP.shape.length - 1],
            this.lastPathP.shape[1],
            this.lastPathP.shape[pathP.shape.length - 1]
          );

          colors.push(
            [255, 255, 255, 255],
            [255, 255, 255, 255],
            [255, 255, 255, 255]
          );
          //colors.push([255, 0, 0, 255], [0, 255, 0, 255], [0, 0, 255, 255]);

          positions.push(
            pathP.shape[pathP.shape.length - 1],
            this.lastPathP.shape[1],
            pathP.shape[1]
          );

          colors.push([255, 0, 0, 255], [0, 255, 0, 255], [0, 0, 255, 255]);

          //if (positions.length > 0) this.form.addPoints({ positions, colors });
          //return;

          // 6. Final across
          // positions.push(pathP.shape[1], pathP.shape[pathP.shape.length - 1]);
          //colors.push(pathP.color, pathP.color);
          // colors.push([255, 180, 180, 255], [255, 180, 180, 255]);

          // positions.push(this.lastPathP.shape[1]);
          // colors.push([0, 0, 0, 255]);
        }

        if (this.sides >= 5) {
          // First closer.
          positions.push(
            pathP.shape[pathP.shape.length - 1],
            this.lastPathP.shape[pathP.shape.length - 1],
            this.lastPathP.shape[1]
          );

          colors.push(
            [255, 255, 255, 255],
            [255, 255, 255, 255],
            [255, 255, 255, 255]
          );
          //colors.push([255, 0, 0, 255], [0, 255, 0, 255], [0, 0, 255, 255]);

          positions.push(
            pathP.shape[pathP.shape.length - 1],
            this.lastPathP.shape[1],
            pathP.shape[1]
          );

          colors.push([255, 0, 0, 255], [0, 255, 0, 255], [0, 0, 255, 255]);
        }
      } else {
        // Lines

        if (this.sides > 2) {
          positions.push(
            this.lastPathP.shape[1],
            pathP.shape[pathP.shape.length - 1]
          );
          colors.push([0, 0, 255, 255], [0, 0, 255, 255]);
        }

        if (this.sides > 2) {
          // 6. Final across
          positions.push(pathP.shape[1], pathP.shape[pathP.shape.length - 1]);
          //colors.push(pathP.color, pathP.color);
          colors.push([255, 180, 180, 255], [255, 180, 180, 255]);
        }
      }

      this.lastPathP = pathP;
    }

    if (positions.length > 0) this.form.addPoints({ positions, colors });
  }
}

// Turtle graphics in 3D.
class Spider {
  $;
  position;
  direction;
  lastDirection;
  color;

  rotQuat;

  path = []; // A built up path.
  lastPosition;
  lastNormal;

  constructor(
    $,
    pos = [0, 0, 0, 1],
    lp = [0, 0, 0, 1],
    dir = [0.00001, 1, 0.00001],
    col = [255, 255, 255, 255]
  ) {
    this.$ = $;
    this.position = pos;
    if (pos.length === 3) pos.push(1); // Make sure pos has a W. TODO: Eventually fix this up-chain.

    this.direction = dir;
    this.lastDirection = dir; // Should only ever be re-assigning.

    this.color = col;

    //this.rotQuat = quat;

    this.lastPosition = lp;
    this.lastNormal = [0, 0, 1];
    this.rotateTowards(this.position);
    this.path.push(this.state);
  }

  get state() {
    // TODO: Is slicing necessary? (Try a complex path with it off.)
    return {
      direction: this.direction.slice(),
      quat: this.rotQuat,
      position: this.position.slice(),
      //angle: this.angle.slice(),
      color: this.color.slice(),
    };
  }

  // TODO: See if this can support all color parameters via the color parser
  //       in disk.

  // Set the color.
  ink() {
    if (arguments.length === 3) {
      this.color = [...arguments, 255];
    } else {
      // Assume 4
      this.color = [...arguments];
    }
  }

  // Move the spider forward in 3D by n steps, or imagine a forward move.
  // Turning is optional.
  crawl(stepSize, turn, peeking = false) {
    const {
      num: { mat3, mat4, quat, vec4, vec3, radians },
      debug,
    } = this.$;

    // Old
    const scaledDir = vec3.scale(vec3.create(), this.direction, stepSize);
    const pos = vec3.add(vec3.create(), this.position, scaledDir);

    // if (debug) { // TODO: Log peek position.
    //   const p = this.position.map(p => p.toFixed(2)),
    //     a = this.angle.map(a => a.toFixed(2));
    //   console.log( "🕷️ Pos", "X:", p[0], "Y:", p[1], "Z:", p[2]);
    //   console.log( "🕷️ Rot", "X:", a[0], "Y:", a[1], "Z:", a[2]);
    // }

    // Don't actually go further if we are only taking a peek.
    if (peeking) return pos;

    //this.turnDelta = [0, 0, 0]; // Consume turn angle.
    this.lastPosition = this.position;
    // this.position = [...pos, 1];
    this.position = [...pos];

    const state = this.state;
    this.path.push(state);
    return state;
  }

  // Imagine a future position, turning an optional amount beforehand.
  peek(steps, turn) {
    return this.crawl(steps, turn, true);
  }

  // TODO: Keep track of the last normal...

  rotateTowards(targetPosition, tightness) {
    const {
      num: { mat3, mat4, vec3, quat, radians },
    } = this.$;

    const firstTangent = vec3.normalize(
      vec3.create(),
      vec3.sub(vec3.create(), this.position, this.lastPosition)
    );
    const nextTangent = vec3.normalize(
      vec3.create(),
      vec3.sub(vec3.create(), targetPosition, this.position)
    );

    let lastNormal = this.lastNormal;

    const helper = vec3.normalize(
      vec3.create(),
      vec3.cross(vec3.create(), lastNormal, firstTangent)
    );
    lastNormal = vec3.normalize(
      vec3.create(),
      vec3.cross(vec3.create(), firstTangent, helper)
    );

    diffPoints.push(
      this.position,
      vec3.add(
        vec3.create(),
        this.position,
        vec3.scale(vec3.create(), firstTangent, 0.01)
      )
    );
    diffColors.push([0, 0, 255, 255], [0, 0, 255, 255]);

    let newNormal;

    let bitangent = vec3.cross(vec3.create(), firstTangent, nextTangent);

    const theta = acos(vec3.dot(firstTangent, nextTangent)) || 0;

    if (vec3.length(bitangent) === 0) {
      newNormal = lastNormal;
      // TODO: Starting angle is fucking up.

      diffPoints.push(
        this.position,
        vec3.add(
          vec3.create(),
          this.position,
          vec3.scale(vec3.create(), newNormal, 0.01)
        )
      );
      diffColors.push([0, 255, 0, 255], [0, 255, 0, 255]);
    } else {
      // Get angle between first and next tangent.
      bitangent = vec3.normalize(vec3.create(), bitangent);

      const mat = mat4.fromRotation(mat4.create(), theta, bitangent); // Rotate theta radians around bitangent.
      newNormal = vec3.transformMat4(vec3.create(), lastNormal, mat);

      // This also works...
      //let rq = quat.rotationTo(quat.create(), firstTangent, nextTangent);
      //newNormal = vec3.transformQuat(vec3.create(), firstNormal, rq)

      diffPoints.push(
        this.position,
        vec3.add(
          vec3.create(),
          this.position,
          vec3.scale(vec3.create(), newNormal, 0.01)
        )
      );
      diffColors.push([0, 255, 0, 255], [0, 255, 0, 255]);
    }

    bitangent = vec3.normalize(
      vec3.create(),
      vec3.cross(vec3.create(), newNormal, firstTangent)
    );

    diffPoints.push(
      this.position,
      vec3.add(
        vec3.create(),
        this.position,
        vec3.scale(vec3.create(), bitangent, 0.01)
      )
    );
    diffColors.push([255, 255, 0, 255], [255, 255, 0, 255]);

    const rotMat = mat3.fromValues(...bitangent, ...newNormal, ...firstTangent);
    const qua = quat.normalize(
      quat.create(),
      quat.fromMat3(quat.create(), rotMat)
    );

    this.lastNormal = newNormal; // Keep track of last normal.

    // Interpolate the quaternion by a turn radius.

    let fq = qua;
    if (this.rotQua) {
      fq = quat.slerp(quat.create(), this.rotQuat, qua, tightness);
    }

    this.rotQuat = fq; // Only update the quaternion if it makes sense with the bitangent result.
    this.direction = nextTangent;
  }

  // Turn the spider on any axis.
  // TODO: Eventually add named parameters or more shorthand functions.
  //turn(x, y, z) {
  //this.angle[0] = (this.angle[0] + x) % 360;
  //this.angle[1] = (this.angle[1] + y) % 360;
  //this.angle[2] = (this.angle[2] + z) % 360;
  //  return this.state;
  //}
}
