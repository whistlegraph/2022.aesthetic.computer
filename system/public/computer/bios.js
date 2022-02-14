// 💻 BIOS

// 📦 All Imports
import * as Loop from "./lib/loop.js";
import { Pen } from "./lib/pen.js";
import { Keyboard } from "./lib/keyboard.js";
import * as Graph from "./lib/graph.js";
import * as UI from "./lib/ui.js";
import * as Glaze from "./lib/glaze.js";
import { apiObject, extension } from "./lib/helpers.js";
import { dist } from "./lib/num.js";

const { assign } = Object;
const { round, floor, min } = Math;

// 💾 Boot the system and load a disk.
async function boot(
  path = "index",
  bpm = 60,
  host = window.location.host,
  resolution,
  debug
) {
  // Title
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

  // Global Keyboard Shortcuts
  console.log("Fullscreen:", "[ctrl+x]");
  console.log("Back:", "[esc]");

  // What words to type in?
  console.log(
    "Pieces:",
    "plot w h, tracker, melody, spray, sprinkles, starfield, pull, stage, metronome"
  );

  if (window.isSecureContext) {
    console.log("🔒 Secure");
  } else {
    console.warn("🔓 Insecure");
  }

  let pen, keyboard;
  let frameCount = 0;
  let timePassed = 0;

  let diskSupervisor;
  let currentPiece = null; // Gets set to a path after `loaded`.

  // 0. Video storage
  const videos = [];

  // 1. Rendering
  // Our main display surface.
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  // A ui canvas for rendering a native resolution ui on top of everything.
  const uiCanvas = document.createElement("canvas");
  const uiCtx = uiCanvas.getContext("2d");
  uiCanvas.dataset.type = "ui";

  // A buffer for nicer resolution switches, nice when moving from
  // low resolution back to high resolution. Could eventually be used
  // for transition effects.
  const freezeFrameCan = document.createElement("canvas");
  const ffCtx = freezeFrameCan.getContext("2d");
  freezeFrameCan.dataset.type = "freeze";

  let imageData;
  let fixedWidth, fixedHeight;
  let projectedWidth, projectedHeight;
  let canvasRect;

  let glaze = { on: false };

  let needsReframe = false;
  let freezeFrame = false,
    freezeFrameGlaze = false;

  const screen = apiObject("pixels", "width", "height");

  const REFRAME_DELAY = 250;
  let curReframeDelay = REFRAME_DELAY;

  function frame(width, height) {
    // Cache the current canvas if needed.
    if (freezeFrame && imageData) {
      console.log(
        "🥶 Freezing:",
        freezeFrame,
        imageData.width,
        imageData.height
      );
      freezeFrameCan.width = imageData.width;
      freezeFrameCan.height = imageData.height;
      freezeFrameCan.style.width = canvas.style.width;
      freezeFrameCan.style.height = canvas.style.height;
      freezeFrameCan.style.left = canvasRect.x + "px";
      freezeFrameCan.style.top = canvasRect.y + "px";

      // TODO: Save the Glaze canvas if glaze is enabled / figure out how to deal
      //       with Glaze.

      if (freezeFrameGlaze) {
        console.log("Freeze glaze!");
        Glaze.freeze(ffCtx);
        // ffCtx.fillStyle = "lime";
        // ffCtx.fillRect(0, 0, ffCtx.canvas.width, ffCtx.canvas.height);
        freezeFrameGlaze = false;
      } else {
        ffCtx.putImageData(imageData, 0, 0);
      }

      if (!document.body.contains(freezeFrameCan))
        document.body.append(freezeFrameCan);
      else freezeFrameCan.style.removeProperty("opacity");
      canvas.style.opacity = 0;
    }

    // Find the width and height of our default screen and native projection.
    width = width || fixedWidth;
    height = height || fixedHeight;
    const gapSize = 8 * window.devicePixelRatio;

    if (width === undefined && height === undefined) {
      // Automatically set and frame a reasonable resolution.
      const subdivisions = 2 + window.devicePixelRatio;
      width = floor(window.innerWidth / subdivisions);
      height = floor(window.innerHeight / subdivisions);
      projectedWidth = width * subdivisions - gapSize;
      projectedHeight = height * subdivisions - gapSize;
    } else {
      // Or do it manually if both width and height are defined.
      fixedWidth = width;
      fixedHeight = height;

      const scale = min(window.innerWidth / width, window.innerHeight / height);

      projectedWidth = floor(width * scale - gapSize);
      projectedHeight = floor(height * scale - gapSize);
    }

    console.info(
      "🔭 View:",
      width,
      height,
      "🖥 Window:",
      window.innerWidth,
      window.innerHeight
    );

    canvas.style.width = projectedWidth + "px";
    canvas.style.height = projectedHeight + "px";

    canvas.width = width;
    canvas.height = height;

    uiCanvas.width = projectedWidth * window.devicePixelRatio;
    uiCanvas.height = projectedHeight * window.devicePixelRatio;

    uiCanvas.style.width = projectedWidth + "px";
    uiCanvas.style.height = projectedHeight + "px";

    if (imageData) ctx.putImageData(imageData, 0, 0);

    imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    assign(screen, { pixels: imageData.data, width, height });

    // Add the canvas & uiCanvas when we first boot up.
    if (!document.body.contains(canvas)) {
      document.body.append(canvas);
      document.body.append(uiCanvas);

      // Trigger it to re-draw whenever the window resizes.
      let timeout;
      window.addEventListener("resize", () => {
        window.clearTimeout(timeout); // Small timer to save on performance.

        timeout = setTimeout(() => {
          needsReframe = true;
          curReframeDelay = REFRAME_DELAY;
        }, curReframeDelay); // Is this needed?
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

    uiCanvas.style.top = canvasRect.y + "px";
    uiCanvas.style.left = canvasRect.x + "px";

    // A native resolution canvas for drawing cursors, system UI, and effects.
    if (glaze.on) {
      Glaze.frame(
        canvas.width,
        canvas.height,
        canvasRect,
        projectedWidth,
        projectedHeight
      );
    } else {
      Glaze.off();
    }

    needsReframe = false;
    send({ type: "needs-paint" });
  }

  // 2. Audio
  const sound = {
    bpm: new Float32Array(1),
  };

  let updateMetronome,
    updateSquare,
    updateBubble,
    attachMicrophone,
    audioContext;

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

      updateBubble = function (bubble) {
        soundProcessor.port.postMessage({
          type: "bubble",
          data: bubble,
        });
      };

      soundProcessor.port.onmessage = (e) => {
        const time = e.data;
        diskSupervisor.requestBeat?.(time);
      };

      soundProcessor.connect(audioContext.destination);
    })();

    window.addEventListener("pointerdown", async () => {
      if (["suspended", "interrupted"].includes(audioContext.state)) {
        audioContext.resume();
      }
    });

    window.addEventListener("keydown", async () => {
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
      // TODO: Try and save the crash here by restarting the worker
      //       without a full system reload?
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
      diskSupervisor = { requestBeat, requestFrame };
      // Set currentPiece to be the last segment of the path.

      // Pen (also handles touch & pointer events)
      pen = new Pen((x, y) => {
        return {
          x: floor(((x - canvasRect.x) / projectedWidth) * screen.width),
          y: floor(((y - canvasRect.y) / projectedHeight) * screen.height),
        };
      });

      // ⌨️ Keyboard
      keyboard = new Keyboard();
      {
        /**
         * Insert a hidden input element that is used to toggle the software
         * keyboard on touchscreen devices like iPhones and iPads.
         * *Only works in "disks/prompt".
         */
        const input = document.createElement("input");
        input.id = "software-keyboard-input";
        input.type = "text";
        input.style.opacity = 0;
        input.style.width = 0;
        input.style.height = 0;
        input.style.position = "absolute";
        document.body.append(input);

        input.addEventListener("input", (e) => (e.target.value = null));

        let touching = false;
        let keyboardOpen = false;

        // TODO: The input element could be created and added to the DOM here
        //       if it didn't already exist?
        window.addEventListener("touchstart", () => (touching = true));

        window.addEventListener("focusout", (e) => {
          if (keyboardOpen) {
            keyboard.events.push({ name: "keyboard:close" });
            keyboardOpen = false;
          }
        });

        // Make a pointer "tap" gesture with an `inTime` window of 250ms to
        // trigger the keyboard on all browsers.
        let down = false;
        let downPos;
        let inTime = false;

        window.addEventListener("pointerdown", (e) => {
          down = true;
          downPos = { x: e.x, y: e.y };
          inTime = true;
          setTimeout(() => (inTime = false), 250);
          e.preventDefault();
        });

        window.addEventListener("pointerup", (e) => {
          if (
            down &&
            dist(downPos.x, downPos.y, e.x, e.y) < 8 &&
            inTime &&
            currentPiece === "disks/prompt" &&
            document.activeElement !== input
          ) {
            input.focus();
            if (touching) {
              touching = false;
              keyboard.events.push({ name: "keyboard:open" });
              keyboardOpen = true;
            }
          }
          down = false;
          e.preventDefault();
        });

        input.addEventListener("focus", (e) => {
          keyboard.events.push({ name: "typing-input-ready" });
        });
      }

      // 🖥️ Display
      frame(resolution?.width, resolution?.height);

      // 🔊 Sound
      // TODO: Only start this after a user-interaction to prevent warnings. 2022.01.19.19.53
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
          diskSupervisor.requestFrame?.(needsRender, updateTimes);
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
    for (const bubble of content.bubbles) updateBubble(bubble);
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

    // TODO: 📏 Measure performance of frame: test with different resolutions.
    startTime = performance.now();

    // Build the data to send back to the disk thread.
    send({
      type: "frame",
      content: {
        needsRender,
        updateCount,
        inFocus: document.hasFocus(),
        audioTime: audioContext?.currentTime,
        audioBpm: sound.bpm[0], // TODO: Turn this into a messaging thing.
        width: canvas.width,
        height: canvas.height,
        pen: pen.events, // TODO: Should store an array of states that get ingested by the worker.
        keyboard: keyboard.events, // TODO: Should store an array of states that get ingested by the worker.
      },
    });

    // Time budgeting stuff...
    //const updateDelta = performance.now() - updateNow;
    //console.log("Update Budget: ", round((updateDelta / updateRate) * 100));
    // TODO: Output this number graphically.

    //const renderNow = performance.now();
    //const renderDelta = performance.now() - renderNow;
    //console.log("Render Budget: ", round((renderDelta / renderRate) * 100));
    // TODO: Output this number graphically.

    // Clear pen events.
    pen.events.length = 0;

    // Clear keyboard events.
    keyboard.events.length = 0;
  }

  let frameCached = false;
  let pixelsDidChange = false; // TODO: Can this whole thing be removed? 2021.11.28.03.50

  async function receivedChange({ data: { type, content } }) {
    // Route to different functions if this change is not a full frame update.
    if (type === "refresh") {
      window.location.reload();
      return;
    }

    if (type === "web") {
      window.location.href = content;
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

    if (type === "fullscreen-toggle") {
      curReframeDelay = 0;
      toggleFullscreen();
      return;
    }

    if (type === "fps-change") {
      console.log("🎞️ FPS:", content);
      Loop.frameRate(content);
      return;
    }

    if (type === "glaze") {
      console.log("🪟 Glaze:", content);
      glaze = content;
      if (glaze.on === false) Glaze.off();
      else if (glaze.on === true) {
        Glaze.on(
          canvas.width,
          canvas.height,
          canvasRect,
          projectedWidth,
          projectedHeight
        );
      }
      return;
    }

    if (type === "disk-loaded") {
      // Emit a push state for the old disk if it was not the first. This is so
      // a user can use browser history to switch between disks.
      if (content.pieceCount > 0) {
        const url =
          content.path === content.firstPiece
            ? ""
            : // Set hash to be the last segment of the currentPiece path.
              "#" + content.path.substring(content.path.lastIndexOf("/") + 1);
        if (content.fromHistory === false) {
          history.pushState("", document.title, url);
        }
      }
      currentPiece = content.path;
      return;
    }

    if (type === "back-to-piece") {
      history.back();
      return false;
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

      // Reset the framing to a system default when unloading a disk if using
      // a customized resolution.
      // TODO: Do disks with custom resolutions need to be reset
      //       if they are being reloaded?
      if (fixedWidth && fixedHeight) {
        freezeFrame = true;
        freezeFrameGlaze = glaze.on;
        fixedWidth = undefined;
        fixedHeight = undefined;
        needsReframe = true;
      } else {
        console.log("flicker?");
        //Glaze.off(); // TODO: Move this to bottom of draw?
        //glaze.on = false;
      }

      // Turn off glaze.
      glaze.on = false;

      // Clear pen events.
      pen.events.length = 0;

      // Clear keyboard events.
      keyboard.events.length = 0;

      // Close (defocus) software keyboard if it exists.
      document.querySelector("#software-keyboard-input")?.blur();

      return;
    }

    // TODO: Filter out update from bottom of `disk.js` because I may not need to be
    //       sending them at all? 2022.01.30.13.01
    if (type === "update") {
      frameAlreadyRequested = false; // 🗨️ Tell the system we are ready for another frame.
      return;
    }

    // 🌟 Assume that `type` is "render" from now on.

    // Check for a change in resolution.
    if (content.reframe) {
      // Reframe the captured pixels.
      frame(content.reframe.width, content.reframe.height);
      pen.retransformPosition();
    }

    if (content.cursorCode) pen.setCursorCode(content.cursorCode);

    // About the render if pixels don't match.
    if (
      content.dirtyBox === undefined &&
      content.pixels?.length !== undefined &&
      content.pixels?.length !== screen.pixels.length
    ) {
      console.warn("Aborted render. Pixel buffers did not match.");
      console.log(
        "Content pixels:",
        content.pixels.length,
        "Screen:",
        screen.pixels.length,
        content.didntRender,
        content.reframe,
        "Freeze:",
        freezeFrame
      );
      frameAlreadyRequested = false; // 🗨️ Tell the system we are ready for another frame.
      return;
    }

    let dirtyBoxBitmapCan;

    // 👌 Otherwise, grab all the pixels, or some, if `dirtyBox` is present.
    if (content.dirtyBox) {
      // 🅰️ Cropped update.
      const imageData = new ImageData(
        content.pixels, // Is this the only necessary part?
        content.dirtyBox.w,
        content.dirtyBox.h
      );

      // Paint everything to a secondary canvas buffer.
      // TODO: Maybe this should be instantiated when the system starts to better
      //       optimize things? (Only if it's ever slow...)
      // TODO: Use ImageBitmap objects to make this faster once it lands in Safari.
      dirtyBoxBitmapCan = document.createElement("canvas");
      dirtyBoxBitmapCan.width = imageData.width;
      dirtyBoxBitmapCan.height = imageData.height;

      const dbCtx = dirtyBoxBitmapCan.getContext("2d");
      dbCtx.putImageData(imageData, 0, 0);

      // Use this alternative once it's faster. 2022.01.29.02.46
      // const dbCtx = dirtyBoxBitmapCan.getContext("bitmaprenderer");
      // dbCtx.transferFromImageBitmap(dirtyBoxBitmap);
    } else if (content.paintChanged) {
      // 🅱️ Normal full-screen update.
      imageData = new ImageData(content.pixels, canvas.width, canvas.height);
    }

    pixelsDidChange = content.paintChanged || false;

    function draw() {
      // 🅰️ Draw updated content from the piece.

      const db = content.dirtyBox;
      if (db) {
        ctx.drawImage(dirtyBoxBitmapCan, db.x, db.y);
        if (glaze.on) Glaze.update(dirtyBoxBitmapCan, db.x, db.y);
      } else if (pixelsDidChange) {
        ctx.putImageData(imageData, 0, 0); // Comment out for a `dirtyBox` visualization.
        if (glaze.on) Glaze.update(imageData);
      }

      if (glaze.on) {
        Glaze.render(
          ctx.canvas,
          timePassed,
          pen.normalizedPosition(canvasRect)
        );
      } else {
        Glaze.off();
      }

      // 🅱️ Draw anything from the system UI layer on top.

      const dpi = window.devicePixelRatio;

      uiCtx.scale(dpi, dpi);

      uiCtx.clearRect(0, 0, 64, 64); // Clear 64 pixels from the top left to remove any
      //                                previously rendered corner icons.

      pen.render(uiCtx, canvasRect); // ️ 🐭 Draw the cursor.

      if (content.loading === true) {
        UI.spinner(uiCtx, timePassed);
      }

      if (debug && frameCached && content.loading !== true) UI.cached(uiCtx); // Pause icon.

      uiCtx.resetTransform();
    }

    if (pixelsDidChange || pen.changedInPiece) {
      frameCached = false;
      pen.changedInPiece = false;
      draw();
    } else if (frameCached === false) {
      frameCached = true;
      draw();
      //console.log("Caching frame...");
    } else if (content.loading === true && debug === true) {
      draw();
    } else if (frameCached === true) {
      //draw(); // TODO: This is causing stuttering.
      // console.log("Cached...");
    }

    if (freezeFrame) {
      canvas.style.removeProperty("opacity");
      freezeFrameCan.style.opacity = 0;
      freezeFrame = false;
      freezeFrameGlaze = false;
    }

    if (glaze.on) Glaze.unfreeze();

    // TODO: Put this in a budget / progress bar system, related to the current refresh rate.
    // console.log("🎨", (performance.now() - startTime).toFixed(4), "ms");

    timePassed = performance.now();
    frameCount += 1;
    frameAlreadyRequested = false; // 🗨️ Tell the system we are ready for another frame.
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

  // 📚 History
  // TODO: Extract all the history features into a class of some kind?
  // TODO: Eventually add an API so that a disk can list all the history of
  //       a user's session. This could also be used for autocompletion of
  //       pieces / up + down arrow prev-next etc.
  window.onpopstate = function (e) {
    console.log("Popping State!");
    send({
      type: "history-load",
      content: document.location.hash.substring(1),
    });
  };

  // Fullscreen

  // Tries to toggle fullscreen. Must be called within a user interaction.
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.body.requestFullscreen().catch((e) => console.error(e));
    } else {
      document.exitFullscreen();
    }
  }

  document.body.onfullscreenchange = (event) => {
    if (document.fullscreenElement) {
      console.log("😱 Entered fullscreen mode!", document.fullscreenElement);
    } else {
      console.log("😱 Leaving fullscreen mode!");
    }
  };
}

export { boot };
