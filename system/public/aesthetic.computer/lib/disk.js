// 👩‍💻 Disk (Jockey) aka the tape / piece player?

import * as graph from "./graph.js";
import * as num from "./num.js";
import * as geo from "./geo.js";
import * as gizmo from "./gizmo.js";
import * as ui from "./ui.js";
import * as help from "./help.js";
import { Socket } from "./socket.js"; // TODO: Eventually expand to `net.Socket`
import { notArray } from "./helpers.js";

export const noWorker = { onMessage: undefined, postMessage: undefined };

const servers = {
  main: "server.aesthetic.computer",
  local: "localhost:8082",
  julias: "192.168.1.120:8082",
  lucias: "192.168.1.245:8082",
  ashland_mbp: "192.168.1.18",
};

let ROOT_PIECE = "prompt"; // This gets set straight from the host html file for the ac.
let debug = false; // This can be overwritten on boot.

const defaults = {
  boot: ($) => {
    $.cursor("native");
    $.gap(0);
  }, // aka Setup
  sim: () => false, // A framerate independent of rendering.
  paint: ($) => {
    // TODO: Make this a boot choice via the index.html file?
    //$.noise16DIGITPAIN();
    //$.noiseTinted([20, 20, 20], 0.8, 0.7);
    $.wipe(0, 0, 0);
  },
  beat: () => false, // Runs every bpm.
  act: () => false, // All user interaction.
};

let boot = defaults.boot;
let sim = defaults.sim;
let paint = defaults.paint;
let beat = defaults.beat;
let act = defaults.act;

let currentPath,
  currentHost,
  currentSearch,
  currentParams,
  currentHash,
  currentText;
let loading = false;
let reframe;
let screen;
let cursorCode;
let pieceHistoryIndex = -1; // Gets incremented to 0 when first piece loads.
let paintCount = 0n;
let simCount = 0n;
let initialSim = true;
let noPaint = false;

let socket;
let penX, penY;
const store = {}; // This object is used to store and retrieve data across disks
//                   during individual sessions. It doesn't get cleared
//                   automatically unless the whole system refreshes.
let upload;
let activeVideo; // TODO: Eventually this can be a bank to store video textures.
let bitmapPromises = {};
let inFocus;
let loadFailure;

// 1. ✔ API

// For every function to access.
const $commonApi = {
  // content: added programmatically: see Content class
  num: {
    randInt: num.randInt,
    randIntArr: num.randIntArr,
    randIntRange: num.randIntRange,
    multiply: num.multiply,
    dist: num.dist,
    radians: num.radians,
    lerp: num.lerp,
    Track: num.Track,
    timestamp: num.timestamp,
    vec2: num.vec2,
    vec4: num.vec4,
    mat4: num.mat4,
  },
  geo: {
    Box: geo.Box,
    DirtyBox: geo.DirtyBox,
    Grid: geo.Grid,
    Circle: geo.Circle,
  },
  ui: {
    Button: ui.Button,
  },
  help: {
    choose: help.choose,
    repeat: help.repeat,
    every: help.every,
    any: help.any,
    each: help.each,
  },
  gizmo: { Hourglass: gizmo.Hourglass },
  rec: {
    rolling: (opts) => send({ type: "recorder-rolling", content: opts }),
    cut: () => send({ type: "recorder-cut" }),
    print: () => send({ type: "recorder-print" }),
  },
  net: {},
  needsPaint: () => (noPaint = false), // TODO: Does "paint" needs this?
  store,
  pieceCount: -1, // Incs to 0 when the first piece (usually the prompt) loads.
  //                 Increments by 1 each time a new piece loads.
  debug,
};

// Just for "update".
const $updateApi = {};

// 🖼 Painting

// Pre-fab models:
const SQUARE = {
  positions: [
    // Triangle 1 (Left Side)
    [-1, -1, 0, 1], // Bottom Left
    [-1, 1, 0, 1], // Top Left
    [1, 1, 0, 1], // Top Right
    // Triangle 2 (Right Side)
    [-1, -1, 0, 1], // Bottom Left
    [1, -1, 0, 1], // Bottom Right
    [1, 1, 0, 1], // Top Right
  ],
  indices: [
    // These are not re-used for now.
    // One
    0, 1, 2,
    //Two
    3, 4, 5,
  ],
};

