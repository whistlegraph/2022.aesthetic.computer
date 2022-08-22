// i, 22.07.29.16.42
// An environment / game where the player character looks like an i

// TODO: Resarch
// [] Add 2d physics engine.
// [] Look at old `flower eater` / `mood` engine C source and videos.
// [] Add a portal / doorway to another piece / room for this piece.

const { sign, min } = Math;

class I {
  pos = { x: 15, y: 10 };
  dir = { x: 0, y: 0 };
  vel = { x: 0, y: 0 };
  len = 3;
  constructor() {}
}

const i = new I();

// 🥾 Boot (Runs once before first paint and sim)
function boot({ density, resize }) {
  resize(32, 32);
}

// 🎨 Paint (Executes every display frame)
function paint({ wipe, ink, pan, unpan, line, point }) {
  wipe(255, 100, 100); // Draw a gray background.

  // Draw the i character.
  ink(255, 0, 0);

  pan(i.pos.x, i.pos.y);
  point(0, -2);
  line(0, 0, 0, i.len);

  ink(255, 255, 0);
  unpan();

  pan(i.pos.x + 1, i.pos.y - 2);
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

  if (i.dir.y !== 0) {
    i.pos.y += sign(i.dir.y) * i.vel.y;
    i.vel.y = min(i.vel.y * 1.1, 0.4); 
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
        i.dir.y = -1;
        i.vel.y = 0.1;
        break;
      case "ArrowDown":
        i.dir.y = 1;
        i.vel.y = 0.1;
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
        i.dir.y = 0;
        i.vel.y = 0;
        break;
      case "ArrowDown":
        i.dir.y = 0;
        i.vel.y = 0;
        break;
    }
  }
}

// 💗 Beat (Runs once per bpm, starting when the audio engine is activated.)
function beat($api) {
  // TODO: Play a sound here!
}

// 📚 Library (Useful functions used throughout the piece)

export { boot, sim, paint, act, beat };