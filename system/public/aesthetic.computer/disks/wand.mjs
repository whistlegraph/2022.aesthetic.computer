// Wand, 22.10.29.01.50 
//       22.10.05.11.01

// TODO
// - [] Get font loaded.
// - [] Play a sound on exit or enter.
// - [] Add notifications to see who joins on the main screen.
// - [] Title screen.
// - [] Add touch controls.
// - [] Segmented, colored wands.
// - [] Add text chat.
// - [] Add voice chat.
// - [] Add demo recording and playback with vocals.
// + Later
// - [] Fix broken GL lines.
// - [] Send the actual camera fov and near and far through to the gpu.
// - [] Add circular buffer to wand lines (buffer-geometry) / infinite
//      wand with dissolving trail.
// + Done
// - [x] Fix scaling of 2D camera / don't scale but add depth to the screenToPoint / center function of Camera.
// - [x] Add colors to line.
// - [x] Switch to a new stick of color and length once a line runs out.
// - [x] Other players should be represented by separate geometry.
// - [x] Reset / reload a wand when it runs out.
// - [x] Add a "leave" event to the server.
// - [x] Give each player their own wand.
// - [x] Transmit wand position and length.
// - [x] Along with status updates / resets.
// - [x] Cross platform Y level / eye level check and scale check.
// - [x] Make step size equal across players. 
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
let wandDepth2D = 0.3; // The distance from the near plane for drawing on screens.
const wandLength = 4096; // The maximum number of points per each wand.
const remoteWands = {}; // A container for wands that come off the network.

// 🥾 Boot
async function boot({ painting: p, Camera, Dolly, Form, QUAD, TRI, color,
  geo: { Race, Quantizer }, num: { dist3d }, params, store, net, cursor, wipe }) {
  colorParams = params.map((str) => parseInt(str)); // Set params for color.
  if (colorParams.length === 0) { colorParams = undefined; }

  // Clear the screen to transparent and remove the cursor.
  cursor("none");
  wipe(0, 0);

  // Connect to the network.
  client = net.socket(async (id, type, content) => {

    // Make a new wand for another user.
    if (type === "create") {
      if (client.id === id) return;
      // TODO: This is hacky / bad design... so many create messages are being sent... (need server state?)
      if (remoteWands[id] !== undefined) return; // Don't instantiate anyone's wand more than once.

      remoteWands[id] = await (new Wand({
        Form, color, Quantizer, Race, store, dist3d, client
      }, "line", wandLength).init({
        preload: false, color: content.color
      }));

      if (content.points?.length > 0) {
        remoteWands[id].drawing.addPoints({
          positions: content.points,
          colors: content.points.map(() => remoteWands[id].color)
        });
      }

      // Instantiate our wand for the client who sent us their wand instantiation request.
      client.send("create", { color: wand.color, points: wand.drawing.vertices.map(v => [...v.pos]) });
    }

    if (type === "start" && client.id !== id) {
      remoteWands[id]?.start(content.target, content.vr, true);
    }

    if (type === "goto" && client.id !== id) {
      remoteWands[id]?.goto(content.target, true);
    }

    if (type === "move") {
      if (client.id !== id) {
        const rw = remoteWands[id];
        if (rw === undefined) return;
        const form = rw.form;
        form.turn({ x: 0, y: 0, z: 0 }); // TODO: Is this still necessary?
        form.position = content.position;
        form.rotation = content.rotation;
        form.scale = content.scale;
      }
    }

    if (type === "stop" && client.id !== id) remoteWands[id]?.stop(true);

    // Add points to wand... or make new wand associated with a client ID if it
    // doesn't exist. 
    if (type === "add") {
      // In case we are sending messages to "everyone".
      if (client.id !== id) remoteWands[id]?.drawing.addPoints(content); // Add points locally.
    }

    // Clear wand.
    if (type === "clear") {
      if (client.id !== id) remoteWands[id]?.clear(content, true);
    }

    // TODO: This needs to be handled from `socket.mjs` 
    if (type === "left") {
      if (client.id !== id) delete remoteWands[content.id]; //?.clear(content, true);
      console.log("user left", content);
      // If a user leaves and a remote wand. 
    }

  });

  cam = new Camera(80, { z: 4, y: 1.8, scale: [1, 1, 1] }); // camera with fov
  dolly = new Dolly(cam); // moves the camera


  floor = new Form(
    QUAD,
    { tex: p(2, 2, (g) => g.wipe(0, 0, 100)) },
    { pos: [0, 0, 0], rot: [-90, 0, 0], scale: [8, 8, 8] }
  );

  const cs = 128;
  cross = new Form(
    QUAD,
    // { tex: p(4, 4, (g) => g.noise16DIGITPAIN()) },
    { tex: p(cs, cs, (g) => g.ink(0, 0, 150).line(0, 0, cs, cs).line(cs, 0, 0, cs)) },
    { pos: [0, 0, 0], rot: [-90, 0, 0], scale: [0.5, 0.5, 0.5] }
  );

  tri = new Form(
    TRI,
    { tex: p(1, 8, (g) => g.noise16DIGITPAIN()), alpha: 0.75 },
    { pos: [0, 1, 0], scale: [0.5, 0.5, 0.5] }
  );

  // 1. Create a wand for the user.
  // Wand type, how many samples allowed, and a geometry.
  wand = await (new Wand({
    Form, color, Quantizer, Race, store, dist3d, client
  }, "line", wandLength).init({
    preload: false, color: colorParams
  }));

  client.send("create", { color: wand.color }); // Tell anyone whose around to make a wand for us.
}

