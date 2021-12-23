// 📚 Helpers

/*
export function times(n, fun) {
  const accum = Array(Math.max(0, n));
  for (let i = 0; i < n; i += 1) accum[i] = fun();
  return accum;
}
*/

// Generate a sealed object with named keys set to undefined.
export function apiObject() {
  const obj = {};
  for (const key of arguments) obj[key] = undefined;
  return Object.seal(obj);
}

export function extension(filename) {
  // https://stackoverflow.com/a/680982
  return /(?:\.([^.]+))?$/.exec(filename)[1];
}

// Returns true if the object is not an Array.
export function notArray(obj) {
  return !Array.isArray(obj);
}
