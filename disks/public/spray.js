// Spray, 22.12.31
// A stylus based painting tool for flower pictures.

let painting; // A bitmap to draw on.
const sprays = []; // Points to draw.
let dot = false; // Show preview dot while moving cursor.

let server; // Networking
const servers = {
  me: "localhost:8082",
  julias: "192.168.1.120:8082",
  lucias: "192.168.1.245:8082",
};

// 🥾 Boot (Runs once before first paint and sim)
function boot({ paste, cursor, painting: p, screen, net: { socket } }) {
  cursor("none");
  // Make & display the canvas.
  painting = p(screen.width, screen.height, (gfx) => gfx.wipe(40, 50, 20));
  paste(painting);

  // Connect to the server.
  server = socket(servers.me, (type, content) => {
    if (type === "point") sprays.push(content);
  });
}

// 🎨 Paint (Runs once per display refresh rate)
function paint({
  pen,
  ink,
  setPixels: page,
  screen,
  paste,
  num: { randIntRange: rnd, dist },
  help: { repeat: rep },
}) {
  paste(painting);
  if (sprays.length > 0) {
    // Spray on the painting within a circle.
    page(painting);

    sprays.forEach((s) => {
      const radius = 4;
      const sq = [-radius, radius];
      const cx = s.x;
      const cy = s.y;

      function randomInCircle() {
        const nx = cx + rnd(...sq);
        const ny = cy + rnd(...sq);

        if (dist(cx, cy, nx, ny) < radius) {
          return { x: nx, y: ny };
        } else {
          return randomInCircle();
        }
      }

      let alpha = 255 * s.pressure * s.pressure;

      rep(8 + 32 * s.pressure, (i) => {
        const point = randomInCircle();
        ink(
          60 + rnd(-40, 80), // R
          255 - rnd(0, 100), // G
          80 + rnd(-40, 80), // B
          alpha + rnd(-20, 20) // A
        ).plot(point.x, point.y);
      });
    });
    sprays.length = 0;
    page(screen);
    paste(painting);
    ink(255, 0, 0).plot(pen.x, pen.y); // Draw cursor.
  } else if (dot) {
    ink(255, 255, 0).plot(pen.x, pen.y); // Hover cursor.
    dot = false;
  }
}

// ✒ Act (Runs once per user interaction)
function act({ event, plot }) {
  if (event.is("move")) dot = true;
  if (event.is("draw") || event.is("touch")) {
    sprays.push(event);
    server.send("point", { x: event.x, y: event.y, pressure: event.pressure });
  }
}

// 💗 Beat (Runs once per bpm)
// function beat($api) { // TODO: Play a sound here! }

// 🧮 Simulate (Runs once per logic frame (120fps)).
// function sim($api) { // TODO: Move a ball here! }

// 📚 Library (Useful functions used throughout the program)

export { boot, paint, act };
