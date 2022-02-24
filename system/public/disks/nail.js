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
let dot = false; // Show preview dot while moving cursor.

// 🥾 Boot (Runs once before first paint and sim)
function boot({ paste, cursor, painting: p, screen, net, resize }) {
  resize(screen.width / 2, screen.height / 2); // TODO: Get screen.nativeWidth.
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
  //paste(painting); // TODO: Optimize this with a dirty rectangle (See `line`).

  if (actions.length) {
    // Process actions and render to the painting.
    page(painting);

    actions.forEach((action) => {
      const painter = painters[action.id];
      painter[action.type](action.content); // Run the action and then paint it.
      painter.paint(action.type, { ink });
    });
    actions.length = 0;

    page(screen).paste(painting);
    for (const painter in painters) painters[painter].overlay({ ink });
    ink(0, 0, 255, 100).plot(pen); // 🔴 Draw cursor.
  } else {
    // Just show the current state.
    paste(painting);
    for (const painter in painters) painters[painter].overlay({ ink });
    ink(255, 255, 0, 100).plot(pen); // 🟡 Move (hover) cursor.
    dot = false;
  }
}

// ✒ Act (Runs once per user interaction)
function act({ event: e, num: { dist } }) {
  if (e.is("move")) dot = true;

  if (e.is("draw") || e.is("touch")) {
    // Extract the necessary fields from the event object.
    // TODO: I could reduce the data into an array here for faster parsing
    //       and a smaller footprint over the network. 22.1.5
    //       And also send it in batches / frames in order to avoid flooding
    //       the server. 2022.02.20.22.14
    const point = (({ x, y, pressure }) => ({ x, y, pressure }))(e);
    server.send("point", point);
  }

  if (e.is("lift")) {
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
  currentMark;
  #paintedMarkOnce = false;

  constructor(id) {
    this.id = id;
  }

  paint(action, { ink }) {
    if (!this.currentMark) return; // Nothing to paint if there is no mark.

    const lines = this.currentMark.line();

    lines.forEach((p, i) => {
      if (i < lines.length - 1) {
        ink(255, 0, 0, 50)
          // Skip the first point except for the first line.
          //.skip(this.#paintedMarkOnce ? p : null)
          .skip(p)
          .line(p, lines[i + 1])
          .skip(null);
        //this.#paintedMarkOnce = true;
      } else if (this.#paintedMarkOnce === false) {
        console.log("length of 1");
        this.#paintedMarkOnce = true;
        ink(255, 0, 0, 50).plot(p);
      }
    });

    // TODO: Why would this action behavior be here?
    if (action === "stop") {
      // TODO: Paint the rest of previewLine on release.

      this.currentMark.previewLine((pl) =>
        ink(255, 0, 0, 50)
          .skip(pl[0])
          .line(...pl)
          .skip(null)
      );

      this.currentMark = null;
      this.#paintedMarkOnce = false;
    }
  }

  overlay({ ink }) {
    if (!this.currentMark) return; // Nothing to overlay if there is no mark.

    this.currentMark.previewLine((pl) =>
      ink(0, 255, 0, 100)
        .skip(pl[0])
        .line(...pl)
        .skip(null)
    );
  }

  // Runs on every recorded point.
  point(p) {
    this.currentMark = this.currentMark || new Mark(8, 8);
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
