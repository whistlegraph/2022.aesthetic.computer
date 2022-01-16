// 💻 BIOS

// 📦 All Imports
import * as Loop from "./lib/loop.js";
import { Pen } from "./lib/pen.js";
import { Keyboard } from "./lib/keyboard.js";
import * as Graph from "./lib/graph.js";
import * as UI from "./lib/ui.js";
import { apiObject, extension } from "./lib/helpers.js";

const { assign } = Object;

// 💾 Boot the system and load a disk.
async function boot(
  path = "index",
  bpm = 60,
  host = window.location.host,
  resolution,
  debug
) {
  console.log(
    "%caesthetic.computer",
    `background: rgb(10, 20, 40);
     color: rgb(120, 120, 170);
     font-size: 120%;
     padding: 0 0.25em;
     border-radius: 0.15em;
     border-bottom: 0.75px solid rgb(120, 120, 170);
     border-right: 0.75px solid rgb(120, 120, 170);
   `
  ); // Print a pretty title in the console.

  if (window.isSecureContext) {
    console.log("🔒 Secure");
  } else {
    console.warn("🔓 Insecure");
  }

  let pen, keyboard;

  // Define a blank starter disk that just renders noise and plays a tone.
  let disk;

  // 0. Video storage
  const videos = [];

  // 1. Rendering
  // Our main display surface.
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  // A buffer for nicer resolution switches, nice when moving from
  // low resolution back to high resolution. Could eventually be used
  // for transition effects.
  const freezeFrameCan = document.createElement("canvas");
  const ffCtx = freezeFrameCan.getContext("2d");

  let imageData;
  let compositeImageData;
  let fixedWidth, fixedHeight;
  let projectedWidth, projectedHeight;
  let canvasRect;
  let needsReframe = false;
  let freezeFrame = false;

  const screen = apiObject("pixels", "width", "height");
  const composite = apiObject("pixels", "width", "height");

  function frame(width, height) {
    // Cache the current canvas.
    if (freezeFrame && imageData) {
      console.log("Freezing:", freezeFrame, imageData.width, imageData.height);
      freezeFrameCan.width = imageData.width;
      freezeFrameCan.height = imageData.height;
      freezeFrameCan.style.width = canvas.style.width;
      freezeFrameCan.style.height = canvas.style.height;
      ffCtx.putImageData(imageData, 0, 0);
      if (!document.body.contains(freezeFrameCan))
        document.body.append(freezeFrameCan);
      else freezeFrameCan.style.removeProperty("display");
      canvas.style.display = "none";
    }

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

      const scale = Math.min(
        window.innerWidth / width,
        window.innerHeight / height
      );

      projectedWidth = Math.floor(width * scale - gapSize);
      projectedHeight = Math.floor(height * scale - gapSize);
    }

    canvas.style.width = projectedWidth + "px";
    canvas.style.height = projectedHeight + "px";

    console.info(
      "🔭 View:",
      width,
      height,
      "🖥 Window:",
      window.innerWidth,
      window.innerHeight
    );

    canvas.width = width;
    canvas.height = height;

    if (imageData) ctx.putImageData(imageData, 0, 0);

    imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    compositeImageData = ctx.getImageData(0, 0, canvas.width, canvas.height); // Allocate composite data.

    assign(screen, { pixels: imageData.data, width, height });
    assign(composite, { pixels: compositeImageData.data, width, height });

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

      // Prevent canvas touchstart events from triggering magnifying glass on
      // iOS Safari.
      canvas.addEventListener(
        "touchstart",
        function (event) {
          event.preventDefault();
        },
        false
      );
    }

    canvasRect = canvas.getBoundingClientRect();
    needsReframe = false;
    send({ type: "needs-paint" });
  }

  // 2. Audio
  const sound = {
    bpm: new Float32Array(1),
  };

  let updateMetronome, updateSquare, attachMicrophone, audioContext;

  function startSound() {
    audioContext = new AudioContext({
      latencyHint: 0,
      // TODO: Eventually choose a good sample rate and/or make it settable via
      //       the current disk.
      // sampleRate: 44100,
      // sampleRate: 48000,
      // sampleRate: 96000,
      sampleRate: 192000,
    });

    if (audioContext.state === "running") {
      audioContext.suspend();
    }

    // TODO: Check to see if there is support for AudioWorklet or not...
    //       and and use ScriptProcessorNode as a fallback. 2022.01.13.21.00

    // Microphone Input Processor
    // (Gets attached via a message from the running disk.)
    attachMicrophone = async (data) => {
      console.log("Attaching microphone:", data);

      const micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          latency: 0,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });

      const micNode = new MediaStreamAudioSourceNode(audioContext, {
        mediaStream: micStream,
      });

      await audioContext.audioWorklet.addModule("computer/lib/microphone.js");
      const playerNode = new AudioWorkletNode(audioContext, "microphone", {
        outputChannelCount: [2],
      });

      micNode.connect(playerNode);
      playerNode.connect(audioContext.destination);
    };

    // Sound Synthesis Processor
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
  const firstMessage = { path, host, search, debug };

  // Rewire things a bit if workers with modules are not supported (Firefox).
  worker.onerror = async (err) => {
    if (
      err.message ===
      "SyntaxError: import declarations may only appear at top level of a module"
    ) {
      console.error(
        "🟡 Disk module workers unsupported. Continuing with dynamic import..."
      );
      const module = await import(`./lib/disk.js`);
      module.noWorker.postMessage = (e) => onMessage(e); // Define the disk's postMessage replacement.
      send = (e) => module.noWorker.onMessage(e); // Hook up our post method to disk's onmessage replacement.
      send(firstMessage);
    } else {
      console.error("🛑 Disk error:", err);
    }
  };

  let send = (e) => worker.postMessage(e);
  let onMessage = loaded;

  worker.onmessage = (e) => onMessage(e);

  // Start everything once the disk is loaded.
  function loaded(e) {
    if (e.data.loaded === true) {
      //console.log("💾", path, "🌐", host);
      onMessage = receivedChange;
      disk = { requestBeat, requestFrame };

      // Pen (also handles touch & pointer events)
      pen = new Pen((x, y) => {
        return {
          x: Math.floor(((x - canvasRect.x) / projectedWidth) * screen.width),
          y: Math.floor(((y - canvasRect.y) / projectedHeight) * screen.height),
        };
      });

      // Keyboard
      keyboard = new Keyboard();

      // Display
      frame(resolution?.width, resolution?.height);

      // Sound
      // TODO: Only start this after a user-interaction 22.1.3.
      startSound();

      // ➰ Core Loops for User Input, Music, Object Updates, and Rendering
      Loop.start(
        () => {
          // TODO: What is this now?
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
  send(firstMessage);

  // Beat

  // Set the default bpm.
  sound.bpm.fill(bpm);

  function requestBeat(time) {
    send(
      {
        type: "beat",
        content: {
          time,
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
    if (needsReframe) {
      frame();
      pen.retransformPosition();
    }

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
          inFocus: document.hasFocus(),
          audioTime: audioContext?.currentTime,
          audioBpm: sound.bpm[0],
          pixels: screen.pixels.buffer,
          width: canvas.width,
          height: canvas.height,
          pen: pen.events, // TODO: Should store an array of states that get ingested by the worker.
          keyboard: keyboard.events, // TODO: Should store an array of states that get ingested by the worker.
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

    // Clear keyboard events.
    keyboard.events.length = 0;
  }

  let frameCached = false;
  let pixelsDidChange = false; // TODO: Can this whole thing be removed? 2021.11.28.03.50

  // TODO: Organize e into e.data.type and e.data.content.
  function receivedChange({ data: { type, content } }) {
    // Route to different functions if this change is not a full frame update.
    if (type === "refresh") {
      window.location.reload();
      return;
    }

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

    if (type === "microphone") {
      receivedMicrophone(content);
      return;
    }

    if (type === "video") {
      receivedVideo(content);
      return;
    }

    if (type === "disk-unload") {
      // Remove existing video tags.
      videos.forEach(({ video, buffer, getAnimationRequest }) => {
        console.log("🎥 Removing:", video, buffer, getAnimationRequest());
        video.remove();
        buffer.remove();
        cancelAnimationFrame(getAnimationRequest());
      });
      // Note: Any other disk state cleanup that needs to take place on unload
      //       should happen here.

      // Reset the framing to system when unloading a disk if it is using
      // a customized resolution.
      // TODO: Do disks with custom resolutions need to be reset
      //       if they are being reloaded?
      if (fixedWidth && fixedHeight) {
        freezeFrame = true;
        fixedWidth = undefined;
        fixedHeight = undefined;
        needsReframe = true;
      }

      // Clear pen events.
      pen.events.length = 0;

      // Clear keyboard events.
      keyboard.events.length = 0;

      return;
    }

    // Assume that type is "render" or "update" from now on.

    // Check for a change in resolution.
    if (content.reframe) {
      // Reframe the captured pixels.
      frame(content.reframe.width, content.reframe.height);
      pen.retransformPosition();
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

    // Copy all rendered pixels to a composite buffer that will have system-wide
    // UI elements like loading spinners and cursors tacked on before displaying.
    composite.pixels.set(imageData.data);

    Graph.setBuffer(composite);

    pixelsDidChange = content.paintChanged || false;

    // TODO: This can all be rewritten: 22.1.13.15.26
    // TODO: Can pen.changed just be a cursor change?
    if (pixelsDidChange || pen.changed) {
      frameCached = false;
      pen.render(Graph);
      if (content.loading === true && debug === true) UI.spinner(Graph);
      ctx.putImageData(compositeImageData, 0, 0);
    } else if (frameCached === false) {
      frameCached = true;
      pen.render(Graph);
      if (debug) {
        // TODO: How to I use my actual API in here? 2021.11.28.04.00
        // Draw the pause icon in the top left.
        Graph.color(0, 255, 255);
        Graph.line(1, 1, 1, 4);
        Graph.line(3, 1, 3, 4);
      }
      ctx.putImageData(compositeImageData, 0, 0);
      // console.log("Caching frame...");
    } else if (content.loading === true && debug === true) {
      UI.spinner(Graph);
      ctx.putImageData(compositeImageData, 0, 0);
    } else if (frameCached === true) {
      // console.log("Cached...");
    }

    if (freezeFrame) {
      console.log("Thawing...", freezeFrameCan.width, freezeFrameCan.height);
      canvas.style.removeProperty("display");
      freezeFrameCan.style.display = "none";
      freezeFrame = false;
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

  // Connects the Microphone to the current audioContext.
  function receivedMicrophone(data) {
    attachMicrophone?.(data);
  }

  // Takes a request for a video and then either uses a media query (for a camera)
  // or loads a video file from a given url.

  // Then it puts that into a new video tag and starts playing it,
  // sending the disk the thread frames as they update.
  function receivedVideo({ type, options }) {
    console.log("🎥", type, options);

    if (type === "camera") {
      // TODO: Give video and canvas a unique identifier that
      //       will create a link in the worker so that frame updates
      //       for multiple videos can be routed simultaneously.
      const video = document.createElement("video");
      const buffer = document.createElement("canvas");
      let animationRequest;

      function getAnimationRequest() {
        return animationRequest;
      }

      videos.push({ video, buffer, getAnimationRequest });

      buffer.width = options.width || 1280;
      buffer.height = options.height || 720;

      const bufferCtx = buffer.getContext("2d");

      document.body.appendChild(video);
      document.body.appendChild(buffer);

      video.style = `position: absolute;
                     top: 0;
                     left: 0;
                     width: 300px;
                     opacity: 0;`;

      buffer.style = `position: absolute;
                      opacity: 0;`;

      navigator.mediaDevices
        .getUserMedia({
          video: { width: { min: 1280 }, height: { min: 720 } },
          audio: false,
        })
        .then((stream) => {
          video.srcObject = stream;
          video.play();
          process();
        })
        .catch((err) => {
          console.log(err);
        });

      function process() {
        bufferCtx.drawImage(
          video,
          0,
          0,
          bufferCtx.canvas.width,
          bufferCtx.canvas.height
        );

        const pixels = bufferCtx.getImageData(
          0,
          0,
          buffer.clientWidth,
          buffer.clientHeight
        );

        send(
          {
            type: "video-frame",
            content: {
              width: pixels.width,
              height: pixels.height,
              pixels: pixels.data,
            },
          },
          [pixels.data]
        );

        animationRequest = requestAnimationFrame(process);
      }
    }
  }

  // TODO: Add fullscreen support.
  /*
  // Tries to toggle fullscreen. Must be called within a user interaction.
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.body.requestFullscreen().catch((e) => console.error(e));
    } else {
      document.exitFullscreen();
    }
  }

  // TODO: Get fullscreen to work via a keyboard shortcut in addition
  // to a button click within an api.
  // toggleFullscreen();
  window.addEventListener("touchstart", (e) => {
    toggleFullscreen();
  });
  */
}

export { boot };
