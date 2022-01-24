// 💅 Line, 2022.01.24.02.41
// A 1px line drawing algorithm.

const { values } = Object;

let painting; // A bitmap to draw on.
let dot = false; // Show preview dot while moving cursor.
const points = [];

// 🥾 Boot (Runs once before first paint and sim)
function boot({ paste, cursor, painting: p, screen, resize }) {
  resize(96, 96);
  cursor("none");

  // Make & display the canvas.
  painting = p(screen.width, screen.height, (gfx) => gfx.wipe(100, 100, 100));
  paste(painting);
}

const bresenPoints = [];

// 🎨 Paint (Runs once per display refresh rate)
function paint({ pen, ink, line, page, screen, paste, num }) {
  paste(painting); // TODO: This could be optimized with a dirty rectangle.

  // console.log(points.length, pixelPerfect(points).length);

  if (points.length) {
    page(painting);

    // Add to painting here.
    console.log(points.length);

    // TODO: Sample original points at longer distances.
    // TODO: Paint bresenham line for every original point, and remove duplicates?
    // TODO: Filter bresenham points.

    const filteredPoints = pixelPerfect(points);
    filteredPoints.forEach((p, i) => {
      ink(0, 0, 0, 25).plot(p.x, p.y);
    });

    //points.length = 0; // TODO: This breaks it.

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

  if (e.is("draw") || e.is("touch")) {
    // Extract the necessary fields from the event object.
    const point = (({ x, y, pressure }) => ({ x, y, pressure }))(e);

    if (!lastPoint) {
      points.push(point);
      lastPoint = point;
    } else if (dist(point.x, point.y, lastPoint.x, lastPoint.y) >= 0.0) {
      // Make sure the points are not equal.
      if (lastPoint.x !== point.x || lastPoint.y !== point.y) {
        points.push(point);
        lastPoint = point;
      }
    }
  }

  if (e.is("lift")) {
    points.length = 0;
    bresenPoints.length = 0;
    lastPoint = null;
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

  while (c < pixels.length) {
    /*
    if (c > 0 && c + 1 < pixels.length) {
      //console.log(pixels[c - 1].x, pixels[c].x);
      console.log(
        pixels[c - 1].x === pixels[c].x || pixels[c - 1].y === pixels[c].y,
        pixels[c + 1].x === pixels[c].x || pixels[c + 1].y === pixels[c].y, // check right and down
        pixels[c - 1].x !== pixels[c + 1].x, // check left and right of prev and next
        pixels[c - 1].y !== pixels[c + 1].y
      );
    }
     */

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

/*
points.forEach((p, i) => {
  //ink(150, 150, 150, 25).plot(p.x, p.y);

  if (i < points.length - 1) {
    const np = points[i + 1];
    line(p.x, p.y, np.x, np.y, (x, y) => {
      if (i > 0) {
        const lp = points[i - 1];
        if (p.x !== lp.x || p.y !== lp.y) bresenPoints.push({ x, y });
      } else {
        bresenPoints.push({ x, y });
      }
    });
  } else {
    bresenPoints.push({ x: p.x, y: p.y });
  }
});
 */

// bresenPoints.forEach((p, i) => {
//  ink(150, 150, 150, 255).plot(p.x, p.y);

// TODO: If distance is greater than 1px to i+1, then draw a line to i+1.
/*
  if (i < points.length - 1) {
    const np = points[i + 1];
    if (num.dist(p.x, p.y, np.x, np.y) >= 2) {
      ink(0, 0, 255).line(p.x, p.y, np.x, np.y);
    }
  }
   */
// });
