// Microphone, 2022.1.11.0.26
// A simple audio + video feedback monitor test.

const { floor } = Math;

let mic,
  interfaceDisabled = true,
  rec = false;

function boot({ ui, screen, cursor, content }) {
  // TODO: Read the top two lines of a piece for page metadata!
  // description("Blah blah...");
  // cursor("native");
  // btn = new ui.Button(screen.width / 2 - 6, screen.height - 24, 12, 12);
  // btn.disabled = true;
}

function paint({ wipe, box, ink, rec: { printProgress }, screen: { width, height } }) {
  wipe(15, 20, 0); // Dark green background.

  // Waveform & Amplitude Line
  if (mic?.waveform.length > 0 && mic?.amplitude !== undefined) {
    const xStep = width / mic.waveform.length + 1;
    const yMid = height / 2,
      yMax = yMid;
    ink(255, 0, 0, 128).poly(
      mic.waveform.map((v, i) => [i * xStep, yMid + v * yMax])
    );
    const y = height - mic.amplitude * height;
    ink(255, 16).line(0, y, width, y); // Horiz. line for amplitude.
  }

  ink(0, 255, 0, 16).line(0, height / 2, width, height / 2); // Center line.

  // Draw progress bar for video rendering.
  if (printProgress > 0) {
    ink(255, 0, 0);
    box(0, 0, printProgress * width, 3);
  } 
}

function sim({ dom: { html, css, javascript } }) {
  mic?.poll(); // Query for updated amplitude and waveform data.
  if (mic && interfaceDisabled) {
    interfaceDisabled = false;

    // TODO: Use shadowDom for these?
    html`<button tabindex="1" id="rec-btn"></button>`;

    css`
      button {
        border-radius: 100%;
        border: none;
        width: 6em;
        height: 6em;
        margin: auto auto 3em auto;
        background-color: rgb(200, 0, 0);
        border: 0.45em solid rgb(28, 59, 34);
        cursor: none;
        transition: .25s border-radius, .25s background-color;
      }
      button.recording {
        border: 0.85em solid rgb(28, 59, 34);
        background-color: rgb(100, 100, 100);
        border-radius: 15%;
      }
    `;

    javascript`
      const rec = document.body.querySelector('#rec-btn'); 
      console.log(rec);

      rec.addEventListener("pointerdown", () => {
        signal("microphone:record-btn-pressed");
      });

      when("microphone:recording", () => {
        rec.classList.add('recording');
      });

      when("microphone:recording-done", () => {
        rec.classList.remove('recording');
      });
    `;
  }
}

function beat({ sound: { time, microphone }, content }) {
  if (!mic) mic = microphone.connect();
}

function act({ signal, event: e, rec: { rolling, cut, print, printProgress } }) {
  if (!mic) return; // Disable all events until the microphone is working.
  if (printProgress > 0) return; // Prevent any interaction when a video is rendering.

  // Keyboard Events
  if (e.is("keyboard:down") && e.repeat === false) {
    // These shortcuts allow for pausing and starting a recording.
    if (e.key === "Enter") {
      if (rec === false) {
        rolling("video");
        rec = true;
      } else {
        cut();
        rec = false;
      }
    }
    if (e.key == " ") print();
  }

  // And this UI button just stops and saves single takes.
  if (e.is("signal") && e.signal.includes("microphone:record-btn-pressed")) {
    if (rec === false) {
      rolling("video");
      rec = true;
      signal("microphone:recording");
    } else {
      cut();
      print();
      rec = false;
      signal("microphone:recording-done");
    }
  }
}

export { boot, sim, paint, beat, act };
