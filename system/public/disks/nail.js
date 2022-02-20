// 💅 Nail, 22.12.31
// A multiplayer drawing tool for thumbnailing.

// [] Incorporate 1px line algorithm after smoothing via catmull-rom.
// [] Allow recordings to be made via the action layer.
// [] Set the resolution to a 16x9 situation with a border.
// [] Figure out a storage method on the server
//    for reloading and keeping the board active.

let painting; // A bitmap to draw on.

let server;
const painters = {}; // Instances of Painter stored by client id.
const actions = []; // Actions that have been received by `server`. These get
//                     flushed after every `paint` frame.
//                     TODO: Record all actions in order to replay pictures.

const MIN_DIST = 0;
let lastPoint;
let dot = false; // Show preview dot while moving cursor.

// 🥾 Boot (Runs once before first paint and sim)
function boot({ paste, cursor, painting: p, screen, net, resize }) {
  // resize(96, 96);
  cursor("none");

  // Make & display the canvas.
  painting = p(screen.width, screen.height, (gfx) => gfx.wipe(100, 100, 100));
  paste(painting);

  // Connect to the server and route each message.
  server = net.socket((id, type, content) => {
    // Instantiate painters (clients) based on their `id` attribute.
    painters[id] = painters[id] || new Painter(id);
    // Record the action.
    actions.push({ id, type, content });
  });
}

// 🎨 Paint (Runs once per display refresh rate)
function paint({ pen, ink, abstract: { bresenham }, page, screen, paste }) {
  paste(painting); // TODO: Optimize this with a dirty rectangle (See `line`).

  // Process any actions that need rendering.
  if (actions.length) {
    page(painting);

    // Process actions in order of arrival.
    actions.forEach((action) => {
      const painter = painters[action.id];
      painter[action.type](action.content);

      // Render anything new that occurred as a result of this action.
      painter.paint(action.type, { ink });
    });
    actions.length = 0;

    // Render

    page(screen).paste(painting);
    ink(0, 0, 255, 100).plot(pen); // 🔴 Draw cursor.
  } else {
    ink(255, 255, 0, 100).plot(pen); // 🟡 Move (hover) cursor.
    dot = false;
  }
}

// ✒ Act (Runs once per user interaction)
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
    } else if (dist(point.x, point.y, lastPoint.x, lastPoint.y) > MIN_DIST) {
      // Make sure the points are not equal.
      server.send("point", point);
      lastPoint = point;
    }
  }

  if (e.is("lift")) {
    lastPoint = null;
    server.send("stop");
  }
}

// 📚 Library (Useful functions used throughout the program)

import { Mark } from "../computer/lib/gesture.js";

/**
 * Draws segments of brushes and keeps track of gesture state for each painter.
 */
class Painter {
  id;
  //lastPoint;
  //points = [];
  currentMark;

  constructor(id) {
    this.id = id;
  }

  paint(action, { ink }) {
    console.log("Painting: ", action, this.currentMark);

    // TODO: Mark needs to be able to eat up points.

    const lines = this.currentMark.line();

    lines.forEach((p, i) => {
      if (i < lines.length - 1) ink(255, 0, 0).line(p, lines[i + 1]);
    });

    //console.log("Coords len:", this.currentMark.spots());

    if (action === "stop") {
      this.currentMark = null;
    }
  }

  // Runs on every recorded point.
  point(p) {
    this.currentMark = this.currentMark || new Mark();
    this.currentMark.input(p);
  }

  stop() {
    // console.log("Stop", this.currentMark.points);
    // this.lastPoint = null;
    // Ingest
    //this.currentMark = null;
  }
}

export { boot, paint, act };
