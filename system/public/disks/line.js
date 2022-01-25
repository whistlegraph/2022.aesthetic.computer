// 💅 Line, 2022.01.24.02.41
// A 1px line drawing algorithm.

// TODO: Better colors. Abstract everything so it can be used
//       in multiple instances. (See: `Painters` in `nail`)

const { values } = Object;

let painting; // A bitmap to draw on.
let dot = false; // Show preview dot while moving cursor.
let points = []; // This stored every point in a mark.
let pointsToPaint = [];
let lastPoint, lastBres; // TODO: Are both of these necessary?

// 🥾 Boot (Runs once before first paint and sim)
function boot({ paste, cursor, painting: p, screen, resize }) {
  // resize(96, 96);
  cursor("none");

  // Make & display the canvas.
  painting = p(screen.width, screen.height, (gfx) => gfx.wipe(100, 100, 100));
  paste(painting);
}

// 🎨 Paint (Runs once per display refresh rate)
function paint({ pen, ink, wipe, line, page, screen, paste, num }) {
  // TODO: Add ability to change paint fps in here.
  paste(painting); // TODO: This could be optimized with a dirty rectangle.

  // A. Paint anything that needs to be permanent.
  if (pointsToPaint.length) {
    page(painting);
    pointsToPaint.forEach((p) => ink(50, 50, 50, 255).plot(p.x, p.y)); // TODO: Eventually add effects here.
    pointsToPaint.length = 0;
    page(screen).paste(painting);
  }

  // B. Paint any preview pixels that are still being calculated.
  if (points.length) {
    const filteredPoints = pixelPerfect(points);
    filteredPoints.forEach((p, i) => {
      ink(25, 255).plot(p.x, p.y); // Plot the filtered points.
      // Mark all but first and last to be painted.
      if (i > 0 && i < filteredPoints.length - 1) pointsToPaint.push(p);
    });

    // TODO: Dump these into a recording... or, how do I record points for playback?
    const tail = 2; // TODO: I could use other tail lengths to add effects.
    points = filteredPoints.slice(-tail);

    ink(0, 255).plot(pen); // 🔴 Painting cursor.
  } else {
    paste(painting);
    ink(255, 255, 0, 100).plot(pen); // 🟡 Navigation cursor.
    dot = false;
  }

  // TODO: This could be optimized to return false sometimes.
}

// ✒ Act (Runs once per user interaction)
function act({ event: e, num: { dist }, abstract: { bresenham } }) {
  if (e.is("move")) dot = true;

  if (e.is("draw") || e.is("touch")) {
    // Extract the necessary fields from the event object.
    const point = (({ x, y, pressure }) => ({ x, y, pressure }))(e);

    if (!lastPoint) {
      //points.push(point);
      lastPoint = point;
    } else if (dist(point.x, point.y, lastPoint.x, lastPoint.y) >= 0) {
      // Make sure the points are not equal.
      if (lastPoint.x !== point.x || lastPoint.y !== point.y) {
        // Add bresen points.
        bresenham(lastPoint.x, lastPoint.y, point.x, point.y).forEach((np) => {
          if (np.x !== lastBres?.x || np.y !== lastBres?.y) points.push(np);
          lastBres = np;
        });
        lastPoint = point;
      }
    }
  }

  if (e.is("lift")) {
    lastPoint = null;
    lastBres = null;
    pointsToPaint.push(pixelPerfect(points));
    points.length = 0;
  }
}

// 💗 Beat (Runs once per bpm)
// function beat($api) { // TODO: Play a sound here! }

// 🧮 Simulate (Runs once per logic frame (120fps)).
// function sim($api) { // TODO: Move a ball here! }

// 📚 Library (Useful functions used throughout the program)

/**
 *  Takes an array of pixel coordinates {x, y} and filters out L shapes.
 *
 *  Note: It checks the previous, current, and next pixel and requires a minimum
 *        set of 3 before it removes anything.
 *
 *  Transcribed from: https://rickyhan.com/jekyll/update/2018/11/22/pixel-art-algorithm-pixel-perfect.html
 */
function pixelPerfect(pixels) {
  if (pixels.length === 1 || pixels.length === 0) {
    return pixels; // Return the inputs if the length is 0 or 1.
  }

  let filtered = [];
  let c = 0;

  while (c < pixels.length) {
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
