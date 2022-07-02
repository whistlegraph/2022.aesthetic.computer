// Microphone, 2022.1.11.0.26
// A simple audio + video feedback monitor test.

const { floor } = Math;

let mic,
  btn,
  rec = false;

function boot({ ui, screen, cursor }) {
  // cursor("native");
  btn = new ui.Button(screen.width / 2 - 4, screen.height - 24, 12, 12);
  btn.disabled = true;
}

// 🎨 Paint (Runs once per display refresh rate)
function paint({ wipe, ink, screen: { width, height } }) {
  wipe(15, 20, 0); // Dark green background.

  // Waveform & Amplitude Line
  if (mic?.waveform.length > 0 && mic?.amplitude) {
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

  // Record Button
  btn.paint((btn) => {
    ink(rec ? [255, 0, 0] : [80, 80, 80]).box(btn.box, btn.down ? "in" : "out");
  });
}

function sim() {
  btn.enableIf(mic?.waveform.length > 0);
  mic?.poll(); // Query for updated amplitude and waveform samples from the mic.
}

// 💗 Beat (Runs once per bpm, starting when the audio engine is activated.)
function beat({ sound: { time, microphone } }) {
  if (!mic) mic = microphone.connect();
}

let keyDowned = false; // TODO: This is really ugly and the keyboard api
//                              should be more beautiful.

function act({ event: e, rec: { rolling, cut, print } }) {
  if (!mic) return; // Disable all events until the microphone is working.

  if (e.is("keyboard:down") && e.key === "Enter" && keyDowned === false) {
    keyDowned = true;
    if (rec === false) {
      rolling("video");
      rec = true;
    } else {
      cut();
      rec = false;
    }
  }

  if (e.is("keyboard:down") && e.key == " ") {
    console.log("space");
    print(); // TODO: Allow multiple clips to be strung together.
  }

  // Relay event info to the save button.
  //recBtn.act(e, () => download(encode(timestamp())));
  btn.act(e, () => {
    if (rec === false) {
      rolling("video");
      rec = true;
    } else {
      cut();
      print();
      rec = false;
    }
  });

  if (e.is("keyboard:up") && e.key === "Enter") keyDowned = false;
}

export { boot, sim, paint, beat, act };
