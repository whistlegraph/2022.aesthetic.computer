// Wand, 22.10.29.01.50 
//       22.10.05.11.01

// TODO
// - [] Add shortening of line.
//   - []  Render wand at a length that is a ratio of the actual length.
//     - [] 2D
//     - [] 3D
//   - [x] Create a class for a wand. 

// - [] Transmit wand position and length.
// - [] Resizing the 2D camera should work properly / send new
//      camera data.
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
// - [x] Limit wand length so you can run out.
// - [x] Prevent wand from maxing out.
// - [x] Add a 'wand' representation to 2d screens. 
// - [x] Make 2D camera properly scaled.
// - [x] "Flat" 2D controls to allow better participation on 2d screens.

let cam, dolly; // Camera system.
let wand; // Player / line geometry.
let floor, cross, tri, triTop; // Room Geometry.
let lookCursor = false;
let client; // Network.
let colorParams = [255, 255, 255, 255];
let W, S, A, D, UP, DOWN, LEFT, RIGHT; // Controls

let mouse = false;

// 🥾 Boot
async function boot({ painting: p, Camera, Dolly, Form, QUAD, TRI, color,
  geo: { Race, Quantizer }, num: { dist3d }, params, store, net, cursor, wipe }) {
  // colorParams = params.map((str) => parseInt(str)); // Set params for color.

  // Clear the screen to transparent and remove the cursor.
  cursor("none");
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
    if (client.id !== id) drawing.addPoints(content); // Add points locally.
  });

  cam = new Camera(80, { z: 4, y: 1, scale: [0.65, 0.65, 0.65] }); // camera with fov
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
    { pos: [0, 1, 0] }
  );

  triTop = new Form({
    type: "line",
    positions: [
      [0, 0, 0.0, 1], // Bottom
      [0, 0, 0.1, 1] // Top
    ],
    indices: [0, 1],
  }, { pos: [0, 0, 0], scale: [1, 1, 1] });

  // 1. Create a wand for the user.
  // Wand type, how many samples allowed, and a geometry.
  wand = await (new Wand({ Form, color, Quantizer, Race, store, dist3d, client }, "line", 2048).init({
    preload: false
  }));
}

// 🎨 Paint (Executes every display frame)
function paint({ ink, pen, pen3d, wipe, screen, Form }) {
  // The lines & the furnitue.
  ink(255, 255, 255, 150).form([tri, floor, triTop, wand?.drawing], cam);

  // Draw cursors for 2D screens.
  if (lookCursor) wipe(10, 0).ink(255).circle(pen.x, pen.y, 8);
  else if (pen) wipe(10, 0).ink(255).line(pen.x, pen.y, pen.x + 15, pen.y + 15);

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
  // First person camera controls.
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

  dolly.sim(); // Move the camera.
  tri.turn({ y: -0.25 }); // Rotate some scenery.
  triTop.turn({ x: 0.0, y: 0.0, z: 0.0 }); // Why does this make everything work?

  if (pen3d) {
    triTop.position = [pen3d.pos.x, pen3d.pos.y, pen3d.pos.z, 0];
    triTop.rotation = [deg(pen3d.rot._x), deg(pen3d.rot._y), deg(pen3d.rot._z)];
    triTop.gpuTransformed = true;
  }

  // 📈 Add to the drawing.
  if (wand?.waving) {
    if (mouse) wand.goto(cam.center(1 - (pen.x / width), 1 - (pen.y / height)))
    else wand.goto([pen3d.pos.x, pen3d.pos.y, pen3d.pos.z, 0]);
  }
}

// ✒ Act
function act({ event: e, color, screen, download, num: { timestamp } }) {

  // 👋 Right Hand
  //   ✏️ Start a mark.
  if (e.is("3d:touch:2")) wand.start([e.pos.x, e.pos.y, e.pos.z, 0]);
  //   🚩 End a mark.
  if (e.is("3d:lift:2")) wand.stop();

  // 🖱️ Mouse
  //   ✏️ Start a mark.
  if (e.is("touch") && e.device === "mouse" && e.button === 0) {
    wand.start(cam.center(1 - (e.x / screen.width), 1 - (e.y / screen.height)));
    mouse = true;
  }
  //   🚩 End a mark.
  if (e.is("lift") && e.device === "mouse" && e.button === 0) wand.stop();

  // 👀 Look around while dragging with a finger. (or mouse if 2nd button held)
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

    // *** Markmaking Configuration ***
    const smoothing = true; // Use a lazy moving cursor, or normal quantized lines.
    const quantizedSmoothing = true; // Regulate all segments while still smoothing.

    // Good for VR...
    const step = 0.0010; // Step size of regulated line / minimum cut-off.
    const speed = 30; // Only used if smoothing is true.
    // Good for PC + Keyboard.
    //const step = 0.10;
    //const speed = 20;

    this.race =
      smoothing === true
        ? new api.Race({ step, speed, quantized: quantizedSmoothing })
        : new api.Quantizer({ step });
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

  start(target) {
    this.race.start(target);
    this.waving = true;
  }

  goto(target) {
    const path = this.race.to(target);
    if (!path) return;

    if (path.out?.length > 0) {
      const colors = [];

      path.out.forEach(() => {
        const vertexColor = this.api.color(...colorParams);
        colors.push(vertexColor, vertexColor);
      });

      // Add points locally.
      const maxedOut = this.drawing.addPoints({ positions: path.out, colors });
      if (maxedOut) console.log("Maxed out points!");

      // Send vertices to the internet.
      this.api.client.send("add", {
        positions: path.out.map((vertex) => [...vertex]),
        colors,
      });
    }

    // Previews from wand tip. 
    if (this.api.dist3d(path.last, path.current)) this.tail = [path.last, path.current];
    if (this.api.dist3d(path.current, target)) { this.tail2 = [path.current, target]; }
  }

  stop() {
    this.race.reset?.();
    this.waving = false;

    // Draw the second tail if it exists, then clear both.
    const start = this.tail?.[0] || this.tail2?.[0];
    const end = this.tail2?.[1];

    if (start && end) {
      const q = new this.api.Quantizer({ step: this.step });
      q.start(start);
      const path = q.to(end);

      if (path.out.length > 0) {
        const colors = []; // Note: Could this whole color loop be shorter?
        path.out.forEach((p) => {
          const vertexColor = this.api.color(...colorParams);
          colors.push(vertexColor, vertexColor);
        });

        const maxedOut = this.drawing.addPoints({ positions: path.out, colors });
        if (maxedOut) console.log("Maxed out points!");
      }
    }

    this.tail = this.tail2 = undefined;
  }

}