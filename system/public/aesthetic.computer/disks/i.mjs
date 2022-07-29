// i, 22.07.29.16.42
// An environment / game where the player character looks like an i

// TODO: Resarch
// [] Add 2d physics engine.
// [] Look at old `flower eater` / `mood` engine C source and videos.
// [] Add a portal / doorway to another piece / room for this piece.

const { sign, min } = Math;

const i = new I();

// 🥾 Boot (Runs once before first paint and sim)
function boot({ density }) {
  density(8); // TODO: Should density be replaced with zoom or accept fractions?
  // TODO: Runs only once!
  // resize(50, 20);
}

// 🎨 Paint (Executes every display frame)
function paint({ wipe, ink, pan, unpan, line, point }) {
  wipe(32); // Draw a gray background.

  // Draw the i character.
  ink(200);
  pan(i.pos.x, i.pos.y);
  point(0, -2);
  line(0, 0, 0, i.len);
  unpan();

  return false; // Only once.
}

// 🧮 Sim(ulate) (Runs once per logic frame (120fps locked)).
function sim({ needsPaint }) {
  if (i.dir.x !== 0) {
    i.pos.x += sign(i.dir.x) * i.vel.x;
    i.vel.x = min(i.vel.x * 1.1, 0.4); 
  }

  // TODO: Replace with vec2 mag function?
  if (i.dir.x !== 0 || i.dir.y !== 0) needsPaint();
}

// ✒ Act (Runs once per user interaction)
function act({ event: e }) {
  if (e.is("keyboard:down") && !e.repeat) {
    switch (e.key) {
      case "ArrowRight":
        i.dir.x = 1;
        i.vel.x = 0.1;
        break;
      case "ArrowLeft":
        i.dir.x = -1;
        i.vel.x = 0.1;
        break;
      case "ArrowUp":
        break;
      case "ArrowDown":
        break;
    }
  }

  if (e.is("keyboard:up")) {
    switch (e.key) {
      case "ArrowRight":
        i.dir.x = 0;
        i.vel.x = 0;
        break;
      case "ArrowLeft":
        i.dir.x = 0;
        i.vel.x = 0;
        break;
      case "ArrowUp":
        break;
      case "ArrowDown":
        break;
    }
  }
}

// 💗 Beat (Runs once per bpm, starting when the audio engine is activated.)
function beat($api) {
  // TODO: Play a sound here!
}

// 📚 Library (Useful classes & functions used throughout the piece)

class I {
  pos = { x: 15, y: 10 };
  dir = { x: 0, y: 0 };
  vel = { x: 0, y: 0 };
  len = 3;
  constructor() {}
}

export { boot, sim, paint, act, beat };