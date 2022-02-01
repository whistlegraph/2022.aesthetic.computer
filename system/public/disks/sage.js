// Sage, 2022.01.31.19.14
// A basic demo.
// TODO: Add `get, pix, pull, sample` (getPixel) to graph.js.

const { pow, floor, sin, cos, random, round } = Math;
const { assign } = Object;
const points = [];
const location = { x: 0, y: 0 };
let theta = 0;

// 🥾 Boot (Runs once before first paint and sim)
function boot({ resize, fps, wipe, screen, cursor }) {
  location.x = screen.width / 2;
  location.y = screen.height / 2;
  fps(1000);
  //resize(64, 64);
  cursor("none");
  //wipe(255, 0, 0).ink(255).line(0, 0, screen.width, screen.height);
  wipe(0, 0, 0);
}

// 🧮 Sim(ulate) (Runs once per logic frame (120fps locked)).
function sim($api) {
  //console.log($api);
}

// 🎨 Paint (Runs once per display refresh rate)
function paint({ ink, line, plot, num, paintCount, screen }) {
  function clampToScreen({ x, y }) {
    x = (x / screen.width - floor(x / screen.width)) * screen.width;
    y = (y / screen.height - floor(y / screen.height)) * screen.height;
    return { x, y };
  }

  function getIndex({ x, y }) {
    return (screen.width * floor(location.y) + floor(location.x)) * 4;
  }

  const selfColor = screen.pixels[getIndex(location)] / 29 + 1;

  const lastLocation = { x: location.x, y: location.y };
  assign(lastLocation, location);

  theta += random() - 0.5;

  location.x += cos(theta) * selfColor;
  location.y += sin(theta) * selfColor;

  const clamped = clampToScreen(location);
  location.x = clamped.x;
  location.y = clamped.y;

  ink(25 + sin(0.01 * paintCount) * 128 + 128);

  let threshold = 29;
  if (
    pow(lastLocation.x - location.x, 2) + pow(lastLocation.y - location.y, 2) <
    threshold
  )
    line(lastLocation.x, lastLocation.y, location.x, location.y);
  //}
}

// ✒ Act (Runs once per user interaction)
function act({ event: e }) {
  //if (e.is("draw")) points.push(e);
}

export { boot, sim, paint, act };

/*
// 💗 Beat (Runs once per bpm)
function beat($api) {
  // TODO: Play a sound here!
}
 */

// 📚 Library (Useful classes & functions used throughout the piece)
// ...

// export { boot, sim, paint, act, beat };
