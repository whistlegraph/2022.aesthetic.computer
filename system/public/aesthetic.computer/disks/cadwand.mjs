// ️🪄 Cadwand, 22.11.05.00.30 ⚙️
// A laboratory for designing the procedural geometry in `wand`.

// TODO
// - [-] Render triangulated geometry onto the GPU.
//   - [] Get it working on the CPU first.
// - [] Set up both lines and triangles mode using buffered geometry.
// - [] Prevent the tube's circle from twisting on its Y axis.
// - [] Integrate into `wand` and VR.
//   - [] Hook it up to the cursor via race.
//   - [] Bring that code into `wand`.
// + Later
// - [] Reload last camera position on refresh.
// - [] Record some GIFs.
// - [] There should be an "inner" and "outer" triangulation option.
//       - [] Inner ONLY for complexity 1 and 2.
//       - [] Optional elsewhere.
// - [] Draw the cursor again.
//      const cDepth = 1;
//      const cPos = cam.ray(pen.x, pen.y, cDepth, true);
//      const cRot = cam.rotation.slice();
//      form(segment({ Form, num }, cPos, cRot, 0.1, 0.1, sides), cam, { cpu: true });
// + Done
// - [x] Make the lines buffered.
// - [x] Render line geometry onto the GPU.
// - [x] Make a spider that can move the tube forward and generate a path over time.
// - [x] Turn / crawl towards the 3d cursor position.

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
  sides = 4,
  // radius = 1,
  radius = 0.4,
  limiter = 0,
  limiter2 = 0;

let race;

let step = 0.25;
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
  race = new Race();

  // Create a buffered tube to follow our gesture.
  tube = new Tube({ Form, painting, num, wiggle }, "triangles"); // Make a new tube.
  tube2 = new Tube({ Form, painting, num, wiggle }, "lines"); // Make a new tube.
}

const racePoints = [],
  diffPoints = [];

function sim({
  wiggle,
  simCount,
  pen,
  num: { vec3, randIntRange: rr, dist3d, degrees, mat4, mat3, quat, radians },
  help,
}) {
  //yw = wiggle(8); // 🎡 Some dynamics for each frame
  //rot += rotSpeed;
  cd.sim(); // Update the camera + dolly.

  // Create geometry by racing towards the cursor from the center point.
  if (growing && simCount % 10n === 0n) {
    const ray = cd.cam.ray(pen.x, pen.y, 0.3, true);
    race.to(ray); // Race towards current position.

    racePoints.push(race.pos);
    spi.rotateTowards(race.pos, 10);
    spi.crawl(step);
    //tubeGoto.push(spi.state);
    tube.goto(spi.state);
    tube2.goto(spi.state);
    spi.ink(rr(100, 255), rr(100, 255), rr(100, 255), 255); // Set the color.

    // growing = false;

    //if (dist > step) {
    //racePoints.push(race.pos);
    //spi.crawl(step);
    //}
  }

  /*
  if (simCount % 10n === 0n && growing) {
    let lastSpiderState = tubeGoto[tubeGoto.length - 1] || spiStart;
    const turn = [rr(-15, 15), 0, rr(-15, 15)];
    const peekAmount = microstep;

    let newSpiderState = spi.peek(peekAmount, turn); // Take a look outwards...

    //const p1 = [...lastSpiderState.position].map((p) => Number(p.toPrecision(4)));
    //const p2 = [...newSpiderState].map((p) => Number(p.toPrecision(4)));
    let dist = distanceTo(lastSpiderState.position, newSpiderState); // vec3's distance was innacurate.
    let angleBetween = vec3.angle(lastSpiderState.position, newSpiderState);
    //const degreeThreshold = tubeGoto.length === 0 || degrees(angleBetween) < 10;

    // If we have looked over the theshold step distance...
    if (dist > step) {
      // Then quantize some segments and push forward safely by amounts we can.
      const repeatCount = floor(dist / step);
      turn[0] /= repeatCount; // Not quite sure where the turns should go...
      turn[1] /= repeatCount;
      turn[2] /= repeatCount;
      help.repeat(repeatCount, (i) => {
        spi.turn(...turn); // Turn the amount we need to.
        spi.ink(rr(100, 255), rr(100, 255), rr(100, 255)); // Set the color.
        tubeGoto.push(spi.crawl(step));
      });
      // Note: To avoid quantizing, simply crawl by the distance.
    } else {
      // Otherwise just inch forward by the amount we peeked.
      spi.turn(...turn); // Turn the amount we need to.
      spi.crawl(peekAmount);
    }
  }
  */
}

