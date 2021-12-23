import * as num from "./num.js";

// Randomly returns one of the arguments.
export function choose() {
  return arguments[num.randInt(arguments.length - 1)];
}

// Set every property of an object to a certain value.
export function every(obj, value) {
  Object.keys(obj).forEach((k) => (obj[k] = value));
}

// Returns a random value from an object.
export function any(obj) {
  const keys = Object.keys(obj);
  return obj[keys[(keys.length * Math.random()) << 0]];
}

// Run a function on every value in an object.
// Ex. each(obj, (value, key) => console.log(value, key));
export function each(obj, fn) {
  Object.entries(obj).forEach(([key, obj]) => fn(obj, key));
}

// Run a function `n` times, passing in `i` on each iteration.
export function repeat(n, fn) {
  for (let i = 0; i < n; i += 1) fn(i);
}
