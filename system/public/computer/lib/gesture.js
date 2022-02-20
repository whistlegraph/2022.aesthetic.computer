// 🖌️ Gesture
// Classes and functions to support freehand drawing.

import { lerp } from "./num.js";
import * as vec2 from "../dep/gl-matrix/vec2.js";
const { floor, pow } = Math;

// Takes and keeps a set of input points and yields a processed spline as
// a single mark gets continuously drawn.
export class Mark {
  #rawInputPoints = []; // Data coming from hardware. {x, y, pressure}
  #points = [];
  #segmentLength;
  #segmentProgress = 0;

  constructor(segmentLength = 8) {
    this.#segmentLength = segmentLength;
  }

  get points() {
    return this.#points;
  }

  // Add fresh points from a hardware device or automata.
  input(raw) {
    if (Array.isArray(raw)) this.#rawInputPoints.push(...raw);
    else this.#rawInputPoints.push(raw);
    this.#processRawInputIntoSegments();
  }

  #processRawInputIntoSegments() {
    // TODO: Quantize this raw data so the segments have a regulated distance.
    this.#points.push(...this.#rawInputPoints.slice());

    this.#rawInputPoints.length = 0;
  }

  // Feeds the processed raw data back and dumps points.
  spots() {
    const points = this.#points.slice();
    this.#points.length = 0;
    return points;
  }

  line() {
    if (this.#points.length < 2) return [];
    const points = this.#points.slice();
    this.#points.length = 0;
    return points;
  }

  // Calculates the spline from all input points, consumes them, and returns
  // an even sampling of coordinates.
  spline() {
    //if (this.#points.length < 4) return [];

    const coords = [];
    this.#points.forEach((coord, i) => {
      const segs = this.#points;
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

      // TODO: Maybe segmentLength could be defined based on distance from
      //       a previous point.
      for (let t = 0; t < this.#segmentLength; t += 1) {
        const cR = Mark.#catmullRom(p0, p1, p2, p3, t / this.#segmentLength);
        coords.push({ x: floor(cR.x), y: floor(cR.y) }); // inner points
      }

      coords.push({ x: floor(p2[0]), y: floor(p2[1]) }); // last point
    });

    console.log("Spline point length:", this.#points.length);
    this.#points.length = 0;

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
