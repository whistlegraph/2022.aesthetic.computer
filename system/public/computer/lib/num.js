// 🧮 Numbers
import { vec4, mat4 } from "../dep/gl-matrix/index.js";

export { vec4, mat4 };

// Returns true if the number is even, and false otherwise.
export function even(n) {
  return n % 2 === 0;
}

// Accepts integer from 0–16
// Yields 17 different values between 0–255.
export function byteInterval17(i16) {
  return Math.min(i16 * 16, 255);
}

// Generates an integer from 0-n (inclusive)
export function randInt(n) {
  return Math.floor(Math.random() * (n + 1));
}

// Generates an integer from low-high (inclusive)
export function randIntRange(low, high) {
  return low + randInt(high - low);
}

// Gets the distance between two points.
export function dist(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

// Converts degrees to radians.
export function radians(deg) {
  return deg * (Math.PI / 180);
}

// Keeps a value between min and max.
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

// Slides a number between a and by a normalized amount.
export function lerp(a, b, amount) {
  return a + (b - a) * clamp(amount, 0, 1);
}

// Returns a string of numbers based on local system time. YYYY.MM.DD.HH.MM.SS
export function timestamp() {
  const d = new Date();
  const pad = (n) => n.toString().padStart(2, "0");
  return `
    ${d.getFullYear()}.
    ${d.getMonth() + 1}.
    ${pad(d.getDate())}.
    ${pad(d.getHours())}.
    ${pad(d.getMinutes())}.
    ${pad(d.getSeconds())}`.replace(/\s/g, "");
}

// A. Lerps over a single value (from->to) via `progress` (0->1).
// B. Quantizes over an array of individual `values` via `progress` (0->1).
// TODO: Allow `progress` to be 0->N which would map to an index in `values`.
export class Track {
  #values;
  #result;
  #quantize;

  constructor(values, result) {
    this.#values = values;
    this.#result = result;
    this.#quantize = Array.isArray(values);
  }

  step(progress) {
    if (this.#quantize) {
      const index = Math.min(
        Math.floor(progress * this.#values.length),
        this.#values.length - 1
      );
      this.#result(this.#values[index]);
    } else {
      this.#result(lerp(this.#values.from, this.#values.to, progress));
    }
  }
}
