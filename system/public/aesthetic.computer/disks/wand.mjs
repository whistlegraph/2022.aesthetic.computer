// Wand, 22.10.29.01.50 
//       22.10.05.11.01

// TODO
// - [👨‍🚒] Make step size equal across players. 
// - [] Cross platform Y level / eye level check and scale check.

// - [] Wand length should be based on distance and not samples.
// - [] Step size needs to take this into account.
// - [] Reset / reload a wand when it runs out.

// Server
// - [] Give each player their own wand.
// - [] Transmit wand position and length.
// - [] Along with status updates / resets.

// - [] Add touch controls.
// - [] Other players should be represented by separate geometry.
// - [] Fix scaling of 2D camera / don't scale but add depth to the screenToPoint / center function of Camera.
// - [] Add colors to line.
// - [] Switch to a new stick of color and length once a line runs out.
// - [] Title screen.
// - [] Add notifications to see who joins.
// - [] Add text chat.
// - [] Add voice chat.
// + Later
// - [] Add circular buffer to wand lines (buffer-geometry) / infinite
//      wand with dissolving trail.
// + Done
// - [x] Fast ending marks no longer add bits to the end of the preview. (Fixed / disabled)
// - [x] Add shortening of line.
// - [x] Render wand at a length that is a ratio of the actual length.
// - [x] Move 3D wand to 2D.
// - [x] Create a class for a wand. 
// - [x] Resizing the 2D camera should work properly / send new camera data?
// - [x] Set speed and step based on device type within wand.
// - [x] Limit wand length so you can run out.
// - [x] Prevent wand from maxing out.
// - [x] Add a 'wand' representation to 2d screens. 
// - [x] Make 2D camera properly scaled.
// - [x] "Flat" 2D controls to allow better participation on 2d screens.

let cam, dolly; // Camera system.
let wand; // Player / line geometry.
let floor, cross, tri; // Room Geometry.
let lookCursor = false;
let client; // Network.
let colorParams = [255, 255, 255, 255];
let W, S, A, D, UP, DOWN, LEFT, RIGHT; // Controls

// 🥾 Boot
async function boot({ painting: p, Camera, Dolly, Form, QUAD, TRI, color,
  geo: { Race, Quantizer }, num: { dist3d }, params, store, net, cursor, wipe }) {
  // colorParams = params.map((str) => parseInt(str)); // Set params for color.

  // Clear the screen to transparent and remove the cursor.
  //cursor("none");
  wipe(0, 0);

  // Connect to the network.
  client = net.socket((id, type, content) => {
    // Instantiate painters (clients) based on their `id` attribute.
    //painters[id] = painters[id] || new Painter(id);
    // Record the action.
    //actions.push({ id, type, content });
    //console.log(content);

    // Just in case we are sending messages to "everyone" / receiving our
    // own messages.
    if (client.id !== id) wand?.drawing.addPoints(content); // Add points locally.
  });

  cam = new Camera(80, { z: 4, y: 1, scale: [1, 1, 1] }); // camera with fov
  dolly = new Dolly(cam); // moves the camera


  floor = new Form(
    QUAD,
    { tex: p(2, 2, (g) => g.wipe(0, 0, 100)) },
    { pos: [0, 0, 0], rot: [-90, 0, 0], scale: [3, 3, 3] }
  );

  cross = new Form(
    QUAD,
    { tex: p(4, 4, (g) => g.noise16DIGITPAIN()) },
    { pos: [0, -0.99, 1], rot: [-90, 0, 0] }
  );

  tri = new Form(
    TRI,
    { tex: p(1, 8, (g) => g.noise16DIGITPAIN()), alpha: 0.75 },
    { pos: [0, 1, 0], scale: [0.5, 0.5, 0.5] }
  );

  // 1. Create a wand for the user.
  // Wand type, how many samples allowed, and a geometry.
  wand = await (new Wand({ Form, color, Quantizer, Race, store, dist3d, client }, "line", 8096).init({
    preload: false
  }));
}

