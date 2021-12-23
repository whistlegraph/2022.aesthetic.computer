// 📦 All Imports
import * as Loop from "./lib/loop.js";
import { Pen } from "./lib/pen.js";
import * as Graph from "./lib/graph.js";
import * as UI from "./lib/ui.js";
import { apiObject, extension } from "./lib/helpers.js";

// 💾 Boot the system and load a disk.
async function boot(
  path = "index",
  bpm = 60,
  host = window.location.host,
  resolution,
  debug
) {
  let pen;

  // Define a blank starter disk that just renders noise and plays a tone.
  let disk;

  // 1. Rendering
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  let imageData;
  let fixedWidth, fixedHeight;
  let projectedWidth, projectedHeight;
  let canvasRect;
  let needsReframe = false;

  const screen = apiObject("pixels", "width", "height");

  function frame(width, height) {
    width = width || fixedWidth;
    height = height || fixedHeight;
    const gapSize = 8 * window.devicePixelRatio;

    if (width === undefined && height === undefined) {
      // Automatically set and frame a reasonable resolution.
      const subdivisions = 2 + window.devicePixelRatio;
      width = Math.floor(window.innerWidth / subdivisions);
      height = Math.floor(window.innerHeight / subdivisions);
      projectedWidth = width * subdivisions - gapSize;
      projectedHeight = height * subdivisions - gapSize;
    } else {
      // Or do it manually if both width and height are defined.
      fixedWidth = width;
      fixedHeight = height;

      const pixelGap = 1;

      const scale = Math.min(
        window.innerWidth / width,
        window.innerHeight / height
      );

      projectedWidth = Math.floor(width * scale - gapSize);
      projectedHeight = Math.floor(height * scale - gapSize);
    }

    // Store any pre-written imageData, in case of reframing.
    const storedImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    canvas.style.width = projectedWidth + "px";
    canvas.style.height = projectedHeight + "px";

    console.info(
      "Viewport:",
      width,
      height,
      "Window:",
      window.innerWidth,
      window.innerHeight
    );

    canvas.width = width;
    canvas.height = height;

    // Paste stored imageData back.
    ctx.putImageData(storedImageData, 0, 0);
    imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    Object.assign(screen, { pixels: imageData.data, width, height });

    if (fixedWidth === undefined && fixedHeight === undefined) {
      Graph.setBuffer(screen);
      Graph.color(25, 25, 100);
      Graph.clear(25, 25, 100);
      ctx.putImageData(imageData, 0, 0);
    }

    if (!document.body.contains(canvas)) {
      document.body.append(canvas);
      // Trigger it to re-draw whenever the window resizes.
      let timeout;
      window.addEventListener("resize", () => {
        window.clearTimeout(timeout); // Small timer to save on performance.
        timeout = setTimeout(() => {
          needsReframe = true;
        }, 500);
      });
    }

    canvasRect = canvas.getBoundingClientRect();
    needsReframe = false;
  }

  // 2. Audio
  const sound = {
    bpm: new Float32Array(1),
  };
  let updateMetronome, updateSquare, audioContext;

  function startSound() {
    audioContext = new AudioContext({
      latencyHint: "interactive",
      sampleRate: 44100,
    });

    if (audioContext.state === "running") {
      audioContext.suspend();
    }

    (async () => {
      await audioContext.audioWorklet.addModule("computer/lib/speaker.js");
      const soundProcessor = new AudioWorkletNode(
        audioContext,
        "sound-processor",
        { outputChannelCount: [2], processorOptions: { bpm: sound.bpm[0] } }
      );

      updateMetronome = function (newBPM) {
        soundProcessor.port.postMessage({
          type: "new-bpm",
          data: newBPM,
        });
      };

      updateSquare = function (square) {
        soundProcessor.port.postMessage({
          type: "square",
          data: square,
        });
      };

      soundProcessor.port.onmessage = (e) => {
        const time = e.data;
        disk.requestBeat?.(time);
      };

      soundProcessor.connect(audioContext.destination);
    })();

    window.addEventListener("pointerdown", async () => {
      if (["suspended", "interrupted"].includes(audioContext.state)) {
        audioContext.resume();
      }
    });
  }

  // TODO: Add mute
  // function mute() {
  //   audioContext.suspend();
  //   // Or... audioContext.resume();
  // }

  // Grab query parameters.
  const search = new URL(self.location).search;

  // Try to load the disk boilerplate as a worker first.
  // Safari and FF support is coming for worker module imports: https://bugs.webkit.org/show_bug.cgi?id=164860
  const worker = new Worker("./computer/lib/disk.js", { type: "module" });

  let send = (e) => worker.postMessage(e);
  let onMessage = loaded;
  worker.onmessage = (e) => onMessage(e);

  // Rewire things a bit if workers with modules are not supported (Safari & FF).
  worker.onerror = async () => {
    console.error("Disk worker failure.");
    const module = await import("./lib/disk.js");
    module.noWorker.postMessage = (e) => onMessage(e); // Define the disk's postMessage replacement.
    send = (e) => module.noWorker.onMessage(e); // Hook up our post method to disk's onmessage replacement.
    send({ path, host, search });
  };

  // Start everything once the disk is loaded.
  function loaded(e) {
    if (e.data.loaded === true) {
      console.log("💾 Loaded:", path, "🌐 from:", host);
      onMessage = receivedChange;
      disk = { requestBeat, requestFrame };

      // Pen (also handles touch & pointer events)
      pen = new Pen((x, y) => {
        return {
          x: Math.floor(((x - canvasRect.x) / projectedWidth) * screen.width),
          y: Math.floor(((y - canvasRect.y) / projectedHeight) * screen.height),
        };
      });

      // Display
      frame(resolution?.width, resolution?.height);

      // Sound
      startSound(); // This runs disk.beat

      // TODO: Stop using polling.

      // ➰ Core Loops for User Input, Music, Object Updates, and Rendering
      Loop.start(
        () => {
          // pen.poll();
          // TODO: Key.input();
          // TODO: Voice.input();
        },
        function (needsRender, updateTimes) {
          // console.log(updateTimes); // Note: No updates happen yet before a render.
          disk.requestFrame?.(needsRender, updateTimes);
        }
      );
    }
  }

  // The initial message sends the path and host to load the disk.
  send({ path, host, search });

  // Beat

  // Set the default bpm.
  sound.bpm.fill(bpm);

  function requestBeat(time) {
    send(
      {
        type: "beat",
        content: {
          time,
          beatProgress: 100,
          bpm: sound.bpm,
        },
      },
      [sound.bpm] // TODO: Why not just send the number here?
    );
  }

  function receivedBeat(content) {
    // BPM
    if (sound.bpm[0] !== content.bpm[0]) {
      sound.bpm = new Float32Array(content.bpm);
      updateMetronome(sound.bpm[0]);
    }

    // SQUARE
    for (const square of content.squares) updateSquare(square);
  }

  // Update & Render
  let frameAlreadyRequested = false;
  let startTime;

  function requestFrame(needsRender, updateCount) {
    if (needsReframe) frame();

    if (frameAlreadyRequested) return;
    frameAlreadyRequested = true;

    startTime = performance.now();

    // Build the data to send back to the disk thread.
    send(
      {
        type: "frame",
        content: {
          needsRender,
          updateCount,
          audioTime: audioContext?.currentTime,
          audioBpm: sound.bpm[0],
          pixels: screen.pixels.buffer,
          width: canvas.width,
          height: canvas.height,
          pen: pen.events, // TODO: Should store an array of states that get ingested by the worker.
          //updateMetronome,
        },
      },
      [screen.pixels.buffer]
    );

    // Time budgeting stuff...
    //const updateDelta = performance.now() - updateNow;
    //console.log("Update Budget: ", Math.round((updateDelta / updateRate) * 100));
    // TODO: Output this number graphically.

    //const renderNow = performance.now();
    //const renderDelta = performance.now() - renderNow;
    //console.log("Render Budget: ", Math.round((renderDelta / renderRate) * 100));
    // TODO: Output this number graphically.

    // Clear pen events.
    pen.events.length = 0;
  }

  let frameCached = false;
  let pixelsDidChange = false; // TODO: Can this whole thing be removed? 2021.11.28.03.50

  // TODO: Organize e into e.data.type and e.data.content.
  function receivedChange({ data: { type, content } }) {
    // Route to different functions if this change is not a full frame update.
    if (type === "beat") {
      receivedBeat(content);
      return;
    }

    if (type === "download") {
      receivedDownload(content);
      return;
    }

    if (type === "upload") {
      receivedUpload(content);
      return;
    }

    // Assume that type is "render" or "update" from now on.

    // Check for a change in resolution.
    if (content.reframe) {
      // Reframe the captured pixels.
      frame(content.reframe.width, content.reframe.height);
    }

    // Grab the pixels.
    // TODO: Use BitmapData objects to make this faster once it lands in Safari.
    imageData = new ImageData(
      new Uint8ClampedArray(content.pixels), // Is this the only necessary part?
      canvas.width,
      canvas.height
    );

    screen.pixels = imageData.data;

    frameAlreadyRequested = false;

    if (content.cursorCode) pen.setCursorCode(content.cursorCode);

    if (content.didntRender === true) return;

    Graph.setBuffer(screen); // Why does screen exist here?

    pixelsDidChange = content.paintChanged || false;

    if (pixelsDidChange || pen.changed) {
      frameCached = false;

      pen.render(Graph);
      if (content.loading === true && debug === true) UI.spinner(Graph);

      ctx.putImageData(imageData, 0, 0);
    } else if (frameCached === false) {
      frameCached = true;
      pen.render(Graph);
      if (debug) {
        // Draw the pause icon in the top left.
        // TODO: How to I use my actual API in here? 2021.11.28.04.00
        Graph.color(0, 255, 255);
        Graph.line(1, 1, 1, 4);
        Graph.line(3, 1, 3, 4);
      }
      ctx.putImageData(imageData, 0, 0);
    } else if (content.loading === true && debug === true) {
      UI.spinner(Graph);
      ctx.putImageData(imageData, 0, 0);
    }

    // TODO: Put this in a budget related to the current refresh rate.
    // TODO: Do renders always need to be requested?
    //console.log("🎨 MS:", (performance.now() - startTime).toFixed(1));
  }

  // Reads the extension off of filename to determine the mimetype and then
  // handles the data accordingly and downloads the file in the browser.
  function receivedDownload({ filename, data }) {
    let MIME = "application/octet-stream"; // TODO: Default content type?

    if (extension(filename) === "json") {
      MIME = "application/json";
    }

    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([data], { type: MIME }));
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  // Opens a file chooser that is filtered by a given extension / mimetype list.
  // And sends the text contents of an individual file back to the disk.
  function receivedUpload(type) {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = type;

    input.onchange = (e) => {
      // Grab the only selected file in the file input.
      const file = e.target.files[0];

      // Does type match nothing in the comma separated `input.accept` list?
      const noMatch = type.split(",").every((t) => {
        return t !== file.type && t !== `.${extension(file.name)}`;
      });

      // Relay error if chosen file does not match the `input.accept` list.
      if (noMatch) {
        send({
          type: "upload",
          content: {
            result: "error",
            data: `Chosen file was not of type "${type}"`,
          },
        });
        return;
      }

      // Read the file.
      const reader = new FileReader();
      reader.readAsText(file);

      // Send the content back to the disk once the file loads.
      reader.onload = (e) => {
        send({
          type: "upload",
          content: { result: "success", data: e.target.result },
        });
      };

      // Relay an error if the file fails to load for any reason.
      reader.onerror = () => {
        send({
          type: "upload",
          content: { result: "error", data: reader.error },
        });
      };
    };

    input.click();
  }
}

export { boot };
