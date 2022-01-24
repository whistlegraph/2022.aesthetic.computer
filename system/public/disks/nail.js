// 💅 Nail, 22.12.31
// A multiplayer drawing tool for thumbnailing.

// TODO: A class needs to be written that keeps a concept of a "Painter" and their marks so that remote commands can be routed properly.

// TODO: - Make a 1px line algorithm.
//       - Set the resolution to a 16x9 situation with a border.
//       - Figure out a storage method on the server
//         for reloading and keeping the board active.


let painting; // A bitmap to draw on.
const marks = []; // Points to draw.

const painters = {}; // Remote (server sent) marks sorted in arrival order by connection id. 
let lastRMarks = {}; // Maintain a tail of recent rMarks, sorted by connetion id.

let dot = false; // Show preview dot while moving cursor.

let server; // Networking
import { servers } from "./common/servers.js"; // Import server list.

// 🥾 Boot (Runs once before first paint and sim)
function boot({ paste, cursor, painting: p, screen, net: { socket }, debug }) {
  cursor("none");

  // Make & display the canvas.
  painting = p(screen.width, screen.height, (gfx) => gfx.wipe(100, 100, 100));
  paste(painting);

  // Connect to the server.
  server = socket(debug ? servers.local : servers.main, (id, type, content) => {
    // Organize messages into client pools based on their `id` attribute.
    painters[id] = painters[id] || new Painter(id);
    painters[id].actions.push({id, type, content });
  });
}

class Painter {
  id;
  gestures = []; // TODO: A set of arrays of gestures.
  actions = []; // TODO: Would timestamping ever be needed to better sort actions among painters?
  constructor(id) { this.id = id; }
}

// let lastMarks;

// 🎨 Paint (Runs once per display refresh rate)
function paint({ pen, ink, page, screen, paste, geo: { Circle }, num: { randIntRange: rnd }, help: { repeat: rep }, }) {
  paste(painting); // Paint the background.

  // Digest actions of each painter (all remote).
  for (const ptr of painters) {
    for (const a of ptr.actions) {
      if (a.type === "point") ptr.gestures.push(a);
      else if (a.type === "stop") ptr.gesture.length = 0;
    }
  }

  /*
  Object.values(painters).forEach((rmarks) => {
    if (rmarks.length > 0) {

      const len = rmarks.length;
      rmarks = pixelPerfect(rmarks);
      console.log(len, rmarks.length);

      page(painting);

      // Spray on the painting within a circle.
      rmarks.forEach(({ id, type, content: m }, i) => {
        // ✒️ Mark Rendering

        // If we are ending a mark.
        if (type === "stop") {
          delete lastRMarks[id];
          return;
        }

        if (lastRMarks[id]) { // Draw a line so long as a previous mark exists.
          ink(255, 0, 0, 100).line(lastRMarks[id].x, lastRMarks[id].y, m.x, m.y);
        }

        lastRMarks[id] = m;

        // ink(255, 255, 25).plot(m.x, m.y); // Add a small point.

        // Spray a little dot for each vertex.
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
      });

      rmarks.length = 0;

      page(screen);
      paste(painting);
      ink(0, 0, 255).plot(pen); // 🔴 Draw cursor.
    } else if (dot) {
      ink(255, 255, 0).plot(pen); // 🟡 Move (hover) cursor.
      dot = false;
    }
  });
  */
}

// ✒ Act (Runs once per user interaction)
function act({ event: e }) {
  if (e.is("move")) dot = true;

  // TODO: How to stream everyone's points?

  // TODO: I could reduce the data into an array here for faster parsing
  //       and a smaller footprint over the network. 22.1.5
  if (e.is("draw") || e.is("touch")) {
    // Extract the necessary fields from the event object.
    const point = (({ x, y, pressure }) => ({ x, y, pressure }))(e);
    // marks.push(point); // TODO: Bring back local cursor.
    server.send("point", point);
    //lastMark = point;
  }

  if (e.is("lift")) {
    server.send("stop");
    //lastMark = undefined;
  }
}

// 💗 Beat (Runs once per bpm)
// function beat($api) { // TODO: Play a sound here! }

// 🧮 Simulate (Runs once per logic frame (120fps)).
// function sim($api) { // TODO: Move a ball here! }

// 📚 Library (Useful functions used throughout the program)

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

  while(c < pixels.length) {
    if(c > 0 && c + 1 < pixels.length
      && (pixels[c - 1].x === pixels[c].x || pixels[c - 1].y === pixels[c].y) // check left and up
      && (pixels[c + 1].x === pixels[c].x || pixels[c + 1].y === pixels[c].y) // check right and down 
      && pixels[c - 1].x !== pixels[c + 1].x // check left and right of prev and next      
      && pixels[c - 1].y !== pixels[c + 1].y) // check top and bottom of prev and next      
    {
      c += 1;
    }
    filtered.push(pixels[c]);
    c+= 1;
  }
  return filtered;
}


export { boot, paint, act };
