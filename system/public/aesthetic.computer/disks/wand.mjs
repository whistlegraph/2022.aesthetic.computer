// Wand, 22.10.29.01.50 
//       22.10.05.11.01

// TODO
// - [] Add shortening of line.
// - [] Switch to a new stick of color and length once a line runs out.
// - [] Transmit wand position.
// - [] "Flat" 2D controls to allow better participation on 2d screens.
// - [] Make 2D controls closer.
// - [] Add colors to line.
// - [] Add text chat.
// - [] Add voice chat.

let cam, dolly; // Camera system.
let floor, cross, tri, triTop, drawing; // Geometry.
let race, tail, tail2; // Lazy line control with preview lines.

let client; // Network.

// *** Markmaking Configuration ***
//const step = 0.02; // Step size of regulated line / minimum cut-off.
const step = 0.0010;
const smoothing = true; // Use a lazy moving cursor, or normal quantized lines.
const quantizedSmoothing = true; // Regulate all segments while still smoothing.
//const speed = 2; // Only used if smoothing is true.
const speed = 30;

let colorParams = [255, 255, 255, 255];

let W, S, A, D, UP, DOWN, LEFT, RIGHT;

// 🥾 Boot
async function boot({
  painting: p,
  Camera,
  Dolly,
  Form,
  QUAD,
  TRI,
  LINE,
  geo: { Race, Quantizer },
  params,
  store,
  net,
  wipe
}) {

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

    //console.log(id, type, content);
  });

  //colorParams = params.map((str) => parseInt(str)); // Set params for color.

  cam = new Camera(80, { z: 4, y: 2 }); // camera with fov
  dolly = new Dolly(cam); // moves the camera

  race =
    smoothing === true
      ? new Race({ step, speed, quantized: quantizedSmoothing })
      : new Quantizer({ step });

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
    { pos: [0, 0, 1] }
  );

  triTop = new Form({
    type: "line",
    positions: [
      [0, 0, 0.0, 1], // Bottom
      [0, 0, 0.1, 1] // Top
    ],
    indices: [0, 1],
  }, { pos: [0, 0, 0], scale: [1, 1, 1] });

  // An empty buffer that gets populated in `sim()`.

  // Load a drawing from RAM if it already exists, or from the indexedDB,
  // otherwise start an empty one.
  /*
  const stored = (store["3dline:drawing"] =
    store["3dline:drawing"] ||
    (await store.retrieve("3dline:drawing", "local:db")));
  */
 const stored = undefined;

  drawing = new Form(
    {
      type: "line:buffered",
      vertices: stored?.vertices,
      indices: stored?.indices,
    },
    { color: [255, 255, 255, 255] }
  );

}

// 🎨 Paint (Executes every display frame)
function paint({ ink, pen3d, wipe, screen, Form }) {
  // The lines & the furnitue.
  //ink(0, 255, 0, 255).form([floor, cross, tri, triTop, drawing], cam);
  ink(255, 255, 255, 150).form([floor, triTop, drawing], cam);

  // Crosshair
  // TODO: Do a dirty box wipe here / use this to test the new compositor? 🤔
  // Tip of drawn line.

  // console.log(tail?.vertices[0], tail?.vertices[1])
  // ink(255, 0, 0).form(tail2, cam, { keep: false });
  //wipe(10, 0)
  //  .ink(200, 0, 0, 255)
  //  .circle(...screen.center, 9);

  // I'm rendering multiple times before simming again, which means tail
  if (tail) {
    //ink(0, 255, 0).form(
    ink(255, 255, 255).form(
      new Form({ type: "line", positions: tail, keep: false }, { alpha: 1 }),
      cam
    );
  }

  if (tail2) {
    //ink(255, 0, 0).form(
    ink(255, 255, 255).form(
      new Form({ type: "line", positions: tail2, keep: false }, { alpha: 1 }),
      cam
    );
  }

}

