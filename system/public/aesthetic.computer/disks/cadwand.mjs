// ️🪄 Cadwand, 22.11.05.00.30 ⚙️
// A laboratory for designing the procedural geometry in `wand`.

// TODO
// - [-] Turn / crawl towards the 3d cursor position.
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
// - [x] Make a spider that can move the tube forward and generate a path over time.

import { CamDoll } from "../lib/cam-doll.mjs";
const { max, floor, cos, sin } = Math;

let cd, stage; // Camera and floor.

let spi, // Crawls in 3D and creates a path.
  spiStart,
  tubeGoto = [];

let tube, // Tube geometry that surrounds the spider's path at even increments.
  rot = 0,
  rotSpeed = 0.5,
  yw = 8,
  sides = 2,
  radius = 0.2,
  limiter = 0;

let step = 0.15;
let microstep = 0.05;
let growing = false;

function boot({ Camera, Dolly, Form, QUAD, painting, num, debug, help }) {
  cd = new CamDoll(Camera, Dolly, { z: 1.4, y: 0.5 }); // FPS style camera controls.
  stage = new Form(
    QUAD,
    { tex: painting(2, 2, (g) => g.wipe(0, 0, 70)) },
    { rot: [-90, 0, 0] }
  );

  // Create a spider and set its starting state.
  spi = new Spider({ num, debug }, [0, 0, 0], [0, 0, 0], [255, 0, 0, 255]);
  spiStart = spi.state;
}

function sim({
  wiggle,
  simCount,
  num: { vec3, randIntRange: rr, dist3d, degrees },
  help,
}) {
  yw = wiggle(8); // 🎡 Some dynamics for each frame
  rot += rotSpeed;
  cd.sim();

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
}

function paint({ wipe, Form, form, num, wiggle }) {
  wipe(0, 0, 50); // Clear the background...
  //ink(0, 1).box(0, 0, screen.width, screen.height); // Or use a fade effect.

  // Draw the spider's path so far.
  const spiderPositions = [];
  const spiderColors = [];

  for (let s = 0; s < spi.path.length - 1; s += 1) {
    spiderPositions.push(spi.path[s].position, spi.path[s + 1].position);
    spiderColors.push([255, 255, 255, 255], [0, 0, 0, 255]);
    //spiderColors.push(spi.path[s + 1].color, spi.path[s + 1].color);
  }

  const spiderForm = new Form(
    {
      type: "line",
      positions: spiderPositions,
      colors: spiderColors,
      gradients: true,
    },
    { color: [255, 255, 0, 255] },
    { scale: [1, 1, 1] }
  );

  // And however far the tube has gotten, given the spider's length.
  tube = new Tube({ Form, num, wiggle }, radius); // Make a new tube.
  tube.form.limiter = limiter; // Copy over its limiter.
  tube?.start(spiStart, radius, sides); // Start a gesture.
  tube?.goto(...tubeGoto); // Continue a gesture.
  tube?.stop(); // Finish a gesture.

  form([stage, spiderForm, tube?.form], cd.cam, { cpu: true }); // Draw the tube and floor.
  // return false;
}

