// 💅 Line, 2022.01.24.02.41
// A 1px line drawing algorithm.

// TODO: Make clicking (plotting a single point) work.

// TODO: Better colors. Abstract everything so it can be used
//       in multiple instances. (See: `Painters` in `nail`)

const { values } = Object;

let painting; // A bitmap to draw on.
let dot = false; // Show preview dot while moving cursor.
let points = []; // This stored every point in a mark.
let allPoints = [];
let pointsToPaint = [];
let pointsToPreview = [];
let lastPoint, lastBres; // TODO: Are both of these necessary?

// 🥾 Boot (Runs once before first paint and sim)
function boot({ paste, cursor, painting: p, screen, resize }) {
  //resize(96, 96);
  cursor("none");
  // Make & display the canvas.
  painting = p(screen.width, screen.height, (gfx) => gfx.wipe(0, 0, 0));
  paste(painting);
}

// 🎨 Paint (Runs once per display refresh rate)
function paint({ pen, ink, wipe, line, page, screen, paste, num }) {
  // TODO: Add ability to change paint fps in here.

  // TODO: Separate this point logic out of paint, so that it does not loop
  //       indefinitely... because it's not re-entrant.

  // A. Paint anything that needs to be permanent.
  // TODO: Fix alpha blending here.
  if (pointsToPaint.length) {
    page(painting);
    pointsToPaint.forEach((p) =>
      ink(
        num.randIntRange(100, 200),
        num.randIntRange(100, 200),
        num.randIntRange(100, 200),
        90
      ).plot(p.x, p.y)
    );
    pointsToPaint.length = 0;
    page(screen).paste(painting);
  } else {
    paste(painting);
  }

  // B. Paint any preview pixels that are still being calculated if we are
  //    currently drawing.
  if (pointsToPreview.length) {
    //pointsToPreview.forEach((p) => ink(100, 0, 0).plot(p.x, p.y));
    ink(200, 0, 0).plot(pen); // 🔴 Painting cursor.
  } else {
    // Or just paste the existing painting and paint a navigation cursor.
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
    const p = point(e);
    const minDist = 0;

    const startLen = points.length;

    if (!lastPoint) {
      points.push(p);
      lastPoint = p;
    } else if (dist(p.x, p.y, lastPoint.x, lastPoint.y) >= minDist) {
      // Make sure the points are not equal.
      if (lastPoint.x !== p.x || lastPoint.y !== p.y) {
        // Add bresen points.
        bresenham(lastPoint.x, lastPoint.y, p.x, p.y).forEach((np) => {
          if (np.x !== lastBres?.x || np.y !== lastBres?.y) points.push(np);
          lastBres = np;
        });
        lastPoint = p;
      }
    }

    if (points.length > startLen) {
      // Filter points for preview.
      const filteredPoints = pixelPerfect(points);
      filteredPoints.forEach((p, i) => {
        pointsToPreview.push(p); // Preview the filtered points.
        if (i > 0 && i < filteredPoints.length - 1) {
          allPoints.push(p); // Record points for playback.
          pointsToPaint.push(p);
        }
      });
      const tail = 2; // TODO: I could use other tail lengths to add effects.
      points = filteredPoints.slice(-tail);
      pointsToPreview = pointsToPreview.slice(-tail);
    }
  }

  if (e.is("lift")) {
    const filteredPoints = pixelPerfect(points);
    //allPoints.push(...filteredPoints); // Record points for playback.
    pointsToPaint.push(...filteredPoints);

    points.length = 0;
    pointsToPreview.length = 0;

    console.log("Points in painting: ", allPoints.length, allPoints);

    // TODO: Are both of these fields necessary?
    lastPoint = null;
    lastBres = null;
  }
}

// 💗 Beat (Runs once per bpm)
// function beat($api) {}

// 🧮 Simulate (Runs once per logic frame (120fps)).
// function sim($api) {}

// 📚 Library (Useful functions used throughout the program)

/**
 * Extract the necessary fields from the event object to produce a point sample.
 * @param e
 * @returns {{x, y, pressure}}
 */
function point(e) {
  return (({ x, y, pressure }) => ({ x, y, pressure }))(e);
}

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
