// Bleep, 22.07.15.19.21
// A configurable interface of colored boxes that can be pushed to make tones.

// TODO
// - [] Restore previous BPM on unload.
// - [x] Generate all bleeper geometry, to fit into a grid that matches the
//       requested grid size and maps to the screen.

const { floor } = Math;

const minFreq = 100;
const maxFreq = 1000;

class Bleeper {
  button;
  needsBleep = false;
  tone;

  constructor({ ui: { Button }, screen, num: { randIntRange } }, geometry) {
    this.tone = randIntRange(minFreq, maxFreq);

    this.button = new Button(...geometry);
  }

  paint({ ink, num: { map } }) {
    const color = map(this.tone, minFreq, maxFreq, 0, 200);
    ink(this.button.down ? 25 + color : 55 + color).box(this.button.box);
    ink(0).box(this.button.box, "in"); // Outline

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

let grid, gridWidth, gridHeight;
const bleepers = [];

function defineGrid({ geo: { Grid }, screen, num }) {
  const gridRatio = gridHeight / gridWidth;
  const screenRatio = screen.height / screen.width;
  const margin = 8;

  // console.log("grid:", gridRatio, "screen:", screenRatio);

  let x, y, scale;

  function fitToHeight() {
    const height = screen.height - margin * 2;
    scale = floor(height / gridHeight);
    y = floor((screen.height - scale * gridHeight) / 2);
    x = floor(screen.width / 2 - (scale * gridWidth) / 2);
  }

  function fitToWidth() {
    const width = screen.width - margin * 2;
    scale = floor(width / gridWidth);
    y = floor(screen.height / 2 - (scale * gridHeight) / 2);
    x = floor((screen.width - scale * gridWidth) / 2);
  }

  if (gridRatio > 1) {
    // Tall
    if (gridRatio > screenRatio) {
      fitToHeight();
    } else {
      fitToWidth(); // 💁 Size the grid to be as tall as the screen.height.
    }
  } else if (gridRatio < 1) {
    // Wide
    fitToWidth(); // 💁 Size the grid to be as wide as the screen.width;
  } else {
    // Square
    screenRatio > 1 ? fitToWidth() : fitToHeight();
  }

  grid = new Grid(x, y, gridWidth, gridHeight, scale);
}

// 🥾 Boot (Runs once before first paint and sim)
function boot($) {
  const { params, num } = $;

  gridWidth = num.randIntRange(1, 6),
  gridHeight = num.randIntRange(1, 6);

  if (params.length === 1) {
    const split = params[0].split("x");
    gridWidth = parseInt(split[0]) || gridWidth;
    gridHeight = parseInt(split[1]) || gridHeight;
  }

  // TODO: This does not affect screen width and height right away...
  // $.density(2);
  defineGrid($);

  // Create bleepers and add them to grid boxes.
  for (let x = 0; x < grid.box.w; x += 1) {
    for (let y = 0; y < grid.box.h; y += 1) {
      bleepers.push(new Bleeper($, [...grid.get(x, y), grid.scale]));
    }
  }

}

// 🧮 Sim(ulate) (Runs once per logic frame (120fps locked)).
function sim($api) {}

// 🎨 Paint (Executes every display frame)
function paint($) {
  const { wipe, screen, ink } = $;
  wipe(0); // Draw a black background
  bleepers.forEach((bleeper) => bleeper.paint($)); // Draw every bleeper.
  // ink(255, 0, 0).grid(grid); // Paint grid overlay, for debugging purposes.
  return false; // Draw only once until `needsPaint` is called..
}

// ✒ Act (Runs once per user interaction)
function act($) {
  const { event, needsPaint } = $;

  if (event.is("reframed")) {
    defineGrid($);
    // TODO: Loop over bleepers here so they can remap properly.
  }

  bleepers.forEach((bleeper) => {
    bleeper.button.act(event, {
      push: () => needsPaint(),
      down: () => {
        bleeper.needsBleep = true;
        needsPaint();
      },
      cancel: () => needsPaint(),
    });
  });
}

let beatCount = 0n

// 💗 Beat (Runs once per bpm, starting when the audio engine is activated.)
function beat($api) {
  if (beatCount === 0n) $api.sound.bpm(3600); // Set bpm to 3600 ~ 60fps
  bleepers.forEach((bleeper) => bleeper.bleep($api));
  beatCount += 1n;
}

// 📚 Library (Useful classes & functions used throughout the piece)
// ...

export { boot, sim, paint, act, beat };