// 🎨 Paint (Executes every display frame)
function paint({ ink, pen, pen3d, wipe, screen, Form }) {
  // The lines & the furnitue.
  ink(255, 255, 255, 150).form([tri, floor, wand?.form, wand?.drawing], cam);

  // Draw cursors for 2D screens.
  wipe(10, 0);
  if (lookCursor) ink(127).circle(pen.x, pen.y, 8);
  else if (pen) {
    const shadow = 30 * (1 - wand.progress);
    ink(127, 127).line(pen.x, pen.y, pen.x + shadow, pen.y + shadow);
  }

  if (wand?.tail) {
    ink(0, 255, 0).form(
      new Form({ type: "line", positions: wand.tail, keep: false }, { alpha: 1 }),
      cam
    );
  }

  if (wand?.tail2) {
    ink(255, 0, 0).form(
      new Form({ type: "line", positions: wand.tail2, keep: false }, { alpha: 1 }),
      cam
    );
  }
}

// 🧮 Sim(ulate) (Runs once per logic frame (120fps locked)).
function sim({ pen, pen3d, screen: { width, height }, num: { degrees: deg } }) {
  // 🔫 FPS style camera movement.
  let forward = 0, strafe = 0;
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


  // 🌴 Scenery adjustments.
  tri.turn({ y: -0.25 });

  // 🪄 Wand
  if (wand) {
    // Position wand.
    if (pen3d) {
      wand.form.turn({ x: 0.0, y: 0.0, z: 0.0 }); // Why does this make everything work?
      wand.form.position = [pen3d.pos.x, pen3d.pos.y, pen3d.pos.z, 0];
      wand.form.rotation = [deg(pen3d.rot._x), deg(pen3d.rot._y), deg(pen3d.rot._z)];
      wand.form.scale = [1, 1, 1 - wand.progress];
      wand.form.gpuTransformed = true; // Is this still needed?
    } else if (pen) {
      wand.form.turn({ x: 0.0, y: 0.0, z: 0.0 }); // Why does this make everything work?
      wand.form.position = cam.ray(pen.x, pen.y);
      wand.form.rotation = cam.rotation;
      wand.form.scale = [1, 1, 1 - wand.progress];
    }

    // Calculate current gesture.
    if (wand.waving) {
      if (wand.vr) wand.goto([pen3d.pos.x, pen3d.pos.y, pen3d.pos.z, 0]);
      else wand.goto(cam.ray(pen.x, pen.y))
    }
  }
}

// ✒ Act
function act({ event: e, color, screen, download, num: { timestamp } }) {

  // 👋 Right Hand
  if (e.is("3d:touch:2")) wand.start([e.pos.x, e.pos.y, e.pos.z, 0]); // ✏️
  if (e.is("3d:lift:2")) wand.stop(); // 🚩

  // 🖱️ Mouse
  if (e.device === "mouse" && e.button === 0) {
    if (e.is("touch")) wand.start(cam.ray(e.x, e.y), false); // ✏️ Start a mark.
    if (e.is("lift")) wand.stop(); // 🚩 End a mark.
  }

  // 👀 Look around while dragging with a finger (or mouse if 2nd button held).
  if (e.is("draw") && (e.device === "touch" || e.button === 2)) {
    cam.rotX -= e.delta.y / 3.5;
    cam.rotY -= e.delta.x / 3.5;
  }

  // Enable look mode / cursor.
  if (e.is("touch") && e.button === 2) lookCursor = true;
  if (e.is("lift") && e.button === 2) lookCursor = false;

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

  // 💾 Saving
  if (e.is("keyboard:down:enter")) {
    // 🅰️ Pack up and download the vertices in an array of arrays.
    /*
    download(`sculpture-${timestamp()}.json`, JSON.stringify(
      drawing.vertices.map(v => [
        [v.pos["0"], v.pos["1"], v.pos["2"]],
        [...v.color]
      ]))
    );
    */

    // 🅱️ Pack up and download the vertices according to an unreal engine
    //    friendly JSON import format for Data Tables..
    download(`sculpture-${timestamp()}.json`, JSON.stringify(
      wand.drawing.vertices.map((v, i) => {
        return {
          Name: "NewRow_" + i,
          Vertices: [
            { X: v.pos["0"], Y: v.pos["1"], Z: v.pos["2"] }
          ],
          Color: [
            {
              R: v.color["0"], G: v.color["1"], B: v.color["2"], A: v.color["3"]
            }
          ]
        }
      }))
    );
  }
}