// 🎨 Paint (Executes every display frame)
function paint({ ink, pen, pen3d, wipe, help, screen, Form, form }) {

  // Only draw a wand / a wand's drawing if it exists.

  // The lines & the furnitue and our wand.
  form([floor, wand?.form, wand?.drawing], cam);

  // Everyone else's wands...
  help.each(remoteWands, w => form([w.form, w.drawing], cam));

  // Draw cursors for 2D screens.
  wipe(10, 0);
  if (lookCursor) ink(127).circle(pen.x, pen.y, 8);
  else if (pen && wand) {
    const shadow = 30 * (1 - wand.progress);
    ink(127, 127).line(pen.x, pen.y, pen.x + shadow, pen.y + shadow);
  }

  // Draw current wand's tail.
  if (wand?.tail) {
    //ink(0, 255, 0).form(
    ink(wand.color).form(
      new Form({ type: "line", positions: wand.tail, keep: false }, { alpha: 1 }),
      cam
    );
  }

  if (wand?.tail2) {
    // ink(255, 0, 0).form(
    ink(wand.color).form(
      new Form({ type: "line", positions: wand.tail2, keep: false }, { alpha: 1 }),
      cam
    );
  }

  // Draw the tails for any remote wands.

  help.each(remoteWands, w => {
    if (w.tail) {
      ink(w.color).form(
        new Form({ type: "line", positions: w.tail, keep: false }, { alpha: 1 }),
        cam
      );
    }

    if (w.tail2) {
      ink(w.color).form(
        new Form({ type: "line", positions: w.tail2, keep: false }, { alpha: 1 }),
        cam
      );
    }
  });

  // Draw a colored tail for any remote wands.
  /*
  help.each(remoteWands, w => {
    if (!w.waving) return;
    const start = w.form.position;
    const end = w.drawing.vertices[w.drawing.vertices.length - 1]?.pos;
    console.log(start, end);
    if (start && end) {
      ink(w.color).form(
        new Form({ type: "line", positions: [start, end], keep: false }, { alpha: 1 }),
        cam
      );
    }
  });
  */

}

// 🧮 Sim(ulate) (Runs once per logic frame (120fps locked)).
function sim({ pen, pen3d, screen: { width, height }, num: { degrees: deg } }) {
  // 🔫 FPS style camera movement.
  let forward = 0, strafe = 0;
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

      client.send("move", {
        position: wand.form.position,
        rotation: wand.form.rotation,
        scale: wand.form.scale
      });

    } else if (pen) {
      wand.form.turn({ x: 0.0, y: 0.0, z: 0.0 }); // Why does this make everything work?
      wand.form.position = cam.ray(pen.x, pen.y, wandDepth2D);
      wand.form.rotation = cam.rotation;
      wand.form.scale = [1, 1, 1 - wand.progress];

      client.send("move", {
        position: [...wand.form.position],
        rotation: wand.form.rotation,
        scale: wand.form.scale
      });
    }

    // Calculate current gesture.
    if (wand.waving) {
      if (wand.vr) wand.goto([pen3d.pos.x, pen3d.pos.y, pen3d.pos.z, 0]);
      else wand.goto(cam.ray(pen.x, pen.y, wandDepth2D))
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
    if (e.is("touch")) wand.start(cam.ray(e.x, e.y, wandDepth2D), false); // ✏️ Start a mark.
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
  if (wand?.drawing) {
    store["3dline:drawing"] = wand.drawing;
    store.persist("3dline:drawing", "local:db");
  }
}

