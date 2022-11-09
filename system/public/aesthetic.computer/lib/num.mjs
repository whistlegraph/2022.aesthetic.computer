// 🧮 Numbers
import * as quat from "../dep/gl-matrix/quat.mjs";
import * as mat3 from "../dep/gl-matrix/mat3.mjs";
import * as mat4 from "../dep/gl-matrix/mat4.mjs";
import * as vec2 from "../dep/gl-matrix/vec2.mjs";
import * as vec3 from "../dep/gl-matrix/vec3.mjs";
import * as vec4 from "../dep/gl-matrix/vec4.mjs";

export { vec2, vec3, vec4, mat3, mat4, quat };

// Returns true if the number is even, and false otherwise.
export function even(n) {
  return n % 2 === 0;
}

export function odd(n) {
  return !even(n);
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

// Generates an array of random integers from 0-n (inclusive)
// TODO: How could this be made more generic? 22.1.5
// TODO: How to make this account for range? 2022.01.17.00.33
export function randIntArr(n, count) {
  return Array(count).fill(n).map(randInt);
}

// Generates an integer from low-high (inclusive)
export function randIntRange(low, high) {
  return low + randInt(high - low);
}

// Multiplies one or more [] operands by n and returns a Number or Array.
export function multiply(operands, n) {
  if (Array.isArray(operands)) {
    return operands.map((o) => o * n);
  } else {
    return operands * n;
  }
}

// Gets the distance between two points.
// (4) x1, y1, x2, y1
// (2) {x, y}, {x, y}
export function dist() {
  let x1, y1, x2, y2;

  if (arguments.length === 4) {
    x1 = arguments[0];
    y1 = arguments[1];
    x2 = arguments[2];
    y2 = arguments[3];
  } else if (arguments.length === 2) {
    x1 = arguments[0].x;
    y1 = arguments[0].y;
    x2 = arguments[1].x;
    y2 = arguments[1].y;
  }

  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

// TODO: Would 6 decimal places work? (Do some research) 22.11.08.00.21
export function dist3d(p1, p2) {
  // Convert everything to 4 decimal places.
  // Drop some precision here so vec3.dist (Math.hypot) doesn't go crazy
  // on my Float32Array values.
  if (p1.buffer) p1 = p1.map((p) => p.toPrecision(4));
  if (p2.buffer) p2 = p2.map((p) => p.toPrecision(4));
  return Number(vec3.dist(p1, p2).toPrecision(4));
}

// Converts degrees to radians.
export function radians(deg) {
  return deg * (Math.PI / 180);
}

export function degrees(rad) {
  return rad * (180 / Math.PI);
}

// Keeps a value between min and max.
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

// Slides a number between a and by a normalized amount.
export function lerp(a, b, amount) {
  return a + (b - a) * clamp(amount, 0, 1);
}

// Maps a number within a range to a new range.
// https://stackoverflow.com/a/23202637/8146077
export function map(num, inMin, inMax, outMin, outMax) {
  return ((num - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
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

function cleanHexString(h) {
  return h.replace("#", "").replace("0x", "");
}

// Determines if a string is a valid hex value.
export function isHexString(h) {
  h = cleanHexString(h);
  const a = parseInt(h, 16);
  return a.toString(16) === h.toLowerCase();
}

// Convert separate rgb values to a single integer.
export function rgbToHex(r, g, b) {
  return (1 << 24) + (r << 16) + (g << 8) + b;
}

// Takes either a string hex or a number hex and outputs and [RGB] array.
// TODO: Take in alpha.
export function hexToRgb(h) {
  const int = typeof h === "string" ? parseInt(cleanHexString(h), 16) : h;
  return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
}
