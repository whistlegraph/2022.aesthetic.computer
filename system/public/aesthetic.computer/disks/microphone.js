// Microphone, 2022.1.11.0.26
// A simple audio + video feedback monitor test.
// TODO: Add recording capability. 22.6.19.11.13

const { floor } = Math;
let mic,
  recording = false;

// 🎨 Paint (Runs once per display refresh rate)
function paint({ wipe, ink, screen: { width, height } }) {
  mic?.poll(); // Query for updated amplitude and waveform samples from the mic.
  wipe(15, 20, 0); // Clear background to green.

  if (mic?.amplitude) {
    const y = height - mic.amplitude * height;
    ink(255, 16).line(0, y, width, y); // Horiz. line to represent total volume.
  }

  if (mic?.waveform) {
    const horizontalStep = width / mic.waveform.length + 1;
    const yMid = height / 2,
      maxHeight = yMid;
    let points = [];
    mic.waveform.forEach((value, i) => {
      points.push([i * horizontalStep, yMid + value * maxHeight]); // Get points.
    });
    ink(255, 0, 0, 128).poly(points); // Plot the waveform as a polyline.
  }

  ink(0, 255, 0, 96).line(0, height / 2, width, height / 2); // Horizontal lime.

  if (recording) {
    ink(255, 0, 0).circle(16, 16, 8);
  }
}

// 💗 Beat (Runs once per bpm)
function beat({ sound: { beat, microphone } }) {
  console.log("beat");
  if (!mic) {
    microphone.connect();
    mic = microphone;
  }
}

let keyDowned = false; // TODO: This is really ugly and the keyboard api
//                              should be more beautiful.

function act({ event: e, rec: { rolling, cut, print } }) {
  if (e.is("keyboard:down") && e.key === "Enter" && keyDowned === false) {
    keyDowned = true;
    if (recording === false) {
      rolling("audio");
      recording = true;
    } else {
      cut();
      print(); // TODO: Allow multiple clips to be strung together.
      recording = false;
    }
  }

  if (e.is("keyboard:up") && e.key === "Enter") keyDowned = false;
}

export { paint, beat, act };
