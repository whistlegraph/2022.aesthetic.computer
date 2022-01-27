// 💅 Line, 2022.01.24.02.41
// A 1px line drawing algorithm.

// TODO: Optimize for higher resolution.

// TODO: VCR would catch the action layer.

// TODO: Fix Safari magnifying glass finger hold bug... again?

// TODO: Better colors. Abstract everything so it can be used
//       in multiple instances. (See: `Painters` in `nail`)

// TODO: Fix skippy scale rendering of pixels on non-retina displays.

const { values } = Object;

let painting; // A bitmap to draw on.
let points = []; // This stored every point in a mark.
let allPoints = [];
let pointsToPaint = [];
let pointsToHighlight = [];
let usingMouse = true;
let lastPoint;
let priorPointsIndex = 0;
let tapped;
const tail = 2; // A red visual tail that follows the 1px line.
let db;

// 🥾 Boot (Runs once before first paint and sim)
function boot({ wipe, paste, cursor, painting: p, screen, resize, fps }) {
  // fps(30);
  //resize(96, 96);
  //resize(2048, 2048);
  cursor("none");
  // Make & display the canvas.
  painting = p(screen.width, screen.height, (gfx) => gfx.wipe(100, 100, 100));
  wipe(100, 100, 100);
  //paste(painting);
}

let lastPen;

// 🎨 Paint (Runs once per display refresh rate)
function paint({ pen, ink, wipe, line, page, screen, paste, num, geo }) {
  // A. Paint anything that needs to be permanent.
  // TODO: Fix alpha blending here.
  if (pointsToPaint.length) {
    page(painting);

    db = new geo.DirtyBox();

    // TODO: What is the actual process here?

    pointsToPaint.forEach((p) => {
      ink(50, 50, 50, 100).plot(p.x, p.y);
      db.soil(p);
    });

    // TODO: Why would width be 0 of dirtyBox?

    pointsToPaint.length = 0;
    page(screen).paste({ painting, crop: db.box }, db.box.x, db.box.y);
    //page(screen).paste(painting);
  } else {
    //paste(painting);
  }

  // B. Paint any preview pixels that are still being calculated if we are
  //    currently drawing.
  if (pointsToHighlight.length) {
    //pointsToHighlight.forEach((p) => ink(100, 0, 0).plot(p.x, p.y));
    //ink(200, 0, 0).plot(pen); // 🔴 Painting cursor.
  } else {
    // Or just paste the existing painting and paint a navigation cursor.

    if (!lastPen) {
      lastPen = pen;
    }

    if (lastPen.x !== pen.x || lastPen.y !== pen.y) {
      let cursorDirty = new geo.DirtyBox();
      cursorDirty.soil(lastPen);
      paste({ painting, crop: cursorDirty.box }, lastPen.x, lastPen.y);
      lastPen = { x: pen.x, y: pen.y }; // TODO: pen should be copied on each api request?
      if (usingMouse) ink(255, 255, 0, 100).plot(pen); // 🟡 Navigation cursor.
    }
  }

  if (db) {
    //paste(painting);
    //ink(255, 0, 255, 32).box(db.box.x, db.box.y, db.box.w, db.box.h); // Preview the dirty rectangle.
  }

  return false;

  // TODO: This could be optimized to return false sometimes.
}

// ✒ Act (Runs once per user interaction)
function act({
  event: e,
  num: { dist },
  abstract: { bresenham },
  geo,
  needsPaint,
}) {
  if (e.is("touch") || e.is("draw") || e.is("move")) needsPaint();

  if (e.is("touch")) {
    const p = point(e);
    db = new geo.DirtyBox();
    allPoints.push(p); // Record points for playback.
    pointsToPaint.push(p);
    lastPoint = p;
    tapped = true;
  }

  if (e.is("draw")) {
    tapped = false;
    const p = point(e);
    const minDist = 0;

    if (dist(p.x, p.y, lastPoint.x, lastPoint.y) >= minDist) {
      // Make sure the points are not equal.
      if (lastPoint.x !== p.x || lastPoint.y !== p.y) {
        // console.log("☑️Points:", points.slice());

        // Add bresen points, filtering out repeats.
        bresenham(lastPoint.x, lastPoint.y, p.x, p.y).forEach((np, i) => {
          if (i > 0 || points.length < 2) points.push(np);
        });
        // console.log("☑️Bresen:", points.slice());

        lastPoint = p;
        // Filter out "L" shapes from interpolated points.
        const filteredPoints = pixelPerfect(points);
        // console.log("☑️Filtered:", filteredPoints.slice());

        filteredPoints.forEach((p, i) => {
          if (i >= priorPointsIndex && i < filteredPoints.length - 1) {
            pointsToHighlight.push(p); // Preview the filtered points.
            // Then immediately paint and record them.
            if (i > 0) pointsToPaint.push(p); // Queue points for painting.
            allPoints.push(p); // Record points for playback.
          }
        });

        points = filteredPoints.slice(-2); // Consume all but up to two points to leave for `pixelPerfect`.
        priorPointsIndex = 1; // Remember how many we have left over so we skip them on the next pass.
        pointsToHighlight = pointsToHighlight.slice(-tail); // Trim highlight points if we go over the tail.
      }
    }
  }

  if (e.is("lift")) {
    if (tapped === false) pointsToPaint.push(points[points.length - 1]); // Paint last point.
    points.length = 0;
    pointsToHighlight.length = 0;
    priorPointsIndex = 0;
    lastPoint = null;
    db = new geo.DirtyBox();
    usingMouse = e.device === "mouse";
    console.log("➕ Pixels:", allPoints.length);
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
