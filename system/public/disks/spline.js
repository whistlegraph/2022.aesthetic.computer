// 🪝 Spline, 2022.01.24.02.41
// An, interactive line algorithm with curves.

import * as vec2 from "../computer/dep/gl-matrix/vec2.js"; // Dependencies of `Mark`
import { lerp } from "../computer/lib/num.js";

const { values } = Object;
const { floor, pow, min, max } = Math;

let mark,
  freq = 10,
  scale;

// 🥾 Boot (Runs once before first paint and sim)
function boot({ cursor }) {
  cursor("tiny");
}

// 🎨 Paint (Executes ever display frame)
function paint({ wipe, ink, point, pan, unpan, help, screen }) {
  wipe(10, 10, 10); // Paint a backdrop.

  // Generate a little periodic data sample.
  const points = [];
  scale = { x: screen.width, y: screen.height / 8 };

  help.repeat(freq, (i) => {
    points.push({
      x: (i / freq) * scale.x,
      y: (i % 2 === 0 ? 1 : -1) * scale.y,
    });
  });

  mark = new Mark(); // Make a mark and add some test points.
  mark.input(points);

  pan(0, screen.height / 2);
  ink(255, 0, 255, 50).poly(mark.spline); // Draw all curve points.

  ink(255, 0, 0, 100);
  points.forEach((p) => point(p)); // Draw every sample point.
  unpan();

  return false; // Freeze until `needsPaint()` is called elsewhere.
}

// ✒ Act (Runs once per user interaction)
function act({ event: e, needsPaint }) {
  if (e.is("move")) {
    freq = min(max(1, freq + e.delta.x / 4), 100);
    needsPaint();
  }
}

// 📚 Library (Useful functions used throughout the program)

// Processes a single, freehand gestural mark from start to end with hooks
// for rendering
class Mark {
  #rawInputPoints = []; // Data coming from hardware. {x, y, pressure}
  #segmentLength;
  #segmentProgress = 0;
  #segments = [];

  constructor(segmentLength = 8) {
    this.#segmentLength = segmentLength;
  }

  // Add fresh points from a hardware device or automata.
  input(raw) {
    this.#rawInputPoints.push(...raw);
    this.#processRawInputIntoSegments();
  }

  #processRawInputIntoSegments() {
    // TODO: Quantize the raw data so the segments have a regulated distance.
    this.#segments = this.#rawInputPoints.slice();

    this.#rawInputPoints.length = 0;
  }

  // Calculates the spline from all input points, consumes them, and returns
  // an even sampling of coordinates.
  get spline() {
    const coords = [];
    this.#segments.forEach((coord, i) => {
      const segs = this.#segments;
      if (i >= segs.length - 2 || i === 0) return; // Skip last 2 and first seg.

      const firstp0 = segs[i];

      let p0 = i > 0 ? segs[i - 1] : firstp0;
      let p1 = segs[i];
      let p2 = segs[i + 1];
      let p3 = i + 2 >= segs.length ? segs[i + 1] : segs[i + 2];

      // Convert to arrays.
      p0 = [p0.x, p0.y];
      p1 = [p1.x, p1.y];
      p2 = [p2.x, p2.y];
      p3 = [p3.x, p3.y];

      coords.push({ x: floor(p1[0]), y: floor(p1[1]) }); // 1st point

      for (let t = 0; t < this.#segmentLength; t += 1) {
        const cR = Mark.#catmullRom(p0, p1, p2, p3, t / this.#segmentLength);
        coords.push({ x: floor(cR.x), y: floor(cR.y) }); // inner points
      }

      coords.push({ x: floor(p2[0]), y: floor(p2[1]) }); // last point
    });

    this.#segments.length = 0;
    return coords;
  }

  // Parametric representation of the curve from `p1` to `p2` with `p0` and `p3`
  // as control points, where `t` is the interpolation parameter. Returns {x, y}
  // See also: https://en.wikipedia.org/wiki/Centripetal_Catmull%E2%80%93Rom_spline
  static #catmullRom(p0, p1, p2, p3, t) {
    const alpha = 0.5;
    const t0 = 0;
    const t1 = Mark.#cRgetT(t0, alpha, p0, p1);
    const t2 = Mark.#cRgetT(t1, alpha, p1, p2);
    const t3 = Mark.#cRgetT(t2, alpha, p2, p3);
    t = lerp(t1, t2, t);

    function addScale(s1, v1, s2, v2) {
      return vec2.add([], vec2.scale([], v1, s1), vec2.scale([], v2, s2));
    }

    const a1 = addScale((t1 - t) / (t1 - t0), p0, (t - t0) / (t1 - t0), p1);
    const a2 = addScale((t2 - t) / (t2 - t1), p1, (t - t1) / (t2 - t1), p2);
    const a3 = addScale((t3 - t) / (t3 - t2), p2, (t - t2) / (t3 - t2), p3);
    const b1 = addScale((t2 - t) / (t2 - t0), a1, (t - t0) / (t2 - t0), a2);
    const b2 = addScale((t3 - t) / (t3 - t1), a2, (t - t1) / (t3 - t1), a3);
    const c0 = addScale((t2 - t) / (t2 - t1), b1, (t - t1) / (t2 - t1), b2);

    return { x: c0[0], y: c0[1] };
  }

  static #cRgetT(t, alpha, p0, p1) {
    const d = vec2.sub([], p1, p0);
    const a = vec2.dot(d, d);
    const b = pow(a, alpha * 0.5);
    return b + t;
  }
}

export { boot, paint, act };

// ♻️ Recycle Bin

/**
 * Extract the necessary fields from the event object to produce a point sample.
 * @param e
 * @returns {{x, y, pressure}}
 */
// function point(e) {
//  return (({ x, y, pressure }) => ({ x, y, pressure }))(e);
//}

// 💗 Beat (Runs once per bpm)
// function beat($api) {}

// 🧮 Simulate (Runs once per logic frame (120fps)).
// function sim($api) {}