// 🧮 Sim(ulate) (Runs once per logic frame (120fps locked)).
function sim({ pen, Form, color, num: { dist3d, degrees: deg, randIntRange: rr }, pen3d }) {
  // First person camera controls.
  let forward = 0,
    strafe = 0;

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

  // Rotate some scenery.
  tri.turn({ y: -0.25 });

  triTop.turn({ x: 0.0, y: 0.0, z: 0.0 }); // Why does this make everything work?
  
  if (pen3d) {
    triTop.position = [pen3d.pos.x, pen3d.pos.y, pen3d.pos.z, 0];
    triTop.rotation = [deg(pen3d.rot._x), deg(pen3d.rot._y), deg(pen3d.rot._z)];
    triTop.gpuTransformed = true;
  }

  // 📈 Add to the drawing.
  if (isDrawing) {
    if (withMouseAndKeyboard) raceTarget = cam.center;
    else if (pen3d) {
      raceTarget = [pen3d.pos.x, pen3d.pos.y, pen3d.pos.z, 0];
    }

    const path = race.to(raceTarget);
    if (!path) return;

    if (path.out?.length > 0) {
      const colors = [];

      path.out.forEach(() => {
        const vertexColor = color(...colorParams);
        console.log(vertexColor)
        colors.push(vertexColor, vertexColor);
      });

      // Add points locally.
      drawing.addPoints({ positions: path.out, colors });

      // Send vertices to the internet.
      client.send("add", {
        positions: path.out.map((vertex) => [...vertex]),
        colors,
      });
    }

    if (dist3d(path.last, path.current)) tail = [path.last, path.current];

    // Preview from current camera cursor / pointer.
    if (dist3d(path.current, raceTarget)) { tail2 = [path.current, raceTarget]; }
  }

}

let raceTarget;
let isDrawing = false;
let withMouseAndKeyboard = false;

// ✒ Act
function act({ event: e, color, download, num: { timestamp }, geo: { Quantizer } }) {

  // 👋 Right Hand

  //   ✏️ Start a mark.
  if (e.is("3d:touch:2")) {
    raceTarget = [e.pos.x, e.pos.y, e.pos.z, 0];
    race.start(raceTarget);
    drawing.gpuFlush = true;
    isDrawing = true;
  }

  //   🚩 End a mark.
  if (e.is("3d:lift:2")) {
    race.reset?.();
    isDrawing = false;
    tail = tail2 = undefined;
  }

  // 🖱️ Mouse

  // ✏️ Start a mark.
  if (e.is("touch") && e.device === "mouse" && e.button === 0) {
    raceTarget = cam.center;
    withMouseAndKeyboard = true;
    race.start(raceTarget);
    drawing.gpuFlush = true;
    isDrawing = true;
  }

  // 🚩 End a mark.
  if (e.is("lift") && e.device === "mouse" && e.button === 0) {
    race.reset?.(); // Reset the lazy cursor.

    // Draw the second tail if it exists, then clear both.
    const start = tail?.[0] || tail2?.[0];
    const end = tail2?.[1];

    if (start && end) {
      const q = new Quantizer({ step });
      q.start(start);
      const path = q.to(end);

      if (path.out.length > 0) {
        const colors = []; // Note: Could this whole color loop be shorter?
        path.out.forEach((p) => {
          const vertexColor = color(...colorParams);
          colors.push(vertexColor, vertexColor);
        });

        drawing.addPoints({ positions: path.out, colors });
      }
    }

    isDrawing = false;
    tail = tail2 = undefined;
  }

  // 👀 Look around while dragging.
  if (e.is("draw")) {
    cam.rotX -= e.delta.y / 3.5;
    cam.rotY -= e.delta.x / 3.5;
  }

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
    /*
    [
      {
        "Name": "NewRow",
        "Vertices": [
          {
            "X": 10,
            "Y": 20,
            "Z": -30
          }
        ],
        "Color": [
          {
            "B": 0,
            "G": 0,
            "R": 201,
            "A": 0
          }
        ]
      },
      {
        "Name": "NewRow_0",
        "Vertices": [
          {
            "X": 10,
            "Y": 20,
            "Z": -30
          }
        ],
        "Color": [
          {
            "B": 0,
            "G": 0,
            "R": 201,
            "A": 0
          }
        ]
      }
    ]
    */
    // Pack up and download the vertices according to the above.
    download(`sculpture-${timestamp()}.json`, JSON.stringify(
      drawing.vertices.map((v, i) => {
        return {
          Name: "NewRow_" + i,
          Vertices: [
            {
              X: v.pos["0"],
              Y: v.pos["1"],
              Z: v.pos["2"],
            }
          ],
          Color: [
            {
              R: v.color["0"],
              G: v.color["1"],
              B: v.color["2"],
              A: v.color["3"]
            }
          ]
        }
      }))
    );


    // Pack up and download the vertices in an array of arrays.
    /*
    download(`sculpture-${timestamp()}.json`, JSON.stringify(
      drawing.vertices.map(v => [
        [v.pos["0"], v.pos["1"], v.pos["2"]],
        [...v.color]
      ]))
    );
    */
  }

}

// 💗 Beat
function beat($api) {
  // Make sound here.
}

// 👋 Leave
function leave({ store }) {
  // Pass data to the next piece here.
  store["3dline:drawing"] = drawing;
  store.persist("3dline:drawing", "local:db");
}

export { boot, sim, paint, act, beat, leave };

// 📚 Library
