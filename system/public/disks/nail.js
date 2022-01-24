// 💅 Nail, 22.12.31
// A multiplayer drawing tool for thumbnailing.

// TODO: - Make a 1px line algorithm.
//       - Set the resolution to a 16x9 situation with a border.
//       - Figure out a storage method on the server
//         for reloading and keeping the board active.

const { values } = Object;

let painting; // A bitmap to draw on.

let server;
const painters = {}; // Instances of Painter stored by client id.
const actions = []; // Actions that have been received by `server`. These get
//                     flushed after every `paint` frame.
//                     TODO: Record all actions in order to replay pictures.

let dot = false; // Show preview dot while moving cursor.

// 🥾 Boot (Runs once before first paint and sim)
function boot({ paste, cursor, painting: p, screen, net, resize }) {
  resize(96, 96);
  cursor("none");

  // Make & display the canvas.
  painting = p(screen.width, screen.height, (gfx) => gfx.wipe(100, 100, 100));
  paste(painting);

  // Connect to the server.
  server = net.socket((id, type, content) => {
    // Instantiate painters (clients) based on their `id` attribute.
    painters[id] = painters[id] || new Painter(id);
    // Record the action.
    actions.push({ id, type, content });
  });
}

// 🎨 Paint (Runs once per display refresh rate)
function paint({
  pen,
  ink,
  line,
  page,
  screen,
  paste,
  geo: { Circle },
  num: { randIntRange: rnd },
  help: { repeat: rep },
}) {
  paste(painting); // TODO: This could be optimized with a dirty rectangle.

  if (actions.length) {
    page(painting);

    // Paint actions in order of arrival.
    // TODO: Record all actions so they can be played back.
    actions.forEach((action) => {
      if (action.type === "point") {
        painters[action.id].point(action, ink, line);
      } else if (action.type === "stop") {
        painters[action.id].stop();
      }
    });
    actions.length = 0;

    page(screen).paste(painting);
    ink(0, 0, 255, 100).plot(pen); // 🔴 Draw cursor.
  } else {
    ink(255, 255, 0, 100).plot(pen); // 🟡 Move (hover) cursor.
    dot = false;
  }

  // TODO: This could be optimized to return false sometimes.
}

// ✒ Act (Runs once per user interaction)

let lastPoint;

function act({ event: e, num: { dist } }) {
  if (e.is("move")) dot = true;

  // TODO: I could reduce the data into an array here for faster parsing
  //       and a smaller footprint over the network. 22.1.5
  if (e.is("draw") || e.is("touch")) {
    // Extract the necessary fields from the event object.
    const point = (({ x, y, pressure }) => ({ x, y, pressure }))(e);

    if (!lastPoint) {
      server.send("point", point);
      lastPoint = point;
    } else if (dist(point.x, point.y, lastPoint.x, lastPoint.y) > 0.0) {
      // Make sure the points are not equal.
      // TODO: Stop sending duplicate event data for "draw" and "touch".
      if (lastPoint.x !== point.x || lastPoint.y !== point.y) {
        server.send("point", point);
        lastPoint = point;
      }
    }
  }

  if (e.is("lift")) {
    lastPoint = null;
    server.send("stop");
  }
}

// 💗 Beat (Runs once per bpm)
// function beat($api) { // TODO: Play a sound here! }

// 🧮 Simulate (Runs once per logic frame (120fps)).
// function sim($api) { // TODO: Move a ball here! }

// 📚 Library (Useful functions used throughout the program)

/**
 * Draws segments of brushes and keeps track of gesture state for each painter.
 */
class Painter {
  id;
  lastPoint;
  points = [];

  constructor(id) {
    this.id = id;
  }

  point({ content: m }, ink, line) {
    ink(255, 0, 0).plot(m.x, m.y);

    if (this.lastPoint) {
      line(this.lastPoint.x, this.lastPoint.y, m.x, m.y, (x, y) => {
        this.points.push({ x, y });
      });

      this.points.forEach((point) => ink(255, 0, 0, 50).plot(point.x, point.y));

      this.lastPoint = { x: m.x, y: m.y };
    } else {
      this.lastPoint = { x: m.x, y: m.y };
    }

    console.log(this.points.length, pixelPerfect(this.points).length);

    //console.log("Last Point: ", this.lastPoint);
    /*
    // Plot a line so long as a previous point exists.
    if (this.lastPoint) {
      // Generate all the points for this line segment and add them to the mark points.
      line(this.lastPoint.x, this.lastPoint.y, m.x, m.y, (x, y) => {
        this.points.push({ x, y });
      });

      this.points.forEach((point) => ink(255, 0, 0, 50).plot(point.x, point.y));

      // Set last point to last filtered point.
      //this.lastPoint = this.points[this.points.length - 1];
      this.lastPoint = { x: m.x, y: m.y };
      this.points.length = 0;
    } else {
      this.lastPoint = { x: m.x, y: m.y };
    }
    //ink(255, 0, 0).line(this.lastPoint.x, this.lastPoint.y, m.x, m.y);
     */
  }

  stop() {
    this.lastPoint = null;
    this.points.length = 0;
  }
}

/**
 *  Takes an array of pixel coordinates {x, y} and filters out L shapes.
 *  Transcribed from: https://rickyhan.com/jekyll/update/2018/11/22/pixel-art-algorithm-pixel-perfect.html
 */
function pixelPerfect(pixels) {
  if (pixels.length === 1 || pixels.length === 0) {
    return pixels; // Return the inputs if the length is 0 or 1.
  }

  let filtered = [];
  let c = 0;

  while (c < pixels.length) {
    if (c > 0 && c + 1 < pixels.length) {
      //console.log(pixels[c - 1].x, pixels[c].x);
      console.log(
        pixels[c - 1].x === pixels[c].x || pixels[c - 1].y === pixels[c].y,
        pixels[c + 1].x === pixels[c].x || pixels[c + 1].y === pixels[c].y, // check right and down
        pixels[c - 1].x !== pixels[c + 1].x, // check left and right of prev and next
        pixels[c - 1].y !== pixels[c + 1].y
      );
    }

    if (
      c > 0 &&
      c + 1 < pixels.length &&
      (pixels[c - 1].x === pixels[c].x || pixels[c - 1].y === pixels[c].y) && // check left and up
      (pixels[c + 1].x === pixels[c].x || pixels[c + 1].y === pixels[c].y) && // check right and down
      pixels[c - 1].x !== pixels[c + 1].x && // check left and right of prev and next
      pixels[c - 1].y !== pixels[c + 1].y
    ) {
      // check top and bottom of prev and next
      c += 1;
    }
    filtered.push(pixels[c]);
    c += 1;
  }
  return filtered;
}

export { boot, paint, act };

// ♻️ Recycling (Useful code that was created in this piece but is no longer being used.)

// Sprays a little dot for each vertex by randomly finding points in a Circle.
// const c = new Circle(m.x, m.y, 2);
// const alpha = 255 * m.pressure * m.pressure;
// rep(8 + 32 * m.pressure, () => {
//   const point = c.random();
//   ink(
//     30 + rnd(-30, 30),
//     30 + rnd(-30, 30),
//     30 + rnd(-30, 30),
//     alpha + rnd(-20, 20) // A
//   ).plot(point);
// });
