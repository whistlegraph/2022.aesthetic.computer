// Microphone, 2022.1.11.0.26
// A simple audio + video feedback monitor test.
// TODO: Add recording capability. 22.6.19.11.13

const { floor } = Math;
let mic;

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
}

// 💗 Beat (Runs once per bpm)
function beat({ sound: { beat, microphone } }) {
  if (!mic) {
    microphone.connect();
    mic = microphone;
  }
}

export { paint, beat };
