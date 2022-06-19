// Microphone, 2022.1.11.0.26
// A simple audio + video feedback monitor test.
// TODO: Add recording capability. 22.6.19.11.13
// TODO: Fork off camera into a separate disk.

const { floor } = Math;
let mic;

// 🎨 Paint (Runs once per display refresh rate)
function paint({ wipe, ink, paste, screen: { width, height } }) {
  mic?.poll(); // Query for updated amplitude and waveform samples from the mic.

  wipe(15, 20, 0); // Clear the background.

  if (mic?.amplitude) {
    const y = height - mic.amplitude * height;
    ink(255, 16).line(0, y, width, y); // Draw line to represent overall volume.
  }

  if (mic?.waveform) {
    const horizontalStep = width / mic.waveform.length + 1;
    const yMid = height / 2;
    const maxHeight = yMid;
    let x = 0,
      points = [];
    // Calculate all the waveform points.
    mic.waveform.forEach((value, i) => {
      points.push([x, yMid + value * maxHeight]);
      x += horizontalStep;
    });
    ink(255, 0, 0, 128).poly(points); // Draw the waveform.
  }

  ink(0, 255, 0, 96).line(0, height / 2, width, height / 2); // Lime horizontal line.
}

// 💗 Beat (Runs once per bpm)
function beat({ sound: { beat, microphone } }) {
  if (!mic) {
    microphone.connect();
    mic = microphone;
  }
}

// 📚 Library (Useful functions used throughout the program)
// ...

export { paint, beat };