const TRIANGLE = {
  positions: [
    [-1, -1, 0, 1], // Bottom Left
    [0, 1, 0, 1], // Top Left
    [1, -1, 0, 1], // Top Right
    // Triangle 2 (Right Side)
  ],
  indices: [0, 1, 2],
};

// Inputs: (r, g, b), (r, g, b, a) or an array of those.
//         (rgb) for grayscale or (rgb, a) for grayscale with alpha.
function ink() {
  let args = arguments;

  if (args.length === 1) {
    const isNumber = () => typeof args[0] === "number";
    const isArray = () => Array.isArray(args[0]);

    // If it's an object then randomly pick a value & re-run.
    if (!isNumber() && !isArray()) return ink(help.any(args[0]));

    // If single argument is a number then replicate it across the first 3 fields.
    if (isNumber()) {
      args = Array.from(args);
      args.push(args[0], args[0]);
    } else if (isArray()) {
      // Or if it's an array, then spread it out and re-ink.
      // args = args[0];
      return ink(...args[0]);
    }
  } else if (args.length === 2) {
    // rgb, a
    args = [arguments[0], arguments[0], arguments[0], arguments[1]];
  }

  graph.color(...args);
}

const $paintApi = {
  // 3D Classes & Objects
  Camera: graph.Camera,
  Form: graph.Form,
  TRIANGLE,
  SQUARE,
};

const $paintApiUnwrapped = {
  page: graph.setBuffer,
  ink, // Color
  // 2D
  wipe: function () {
    if (arguments.length > 0) ink(...arguments);
    graph.clear();
  },
  copy: graph.copy,
  paste: graph.paste,
  plot: function () {
    if (arguments.length === 1) {
      graph.plot(arguments[0].x, arguments[0].y);
    } else {
      graph.plot(...arguments);
    }
  }, // TODO: Should this be renamed to set?
  point: graph.point,
  line: graph.line,
  lineAngle: graph.lineAngle,
  circle: graph.circle,
  poly: graph.poly,
  box: graph.box,
  shape: graph.shape,
  grid: graph.grid,
  draw: graph.draw,
  printLine: graph.printLine, // TODO: This is kind of ugly and I need a state machine for type.
  form: function (f, cam) {
    f.graph(cam);
  },
  pan: graph.pan,
  unpan: graph.unpan,
  skip: graph.skip,
  noise16: graph.noise16,
  noise16DIGITPAIN: graph.noise16DIGITPAIN,
  noiseTinted: graph.noiseTinted,
  // glaze: ...
};

// TODO: Eventually restructure this a bit. 2021.12.16.16.0
//       Should global state like color and transform be stored here?
class Painting {
  #layers = [];
  #layer = 0;
  api = {};

  constructor() {
    Object.assign(this.api, $paintApi);
    const p = this;

    // Filter for and then wrap every rendering behavior of $paintApi into a
    // system to be deferred in groups, using layer.
    for (const k in $paintApiUnwrapped) {
      if (typeof $paintApiUnwrapped[k] === "function") {
        // Wrap and then transfer to #api.
        p.api[k] = function () {
          if (notArray(p.#layers[p.#layer])) p.#layers[p.#layer] = [];
          p.#layers[p.#layer].push(() => $paintApiUnwrapped[k](...arguments));
          return p.api;
        };
      }
    }

    // Creates a new pixel buffer with its own layering wrapper / context
    // on top of the base painting API.
    this.api.painting = function () {
      return graph.makeBuffer(...arguments, new Painting());
    };

    // Allows grouping & composing painting order using an AofA (Array of Arrays).
    // n: 0-n (Cannot be negative.)
    // fun: A callback that contains $paintApi commands or any other code.
    this.api.layer = function (n) {
      p.#layer = n;
      return p.api;
    };

    // This links to abstract, solitary graph functions that do not need
    // to be wrapped or deferred for rendering.
    // TODO: Maybe these functions should be under a graphics algorithms label?
    this.api.abstract = { bresenham: graph.bresenham };
  }

  // Paints every layer.
  paint() {
    this.#layers.forEach((layer) => {
      layer.forEach((paint) => paint());
    });
    this.#layers.length = 0;
    this.#layer = 0;
  }
}

