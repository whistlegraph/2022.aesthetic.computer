// Bleep, 22.07.15.19.21
// A configurable interface of colored boxes that can be pushed to make tones.

class Bleeper {
  button;
  needsBleep = false;
  tone;

  constructor({ ui: { Button }, screen, num: { randIntRange } }, geometry) {
    this.tone = randIntRange(200, 800);

    this.button = new Button(...geometry);
  }

  paint({ ink, num: { map } }) {
    // TODO: Map the tone color range to color the inside.
    const color = map(this.tone, 200, 800, 0, 100);

    ink(this.button.down ? 100 + color : 155 + color).box(this.button.box); // Inside

    ink(this.button.down ? 128 : 200).box(
      this.button.box,
      this.button.down ? "in" : "out"
    ); // Outline

    // TODO: Add a text label or color things based on a tone value?
  }

  bleep({ sound: { square } }) {
    if (!this.needsBleep) return;
    this.needsBleep = false;

    square({
      tone: this.tone,
      beats: 30,
      decay: 0.99,
    });
  }
}

const bleepers = [];

// 🥾 Boot (Runs once before first paint and sim)
function boot($) {
  console.log($);

  const marg = 10;

  // TODO: Generate all bleeper geometry, to fit into a grid that matches the
  //       requested grid size and maps to the screen.

  bleepers.push(
    new Bleeper(
      $, [marg, marg, $.screen.width - marg * 2, $.screen.height - marg * 2]
    ),
  );

}

// 🧮 Sim(ulate) (Runs once per logic frame (120fps locked)).
function sim($api) {}

// 🎨 Paint (Executes every display frame)
function paint($) {
  $.wipe(0); // Draw a black background
  bleepers.forEach((bleeper) => bleeper.paint($)); // Draw every bleeper.
  return false; // Draw only once until `needsPaint` is called..
}

// ✒ Act (Runs once per user interaction)
function act({ event, needsPaint }) {
  bleepers.forEach((bleeper) => {
    bleeper.button.act(event, {
      push: () => {
        needsPaint();
      },
      down: () => {
        bleeper.needsBleep = true;
        needsPaint();
      },
      cancel: () => {
        needsPaint();
      },
    });
  });
}

// 💗 Beat (Runs once per bpm, starting when the audio engine is activated.)
function beat($api) {
  if ($api.sound.time === 0) $api.sound.bpm(3600); // Set bpm to 3600 ~ 60fps

  bleepers.forEach((bleeper) => bleeper.bleep($api));
}

// 📚 Library (Useful classes & functions used throughout the piece)
// ...

export { boot, sim, paint, act, beat };
