// Bleep, 22.07.15.19.21
// A configurable interface of colored boxes that can be pushed to make tones.

class Bleeper {
  button;

  constructor({ ui: { Button }, screen }) {
    const marg = 10;
    this.button = new Button(
      marg,
      marg,
      screen.width - marg * 2,
      screen.height - marg * 2
    );
  }

  paint(ink) {
    ink(this.button.down ? 128 : 200).box(
      this.button.box,
      this.button.down ? "in" : "out"
    );
  }
}

const bleepers = [];

// 🥾 Boot (Runs once before first paint and sim)
function boot($) {
  bleepers.push(new Bleeper($));
}

// 🧮 Sim(ulate) (Runs once per logic frame (120fps locked)).
function sim($api) {}

// 🎨 Paint (Executes every display frame)
function paint({ wipe, ink }) {
  wipe(0); // Draw a black background

  // Draw every bleeper.
  bleepers.forEach((bleeper) => {
    bleeper.paint(ink);
  });

  return false; // Only once.
}

// ✒ Act (Runs once per user interaction)
function act({ event, needsPaint }) {
  bleepers.forEach((bleeper) => {
    bleeper.button.act(event, {
      push: () => {
         console.log("Bleeper: Pushed");
         needsPaint();
      },
      down: () => {
         console.log("Bleeper: Down");
         needsPaint();
      },
      cancel: () => {
         console.log("Bleeper: Cancel");
         needsPaint();
      },
    });
  });
}

// 💗 Beat (Runs once per bpm, starting when the audio engine is activated.)
function beat($api) {}

// 📚 Library (Useful classes & functions used throughout the piece)
// ...

export { boot, sim, paint, act, beat };