let spiderForm;

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
    raceColors.push([255, 255, 0, 255], [255, 255, 0, 255]);
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
  /*
  const diffPositions = [];
  const diffColors = [];

  for (let d = 0; d < diffPoints.length - 1; d += 2) {
    diffPositions.push([...diffPoints[d], 1], [...diffPoints[d + 1], 1]);
    diffColors.push([255, 0, 0, 255], [255, 0, 0, 255]);
  }

  const diffForm = new Form(
    {
      type: "line",
      positions: diffPositions,
      colors: diffColors,
      gradients: false,
    },
    { color: [255, 0, 0, 255] },
    { scale: [1, 1, 1] }
  );
  */

  //form([raceForm, spiderForm, tube.form], cd.cam, { cpu: true });
  console.log("Tube verts:", tube.form.vertices.length);
  //form([stage, tube.form, tube2.form], cd.cam, { cpu: true });
  form([tube.form, tube2.form], cd.cam, { cpu: true });
}

function act({ event: e, pen, num, debug, num: { vec3, randIntRange: rr } }) {
  // Grow model.
  if (e.is("touch") && e.button === 0 && pen && pen.x && pen.y) {
    const ray = cd.cam.ray(pen.x, pen.y, 2.3, true);
    const rayb = cd.cam.ray(pen.x, pen.y, 0.1, true);

    const diff = [...vec3.sub(vec3.create(), rayb, ray)];
    const spiderOrientation = vec3.normalize(vec3.create(), diff);

    spi = new Spider({ num, debug }, ray, spiderOrientation, [
      rr(100, 255),
      rr(100, 255),
      rr(100, 255),
      255,
    ]);
    spiStart = spi.state;
    race.start(spi.state.position);
    racePoints.push(race.pos);
    tube.start(spiStart, radius, sides); // Start a gesture.
    tube2.start(spiStart, radius, sides); // Start a gesture.
    growing = true;
  }

  if (e.is("lift") && e.button === 0) {
    growing = false;
    tube.stop();
    tube2.stop();
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
        type: this.geometry === "triangles" ? "triangle" : "line:buffered",
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
  #pathp({ position, direction, color }) {
    return { pos: position, direction, color, shape: [] };
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

      // It should be a general case now.
      if (this.sides > 4) {
      }
    } else {
      // 📈 Lines

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
    const { mat4, vec4, vec3, radians } = this.$.num;

    const dir = pathP.direction;

    // Method 1: Using normalized orientation vector.
    const nd = vec3.scale(vec3.create(), dir, -1);
    const rm = mat4.targetTo(mat4.create(), [0, 0, 0], nd, [0, 1, 0]);
    const panned = mat4.fromTranslation(mat4.create(), pathP.pos);
    const finalMat = mat4.mul(mat4.create(), panned, rm);

    this.shape.forEach((shapePos) => {
      pathP.shape.push(
        vec4.transformMat4(vec4.create(), [...shapePos, 1], finalMat)
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
      console.log("Number of sections so far:", this.gesture.length);

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

              //colors.push(pathP.color);
              // colors.push(pathP.color);

              //colors.push([255, 0, 0, 200]);

              if (si === 3) {
                //colors.push([0, 255, 0, 100]);
              } else {
                //colors.push([255, 0, 0, 255]);
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
                // if (positions.length > 0) this.form.addPoints({ positions, colors });
                // return;
              }
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

              if (si === 4) {
                // positions.push(
                //   this.lastPathP.shape[si],
                //   this.lastPathP.shape[si + 1],
                //   pathP.shape[si]
                // );
                // colors.push([0, 0, 100, 255]);
                // colors.push([0, 0, 100, 255]);
                // colors.push([0, 0, 100, 255]);
                //if (positions.length > 0) this.form.addPoints({ positions, colors });
                //return;
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
  color;

  path = []; // A built up path.

  constructor(
    $,
    pos = [0, 0, 0, 1],
    dir = [0.00001, 1, 0.00001],
    col = [255, 255, 255, 255]
  ) {
    this.$ = $;
    this.position = pos;
    if (pos.length === 3) pos.push(1); // Make sure pos has a W. TODO: Eventually fix this up-chain.
    this.direction = dir;
    this.color = col;
    this.path.push(this.state);
  }

  get state() {
    // TODO: Is slicing necessary? (Try a complex path with it off.)
    return {
      direction: this.direction.slice(),
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
      num: { mat4, quat, vec4, vec3, radians },
      debug,
    } = this.$;

    const scaledDir = vec3.scale(vec3.create(), this.direction, stepSize);
    const pos = vec3.add(vec3.create(), this.position, scaledDir);

    // Turn for real if we are not peeking, or imagine turning if we are.
    //let turnAmount = this.angle.slice();
    //if (peeking && turn) {
    //  turnAmount[0] = (this.angle[0] + turn[0]) % 360;
    //  turnAmount[1] = (this.angle[1] + turn[1]) % 360;
    //  turnAmount[2] = (this.angle[2] + turn[2]) % 360;
    //}

    //const panned = mat4.fromTranslation(mat4.create(), this.position);
    // ... and around angle.
    //const rotX = mat4.fromXRotation(mat4.create(), radians(turnAmount[0]));
    //const rotY = mat4.fromYRotation(mat4.create(), radians(turnAmount[1]));
    //const rotZ = mat4.fromZRotation(mat4.create(), radians(turnAmount[2]));
    // Note: Would switching to quaternions make this terse? 22.11.05.23.34
    //       Should also be done in the `Camera` and `Form` class inside `graph.mjs`.
    //const rotatedX = mat4.mul(mat4.create(), panned, rotX);
    //const rotatedY = mat4.mul(mat4.create(), rotatedX, rotY);
    //const rotatedZ = mat4.mul(mat4.create(), rotatedY, rotZ);
    //const m = rotatedZ;

    // Project it outwards by `steps`.
    //const pos = vec4.transformMat4(vec4.create(), [0, stepSize, 0, 1], m);

    // if (debug) { // TODO: Log peek position.
    //   const p = this.position.map(p => p.toFixed(2)),
    //     a = this.angle.map(a => a.toFixed(2));
    //   console.log( "🕷️ Pos", "X:", p[0], "Y:", p[1], "Z:", p[2]);
    //   console.log( "🕷️ Rot", "X:", a[0], "Y:", a[1], "Z:", a[2]);
    // }

    // Don't actually go further if we are only taking a peek.
    if (peeking) return pos;

    //this.turnDelta = [0, 0, 0]; // Consume turn angle.
    this.position = [...pos, 1];

    const state = this.state;
    this.path.push(state);
    return state;
  }

  // Imagine a future position, turning an optional amount beforehand.
  peek(steps, turn) {
    return this.crawl(steps, turn, true);
  }

  rotateTowards(targetPosition, deg) {
    const {
      num: { mat4, vec3, radians },
    } = this.$;

    const diff = [...vec3.sub(vec3.create(), targetPosition, this.position)];

    // Cut off the math if any diff value is 0.
    if (
      Number(diff[0].toFixed(4)) === 0 ||
      Number(diff[1].toFixed(4)) === 0 ||
      Number(diff[2].toFixed(4)) === 0
    ) {
      return;
    }

    const normDiff = vec3.normalize(vec3.create(), diff);

    // Line from...
    // spiderPosition -> spiderPosition + diff.
    diffPoints.push(
      this.position,
      vec3.add(
        vec3.create(),
        this.position,
        vec3.scale(vec3.create(), normDiff, 0.1)
      )
    );

    const normDir = vec3.normalize(vec3.create(), this.direction);

    diffPoints.push(
      this.position,
      vec3.add(
        vec3.create(),
        this.position,
        vec3.scale(vec3.create(), normDir, 0.1)
      )
    );

    // Find perpendicular direction among two normal vectors.
    // TODO: ❓ Watch videos about cross product.
    const crossProduct = vec3.cross(vec3.create(), normDiff, normDir);

    diffPoints.push(
      this.position,
      vec3.add(
        vec3.create(),
        this.position,
        vec3.scale(vec3.create(), crossProduct, 0.1)
      )
    );

    // Rotate vector around angle axis.
    //export function fromRotation(out, rad, axis) {

    const rm = mat4.fromRotation(mat4.create(), radians(-deg), crossProduct);
    if (!rm) return; // Return if this matrix is null.

    const steppedDir = vec3.transformMat4(vec3.create(), normDir, rm);

    this.direction = steppedDir;
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