const painting = new Painting();
let glazeAfterReframe;

// Microphone State (Audio Input)
class Microphone {
  amplitude = 0;
  waveform = [];

  connect(options) {
    send({ type: "microphone", content: options });
    return this;
  }

  disconnect() {
    send({ type: "microphone", content: { detach: true } });
  }

  poll() {
    send({ type: "get-microphone-amplitude" });
    send({ type: "get-microphone-waveform" });
  }
}

const microphone = new Microphone();

// 2. ✔ Loading the disk.
let originalHost;
let lastHost; // = "disks.aesthetic.computer"; TODO: Add default host here.
let firstLoad = true;
let firstPiece, firstParams, firstSearch;

// TODO: Give load function a labeled options parameter.
async function load(
  { path, host, search, params, hash, text },
  fromHistory = false
) {

  if (host === "") {
    host = originalHost;
  }

  loadFailure = undefined;
  host = host.replace(/\/$/, ""); // Remove any trailing slash from host. Note: This fixes a preview bug on teia.art. 2022.04.07.03.00
  lastHost = host; // Memoize the host.
  pieceHistoryIndex += fromHistory === true ? -1 : 1;

  // Kill any existing socket that has remained open from a previous disk.
  socket?.kill();

  // Set the empty path to whatever the "/" route piece was.
  if (path === "") path = ROOT_PIECE;
  if (path === firstPiece && params.length === 0) params = firstParams;

  // TODO: In larger multi-disk IPFS exports, a new root path should be defined.

  if (debug) console.log("🧩", path, "🌐", host);

  //if (path.indexOf("/") === -1) path = "aesthetic.computer/disks/" + path;

  if (path)
    if (debug) {
      console.log("🟡 Development");
    } else {
      console.log("🟢 Production");
    }

  if (loading === false) {
    loading = true;
  } else {
    // TODO: Implement some kind of loading screen system here?
    console.warn("Already loading another disk:", path);
    return;
  }

  // TODO: Get proper protocol here...
  let fullUrl = location.protocol + "//" + host + "/" + path + ".js";

  // let fullUrl = "https://" + host + "/" + path + ".js";
  // The hash `time` parameter busts the cache so that the environment is
  // reset if a disk is re-entered while the system is running.
  // Why a hash? See also: https://github.com/denoland/deno/issues/6946#issuecomment-668230727
  fullUrl += "#" + Date.now();

  if (debug) console.log("🕸", fullUrl);

  // TODO: What happens if source is undefined?
  // const moduleLoadTime = performance.now();
  const module = await import(fullUrl).catch((err) => {
    loading = false;
    console.error(`😡 "${path}" load failure:`, err);
    loadFailure = err;
  });
  // console.log(performance.now() - moduleLoadTime, module);

  if (module === undefined) {
    loading = false;
    return;
  }

  // This would also get the source code, in case meta-programming is needed.
  // const source = await (await fetch(fullUrl)).text();

  // 🔥
  // TODO: Should metadata fields be held until after boot runs so that
  //       they can only be set once on the DOM? 22.07.16.18.42

  // Set default metadata fields for SEO and sharing, (requires serverside prerendering).
  let title = text + " - aesthetic.computer";
  if (text === "prompt" || text === "/") title = "aesthetic.computer";
  const meta = {
    title,
    desc: "...",
    img: {
      og: "https://aesthetic.computer/thumbnail/1200x630/" + text,
      twitter: "https://aesthetic.computer/thumbnail/1200x630/" + text,
    },
    url: "https://aesthetic.computer/" + text,
  };

  // Add meta to the common api so the data can be overridden as needed.
  $commonApi.meta = (data) => {
    send({ type: "meta", content: data });
  };

  // Add reload to the common api.
  $commonApi.reload = (type) => {
    if (type === "refresh") {
      send({ type: "refresh" }); // Refresh the browser.
    } else {
      // Reload the disk.
      load({
        path: currentPath,
        host: currentHost,
        search: currentSearch,
        params: currentParams,
        hash: currentHash,
        text: currentText,
      });
    }
  };

  // Add host to the networking api.
  $commonApi.net.host = host;

  // Add web to the networking api.
  $commonApi.net.web = (url) => {
    send({ type: "web", content: url }); // Jump the browser to a new url.
  };

  $commonApi.net.preloadReady = () => {
    send({ type: "preload-ready", content: true }); // Tell the browser that all preloading is done.  
  } 

  $commonApi.net.waitForPreload = () => {
    send({ type: "wait-for-preload", content: true }); // Tell the browser that all preloading is done.  
  } 

  // Automatically connect a socket server if we are in debug mode.
  if (debug) {
    let receiver;
    socket = new Socket(
      servers.local,
      (id, type, content) => receiver?.(id, type, content),
      $commonApi.reload
    );

    $commonApi.net.socket = function (receive) {
      //console.log("📡 Mapping receiver.");
      receiver = receive;
      return socket;
    };
  } else {
    $commonApi.net.socket = function (
      receive,
      host = debug ? servers.local : servers.main
    ) {
      // TODO: Flesh out the rest of reload functionality here to extract it from
      //       Socket. 21.1.5
      socket = new Socket(host, receive);
      return socket;
    };
  }

  // Artificially imposed loading by at least 1/4 sec.
  setTimeout(() => {
    //console.clear();
    paintCount = 0n;
    simCount = 0n;
    initialSim = true;
    activeVideo = null; // reset activeVideo
    bitmapPromises = {};
    noPaint = false;
    currentPath = path;
    currentHost = host;
    currentSearch = search;
    currentParams = params;
    currentHash = hash;
    currentText = text;

    // Redefine the default event functions if they exist in the module.
    boot = module.boot || defaults.boot;
    sim = module.sim || defaults.sim;
    paint = module.paint || defaults.paint;
    beat = module.beat || defaults.beat;
    act = module.act || defaults.act;
    $commonApi.query = search;
    $commonApi.params = params || [];
    $commonApi.load = load;
    $commonApi.pieceCount += 1;
    $commonApi.content = new Content();
    cursorCode = "precise";
    loading = false;
    penX = undefined;
    penY = undefined;

    send({
      type: "disk-loaded",
      content: {
        path,
        host,
        search,
        params,
        hash,
        text,
        pieceCount: $commonApi.pieceCount,
        fromHistory,
        meta
        // noBeat: beat === defaults.beat,
      },
    });
    if (firstLoad === false) {
      // Send a message to the bios to unload the last disk if it is not the first load.
      // This cleans up any bios state that is related to the disk and also
      // takes care of nice transitions between disks of different resolutions.
      send({ type: "disk-unload" });
    } else {
      firstLoad = false;
      firstPiece = path;
      firstParams = params;
      firstSearch = search;
    }
  }, 100);
}

