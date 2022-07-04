// 💻 BIOS

// 📦 All Imports
import * as Loop from "./lib/loop.js";
import { Pen } from "./lib/pen.js";
import { Keyboard } from "./lib/keyboard.js";
import * as UI from "./lib/ui.js";
import * as Glaze from "./lib/glaze.js";
import { apiObject, extension } from "./lib/helpers.js";
import { dist } from "./lib/num.js";

const { assign } = Object;
const { ceil, round, floor, min } = Math;

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
     border-right: 0.75px solid rgb(120, 120, 170);`
  ); // Print a pretty title in the console.

  // Global Keyboard Shortcuts
  console.log(
    `%cFullscreen: C-x, Prompt: ~`,
    `background-color: black;
     color: grey;
     padding: 0 0.25em;
     border-left: 0.75px solid rgb(60, 60, 60);
     border-right: 0.75px solid rgb(60, 60, 60);`
  );

  // What words to type in?
  console.log(
    "%cgithub.com/digitpain/aesthetic.computer",
    `color: rgb(100, 100, 100);
     background-color: black;
     padding: 0 0.25em;
     border-left: 0.75px solid rgb(60, 60, 60);
     border-right: 0.75px solid rgb(60, 60, 60);`
  );

  if (debug) {
    if (window.isSecureContext) {
      console.log("🔒 Secure");
    } else {
      console.warn("🔓 Insecure");
    }
  }

  window.acCONTENT_EVENTS = [];

  let pen, keyboard;
  let frameCount = 0;
  let timePassed = 0;

  let diskSupervisor;
  let currentPiece = null; // Gets set to a path after `loaded`.

  // Media Recorder
  let mediaRecorder; // See "recorder-rolling" below.

  // 0. Video storage
  const videos = [];

  // 1. Rendering

  // Wrap everything in an #aesthetic-computer div.
  const wrapper = document.createElement("div");
  wrapper.id = "aesthetic-computer";

  // Our main display surface.
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  // A layer for modal messages such as "audio engine is off".
  const modal = document.createElement("div");
  modal.id = "modal";

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
  let currentGlaze;

  let needsReframe = false;
  let needsReappearance = false;
  let freezeFrame = false,
    freezeFrameGlaze = false;

  const screen = apiObject("pixels", "width", "height");

  const REFRAME_DELAY = 250;
  let curReframeDelay = REFRAME_DELAY;
  let gap = 0;
  let density = 1; // added to window.devicePixelRatio

  function frame(width, height) {
    // Cache the current canvas if needed.
    if (freezeFrame && imageData && !document.body.contains(freezeFrameCan)) {
      console.log(
        "🥶 Freezing:",
        freezeFrame,
        imageData.width,
        imageData.height
      );

      freezeFrameCan.style.width = canvas.getBoundingClientRect().width + "px";
      freezeFrameCan.style.height =
        canvas.getBoundingClientRect().height + "px";

      // TODO: Get margin of canvasRect or make freezeFrame work on top of everything...
      // Is this still relevant? 2022.4.09

      /*
      console.log(
        "Freezeframe offset",
        wrapper.offsetLeft,
        canvasRect.x,
        canvasRect.width - canvasRect.x
      );
      */

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

      if (!wrapper.contains(freezeFrameCan)) wrapper.append(freezeFrameCan);
      else freezeFrameCan.style.removeProperty("opacity");
      canvas.style.opacity = 0;
    }

    // Find the width and height of our default screen and native projection.
    width = width || fixedWidth;
    height = height || fixedHeight;

    const gapSize = gap * window.devicePixelRatio;

    // console.log("INNER HEIGHT", window.innerHeight);

    if (width === undefined && height === undefined) {
      // Automatically set and frame a reasonable resolution.
      // Or pull from density.
      if (window.devicePixelRatio === 1) density = 2; // Always force a screen density of 3 on non-retina displays.
      const subdivisions = density + window.devicePixelRatio;
      width = round(window.innerWidth / subdivisions);
      height = round(window.innerHeight / subdivisions);
      projectedWidth = width * subdivisions - gapSize;
      projectedHeight = height * subdivisions - gapSize;
    } else {
      // Or do it manually if both width and height are defined.
      fixedWidth = width;
      fixedHeight = height;

      const scale = min(window.innerWidth / width, window.innerHeight / height);
      // console.log(window.innerWidth, window.innerHeight);

      projectedWidth = round(width * scale - gapSize);
      projectedHeight = round(height * scale - gapSize);
    }

    if (debug)
      console.info(
        "🖼 Frame:",
        width,
        height,
        "🖥 Window:",
        window.innerWidth,
        window.innerHeight
      );

    // Send a message about this new width and height to any hosting frames.
    // parent.postMessage({ width: projectedWidth, height: projectedHeight }, "*");

    canvas.width = width;
    canvas.height = height;

    uiCanvas.width = projectedWidth * window.devicePixelRatio;
    uiCanvas.height = projectedHeight * window.devicePixelRatio;

    // Horizontal and vertical offsetting of the wrapper.
    wrapper.style.top =
      round((window.innerHeight - projectedHeight) / 2) + "px";

    wrapper.style.left = round((window.innerWidth - projectedWidth) / 2) + "px";

    canvas.style.width = projectedWidth + "px";
    canvas.style.height = projectedHeight + "px";
    uiCanvas.style.width = projectedWidth + "px";
    uiCanvas.style.height = projectedHeight + "px";

    // Add some fancy ratios to the canvas and uiCanvas.
    /*
    canvas.style.width = `calc(100vw - ${gapSize}px)`;
    canvas.style.height = `calc(calc(${
      height / width
    } * 100vw) - ${gapSize}px)`;
    canvas.style.maxHeight = `calc(100vh - ${gapSize}px)`;
    canvas.style.maxWidth = `calc(calc(${
      width / height
    } * 100vh) - ${gapSize}px)`;

    uiCanvas.style.width = `calc(100vw - ${gapSize}px)`;
    uiCanvas.style.height = `calc(calc(${
      height / width
    } * 100vw) - ${gapSize}px)`;

    uiCanvas.style.maxHeight = `calc(100vh - ${gapSize}px)`;
    uiCanvas.style.maxWidth = `calc(calc(${
      width / height
    } * 100vh) - ${gapSize}px)`;
    */

    if (imageData) ctx.putImageData(imageData, 0, 0);

    imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    assign(screen, { pixels: imageData.data, width, height });

    // Add the canvas, modal, and uiCanvas when we first boot up.
    if (!wrapper.contains(canvas)) {
      wrapper.append(canvas);
      wrapper.append(modal);

      const bumper = document.createElement("div");
      bumper.id = "bumper";
      modal.append(bumper);

      wrapper.append(uiCanvas);
      document.body.append(wrapper);

      // Trigger it to re-draw whenever the window resizes.
      let timeout;
      window.addEventListener("resize", (e) => {
        // Check to see if we are in "native-cursor" mode and hide
        // #aesthetic.computer for the resize if we aren't.
        if (document.body.classList.contains("native-cursor") === false) {
          wrapper.classList.add("hidden");
        }

        window.clearTimeout(timeout); // Small timer to save on performance.

        timeout = setTimeout(() => {
          needsReframe = true; // This makes zooming work / not work.
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

    Glaze.clear();

    // A native resolution canvas for drawing cursors, system UI, and effects.
    if (glaze.on) {
      currentGlaze = Glaze.on(
        canvas.width,
        canvas.height,
        canvasRect,
        projectedWidth,
        projectedHeight,
        wrapper,
        glaze.type,
        () => {
          send({ type: "needs-paint" }); // Once all the glaze shaders load, render a single frame.
          // canvas.style.opacity = 0;
        }
      );
    } else {
      Glaze.off();
    }

    needsReframe = false;
    needsReappearance = true; // Only for `native-cursor` mode.
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
    audioContext,
    audioStreamDest;

  let requestMicrophoneAmplitude, requestMicrophoneWaveform;

  function startSound() {
    audioContext = new AudioContext({
      latencyHint: "interactive",
      // TODO: Eventually choose a good sample rate and/or make it settable via
      //       the current disk.
      sampleRate: 44100,
      // sampleRate: 48000,
      // sampleRate: 96000,
      // sampleRate: 192000,
    });

    audioStreamDest = audioContext.createMediaStreamDestination();

    if (audioContext.state === "running") {
      audioContext.suspend();
    }

    // TODO: Check to see if there is support for AudioWorklet or not...
    //       and and use ScriptProcessorNode as a fallback. 2022.01.13.21.00

    // Microphone Input Processor
    // (Gets attached via a message from the running disk.)
    attachMicrophone = async (data) => {
      if (debug) console.log("🎙 Microphone:", data || { monitor: false });

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

      // TODO: Why can't there be separate audioWorklet modules?
      await audioContext.audioWorklet.addModule(
        "aesthetic.computer/lib/microphone.js"
      );

      const playerNode = new AudioWorkletNode(
        audioContext,
        "microphone-processor",
        {
          outputChannelCount: [2],
          processorOptions: { debug },
        }
      );

      //console.log(playerNode);

      micNode.connect(playerNode);

      // Receive messages from the microphone processor thread.
      playerNode.port.onmessage = (e) => {
        const msg = e.data;

        if (msg.type === "amplitude") {
          send({ type: "microphone-amplitude", content: msg.content });
        }

        if (msg.type === "waveform") {
          send({ type: "microphone-waveform", content: msg.content });
        }
      };

      // Request data / send message to the mic processor thread.
      requestMicrophoneAmplitude = () => {
        playerNode.port.postMessage({ type: "get-amplitude" });
      };

      requestMicrophoneWaveform = () => {
        playerNode.port.postMessage({ type: "get-waveform" });
      };

      // Connect mic to the mediaStream.
      playerNode.connect(audioStreamDest);
      //playerNode.connect(audioContext.destination);

      // Connect to the speaker if we are monitoring audio.
      if (data?.monitor === true) playerNode.connect(audioContext.destination);
    };

    // Sound Synthesis Processor
    (async () => {
      await audioContext.audioWorklet.addModule(
        "aesthetic.computer/lib/speaker.js"
      );
      const soundProcessor = new AudioWorkletNode(
        audioContext,
        "sound-processor",
        {
          outputChannelCount: [2],
          processorOptions: { bpm: sound.bpm[0], debug },
        }
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

      // Connect soundProcessor to the mediaStream.
      soundProcessor.connect(audioStreamDest);

      soundProcessor.connect(audioContext.destination);

      audioContext.resume();

      modal.classList.remove("on");
      bumper.innerText = "";
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
  //const worker = new Worker("./aesthetic.computer/lib/disk.js", {
  //  type: "module",
  //});

  const worker = new Worker(new URL("./lib/disk.js", import.meta.url), {
    type: "module",
  });

  const params = path.split(":");
  const program = params[0];
  params.shift(); // Strip the program out of params.
  const firstMessage = {
    path: program,
    params,
    host,
    search,
    debug,
    rootPiece: window.acSTARTING_PIECE,
  };

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
        wrapper.append(input);

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
          if (currentPiece === "aesthetic.computer/disks/prompt") {
            down = true;
            downPos = { x: e.x, y: e.y };
            inTime = true;
            setTimeout(() => (inTime = false), 250);
            e.preventDefault();
          }
        });

        window.addEventListener("pointerup", (e) => {
          if (
            down &&
            dist(downPos.x, downPos.y, e.x, e.y) < 8 &&
            inTime &&
            currentPiece === "aesthetic.computer/disks/prompt" &&
            // Commenting the above allows iframes to capture keyboard events. 2022.04.07.02.10
            document.activeElement !== input
          ) {
            input.focus();
            if (touching) {
              touching = false;
              keyboard.events.push({ name: "keyboard:open" });
              keyboardOpen = true;
            }
            down = false;
            e.preventDefault();
          }
        });

        input.addEventListener("focus", (e) => {
          keyboard.events.push({ name: "typing-input-ready" });
        });
      }

      // 🖥️ Display
      frame(resolution?.width, resolution?.height);

      // 🔊 Sound
      // TODO: Disable sound engine entirely... unless it is enabled by a disk. 2022.04.07.03.33
      // Only start this after a user-interaction to prevent warnings.
      window.addEventListener(
        "pointerdown",
        function down() {
          startSound();
        },
        { once: true }
      );

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

  let contentFrame;

  async function receivedChange({ data: { type, content } }) {
    // *** Route to different functions if this change is not a full frame update.

    if (type === "content-create") {
      // Create a DOM container, if it doesn't already exist,
      // and add it here along with the requested content in the
      // template.
      if (!contentFrame) {
        contentFrame = document.createElement("div");
        contentFrame.id = "content";
        wrapper.appendChild(contentFrame);

        contentFrame.innerHTML += content.content; // Add content to contentFrame.

        // Evaluate the first script inside of contentFrame.
        // TODO: This should only evaluate new scripts, as they are added...
        const script = contentFrame.querySelector("script");

        if (script?.src) {
          const s = document.createElement("script");
          s.type = "module";
          // s.onload = callback; // s.onerror = callback;

          // The hash `time` parameter busts the cache so that the environment is
          // reset if a disk is re-entered while the system is running.
          // Why a hash? See also: https://github.com/denoland/deno/issues/6946#issuecomment-668230727
          s.src = script.src + "#" + Date.now();
          contentFrame.appendChild(s); // Re-insert the new script tag.
          script.remove(); // Remove old script element.
        } else if (script?.innerText.length > 0) {
          window.eval(script.innerText);
        }
      }

      send({
        type: "content-created",
        content: { id: content.id, response: "Content was made!" }, // TODO: Return an API / better object?
      });
      return;
    }

    if (type === "content-remove") {
      // Clear any DOM content that was added by a piece.
      contentFrame?.remove(); // Remove the contentFrame if it exists.
      contentFrame = undefined;
      // Remove any event listeners added by the content frame.
      window?.acCONTENT_EVENTS.forEach((e) => e());
      window.acCONTENT_EVENTS = []; // And clear all events from the list.
    }

    if (type === "title") {
      document.title = content; // Change the page title.
      return;
    }

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

    if (type === "get-microphone-amplitude") {
      requestMicrophoneAmplitude?.();
      return;
    }

    if (type === "get-microphone-waveform") {
      requestMicrophoneWaveform?.();
      return;
    }

    if (type === "video") {
      receivedVideo(content);
      return;
    }

    if (type === "recorder-rolling") {
      if (debug) console.log("🔴 Recorder: Rolling", content);

      if (mediaRecorder && mediaRecorder.state === "paused") {
        mediaRecorder.resume();
        return;
      }

      // TODO: To add it to a canvas...
      //       look into using "content" or options.

      // recorder.start();

      // https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/captureStream
      // console.log(content);
      // let audioTrack = dest.stream.getAudioTracks()[0];
      // add it to your canvas stream:
      // canvasStream.addTrack(audioTrack);
      // use your canvas stream like you would normally:
      // let recorder = new MediaRecorder(canvasStream);

      let mimeType;

      if (content === "audio" || content === "video") {
        if (MediaRecorder.isTypeSupported(content + "/mp4")) {
          mimeType = content + "/mp4"; // This is the setup for Safari.
        } else if (MediaRecorder.isTypeSupported(content + "/webm")) {
          mimeType = content + "/webm"; // And for Chrome & Firefox.
        } else {
          console.error("🔴 Mimetypes mp4 and webm are unsupported.");
        }
      } else {
        console.error("🔴 Option must be 'audio' or 'video'.");
      }

      let options;

      if (content === "audio") {
        options = {
          audioBitsPerSecond: 128000,
          mimeType,
        };
        mediaRecorder = new MediaRecorder(audioStreamDest.stream, options);
      } else if (content === "video") {
        // Currently always includes an audio track by default.
        options = {
          audioBitsPerSecond: 128000,
          videoBitsPerSecond: 2500000,
          mimeType,
        };

        const canvasStream = canvas.captureStream(30);
        canvasStream.addTrack(audioStreamDest.stream.getAudioTracks()[0]);
        mediaRecorder = new MediaRecorder(canvasStream, options);
      }

      const chunks = []; // Store chunks of the recording.
      mediaRecorder.ondataavailable = (evt) => chunks.push(evt.data);

      mediaRecorder.onstop = function (evt) {
        const blob = new Blob(chunks, {
          type: options.mimeType,
        });

        // Make an appropriate element to store the recording.
        const el = document.createElement(content); // "audio" or "video"
        el.src = URL.createObjectURL(blob);
        el.controls = true;

        // Add the recording to the dom, among other recordings that may exist.
        const recordings = wrapper.querySelector("#recordings");

        if (recordings) {
          recordings.append(el);
        } else {
          const recordingsEl = document.createElement("div");
          recordingsEl.id = "recordings";
          recordingsEl.append(el);

          const download = document.createElement("a");
          download.href = el.src;
          download.innerText = "Download Video";
          download.download = "test.mp4";
          recordingsEl.append(download);

          wrapper.append(recordingsEl);
        }

        // TODO: Figure out what to do with these...
        el.play();

        if (debug) console.log("📼 Recorder: Printed");
      };

      mediaRecorder.start();
      return;
    }

    if (type === "recorder-cut") {
      if (debug) console.log("✂️ Recorder: Cut");
      mediaRecorder?.pause();
      return;
    }

    if (type === "recorder-print") {
      mediaRecorder?.stop();
      mediaRecorder = undefined;
      return;
    }

    if (type === "load-bitmap") {
      fetch(content).then(async (response) => {
        if (!response.ok) {
          send({
            type: "loaded-bitmap-rejection",
            content: { url: content },
          });
        } else {
          const blob = await response.blob();
          const bitmap = await createImageBitmap(blob);

          const ctx = document.createElement("canvas").getContext("2d");
          ctx.canvas.width = bitmap.width;
          ctx.canvas.height = bitmap.height;
          ctx.drawImage(bitmap, 0, 0);
          const iD = ctx.getImageData(0, 0, bitmap.width, bitmap.height);

          send(
            {
              type: "loaded-bitmap-success",
              content: {
                url: content,
                img: {
                  width: iD.width,
                  height: iD.height,
                  pixels: iD.data,
                },
              },
            },
            [iD.data]
          );
        }
      });
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

    if (type === "gap-change") {
      if (debug) console.log("🕳️ Gap:", content);
      if (gap !== content) {
        gap = content;
        needsReframe = true;
      }
      return;
    }

    if (type === "density-change") {
      if (debug) console.log("💻️ Density:", content);
      if (density !== content) {
        density = content;
        needsReframe = true;
      }
      return;
    }

    if (type === "glaze") {
      if (debug) {
        console.log("🪟 Glaze:", content, "Type:", content.type || "prompt");
      }
      glaze = content;
      if (glaze.on === false) {
        Glaze.off();
        canvas.style.removeProperty("opacity");
      }
      // Note: Glaze gets turned on only on a call to `resize` or `gap` via a piece.
      return;
    }

    if (type === "disk-loaded") {
      // Show an "audio engine: off" message.

      //if (content.noBeat === false && audioContext?.state !== "running") {
      //bumper.innerText = "audio engine off";
      //modal.classList.add("on");
      //}

      // Emit a push state for the old disk if it was not the first. This is so
      // a user can use browser history to switch between disks.
      if (content.pieceCount > 0) {
        let url =
          content.path === content.firstPiece
            ? ""
            : // Set piece to be the last segment of the currentPiece path.
              "/" + content.path.substring(content.path.lastIndexOf("/") + 1);
        if (content.params.length > 0) {
          url += ":" + content.params.join(" ");
        }
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
      // Clear any DOM content that was added by a piece.
      contentFrame?.remove(); // Remove the contentFrame if it exists.
      contentFrame = undefined;
      // Remove any event listeners added by the content frame.
      window?.acCONTENT_EVENTS.forEach((e) => e());
      window.acCONTENT_EVENTS = []; // And clear all events from the list.

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

        freezeFrameCan.width = imageData.width;
        freezeFrameCan.height = imageData.height;

        fixedWidth = undefined;
        fixedHeight = undefined;
        needsReframe = true;
      }

      if (gap !== 0) {
        gap = 0;
        freezeFrame = true;
        freezeFrameCan.width = imageData.width;
        freezeFrameCan.height = imageData.height;
        needsReframe = true;
      }

      // Turn off glaze.
      glaze.on = false;

      canvas.style.removeProperty("opacity");

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

    // BIOS:RENDER
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
        // TODO: Is this actually updating with a blank image at first? How to prevent the glaze.clear flicker? 2022.6.8
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
      // } else if (content.loading === true && debug === true) {
    } else if (content.loading === true) {
      draw();
    } else if (frameCached === true) {
      //draw(); // TODO: This is causing stuttering.
      // console.log("Cached...");
    }

    if (freezeFrame) {
      if (glaze.on === false) {
        //canvas.style.removeProperty("opacity");
      }
      //freezeFrameCan.style.opacity = 0;
      freezeFrameCan.remove();
      freezeFrame = false;
      freezeFrameGlaze = false;
    }

    if (glaze.on) {
      Glaze.unfreeze();
    } else {
      canvas.style.removeProperty("opacity");
    }

    // TODO: Put this in a budget / progress bar system, related to the current refresh rate.
    // console.log("🎨", (performance.now() - startTime).toFixed(4), "ms");

    if (needsReappearance && wrapper.classList.contains("hidden")) {
      wrapper.classList.remove("hidden");
      needsReappearance = false;
    }

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

      wrapper.appendChild(video);
      wrapper.appendChild(buffer);

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

  // 🚨 Signal (Used to pass messages via window... important for embedded HTML
  //           `content` used within pieces that needs communication with the
  //           main system)
  window.signal = function (message) {
    if (debug) console.log("🚨 Signal:", message);
    send({
      type: "signal",
      content: message,
    });
  };

  // 📚 History
  // TODO: Extract all the history features into a class of some kind?
  // TODO: Eventually add an API so that a disk can list all the history of
  //       a user's session. This could also be used for autocompletion of
  //       pieces / up + down arrow prev-next etc.
  window.onpopstate = function (e) {
    send({
      type: "history-load",
      content:
        document.location.pathname.substring(1) ||
        document.location.hash.substring(1),
    });
  };

  // Fullscreen
  // Note: This doesn't work in Safari because you can't fullscreen the body element.
  //       (Or anything other than a video element?) 22.2.13

  const requestFullscreen =
    document.body.requestFullscreen || wrapper.webkitRequestFullscreen;

  const exitFullscreen =
    document.exitFullscreen || document.webkitExitFullscreen;

  // Tries to toggle fullscreen. Must be called within a user interaction.
  function toggleFullscreen() {
    const fullscreenElement =
      document.fullscreenElement || document.webkitFullscreenElement;

    if (!fullscreenElement) {
      requestFullscreen.apply(document.body)?.catch((e) => console.error(e));
    } else {
      exitFullscreen();
    }
  }

  document.body.onfullscreenchange = (event) => {
    const fullscreenElement =
      document.fullscreenElement || document.webkitFullscreenElement;

    if (fullscreenElement) {
      console.log("😱 Entered fullscreen mode!", fullscreenElement);
    } else {
      console.log("😱 Leaving fullscreen mode!");
    }
  };
}

export { boot };