// 💗 Beat
function beat($api) { }

// 👋 Leave
function leave({ store }) {
  store["3dline:drawing"] = drawing;
  store.persist("3dline:drawing", "local:db");
}

export { boot, sim, paint, act, beat, leave };

// 📚 Library

class Wand {
  // TODO
  // - [] Add segmented wands: wands ==hasMany=> segments

  api;
  type;
  length;
  waving = false;
  form;

  // The below fields are mostly for the "line" type, but could also be shared
  // by many wand types, depending on the design.
  drawing; // Geometry.
  race; // Lazy line control.
  tail; // Preview / prediction lines.
  tail2;

  constructor(api, type, length) {
    this.api = api;
    this.type = type;
    this.length = length;

    // Define the 3D renderable for this wand.
    this.form = new api.Form({
      type: "line",
      positions: [
        [0, 0, 0.0, 1],
        [0, 0, 0.1, 1]
      ],
      indices: [0, 1],
    }, { pos: [0, 0, 0], scale: [1, 1, 1] })
  }

  async init({ preload }) {
    if (this.type === "line") {
      let stored;
      if (preload) stored = (this.api.store["3dline:drawing"] =
        this.api.store["3dline:drawing"] ||
        (await this.api.store.retrieve("3dline:drawing", "local:db")));

      this.drawing = new this.api.Form(
        {
          type: "line:buffered",
          vertices: stored?.vertices,
          indices: stored?.indices,
        },
        { color: [255, 255, 255, 255] }
      )

      this.drawing.MAX_POINTS = this.length * 2; // Must be a multiple of two for "line".
    } else {
      // TODO: Implement other geometries.
      // drawing.MAX_POINTS = length;
    }
    return this;
  }

  get progress() {
    return this.drawing.vertices.length / this.drawing.MAX_POINTS;
  }

  start(target, vr = true) {
    this.vr = vr;

    // *** Markmaking Configuration ***
    const smoothing = true; // Use a lazy moving cursor, or normal quantized lines.
    const quantizedSmoothing = true; // Regulate all segments while still smoothing.

    //const step = vr ? 0.0010 : 0.025; // Step size / overall quantization.
    //const speed = vr ? 30 : 20; // Racing speed.

    const step = 0.0010;
    const speed = 20;

    this.race =
      smoothing === true
        ? new this.api.Race({ step, speed, quantized: quantizedSmoothing })
        : new this.api.Quantizer({ step });
    this.race.start(target);
    this.waving = true;
  }

  goto(target) {
    const path = this.race.to(target); if (!path) return;
    let maxedOut;

    if (path.out?.length > 0) {
      const colors = [];

      path.out.forEach(() => {
        const vertexColor = this.api.color(...colorParams);
        colors.push(vertexColor, vertexColor);
      });

      // Add points locally.
      maxedOut = this.drawing.addPoints({ positions: path.out, colors });

      // Send vertices to the internet.
      this.api.client.send("add", {
        positions: path.out.map((vertex) => [...vertex]),
        colors,
      });
    }

    // Previews from wand tip. 
    if (this.api.dist3d(path.last, path.current)) this.tail = [path.last, path.current];
    if (this.api.dist3d(path.current, target)) { this.tail2 = [path.current, target]; }

    return maxedOut;
  }

  stop() {
    // Draw the second tail if it exists, then clear both.
    const start = this.tail?.[0] || this.tail2?.[0];
    const end = this.tail2?.[1];

    let maxedOut;

    /*
    if (start && end) {
      const q = new this.api.Quantizer({ step: this.race.step });

      q.start(start);
      const path = q.to(end);

      console.log(path.out);

      if (path.out.length > 0) {
        const colors = []; // Note: Could this whole color loop be shorter?
        path.out.forEach((p) => {
          const vertexColor = this.api.color(...colorParams);
          colors.push(vertexColor, vertexColor);
        });

        maxedOut = this.drawing.addPoints({ positions: path.out, colors });
      }
    }
    */

    this.race = null;
    this.waving = false;
    this.tail = this.tail2 = undefined;
    return maxedOut;
  }

}