export { boot, sim, paint, act, beat, leave };

// 📚 Library

class Wand {
  // TODO
  // - [] Add segmented wands: wands ==hasMany=> segments
  cleared = false;

  api;
  type;
  length;
  waving = false;
  form;
  color;
  randomColor = false;

  // The below fields are mostly for the "line" type, but could also be shared
  // by many wand types, depending on the design.
  drawing; // Geometry.
  race; // Lazy line control.
  lastTarget; // Prevents sending the same points over and over in `goto`.
  tail; // Preview / prediction lines.
  tail2;

  constructor(api, type, length) {
    this.api = api;
    this.type = type;
    this.length = length;
  }

  async init({ preload, color }) {

    // Set the color or choose a random one.
    if (color === undefined) {
      this.randomColor = true;
      // Pick a color for this wand.
      let r = Math.random() > 0.5 ? 0 : 255;
      let g = Math.random() > 0.5 ? 0 : 255;
      let b = Math.random() > 0.5 ? 0 : 255;

      if (r === 0 && g === 0 && b === 0) {
        r = 255;
        g = 255;
        b = 255;
      }

      this.color = [r, g, b, 255];
    } else {
      this.color = color;
    }

    // Define the 3D renderable for this wand.
    this.form = new this.api.Form({
      type: "line",
      positions: [
        [0, 0, 0.0, 1],
        [0, 0, 0.1, 1]
      ],
      indices: [0, 1],
    }, { color: this.color }, { pos: [0, 0, 0], scale: [1, 1, 1] })

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
        { color: this.color }
      )

      this.drawing.MAX_POINTS = this.length * 2; // Must be a multiple of two for "line".
    } else {
      // TODO: Implement other geometries.
      // drawing.MAX_POINTS = length;
    }

    this.lastTarget = undefined; // Reset the target tracker in `goto`.
    return this;
  }

  get progress() {
    if (!this.drawing) return 0;
    return this.drawing.vertices.length / this.drawing.MAX_POINTS;
  }

  start(target, vr = true, remote) {
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
    if (!remote) this.api.client.send("start", { target, vr });
  }

  goto(target, remote = false) {

    if (this.lastTarget !== undefined &&
      this.lastTarget[0] === target[0] &&
      this.lastTarget[1] === target[1] &&
      this.lastTarget[2] === target[2]) {
        return;
    }

    this.lastTarget = target;
    if (this.drawing === null) return;
    if (!this.waving) return;
    const path = this.race.to(target); if (!path) return;

    let maxedOut;

    if (path.out?.length > 0) {
      const colors = [];

      path.out.forEach(() => {
        const vertexColor = this.api.color(...this.color);
        colors.push(vertexColor, vertexColor);
      });

      // Add points locally.
      maxedOut = this.drawing.addPoints({ positions: path.out, colors });

      // Send vertices to the internet.
      /*
      if (!remote) this.api.client.send("add", {
        positions: path.out.map((vertex) => [...vertex]),
        colors,
      });
      */

    }

    // Previews from wand tip. 
    if (this.api.dist3d(path.last, path.current)) this.tail = [path.last, path.current];
    if (this.api.dist3d(path.current, target)) this.tail2 = [path.current, target];

    if (!remote) this.api.client.send("goto", { target: [...target] });

    if (maxedOut) this.clear(!this.randomColor ? this.color : undefined);
    return maxedOut;
  }

  stop(remote = false) {
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
    if (maxedOut) this.clear(!this.randomColor ? this.color : undefined);
    if (!remote) this.api.client.send("stop");
    return maxedOut;
  }

  // Remove the drawing and the wand.
  clear(color, remote = false) {
    this.stop();
    this.init({ preload: false, color }); // Reload this wand.
    if (!remote) this.api.client.send("clear", this.color); // Send a clear event to the server.
  }

}