const isWorker = typeof importScripts === "function";

// ***Bootstrap***
// Start by responding to a load message, then change
// the message response to makeFrame.
if (isWorker) {
  onmessage = async function (e) {
    debug = e.data.debug;
    ROOT_PIECE = e.data.rootPiece;
    originalHost = e.data.parsed.host;
    await load(e.data.parsed);
    onmessage = makeFrame;
    send({ loaded: true });
  };
} else {
  noWorker.onMessage = async (e) => {
    e = { data: e };
    debug = e.data.debug;
    ROOT_PIECE = e.data.rootPiece;
    originalHost = e.data.parsed.host;
    await load(e.data.parsed);
    noWorker.onMessage = (d) => makeFrame({ data: d });
    send({ loaded: true });
  };
}

function send(data) {
  if (isWorker) {
    postMessage(data);
  } else {
    noWorker.postMessage({ data });
  }
}

// 3. ✔ Add any APIs that require send.
//      Just the `content` API for now.
//      TODO: Move others from makeFrame into here.
class Content {
  nodes = [];
  #id = 0;
  constructor() {
    //console.log("📖 Content: On");
  }

  add(content) {
    // Make a request to add new content to the DOM.
    this.nodes.push({ id: this.#id });
    this.#id = this.nodes.length - 1;
    send({ type: "content-create", content: { id: this.#id, content } });
    return this.nodes[this.nodes.length - 1];
  }

  remove() {
    send({ type: "content-remove" });
    this.nodes = [];
    this.#id = 0;
  }

  receive({ id, response }) {
    this.nodes[id].response = response;
  }

  //update({ id, msg }) {
  //  send({ type: "content-update", content: { id, msg } });
  //}
}

// 4. ✔ Respond to incoming messages, and probably produce a frame.
// Boot procedure:
// First `paint` happens after `boot`, then any `act` and `sim`s each frame
// before `paint`ing occurs. One `sim` always happens after `boot` and before
// any `act`. `paint` can return false to stop drawing every display frame,
// then, it must be manually restarted via `needsPaint();`).  2022.01.19.01.08
// TODO: Make simple needsPaint example.
// TODO: Try to remove as many API calls from here as possible.
// TODO: makeFrame is no longer a great name for this function, which actually
//       receives every message from the main thread, one of which renders a
//       frame.

let signal;

function makeFrame({ data: { type, content } }) {
  // console.log("Frame:", type);

  if (type === "signal") {
    signal = content;
    return;
  }

  if (type === "content-created") {
    $commonApi.content.receive(content);
    return;
  }

  // 1. Beat // One send (returns afterwards)
  if (type === "beat") {
    const $api = {};
    Object.assign($api, $commonApi);
    $api.graph = painting.api; // TODO: Should this eventually be removed?

    $api.sound = {
      time: content.time,
      bpm: function (newBPM) {
        if (newBPM) content.bpm[0] = newBPM;
        return content.bpm[0];
      },
    };

    $api.sound.microphone = microphone;
    // Attach the microphone.
    /*
    $api.sound.microphone = function (options) {
      send({ type: "microphone", content: options });
      return {
        amplitude: (cb) => {
          send({ type: "get-microphone-amplitude" });
        },
      };
    };
    */

    // TODO: Generalize square and bubble calls.
    // TODO: Move this stuff to a "sound" module.
    const squares = [];
    const bubbles = [];

    $api.sound.square = function ({
      tone = 440, // TODO: Make random.
      beats = Math.random(), // Wow, default func. params can be random!
      attack = 0,
      decay = 0,
      volume = 1,
      pan = 0,
    } = {}) {
      squares.push({ tone, beats, attack, decay, volume, pan });

      // Return a progress function so it can be used by rendering.
      const seconds = (60 / content.bpm) * beats;
      const end = content.time + seconds;
      return {
        progress: function (time) {
          return 1 - Math.max(0, end - time) / seconds;
        },
      };
    };

    $api.sound.bubble = function ({ radius, rise, volume = 1, pan = 0 } = {}) {
      bubbles.push({ radius: radius, rise, volume, pan });

      // Return a progress function so it can be used by rendering.
      /*
      const seconds = (60 / content.bpm) * beats;
      const end = content.time + seconds;
      return {
        progress: function (time) {
          return 1 - Math.max(0, end - time) / seconds;
        },
      };
      */
    };

    beat($api);

    send({ type: "beat", content: { bpm: content.bpm, squares, bubbles } }, [
      content.bpm,
    ]);

    squares.length = 0;
    bubbles.length = 0;

    return;
  }

  if (type === "microphone-amplitude") {
    microphone.amplitude = content;
    return;
  }

  if (type === "microphone-waveform") {
    microphone.waveform = content;
    return;
  }

  // 1a. Upload // One send (returns afterwards)
  // Here we are receiving file data from main thread that was requested
  // by $api.upload. We check to see if the upload promise exists and then
  // use it and/or throw it away.
  if (type === "upload" && upload) {
    if (content.result === "success") {
      upload?.resolve(content.data);
    } else if (content.result === "error") {
      console.error("File failed to load:", content.data);
      upload?.reject(content.data);
    }
    upload = undefined;
    return;
  }

  // 1b. Video frames.
  if (type === "video-frame") {
    activeVideo = content;
    return;
  }

  // 1c. Loading from History
  if (type === "history-load") {
    if (debug) console.log("⏳ History:", content);
    $commonApi.load(content, true);
    return;
  }

  // 1d. Loading Bitmaps
  if (type === "loaded-bitmap-success") {
    // console.log("Bitmap load success:", content);
    bitmapPromises[content.url].resolve(content.img);
    delete bitmapPromises[content];
    return;
  }

  if (type === "loaded-bitmap-rejection") {
    console.error("Bitmap load failure:", content);
    bitmapPromises[content.url].reject(content.url);
    delete bitmapPromises[content.url];
    return;
  }

  // Request a repaint (runs when the window is resized.)
  if (type === "needs-paint") {
    noPaint = false;
    return;
  }

  // 2. Frame
  // This is where each...
  if (type === "frame") {
    // Act & Sim (Occurs after first boot and paint.)
    if (paintCount > 0n) {
      const $api = {};
      Object.assign($api, $commonApi);
      Object.assign($api, $updateApi);
      Object.assign($api, painting.api);

      $api.inFocus = content.inFocus;

      $api.sound = { time: content.audioTime, bpm: content.audioBpm };

      // Don't pass pixels to updates.
      $api.screen = {
        width: content.width,
        height: content.height,
      };

      $api.cursor = (code) => (cursorCode = code);

      // 🤖 Sim // no send
      $api.seconds = function (s) {
        return s * 120; // TODO: Get 120 dynamically from the Loop setting. 2022.01.13.23.28
      };

      if (initialSim) {
        simCount += 1n;
        $api.simCount = simCount;
        sim($api);
        initialSim = false;
      } else if (content.updateCount > 0 && paintCount > 0n) {
        // Update the number of times that are needed.
        for (let i = content.updateCount; i--; ) {
          simCount += 1n;
          $api.simCount = simCount;
          sim($api);
        }
      }

      // 💾 Uploading + Downloading
      // Add download event to trigger a file download from the main thread.
      $api.download = (dl) => send({ type: "download", content: dl });

      // Add upload event to allow the main thread to open a file chooser.
      // type: Accepts N mimetypes or file extensions as comma separated string.
      // Usage: upload(".jpg").then((data) => ( ... )).catch((err) => ( ... ));
      $api.upload = (type) => {
        send({ type: "upload", content: type });
        return new Promise((resolve, reject) => {
          upload = { resolve, reject };
        });
      };

      // 🌟 Act
      // *Device Event Handling*

      // TODO: Shouldn't all these events come in as part of one array to
      //       keep their order of execution across devices?
      // TODO: Could "device" be removed in favor of "device:event" strings and
      //       if needed, a device method?

      // TODO: Add a focus event.

      // If a disk failed to load, then notify the disk that loaded it
      // by checking to see if loadFailure has anything set.
      if (loadFailure) {
        $api.event = {
          error: loadFailure,
          is: (e) => e === "load-error",
        };
        act($api);
        loadFailure = undefined;
      }

      // Signaling
      if (signal) {
        const data = { signal };
        Object.assign(data, {
          device: "none",
          is: (e) => e === "signal",
        });
        $api.event = data;
        act($api);
        signal = undefined;
      }

      // Window Events
      if (content.inFocus !== inFocus) {
        inFocus = content.inFocus;
        const data = {};
        Object.assign(data, {
          device: "none",
          is: (e) => e === (inFocus === true ? "focus" : "defocus"),
        });
        $api.event = data;
        act($api);
      }

      // Ingest all pen input events by running act for each event.
      // TODO: I could also be transforming pen coordinates here...
      // TODO: Keep track of lastPen to see if it changed.

      content.pen.forEach((data) => {
        Object.assign(data, {
          device: data.device,
          is: (e) => e === data.name,
        });
        penX = data.x;
        penY = data.y;
        $api.event = data;
        act($api);
      });

      // Ingest all keyboard input events by running act for each event.
      content.keyboard.forEach((data) => {
        Object.assign(data, { device: "keyboard", is: (e) => e === data.name });
        $api.event = data;
        act($api); // Execute piece shortcut.

        // 🌟 Global Keyboard Shortcuts

        if (data.name === "keyboard:down") {
          // [Escape]
          // If not on prompt, then move backwards through the history of
          // previously loaded pieces in a session.
          if (
            data.key === "Escape" &&
            currentPath !== "aesthetic.computer/disks/prompt"
          ) {
            if (pieceHistoryIndex > 0) {
              send({ type: "back-to-piece" });
            } else {
              // Load the prompt automatically.
              // $api.load("prompt"); Disabled on 2022.05.07.03.45
            }
          }

          if (
            data.key === "~" &&
            currentPath !== "aesthetic.computer/disks/prompt"
          ) {
            // Load prompt if the tilde is pressed.
            $api.load({
              host: location.hostname,
              path: "aesthetic.computer/disks/prompt",
              params: [],
              search: "",
              hash: "",
              text: "/",
            });
          }

          // [Ctrl + X]
          // Enter and exit fullscreen mode.
          if (data.key === "x" && data.ctrl) {
            send({ type: "fullscreen-toggle" });
          }
        }
      });
    }

    // 🖼 Render // Two sends (Move one send up eventually? -- 2021.11.27.17.20)
    if (content.needsRender) {
      const $api = {};
      Object.assign($api, $commonApi);
      Object.assign($api, painting.api);
      $api.paintCount = Number(paintCount);

      $api.inFocus = content.inFocus;

      $api.glaze = function (content) {
        glazeAfterReframe = { type: "glaze", content };
      };

      // Make a screen buffer or resize it automatically if it doesn't exist.
      if (
        !screen ||
        screen.width !== content.width ||
        screen.height !== content.height
      ) {
        screen = {
          pixels: new Uint8ClampedArray(content.width * content.height * 4),
          width: content.width,
          height: content.height,
        };

        // TODO: Add the depth buffer back here.
        // Reset the depth buffer.
        // graph.depthBuffer.length = screen.width * screen.height;
        // graph.depthBuffer.fill(Number.MAX_VALUE);
      }

      // TODO: Disable the depth buffer for now... it doesn't need to be
      //       regenerated on every frame.
      // graph.depthBuffer.fill(Number.MAX_VALUE); // Clear depthbuffer.

      $api.screen = screen;

      $api.fps = function (newFps) {
        send({ type: "fps-change", content: newFps });
      };

      $api.gap = function (newGap) {
        send({ type: "gap-change", content: newGap });
      };

      $api.density = function (newDensity) {
        send({ type: "density-change", content: newDensity });
      };

      $api.resize = function (width, height) {
        // Don't do anything if there is no change.

        console.log(
          "🖼 Reframe to:",
          width,
          height,
          "from",
          screen.width,
          screen.height
        );

        if (screen.width === width && screen.height === height) return;

        screen.width = width;
        screen.height = height;
        screen.pixels = new Uint8ClampedArray(screen.width * screen.height * 4);

        // Reset the depth buffer.
        // graph.depthBuffer.length = screen.width * screen.height;
        // graph.depthBuffer.fill(Number.MAX_VALUE);

        graph.setBuffer(screen);
        reframe = { width, height };
      };

      $api.cursor = (code) => (cursorCode = code);

      $api.pen = { x: penX, y: penY }; // TODO: This object should not be persistent.

      /**
       * @function video
       * @descrption Make a live video feed. Returns an object that links to current frame.
       * @param {string} type
       * @param {object} options - *unimplemented* { src, width, height }
       */
      $api.video = function (type, options) {
        // Options could eventually be { src, width, height }
        send({ type: "video", content: { type, options } });

        // Return an object that can grab whatever the most recent frame of
        // video was.
        return function videoFrame() {
          return activeVideo;
        };
      };

      graph.setBuffer(screen);

      // * Preload *
      // Add preload to the boot api.
      // Accepts paths local to the original disk server, full urls, and demos.
      // Usage:   preload("demo:drawings/2021.12.12.17.28.16.json") // pre-included
      //          preload("https://myserver.com/test.json") // remote
      //          preload("drawings/default.json") // hosted with disk
      // Results: preload().then((r) => ...).catch((e) => ...) // via promise

      // TODO: Add support for files other than .json and .png / .jpeg 2022.04.06.21.42

      // TODO: How to know when every preload finishes? 2021.12.16.18.55

      // TODO: Preload multiple files and load them into an assets folder with
      //       a complete handler. 2021.12.12.22.24
      $api.net.preload = function (path) {
        // console.log("Preload path:", path);

        const extension = path.split(".").pop();

        if (extension === "json") {
          path = encodeURIComponent(path);
        }

        try {
          const url = new URL(path);
          if (url.protocol === "demo:") {
            // Load from aesthetic.computer host.
            path = `/demo/${url.pathname}`;
          } else if (url.protocol === "https:") {
            // No need to change path because an original URL was specified.
          }
        } catch {
          // Not a valid URL so assume local file on disk server.
          path = `${location.protocol}//${$api.net.host}/${path}`;
        }

        // If we are loading a .json file then we can do it here.
        if (extension === "json") {
          return new Promise((resolve, reject) => {
            fetch(path)
              .then(async (response) => {
                if (!response.ok) {
                  reject(response.status);
                } else return response.json();
              })
              .then((json) => resolve(json))
              .catch(reject);
          });
        } else if (
          extension === "webp" ||
          extension === "jpg" ||
          extension === "png"
        ) {
          // Other-wise we should drop into the other thread and wait...
          return new Promise((resolve, reject) => {
            send({ type: "load-bitmap", content: path });
            bitmapPromises[path] = { resolve, reject };
          });
        }
      };

      // TODO: Set bpm from boot.
      /*
      $api.sound = {
        time: content.time,
        bpm: function (newBPM) {
          if (newBPM) {
            content.bpm[0] = newBPM;
          }
          return content.bpm[0];
        },
      };
       */

      // Run boot only once before painting for the first time.

      // TODO: Why is boot running twice? 22.07.17.17.26

      if (paintCount === 0n) {
        inFocus = content.inFocus; // Inherit our starting focus from host window.
        boot($api);
        if (loading === false) send({type: "disk-loaded-and-booted"});
      }

      // We no longer need the preload api for painting.
      delete $api.net.preload;

      // Paint a frame, which can return false to enable caching via noPaint and by
      // default returns undefined (assume a repaint).
      // Once paint returns false and noPaint is marked true, `needsPaint` must be called.
      // Note: Always marked false on a disk's first frame.
      let painted = false;
      let dirtyBox;

      if (noPaint === false) {
        const paintOut = paint($api); // Returns `undefined`, `false`, or `DirtyBox`.

        // `DirtyBox` and `undefined` always set `noPaint` to `true`.
        noPaint =
          paintOut === false || (paintOut !== undefined && paintOut !== true);

        // Run everything that was queued to be painted, then devour paintLayers.
        painting.paint();
        painted = true;
        paintCount = paintCount + 1n;

        if (paintOut) dirtyBox = paintOut;
      }

      // Return frame data back to the main thread.
      let sendData = {};
      let transferredPixels;

      // Check to see if we have a dirtyBox to render from.
      const croppedBox = dirtyBox?.croppedBox?.(screen);

      if (croppedBox?.w > 0 && croppedBox?.h > 0) {
        transferredPixels = dirtyBox.crop(screen);
        sendData = {
          pixels: transferredPixels,
          dirtyBox: croppedBox,
        };
      } else if (painted === true) {
        // TODO: Toggling this causes a flicker in `line`... but helps prompt. 2022.01.29.13.21
        // Otherwise render everything if we drew anything!
        transferredPixels = screen.pixels;
        sendData = { pixels: transferredPixels };
      }

      // Optional messages to send.
      if (painted === true) sendData.paintChanged = true;
      if (loading === true) sendData.loading = true;

      // These fields are one time `signals`.
      if (reframe || glazeAfterReframe) {
        sendData.reframe = reframe || glazeAfterReframe !== undefined;
        if (glazeAfterReframe) {
          send(glazeAfterReframe);
          glazeAfterReframe = undefined;
        }
      }
      if (cursorCode) sendData.cursorCode = cursorCode;

      // Note: transferredPixels will be undefined when sendData === {}.
      send({ type: "render", content: sendData }, [transferredPixels]);

      // Flush the `signals` after sending.
      if (reframe) reframe = undefined;
      if (cursorCode) cursorCode = undefined;
    } else {
      // Send update (sim).
      // TODO: How necessary is this - does any info ever need to actually
      //       get sent?
      send({
        type: "update",
        content: { didntRender: true, loading },
      });
    }
  }
}
