// 💅 Line, 2022.01.24.02.41
// A 1px line drawing algorithm.

// TODO: *Hide yellow dot.*

// TODO: Optimize for higher resolution.
//       - Fix disk swapping and reloading bugs, etc.

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
let db1;
let lastPen;
let boxCopy;

// 🥾 Boot (Runs once before first paint and sim)
function boot({ wipe, paste, cursor, painting: p, screen, resize, fps, geo }) {
  // fps(30);
  //resize(96, 96);
  //resize(32, 32);
  //resize(512, 768);
  resize(2048, 2048);
  cursor("none");
  // Make & display the canvas.
  painting = p(screen.width, screen.height, (gfx) => gfx.wipe(100, 100, 100));
  wipe(100, 100, 100);
  //paste(painting);
  db1 = new geo.DirtyBox();
}

// 🎨 Paint (Runs once per display refresh rate)
function paint({ pen, ink, wipe, line, page, screen, paste, num, geo }) {
  // A. Replace any content painted last frame with the contents of `painting`.
  let continuedBoxCopy;
  if (boxCopy) {
    paste({ painting, crop: geo.Box.copy(boxCopy) }, boxCopy.x, boxCopy.y);
    continuedBoxCopy = geo.Box.copy(boxCopy);
    boxCopy = undefined;
  } else {
    paste(painting);
  }

  // B. Paint anything that needs to be permanent.
  if (pointsToPaint.length) {
    page(painting);
    pointsToPaint.forEach((p) => {
      ink(50, 50, 50, 100).plot(p.x, p.y);
      db1.soil(p);
    });
    pointsToPaint.length = 0;

    // Paste what was painted, cropped to the box.
    page(screen).paste(
      { painting, crop: geo.Box.copy(db1.box) },
      db1.box.x,
      db1.box.y
    );
  }

  // C. Paint any preview pixels that are still being calculated if we are
  //    currently drawing.
  if (pointsToHighlight.length) {
    pointsToHighlight.forEach((p) => {
      ink(100, 0, 0).plot(p.x, p.y);
      db1.soil(p);
    });
    ink(200, 0, 0).plot(pen); // 🔴 Painting cursor.
    db1.soil(pen);
  } else {
    // Or just paste the existing painting and paint a navigation cursor.
    if (!lastPen) lastPen = pen;
    if (lastPen.x !== pen.x || lastPen.y !== pen.y) {
      if (usingMouse) ink(255, 255, 0, 100).plot(pen); // 🟡 Navigation cursor.
      db1.soil(pen);
      lastPen = { x: pen.x, y: pen.y }; // TODO: pen should be copied on each api request.
    }
  }

  if (db1.soiled) {
    boxCopy = geo.Box.copy(db1.box);
    const db = db1;
    if (continuedBoxCopy) {
      db.soil(continuedBoxCopy);
      db.soil({ x: continuedBoxCopy.right, y: continuedBoxCopy.bottom });
    }
    db1 = new geo.DirtyBox();
    return db;
  }

  return false;
}

// ✒ Act (Runs once per user interaction)
function act({
  event: e,
  num: { dist },
  abstract: { bresenham },
  geo,
  needsPaint,
}) {
  if (e.penChanged && (e.is("touch") || e.is("draw") || e.is("move")))
    needsPaint();

  if (e.is("touch")) {
    const p = point(e);
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
    if (points.length && tapped === false)
      pointsToPaint.push(points[points.length - 1]); // Paint last point.
    points.length = 0;
    pointsToHighlight.length = 0;
    priorPointsIndex = 0;
    lastPoint = null;
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