function act({ event: e }) {
  // Grow model.
  if (e.is("touch") && e.button === 0) growing = true;
  if (e.is("lift") && e.button === 0) growing = false;

  // Increase model complexity.
  if (e.is("keyboard:down:k")) {
    sides += 1;
    limiter = 0;
  }

  if (e.is("keyboard:down:j")) {
    sides = max(1, sides - 1);
    limiter = 0;
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
  #pathp({ position, angle, color }) {
    return { pos: position, angle, color, shape: [] };
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
          // positions.push(this.lastPathP.shape[si], pathP.shape[si]); // 1. Core
          // colors.push(pathP.color, pathP.color);
          // colors.push([127, 127, 127, 255], [127, 127, 127, 255]);
        }

        if (this.sides === 1) return;

        if (si > 0) {
          positions.push(this.lastPathP.shape[si], pathP.shape[si]); // 2. Vertical
          colors.push(pathP.color, pathP.color);
        }

        if (si > 1) {
          positions.push(pathP.shape[si], pathP.shape[si - 1]); // 3. Across
          colors.push(pathP.color, pathP.color);
          // [255, 180, 180, 255], [255, 180, 180, 255]
        }

        if (si > 0 && si < pathP.shape.length - 1) {
          positions.push(this.lastPathP.shape[si + 1], pathP.shape[si]); // 4. Diagonal
          colors.push(pathP.color, pathP.color);
          // [0, 180, 180, 255], [0, 180, 180, 255]
        }
      }

      // 5. Final diagonal
      if (this.sides > 2) {
        positions.push(
          this.lastPathP.shape[1],
          pathP.shape[pathP.shape.length - 1]
        );
        colors.push(pathP.color, pathP.color);
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

// Turtle graphics in 3D.
class Spider {
  $;
  position;
  angle;
  color;

  path = []; // A built up path.

  constructor(
    $,
    pos = [0, 0, 0, 1],
    ang = [0, 0, 0],
    col = [255, 255, 255, 255]
  ) {
    this.$ = $;
    this.position = pos;
    if (pos.length === 3) pos.push(1); // Make sure pos has a W.
    this.angle = ang;
    this.color = col;
    this.path.push(this.state);
  }

  get state() {
    // TODO: Is slicing necessary? (Try a complex path with it off.)
    return {
      position: this.position.slice(),
      angle: this.angle.slice(),
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
  crawl(steps, turn, peeking = false) {
    const {
      num: { mat4, quat, vec4, radians },
      debug,
    } = this.$;

    // Turn for real if we are not peeking, or imagine turning if we are.
    let turnAmount = this.angle.slice();
    if (peeking && turn) {
      turnAmount[0] = (this.angle[0] + turn[0]) % 360;
      turnAmount[1] = (this.angle[1] + turn[1]) % 360;
      turnAmount[2] = (this.angle[2] + turn[2]) % 360;
    }

    // 💆 These quaternions don't really work / they squash eventually?
    //    (Ask sage - should I factor out glMatrix entirely?)
    // Get the current rotated and translated position.
    // const rotation = quat.normalize(
    //   quat.create(),
    //   quat.fromEuler(quat.create(), ...turnAmount)
    // );
    // const m = mat4.fromRotationTranslation(
    //   mat4.create(),
    //   rotation,
    //   this.position
    // );
    //const pos = vec4.transformMat4(vec4.create(), [0, steps, 0, 1], m);

    const panned = mat4.fromTranslation(mat4.create(), this.position);
    // ... and around angle.
    const rotX = mat4.fromXRotation(mat4.create(), radians(turnAmount[0]));
    const rotY = mat4.fromYRotation(mat4.create(), radians(turnAmount[1]));
    const rotZ = mat4.fromZRotation(mat4.create(), radians(turnAmount[2]));
    // Note: Would switching to quaternions make this terse? 22.11.05.23.34
    //       Should also be done in the `Camera` and `Form` class inside `graph.mjs`.
    const rotatedX = mat4.mul(mat4.create(), panned, rotX);
    const rotatedY = mat4.mul(mat4.create(), rotatedX, rotY);
    const rotatedZ = mat4.mul(mat4.create(), rotatedY, rotZ);
    const m = rotatedZ;

    // Project it outwards by `steps`.
    const pos = vec4.transformMat4(vec4.create(), [0, steps, 0, 1], m);

    // if (debug) { // TODO: Log peek position.
    //   const p = this.position.map(p => p.toFixed(2)),
    //     a = this.angle.map(a => a.toFixed(2));
    //   console.log( "🕷️ Pos", "X:", p[0], "Y:", p[1], "Z:", p[2]);
    //   console.log( "🕷️ Rot", "X:", a[0], "Y:", a[1], "Z:", a[2]);
    // }

    // Don't actually go further if we are only taking a peek.
    if (peeking) return pos;

    //this.turnDelta = [0, 0, 0]; // Consume turn angle.
    this.position = pos;
    const state = this.state;
    this.path.push(state);
    return state;
  }

  // Imagine a future position, turning an optional amount beforehand.
  peek(steps, turn) {
    return this.crawl(steps, turn, true);
  }

  // Turn the spider on any axis.
  // TODO: Eventually add named parameters or more shorthand functions.
  turn(x, y, z) {
    this.angle[0] = (this.angle[0] + x) % 360;
    this.angle[1] = (this.angle[1] + y) % 360;
    this.angle[2] = (this.angle[2] + z) % 360;
    return this.state;
  }
}

function distanceTo(v1, v2) {
  return Math.sqrt(distanceToSquared(v1, v2));
}

function distanceToSquared(v1, v2) {
  const dx = v1[0] - v2[0],
    dy = v1[1] - v2[1],
    dz = v1[2] - v2[2];
  return dx * dx + dy * dy + dz * dz;
}
