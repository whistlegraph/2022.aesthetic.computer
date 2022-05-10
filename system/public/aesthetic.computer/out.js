// 🔁 Loop

// These numbers define the budgeted frame-time (max) for CPU and Rendering.
// The updates will repeat multiple times per frame, but rendering will only
// ever happen once per display refresh.

const updateFps = 120; // This is constant and should be used for interpolation.
let renderFps = 165; // This is a maximum and will vary across environments.
const updateRate = 1000 / updateFps;
let renderRate = 1000 / renderFps;
let updateTime = 0;
let renderTime = 0;
let lastNow;
let input;
let updateAndRender;

// Input runs once per loop.
// Update runs multiple times.
// Render runs once if enough time has passed.
function loop(now) {
  input();

  const delta = now - lastNow;

  updateTime += delta;
  renderTime += delta;
  lastNow = now;

  let updateTimes = 0;

  while (updateTime >= updateRate) {
    updateTimes += 1;
    updateTime -= updateRate;
  }

  let needsRender = false;

  if (renderTime >= renderRate) {
    needsRender = true;
    renderTime -= renderRate;
  }

  updateAndRender(needsRender, updateTimes);
  window.requestAnimationFrame(loop);
}

function start(inputFun, updateAndRenderFun) {
  input = inputFun;
  updateAndRender = updateAndRenderFun;
  lastNow = performance.now();
  window.requestAnimationFrame(loop);
}

function frameRate(n) {
  renderFps = n;
  renderRate = 1000 / renderFps;
  renderTime = 0;
}

/**
 * Common utilities
 * @module glMatrix
 */
// Configuration Constants
var EPSILON = 0.000001;
var ARRAY_TYPE = typeof Float32Array !== "undefined" ? Float32Array : Array;
var RANDOM = Math.random;
if (!Math.hypot)
  Math.hypot = function () {
    var y = 0,
      i = arguments.length;

    while (i--) {
      y += arguments[i] * arguments[i];
    }

    return Math.sqrt(y);
  };

/**
 * 4x4 Matrix<br>Format: column-major, when typed out it looks like row-major<br>The matrices are being post multiplied.
 * @module mat4
 */

/**
 * Creates a new identity mat4
 *
 * @returns {mat4} a new 4x4 matrix
 */

function create$2() {
  var out = new ARRAY_TYPE(16);

  if (ARRAY_TYPE != Float32Array) {
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
  }

  out[0] = 1;
  out[5] = 1;
  out[10] = 1;
  out[15] = 1;
  return out;
}
/**
 * Creates a new mat4 initialized with values from an existing matrix
 *
 * @param {ReadonlyMat4} a matrix to clone
 * @returns {mat4} a new 4x4 matrix
 */

function clone$2(a) {
  var out = new ARRAY_TYPE(16);
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  out[4] = a[4];
  out[5] = a[5];
  out[6] = a[6];
  out[7] = a[7];
  out[8] = a[8];
  out[9] = a[9];
  out[10] = a[10];
  out[11] = a[11];
  out[12] = a[12];
  out[13] = a[13];
  out[14] = a[14];
  out[15] = a[15];
  return out;
}
/**
 * Copy the values from one mat4 to another
 *
 * @param {mat4} out the receiving matrix
 * @param {ReadonlyMat4} a the source matrix
 * @returns {mat4} out
 */

function copy$3(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  out[4] = a[4];
  out[5] = a[5];
  out[6] = a[6];
  out[7] = a[7];
  out[8] = a[8];
  out[9] = a[9];
  out[10] = a[10];
  out[11] = a[11];
  out[12] = a[12];
  out[13] = a[13];
  out[14] = a[14];
  out[15] = a[15];
  return out;
}
/**
 * Create a new mat4 with the given values
 *
 * @param {Number} m00 Component in column 0, row 0 position (index 0)
 * @param {Number} m01 Component in column 0, row 1 position (index 1)
 * @param {Number} m02 Component in column 0, row 2 position (index 2)
 * @param {Number} m03 Component in column 0, row 3 position (index 3)
 * @param {Number} m10 Component in column 1, row 0 position (index 4)
 * @param {Number} m11 Component in column 1, row 1 position (index 5)
 * @param {Number} m12 Component in column 1, row 2 position (index 6)
 * @param {Number} m13 Component in column 1, row 3 position (index 7)
 * @param {Number} m20 Component in column 2, row 0 position (index 8)
 * @param {Number} m21 Component in column 2, row 1 position (index 9)
 * @param {Number} m22 Component in column 2, row 2 position (index 10)
 * @param {Number} m23 Component in column 2, row 3 position (index 11)
 * @param {Number} m30 Component in column 3, row 0 position (index 12)
 * @param {Number} m31 Component in column 3, row 1 position (index 13)
 * @param {Number} m32 Component in column 3, row 2 position (index 14)
 * @param {Number} m33 Component in column 3, row 3 position (index 15)
 * @returns {mat4} A new mat4
 */

function fromValues$2(
  m00,
  m01,
  m02,
  m03,
  m10,
  m11,
  m12,
  m13,
  m20,
  m21,
  m22,
  m23,
  m30,
  m31,
  m32,
  m33
) {
  var out = new ARRAY_TYPE(16);
  out[0] = m00;
  out[1] = m01;
  out[2] = m02;
  out[3] = m03;
  out[4] = m10;
  out[5] = m11;
  out[6] = m12;
  out[7] = m13;
  out[8] = m20;
  out[9] = m21;
  out[10] = m22;
  out[11] = m23;
  out[12] = m30;
  out[13] = m31;
  out[14] = m32;
  out[15] = m33;
  return out;
}
/**
 * Set the components of a mat4 to the given values
 *
 * @param {mat4} out the receiving matrix
 * @param {Number} m00 Component in column 0, row 0 position (index 0)
 * @param {Number} m01 Component in column 0, row 1 position (index 1)
 * @param {Number} m02 Component in column 0, row 2 position (index 2)
 * @param {Number} m03 Component in column 0, row 3 position (index 3)
 * @param {Number} m10 Component in column 1, row 0 position (index 4)
 * @param {Number} m11 Component in column 1, row 1 position (index 5)
 * @param {Number} m12 Component in column 1, row 2 position (index 6)
 * @param {Number} m13 Component in column 1, row 3 position (index 7)
 * @param {Number} m20 Component in column 2, row 0 position (index 8)
 * @param {Number} m21 Component in column 2, row 1 position (index 9)
 * @param {Number} m22 Component in column 2, row 2 position (index 10)
 * @param {Number} m23 Component in column 2, row 3 position (index 11)
 * @param {Number} m30 Component in column 3, row 0 position (index 12)
 * @param {Number} m31 Component in column 3, row 1 position (index 13)
 * @param {Number} m32 Component in column 3, row 2 position (index 14)
 * @param {Number} m33 Component in column 3, row 3 position (index 15)
 * @returns {mat4} out
 */

function set$2(
  out,
  m00,
  m01,
  m02,
  m03,
  m10,
  m11,
  m12,
  m13,
  m20,
  m21,
  m22,
  m23,
  m30,
  m31,
  m32,
  m33
) {
  out[0] = m00;
  out[1] = m01;
  out[2] = m02;
  out[3] = m03;
  out[4] = m10;
  out[5] = m11;
  out[6] = m12;
  out[7] = m13;
  out[8] = m20;
  out[9] = m21;
  out[10] = m22;
  out[11] = m23;
  out[12] = m30;
  out[13] = m31;
  out[14] = m32;
  out[15] = m33;
  return out;
}
/**
 * Set a mat4 to the identity matrix
 *
 * @param {mat4} out the receiving matrix
 * @returns {mat4} out
 */

function identity(out) {
  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = 1;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = 1;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}
/**
 * Transpose the values of a mat4
 *
 * @param {mat4} out the receiving matrix
 * @param {ReadonlyMat4} a the source matrix
 * @returns {mat4} out
 */

function transpose(out, a) {
  // If we are transposing ourselves we can skip a few steps but have to cache some values
  if (out === a) {
    var a01 = a[1],
      a02 = a[2],
      a03 = a[3];
    var a12 = a[6],
      a13 = a[7];
    var a23 = a[11];
    out[1] = a[4];
    out[2] = a[8];
    out[3] = a[12];
    out[4] = a01;
    out[6] = a[9];
    out[7] = a[13];
    out[8] = a02;
    out[9] = a12;
    out[11] = a[14];
    out[12] = a03;
    out[13] = a13;
    out[14] = a23;
  } else {
    out[0] = a[0];
    out[1] = a[4];
    out[2] = a[8];
    out[3] = a[12];
    out[4] = a[1];
    out[5] = a[5];
    out[6] = a[9];
    out[7] = a[13];
    out[8] = a[2];
    out[9] = a[6];
    out[10] = a[10];
    out[11] = a[14];
    out[12] = a[3];
    out[13] = a[7];
    out[14] = a[11];
    out[15] = a[15];
  }

  return out;
}
/**
 * Inverts a mat4
 *
 * @param {mat4} out the receiving matrix
 * @param {ReadonlyMat4} a the source matrix
 * @returns {mat4} out
 */

function invert(out, a) {
  var a00 = a[0],
    a01 = a[1],
    a02 = a[2],
    a03 = a[3];
  var a10 = a[4],
    a11 = a[5],
    a12 = a[6],
    a13 = a[7];
  var a20 = a[8],
    a21 = a[9],
    a22 = a[10],
    a23 = a[11];
  var a30 = a[12],
    a31 = a[13],
    a32 = a[14],
    a33 = a[15];
  var b00 = a00 * a11 - a01 * a10;
  var b01 = a00 * a12 - a02 * a10;
  var b02 = a00 * a13 - a03 * a10;
  var b03 = a01 * a12 - a02 * a11;
  var b04 = a01 * a13 - a03 * a11;
  var b05 = a02 * a13 - a03 * a12;
  var b06 = a20 * a31 - a21 * a30;
  var b07 = a20 * a32 - a22 * a30;
  var b08 = a20 * a33 - a23 * a30;
  var b09 = a21 * a32 - a22 * a31;
  var b10 = a21 * a33 - a23 * a31;
  var b11 = a22 * a33 - a23 * a32; // Calculate the determinant

  var det =
    b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

  if (!det) {
    return null;
  }

  det = 1.0 / det;
  out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
  out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
  out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
  out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
  out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
  out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
  out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
  out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
  out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
  out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
  out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
  out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
  out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
  out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
  out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
  out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;
  return out;
}
/**
 * Calculates the adjugate of a mat4
 *
 * @param {mat4} out the receiving matrix
 * @param {ReadonlyMat4} a the source matrix
 * @returns {mat4} out
 */

function adjoint(out, a) {
  var a00 = a[0],
    a01 = a[1],
    a02 = a[2],
    a03 = a[3];
  var a10 = a[4],
    a11 = a[5],
    a12 = a[6],
    a13 = a[7];
  var a20 = a[8],
    a21 = a[9],
    a22 = a[10],
    a23 = a[11];
  var a30 = a[12],
    a31 = a[13],
    a32 = a[14],
    a33 = a[15];
  out[0] =
    a11 * (a22 * a33 - a23 * a32) -
    a21 * (a12 * a33 - a13 * a32) +
    a31 * (a12 * a23 - a13 * a22);
  out[1] = -(
    a01 * (a22 * a33 - a23 * a32) -
    a21 * (a02 * a33 - a03 * a32) +
    a31 * (a02 * a23 - a03 * a22)
  );
  out[2] =
    a01 * (a12 * a33 - a13 * a32) -
    a11 * (a02 * a33 - a03 * a32) +
    a31 * (a02 * a13 - a03 * a12);
  out[3] = -(
    a01 * (a12 * a23 - a13 * a22) -
    a11 * (a02 * a23 - a03 * a22) +
    a21 * (a02 * a13 - a03 * a12)
  );
  out[4] = -(
    a10 * (a22 * a33 - a23 * a32) -
    a20 * (a12 * a33 - a13 * a32) +
    a30 * (a12 * a23 - a13 * a22)
  );
  out[5] =
    a00 * (a22 * a33 - a23 * a32) -
    a20 * (a02 * a33 - a03 * a32) +
    a30 * (a02 * a23 - a03 * a22);
  out[6] = -(
    a00 * (a12 * a33 - a13 * a32) -
    a10 * (a02 * a33 - a03 * a32) +
    a30 * (a02 * a13 - a03 * a12)
  );
  out[7] =
    a00 * (a12 * a23 - a13 * a22) -
    a10 * (a02 * a23 - a03 * a22) +
    a20 * (a02 * a13 - a03 * a12);
  out[8] =
    a10 * (a21 * a33 - a23 * a31) -
    a20 * (a11 * a33 - a13 * a31) +
    a30 * (a11 * a23 - a13 * a21);
  out[9] = -(
    a00 * (a21 * a33 - a23 * a31) -
    a20 * (a01 * a33 - a03 * a31) +
    a30 * (a01 * a23 - a03 * a21)
  );
  out[10] =
    a00 * (a11 * a33 - a13 * a31) -
    a10 * (a01 * a33 - a03 * a31) +
    a30 * (a01 * a13 - a03 * a11);
  out[11] = -(
    a00 * (a11 * a23 - a13 * a21) -
    a10 * (a01 * a23 - a03 * a21) +
    a20 * (a01 * a13 - a03 * a11)
  );
  out[12] = -(
    a10 * (a21 * a32 - a22 * a31) -
    a20 * (a11 * a32 - a12 * a31) +
    a30 * (a11 * a22 - a12 * a21)
  );
  out[13] =
    a00 * (a21 * a32 - a22 * a31) -
    a20 * (a01 * a32 - a02 * a31) +
    a30 * (a01 * a22 - a02 * a21);
  out[14] = -(
    a00 * (a11 * a32 - a12 * a31) -
    a10 * (a01 * a32 - a02 * a31) +
    a30 * (a01 * a12 - a02 * a11)
  );
  out[15] =
    a00 * (a11 * a22 - a12 * a21) -
    a10 * (a01 * a22 - a02 * a21) +
    a20 * (a01 * a12 - a02 * a11);
  return out;
}
/**
 * Calculates the determinant of a mat4
 *
 * @param {ReadonlyMat4} a the source matrix
 * @returns {Number} determinant of a
 */

function determinant(a) {
  var a00 = a[0],
    a01 = a[1],
    a02 = a[2],
    a03 = a[3];
  var a10 = a[4],
    a11 = a[5],
    a12 = a[6],
    a13 = a[7];
  var a20 = a[8],
    a21 = a[9],
    a22 = a[10],
    a23 = a[11];
  var a30 = a[12],
    a31 = a[13],
    a32 = a[14],
    a33 = a[15];
  var b00 = a00 * a11 - a01 * a10;
  var b01 = a00 * a12 - a02 * a10;
  var b02 = a00 * a13 - a03 * a10;
  var b03 = a01 * a12 - a02 * a11;
  var b04 = a01 * a13 - a03 * a11;
  var b05 = a02 * a13 - a03 * a12;
  var b06 = a20 * a31 - a21 * a30;
  var b07 = a20 * a32 - a22 * a30;
  var b08 = a20 * a33 - a23 * a30;
  var b09 = a21 * a32 - a22 * a31;
  var b10 = a21 * a33 - a23 * a31;
  var b11 = a22 * a33 - a23 * a32; // Calculate the determinant

  return b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
}
/**
 * Multiplies two mat4s
 *
 * @param {mat4} out the receiving matrix
 * @param {ReadonlyMat4} a the first operand
 * @param {ReadonlyMat4} b the second operand
 * @returns {mat4} out
 */

function multiply$3(out, a, b) {
  var a00 = a[0],
    a01 = a[1],
    a02 = a[2],
    a03 = a[3];
  var a10 = a[4],
    a11 = a[5],
    a12 = a[6],
    a13 = a[7];
  var a20 = a[8],
    a21 = a[9],
    a22 = a[10],
    a23 = a[11];
  var a30 = a[12],
    a31 = a[13],
    a32 = a[14],
    a33 = a[15]; // Cache only the current line of the second matrix

  var b0 = b[0],
    b1 = b[1],
    b2 = b[2],
    b3 = b[3];
  out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  b0 = b[4];
  b1 = b[5];
  b2 = b[6];
  b3 = b[7];
  out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  b0 = b[8];
  b1 = b[9];
  b2 = b[10];
  b3 = b[11];
  out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  b0 = b[12];
  b1 = b[13];
  b2 = b[14];
  b3 = b[15];
  out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  return out;
}
/**
 * Translate a mat4 by the given vector
 *
 * @param {mat4} out the receiving matrix
 * @param {ReadonlyMat4} a the matrix to translate
 * @param {ReadonlyVec3} v vector to translate by
 * @returns {mat4} out
 */

function translate(out, a, v) {
  var x = v[0],
    y = v[1],
    z = v[2];
  var a00, a01, a02, a03;
  var a10, a11, a12, a13;
  var a20, a21, a22, a23;

  if (a === out) {
    out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
    out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
    out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
    out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
  } else {
    a00 = a[0];
    a01 = a[1];
    a02 = a[2];
    a03 = a[3];
    a10 = a[4];
    a11 = a[5];
    a12 = a[6];
    a13 = a[7];
    a20 = a[8];
    a21 = a[9];
    a22 = a[10];
    a23 = a[11];
    out[0] = a00;
    out[1] = a01;
    out[2] = a02;
    out[3] = a03;
    out[4] = a10;
    out[5] = a11;
    out[6] = a12;
    out[7] = a13;
    out[8] = a20;
    out[9] = a21;
    out[10] = a22;
    out[11] = a23;
    out[12] = a00 * x + a10 * y + a20 * z + a[12];
    out[13] = a01 * x + a11 * y + a21 * z + a[13];
    out[14] = a02 * x + a12 * y + a22 * z + a[14];
    out[15] = a03 * x + a13 * y + a23 * z + a[15];
  }

  return out;
}
/**
 * Scales the mat4 by the dimensions in the given vec3 not using vectorization
 *
 * @param {mat4} out the receiving matrix
 * @param {ReadonlyMat4} a the matrix to scale
 * @param {ReadonlyVec3} v the vec3 to scale the matrix by
 * @returns {mat4} out
 **/

function scale$2(out, a, v) {
  var x = v[0],
    y = v[1],
    z = v[2];
  out[0] = a[0] * x;
  out[1] = a[1] * x;
  out[2] = a[2] * x;
  out[3] = a[3] * x;
  out[4] = a[4] * y;
  out[5] = a[5] * y;
  out[6] = a[6] * y;
  out[7] = a[7] * y;
  out[8] = a[8] * z;
  out[9] = a[9] * z;
  out[10] = a[10] * z;
  out[11] = a[11] * z;
  out[12] = a[12];
  out[13] = a[13];
  out[14] = a[14];
  out[15] = a[15];
  return out;
}
/**
 * Rotates a mat4 by the given angle around the given axis
 *
 * @param {mat4} out the receiving matrix
 * @param {ReadonlyMat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @param {ReadonlyVec3} axis the axis to rotate around
 * @returns {mat4} out
 */

function rotate$1(out, a, rad, axis) {
  var x = axis[0],
    y = axis[1],
    z = axis[2];
  var len = Math.hypot(x, y, z);
  var s, c, t;
  var a00, a01, a02, a03;
  var a10, a11, a12, a13;
  var a20, a21, a22, a23;
  var b00, b01, b02;
  var b10, b11, b12;
  var b20, b21, b22;

  if (len < EPSILON) {
    return null;
  }

  len = 1 / len;
  x *= len;
  y *= len;
  z *= len;
  s = Math.sin(rad);
  c = Math.cos(rad);
  t = 1 - c;
  a00 = a[0];
  a01 = a[1];
  a02 = a[2];
  a03 = a[3];
  a10 = a[4];
  a11 = a[5];
  a12 = a[6];
  a13 = a[7];
  a20 = a[8];
  a21 = a[9];
  a22 = a[10];
  a23 = a[11]; // Construct the elements of the rotation matrix

  b00 = x * x * t + c;
  b01 = y * x * t + z * s;
  b02 = z * x * t - y * s;
  b10 = x * y * t - z * s;
  b11 = y * y * t + c;
  b12 = z * y * t + x * s;
  b20 = x * z * t + y * s;
  b21 = y * z * t - x * s;
  b22 = z * z * t + c; // Perform rotation-specific matrix multiplication

  out[0] = a00 * b00 + a10 * b01 + a20 * b02;
  out[1] = a01 * b00 + a11 * b01 + a21 * b02;
  out[2] = a02 * b00 + a12 * b01 + a22 * b02;
  out[3] = a03 * b00 + a13 * b01 + a23 * b02;
  out[4] = a00 * b10 + a10 * b11 + a20 * b12;
  out[5] = a01 * b10 + a11 * b11 + a21 * b12;
  out[6] = a02 * b10 + a12 * b11 + a22 * b12;
  out[7] = a03 * b10 + a13 * b11 + a23 * b12;
  out[8] = a00 * b20 + a10 * b21 + a20 * b22;
  out[9] = a01 * b20 + a11 * b21 + a21 * b22;
  out[10] = a02 * b20 + a12 * b21 + a22 * b22;
  out[11] = a03 * b20 + a13 * b21 + a23 * b22;

  if (a !== out) {
    // If the source and destination differ, copy the unchanged last row
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
  }

  return out;
}
/**
 * Rotates a matrix by the given angle around the X axis
 *
 * @param {mat4} out the receiving matrix
 * @param {ReadonlyMat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */

function rotateX(out, a, rad) {
  var s = Math.sin(rad);
  var c = Math.cos(rad);
  var a10 = a[4];
  var a11 = a[5];
  var a12 = a[6];
  var a13 = a[7];
  var a20 = a[8];
  var a21 = a[9];
  var a22 = a[10];
  var a23 = a[11];

  if (a !== out) {
    // If the source and destination differ, copy the unchanged rows
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
  } // Perform axis-specific matrix multiplication

  out[4] = a10 * c + a20 * s;
  out[5] = a11 * c + a21 * s;
  out[6] = a12 * c + a22 * s;
  out[7] = a13 * c + a23 * s;
  out[8] = a20 * c - a10 * s;
  out[9] = a21 * c - a11 * s;
  out[10] = a22 * c - a12 * s;
  out[11] = a23 * c - a13 * s;
  return out;
}
/**
 * Rotates a matrix by the given angle around the Y axis
 *
 * @param {mat4} out the receiving matrix
 * @param {ReadonlyMat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */

function rotateY(out, a, rad) {
  var s = Math.sin(rad);
  var c = Math.cos(rad);
  var a00 = a[0];
  var a01 = a[1];
  var a02 = a[2];
  var a03 = a[3];
  var a20 = a[8];
  var a21 = a[9];
  var a22 = a[10];
  var a23 = a[11];

  if (a !== out) {
    // If the source and destination differ, copy the unchanged rows
    out[4] = a[4];
    out[5] = a[5];
    out[6] = a[6];
    out[7] = a[7];
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
  } // Perform axis-specific matrix multiplication

  out[0] = a00 * c - a20 * s;
  out[1] = a01 * c - a21 * s;
  out[2] = a02 * c - a22 * s;
  out[3] = a03 * c - a23 * s;
  out[8] = a00 * s + a20 * c;
  out[9] = a01 * s + a21 * c;
  out[10] = a02 * s + a22 * c;
  out[11] = a03 * s + a23 * c;
  return out;
}
/**
 * Rotates a matrix by the given angle around the Z axis
 *
 * @param {mat4} out the receiving matrix
 * @param {ReadonlyMat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */

function rotateZ(out, a, rad) {
  var s = Math.sin(rad);
  var c = Math.cos(rad);
  var a00 = a[0];
  var a01 = a[1];
  var a02 = a[2];
  var a03 = a[3];
  var a10 = a[4];
  var a11 = a[5];
  var a12 = a[6];
  var a13 = a[7];

  if (a !== out) {
    // If the source and destination differ, copy the unchanged last row
    out[8] = a[8];
    out[9] = a[9];
    out[10] = a[10];
    out[11] = a[11];
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
  } // Perform axis-specific matrix multiplication

  out[0] = a00 * c + a10 * s;
  out[1] = a01 * c + a11 * s;
  out[2] = a02 * c + a12 * s;
  out[3] = a03 * c + a13 * s;
  out[4] = a10 * c - a00 * s;
  out[5] = a11 * c - a01 * s;
  out[6] = a12 * c - a02 * s;
  out[7] = a13 * c - a03 * s;
  return out;
}
/**
 * Creates a matrix from a vector translation
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.translate(dest, dest, vec);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {ReadonlyVec3} v Translation vector
 * @returns {mat4} out
 */

function fromTranslation(out, v) {
  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = 1;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = 1;
  out[11] = 0;
  out[12] = v[0];
  out[13] = v[1];
  out[14] = v[2];
  out[15] = 1;
  return out;
}
/**
 * Creates a matrix from a vector scaling
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.scale(dest, dest, vec);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {ReadonlyVec3} v Scaling vector
 * @returns {mat4} out
 */

function fromScaling(out, v) {
  out[0] = v[0];
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = v[1];
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = v[2];
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}
/**
 * Creates a matrix from a given angle around a given axis
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.rotate(dest, dest, rad, axis);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {Number} rad the angle to rotate the matrix by
 * @param {ReadonlyVec3} axis the axis to rotate around
 * @returns {mat4} out
 */

function fromRotation(out, rad, axis) {
  var x = axis[0],
    y = axis[1],
    z = axis[2];
  var len = Math.hypot(x, y, z);
  var s, c, t;

  if (len < EPSILON) {
    return null;
  }

  len = 1 / len;
  x *= len;
  y *= len;
  z *= len;
  s = Math.sin(rad);
  c = Math.cos(rad);
  t = 1 - c; // Perform rotation-specific matrix multiplication

  out[0] = x * x * t + c;
  out[1] = y * x * t + z * s;
  out[2] = z * x * t - y * s;
  out[3] = 0;
  out[4] = x * y * t - z * s;
  out[5] = y * y * t + c;
  out[6] = z * y * t + x * s;
  out[7] = 0;
  out[8] = x * z * t + y * s;
  out[9] = y * z * t - x * s;
  out[10] = z * z * t + c;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}
/**
 * Creates a matrix from the given angle around the X axis
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.rotateX(dest, dest, rad);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */

function fromXRotation(out, rad) {
  var s = Math.sin(rad);
  var c = Math.cos(rad); // Perform axis-specific matrix multiplication

  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = c;
  out[6] = s;
  out[7] = 0;
  out[8] = 0;
  out[9] = -s;
  out[10] = c;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}
/**
 * Creates a matrix from the given angle around the Y axis
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.rotateY(dest, dest, rad);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */

function fromYRotation(out, rad) {
  var s = Math.sin(rad);
  var c = Math.cos(rad); // Perform axis-specific matrix multiplication

  out[0] = c;
  out[1] = 0;
  out[2] = -s;
  out[3] = 0;
  out[4] = 0;
  out[5] = 1;
  out[6] = 0;
  out[7] = 0;
  out[8] = s;
  out[9] = 0;
  out[10] = c;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}
/**
 * Creates a matrix from the given angle around the Z axis
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.rotateZ(dest, dest, rad);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */

function fromZRotation(out, rad) {
  var s = Math.sin(rad);
  var c = Math.cos(rad); // Perform axis-specific matrix multiplication

  out[0] = c;
  out[1] = s;
  out[2] = 0;
  out[3] = 0;
  out[4] = -s;
  out[5] = c;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = 1;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}
/**
 * Creates a matrix from a quaternion rotation and vector translation
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.translate(dest, vec);
 *     let quatMat = mat4.create();
 *     quat4.toMat4(quat, quatMat);
 *     mat4.multiply(dest, quatMat);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {quat4} q Rotation quaternion
 * @param {ReadonlyVec3} v Translation vector
 * @returns {mat4} out
 */

function fromRotationTranslation(out, q, v) {
  // Quaternion math
  var x = q[0],
    y = q[1],
    z = q[2],
    w = q[3];
  var x2 = x + x;
  var y2 = y + y;
  var z2 = z + z;
  var xx = x * x2;
  var xy = x * y2;
  var xz = x * z2;
  var yy = y * y2;
  var yz = y * z2;
  var zz = z * z2;
  var wx = w * x2;
  var wy = w * y2;
  var wz = w * z2;
  out[0] = 1 - (yy + zz);
  out[1] = xy + wz;
  out[2] = xz - wy;
  out[3] = 0;
  out[4] = xy - wz;
  out[5] = 1 - (xx + zz);
  out[6] = yz + wx;
  out[7] = 0;
  out[8] = xz + wy;
  out[9] = yz - wx;
  out[10] = 1 - (xx + yy);
  out[11] = 0;
  out[12] = v[0];
  out[13] = v[1];
  out[14] = v[2];
  out[15] = 1;
  return out;
}
/**
 * Creates a new mat4 from a dual quat.
 *
 * @param {mat4} out Matrix
 * @param {ReadonlyQuat2} a Dual Quaternion
 * @returns {mat4} mat4 receiving operation result
 */

function fromQuat2(out, a) {
  var translation = new ARRAY_TYPE(3);
  var bx = -a[0],
    by = -a[1],
    bz = -a[2],
    bw = a[3],
    ax = a[4],
    ay = a[5],
    az = a[6],
    aw = a[7];
  var magnitude = bx * bx + by * by + bz * bz + bw * bw; //Only scale if it makes sense

  if (magnitude > 0) {
    translation[0] = ((ax * bw + aw * bx + ay * bz - az * by) * 2) / magnitude;
    translation[1] = ((ay * bw + aw * by + az * bx - ax * bz) * 2) / magnitude;
    translation[2] = ((az * bw + aw * bz + ax * by - ay * bx) * 2) / magnitude;
  } else {
    translation[0] = (ax * bw + aw * bx + ay * bz - az * by) * 2;
    translation[1] = (ay * bw + aw * by + az * bx - ax * bz) * 2;
    translation[2] = (az * bw + aw * bz + ax * by - ay * bx) * 2;
  }

  fromRotationTranslation(out, a, translation);
  return out;
}
/**
 * Returns the translation vector component of a transformation
 *  matrix. If a matrix is built with fromRotationTranslation,
 *  the returned vector will be the same as the translation vector
 *  originally supplied.
 * @param  {vec3} out Vector to receive translation component
 * @param  {ReadonlyMat4} mat Matrix to be decomposed (input)
 * @return {vec3} out
 */

function getTranslation(out, mat) {
  out[0] = mat[12];
  out[1] = mat[13];
  out[2] = mat[14];
  return out;
}
/**
 * Returns the scaling factor component of a transformation
 *  matrix. If a matrix is built with fromRotationTranslationScale
 *  with a normalized Quaternion paramter, the returned vector will be
 *  the same as the scaling vector
 *  originally supplied.
 * @param  {vec3} out Vector to receive scaling factor component
 * @param  {ReadonlyMat4} mat Matrix to be decomposed (input)
 * @return {vec3} out
 */

function getScaling(out, mat) {
  var m11 = mat[0];
  var m12 = mat[1];
  var m13 = mat[2];
  var m21 = mat[4];
  var m22 = mat[5];
  var m23 = mat[6];
  var m31 = mat[8];
  var m32 = mat[9];
  var m33 = mat[10];
  out[0] = Math.hypot(m11, m12, m13);
  out[1] = Math.hypot(m21, m22, m23);
  out[2] = Math.hypot(m31, m32, m33);
  return out;
}
/**
 * Returns a quaternion representing the rotational component
 *  of a transformation matrix. If a matrix is built with
 *  fromRotationTranslation, the returned quaternion will be the
 *  same as the quaternion originally supplied.
 * @param {quat} out Quaternion to receive the rotation component
 * @param {ReadonlyMat4} mat Matrix to be decomposed (input)
 * @return {quat} out
 */

function getRotation(out, mat) {
  var scaling = new ARRAY_TYPE(3);
  getScaling(scaling, mat);
  var is1 = 1 / scaling[0];
  var is2 = 1 / scaling[1];
  var is3 = 1 / scaling[2];
  var sm11 = mat[0] * is1;
  var sm12 = mat[1] * is2;
  var sm13 = mat[2] * is3;
  var sm21 = mat[4] * is1;
  var sm22 = mat[5] * is2;
  var sm23 = mat[6] * is3;
  var sm31 = mat[8] * is1;
  var sm32 = mat[9] * is2;
  var sm33 = mat[10] * is3;
  var trace = sm11 + sm22 + sm33;
  var S = 0;

  if (trace > 0) {
    S = Math.sqrt(trace + 1.0) * 2;
    out[3] = 0.25 * S;
    out[0] = (sm23 - sm32) / S;
    out[1] = (sm31 - sm13) / S;
    out[2] = (sm12 - sm21) / S;
  } else if (sm11 > sm22 && sm11 > sm33) {
    S = Math.sqrt(1.0 + sm11 - sm22 - sm33) * 2;
    out[3] = (sm23 - sm32) / S;
    out[0] = 0.25 * S;
    out[1] = (sm12 + sm21) / S;
    out[2] = (sm31 + sm13) / S;
  } else if (sm22 > sm33) {
    S = Math.sqrt(1.0 + sm22 - sm11 - sm33) * 2;
    out[3] = (sm31 - sm13) / S;
    out[0] = (sm12 + sm21) / S;
    out[1] = 0.25 * S;
    out[2] = (sm23 + sm32) / S;
  } else {
    S = Math.sqrt(1.0 + sm33 - sm11 - sm22) * 2;
    out[3] = (sm12 - sm21) / S;
    out[0] = (sm31 + sm13) / S;
    out[1] = (sm23 + sm32) / S;
    out[2] = 0.25 * S;
  }

  return out;
}
/**
 * Creates a matrix from a quaternion rotation, vector translation and vector scale
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.translate(dest, vec);
 *     let quatMat = mat4.create();
 *     quat4.toMat4(quat, quatMat);
 *     mat4.multiply(dest, quatMat);
 *     mat4.scale(dest, scale)
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {quat4} q Rotation quaternion
 * @param {ReadonlyVec3} v Translation vector
 * @param {ReadonlyVec3} s Scaling vector
 * @returns {mat4} out
 */

function fromRotationTranslationScale(out, q, v, s) {
  // Quaternion math
  var x = q[0],
    y = q[1],
    z = q[2],
    w = q[3];
  var x2 = x + x;
  var y2 = y + y;
  var z2 = z + z;
  var xx = x * x2;
  var xy = x * y2;
  var xz = x * z2;
  var yy = y * y2;
  var yz = y * z2;
  var zz = z * z2;
  var wx = w * x2;
  var wy = w * y2;
  var wz = w * z2;
  var sx = s[0];
  var sy = s[1];
  var sz = s[2];
  out[0] = (1 - (yy + zz)) * sx;
  out[1] = (xy + wz) * sx;
  out[2] = (xz - wy) * sx;
  out[3] = 0;
  out[4] = (xy - wz) * sy;
  out[5] = (1 - (xx + zz)) * sy;
  out[6] = (yz + wx) * sy;
  out[7] = 0;
  out[8] = (xz + wy) * sz;
  out[9] = (yz - wx) * sz;
  out[10] = (1 - (xx + yy)) * sz;
  out[11] = 0;
  out[12] = v[0];
  out[13] = v[1];
  out[14] = v[2];
  out[15] = 1;
  return out;
}
/**
 * Creates a matrix from a quaternion rotation, vector translation and vector scale, rotating and scaling around the given origin
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.translate(dest, vec);
 *     mat4.translate(dest, origin);
 *     let quatMat = mat4.create();
 *     quat4.toMat4(quat, quatMat);
 *     mat4.multiply(dest, quatMat);
 *     mat4.scale(dest, scale)
 *     mat4.translate(dest, negativeOrigin);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {quat4} q Rotation quaternion
 * @param {ReadonlyVec3} v Translation vector
 * @param {ReadonlyVec3} s Scaling vector
 * @param {ReadonlyVec3} o The origin vector around which to scale and rotate
 * @returns {mat4} out
 */

function fromRotationTranslationScaleOrigin(out, q, v, s, o) {
  // Quaternion math
  var x = q[0],
    y = q[1],
    z = q[2],
    w = q[3];
  var x2 = x + x;
  var y2 = y + y;
  var z2 = z + z;
  var xx = x * x2;
  var xy = x * y2;
  var xz = x * z2;
  var yy = y * y2;
  var yz = y * z2;
  var zz = z * z2;
  var wx = w * x2;
  var wy = w * y2;
  var wz = w * z2;
  var sx = s[0];
  var sy = s[1];
  var sz = s[2];
  var ox = o[0];
  var oy = o[1];
  var oz = o[2];
  var out0 = (1 - (yy + zz)) * sx;
  var out1 = (xy + wz) * sx;
  var out2 = (xz - wy) * sx;
  var out4 = (xy - wz) * sy;
  var out5 = (1 - (xx + zz)) * sy;
  var out6 = (yz + wx) * sy;
  var out8 = (xz + wy) * sz;
  var out9 = (yz - wx) * sz;
  var out10 = (1 - (xx + yy)) * sz;
  out[0] = out0;
  out[1] = out1;
  out[2] = out2;
  out[3] = 0;
  out[4] = out4;
  out[5] = out5;
  out[6] = out6;
  out[7] = 0;
  out[8] = out8;
  out[9] = out9;
  out[10] = out10;
  out[11] = 0;
  out[12] = v[0] + ox - (out0 * ox + out4 * oy + out8 * oz);
  out[13] = v[1] + oy - (out1 * ox + out5 * oy + out9 * oz);
  out[14] = v[2] + oz - (out2 * ox + out6 * oy + out10 * oz);
  out[15] = 1;
  return out;
}
/**
 * Calculates a 4x4 matrix from the given quaternion
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {ReadonlyQuat} q Quaternion to create matrix from
 *
 * @returns {mat4} out
 */

function fromQuat(out, q) {
  var x = q[0],
    y = q[1],
    z = q[2],
    w = q[3];
  var x2 = x + x;
  var y2 = y + y;
  var z2 = z + z;
  var xx = x * x2;
  var yx = y * x2;
  var yy = y * y2;
  var zx = z * x2;
  var zy = z * y2;
  var zz = z * z2;
  var wx = w * x2;
  var wy = w * y2;
  var wz = w * z2;
  out[0] = 1 - yy - zz;
  out[1] = yx + wz;
  out[2] = zx - wy;
  out[3] = 0;
  out[4] = yx - wz;
  out[5] = 1 - xx - zz;
  out[6] = zy + wx;
  out[7] = 0;
  out[8] = zx + wy;
  out[9] = zy - wx;
  out[10] = 1 - xx - yy;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}
/**
 * Generates a frustum matrix with the given bounds
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {Number} left Left bound of the frustum
 * @param {Number} right Right bound of the frustum
 * @param {Number} bottom Bottom bound of the frustum
 * @param {Number} top Top bound of the frustum
 * @param {Number} near Near bound of the frustum
 * @param {Number} far Far bound of the frustum
 * @returns {mat4} out
 */

function frustum(out, left, right, bottom, top, near, far) {
  var rl = 1 / (right - left);
  var tb = 1 / (top - bottom);
  var nf = 1 / (near - far);
  out[0] = near * 2 * rl;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = near * 2 * tb;
  out[6] = 0;
  out[7] = 0;
  out[8] = (right + left) * rl;
  out[9] = (top + bottom) * tb;
  out[10] = (far + near) * nf;
  out[11] = -1;
  out[12] = 0;
  out[13] = 0;
  out[14] = far * near * 2 * nf;
  out[15] = 0;
  return out;
}
/**
 * Generates a perspective projection matrix with the given bounds.
 * The near/far clip planes correspond to a normalized device coordinate Z range of [-1, 1],
 * which matches WebGL/OpenGL's clip volume.
 * Passing null/undefined/no value for far will generate infinite projection matrix.
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {number} fovy Vertical field of view in radians
 * @param {number} aspect Aspect ratio. typically viewport width/height
 * @param {number} near Near bound of the frustum
 * @param {number} far Far bound of the frustum, can be null or Infinity
 * @returns {mat4} out
 */

function perspectiveNO(out, fovy, aspect, near, far) {
  var f = 1.0 / Math.tan(fovy / 2),
    nf;
  out[0] = f / aspect;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = f;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[11] = -1;
  out[12] = 0;
  out[13] = 0;
  out[15] = 0;

  if (far != null && far !== Infinity) {
    nf = 1 / (near - far);
    out[10] = (far + near) * nf;
    out[14] = 2 * far * near * nf;
  } else {
    out[10] = -1;
    out[14] = -2 * near;
  }

  return out;
}
/**
 * Alias for {@link mat4.perspectiveNO}
 * @function
 */

var perspective = perspectiveNO;
/**
 * Generates a perspective projection matrix suitable for WebGPU with the given bounds.
 * The near/far clip planes correspond to a normalized device coordinate Z range of [0, 1],
 * which matches WebGPU/Vulkan/DirectX/Metal's clip volume.
 * Passing null/undefined/no value for far will generate infinite projection matrix.
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {number} fovy Vertical field of view in radians
 * @param {number} aspect Aspect ratio. typically viewport width/height
 * @param {number} near Near bound of the frustum
 * @param {number} far Far bound of the frustum, can be null or Infinity
 * @returns {mat4} out
 */

function perspectiveZO(out, fovy, aspect, near, far) {
  var f = 1.0 / Math.tan(fovy / 2),
    nf;
  out[0] = f / aspect;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = f;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[11] = -1;
  out[12] = 0;
  out[13] = 0;
  out[15] = 0;

  if (far != null && far !== Infinity) {
    nf = 1 / (near - far);
    out[10] = far * nf;
    out[14] = far * near * nf;
  } else {
    out[10] = -1;
    out[14] = -near;
  }

  return out;
}
/**
 * Generates a perspective projection matrix with the given field of view.
 * This is primarily useful for generating projection matrices to be used
 * with the still experiemental WebVR API.
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {Object} fov Object containing the following values: upDegrees, downDegrees, leftDegrees, rightDegrees
 * @param {number} near Near bound of the frustum
 * @param {number} far Far bound of the frustum
 * @returns {mat4} out
 */

function perspectiveFromFieldOfView(out, fov, near, far) {
  var upTan = Math.tan((fov.upDegrees * Math.PI) / 180.0);
  var downTan = Math.tan((fov.downDegrees * Math.PI) / 180.0);
  var leftTan = Math.tan((fov.leftDegrees * Math.PI) / 180.0);
  var rightTan = Math.tan((fov.rightDegrees * Math.PI) / 180.0);
  var xScale = 2.0 / (leftTan + rightTan);
  var yScale = 2.0 / (upTan + downTan);
  out[0] = xScale;
  out[1] = 0.0;
  out[2] = 0.0;
  out[3] = 0.0;
  out[4] = 0.0;
  out[5] = yScale;
  out[6] = 0.0;
  out[7] = 0.0;
  out[8] = -((leftTan - rightTan) * xScale * 0.5);
  out[9] = (upTan - downTan) * yScale * 0.5;
  out[10] = far / (near - far);
  out[11] = -1.0;
  out[12] = 0.0;
  out[13] = 0.0;
  out[14] = (far * near) / (near - far);
  out[15] = 0.0;
  return out;
}
/**
 * Generates a orthogonal projection matrix with the given bounds.
 * The near/far clip planes correspond to a normalized device coordinate Z range of [-1, 1],
 * which matches WebGL/OpenGL's clip volume.
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {number} left Left bound of the frustum
 * @param {number} right Right bound of the frustum
 * @param {number} bottom Bottom bound of the frustum
 * @param {number} top Top bound of the frustum
 * @param {number} near Near bound of the frustum
 * @param {number} far Far bound of the frustum
 * @returns {mat4} out
 */

function orthoNO(out, left, right, bottom, top, near, far) {
  var lr = 1 / (left - right);
  var bt = 1 / (bottom - top);
  var nf = 1 / (near - far);
  out[0] = -2 * lr;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = -2 * bt;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = 2 * nf;
  out[11] = 0;
  out[12] = (left + right) * lr;
  out[13] = (top + bottom) * bt;
  out[14] = (far + near) * nf;
  out[15] = 1;
  return out;
}
/**
 * Alias for {@link mat4.orthoNO}
 * @function
 */

var ortho = orthoNO;
/**
 * Generates a orthogonal projection matrix with the given bounds.
 * The near/far clip planes correspond to a normalized device coordinate Z range of [0, 1],
 * which matches WebGPU/Vulkan/DirectX/Metal's clip volume.
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {number} left Left bound of the frustum
 * @param {number} right Right bound of the frustum
 * @param {number} bottom Bottom bound of the frustum
 * @param {number} top Top bound of the frustum
 * @param {number} near Near bound of the frustum
 * @param {number} far Far bound of the frustum
 * @returns {mat4} out
 */

function orthoZO(out, left, right, bottom, top, near, far) {
  var lr = 1 / (left - right);
  var bt = 1 / (bottom - top);
  var nf = 1 / (near - far);
  out[0] = -2 * lr;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = -2 * bt;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = nf;
  out[11] = 0;
  out[12] = (left + right) * lr;
  out[13] = (top + bottom) * bt;
  out[14] = near * nf;
  out[15] = 1;
  return out;
}
/**
 * Generates a look-at matrix with the given eye position, focal point, and up axis.
 * If you want a matrix that actually makes an object look at another object, you should use targetTo instead.
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {ReadonlyVec3} eye Position of the viewer
 * @param {ReadonlyVec3} center Point the viewer is looking at
 * @param {ReadonlyVec3} up vec3 pointing up
 * @returns {mat4} out
 */

function lookAt(out, eye, center, up) {
  var x0, x1, x2, y0, y1, y2, z0, z1, z2, len;
  var eyex = eye[0];
  var eyey = eye[1];
  var eyez = eye[2];
  var upx = up[0];
  var upy = up[1];
  var upz = up[2];
  var centerx = center[0];
  var centery = center[1];
  var centerz = center[2];

  if (
    Math.abs(eyex - centerx) < EPSILON &&
    Math.abs(eyey - centery) < EPSILON &&
    Math.abs(eyez - centerz) < EPSILON
  ) {
    return identity(out);
  }

  z0 = eyex - centerx;
  z1 = eyey - centery;
  z2 = eyez - centerz;
  len = 1 / Math.hypot(z0, z1, z2);
  z0 *= len;
  z1 *= len;
  z2 *= len;
  x0 = upy * z2 - upz * z1;
  x1 = upz * z0 - upx * z2;
  x2 = upx * z1 - upy * z0;
  len = Math.hypot(x0, x1, x2);

  if (!len) {
    x0 = 0;
    x1 = 0;
    x2 = 0;
  } else {
    len = 1 / len;
    x0 *= len;
    x1 *= len;
    x2 *= len;
  }

  y0 = z1 * x2 - z2 * x1;
  y1 = z2 * x0 - z0 * x2;
  y2 = z0 * x1 - z1 * x0;
  len = Math.hypot(y0, y1, y2);

  if (!len) {
    y0 = 0;
    y1 = 0;
    y2 = 0;
  } else {
    len = 1 / len;
    y0 *= len;
    y1 *= len;
    y2 *= len;
  }

  out[0] = x0;
  out[1] = y0;
  out[2] = z0;
  out[3] = 0;
  out[4] = x1;
  out[5] = y1;
  out[6] = z1;
  out[7] = 0;
  out[8] = x2;
  out[9] = y2;
  out[10] = z2;
  out[11] = 0;
  out[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
  out[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
  out[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
  out[15] = 1;
  return out;
}
/**
 * Generates a matrix that makes something look at something else.
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {ReadonlyVec3} eye Position of the viewer
 * @param {ReadonlyVec3} center Point the viewer is looking at
 * @param {ReadonlyVec3} up vec3 pointing up
 * @returns {mat4} out
 */

function targetTo(out, eye, target, up) {
  var eyex = eye[0],
    eyey = eye[1],
    eyez = eye[2],
    upx = up[0],
    upy = up[1],
    upz = up[2];
  var z0 = eyex - target[0],
    z1 = eyey - target[1],
    z2 = eyez - target[2];
  var len = z0 * z0 + z1 * z1 + z2 * z2;

  if (len > 0) {
    len = 1 / Math.sqrt(len);
    z0 *= len;
    z1 *= len;
    z2 *= len;
  }

  var x0 = upy * z2 - upz * z1,
    x1 = upz * z0 - upx * z2,
    x2 = upx * z1 - upy * z0;
  len = x0 * x0 + x1 * x1 + x2 * x2;

  if (len > 0) {
    len = 1 / Math.sqrt(len);
    x0 *= len;
    x1 *= len;
    x2 *= len;
  }

  out[0] = x0;
  out[1] = x1;
  out[2] = x2;
  out[3] = 0;
  out[4] = z1 * x2 - z2 * x1;
  out[5] = z2 * x0 - z0 * x2;
  out[6] = z0 * x1 - z1 * x0;
  out[7] = 0;
  out[8] = z0;
  out[9] = z1;
  out[10] = z2;
  out[11] = 0;
  out[12] = eyex;
  out[13] = eyey;
  out[14] = eyez;
  out[15] = 1;
  return out;
}
/**
 * Returns a string representation of a mat4
 *
 * @param {ReadonlyMat4} a matrix to represent as a string
 * @returns {String} string representation of the matrix
 */

function str$2(a) {
  return (
    "mat4(" +
    a[0] +
    ", " +
    a[1] +
    ", " +
    a[2] +
    ", " +
    a[3] +
    ", " +
    a[4] +
    ", " +
    a[5] +
    ", " +
    a[6] +
    ", " +
    a[7] +
    ", " +
    a[8] +
    ", " +
    a[9] +
    ", " +
    a[10] +
    ", " +
    a[11] +
    ", " +
    a[12] +
    ", " +
    a[13] +
    ", " +
    a[14] +
    ", " +
    a[15] +
    ")"
  );
}
/**
 * Returns Frobenius norm of a mat4
 *
 * @param {ReadonlyMat4} a the matrix to calculate Frobenius norm of
 * @returns {Number} Frobenius norm
 */

function frob(a) {
  return Math.hypot(
    a[0],
    a[1],
    a[2],
    a[3],
    a[4],
    a[5],
    a[6],
    a[7],
    a[8],
    a[9],
    a[10],
    a[11],
    a[12],
    a[13],
    a[14],
    a[15]
  );
}
/**
 * Adds two mat4's
 *
 * @param {mat4} out the receiving matrix
 * @param {ReadonlyMat4} a the first operand
 * @param {ReadonlyMat4} b the second operand
 * @returns {mat4} out
 */

function add$2(out, a, b) {
  out[0] = a[0] + b[0];
  out[1] = a[1] + b[1];
  out[2] = a[2] + b[2];
  out[3] = a[3] + b[3];
  out[4] = a[4] + b[4];
  out[5] = a[5] + b[5];
  out[6] = a[6] + b[6];
  out[7] = a[7] + b[7];
  out[8] = a[8] + b[8];
  out[9] = a[9] + b[9];
  out[10] = a[10] + b[10];
  out[11] = a[11] + b[11];
  out[12] = a[12] + b[12];
  out[13] = a[13] + b[13];
  out[14] = a[14] + b[14];
  out[15] = a[15] + b[15];
  return out;
}
/**
 * Subtracts matrix b from matrix a
 *
 * @param {mat4} out the receiving matrix
 * @param {ReadonlyMat4} a the first operand
 * @param {ReadonlyMat4} b the second operand
 * @returns {mat4} out
 */

function subtract$2(out, a, b) {
  out[0] = a[0] - b[0];
  out[1] = a[1] - b[1];
  out[2] = a[2] - b[2];
  out[3] = a[3] - b[3];
  out[4] = a[4] - b[4];
  out[5] = a[5] - b[5];
  out[6] = a[6] - b[6];
  out[7] = a[7] - b[7];
  out[8] = a[8] - b[8];
  out[9] = a[9] - b[9];
  out[10] = a[10] - b[10];
  out[11] = a[11] - b[11];
  out[12] = a[12] - b[12];
  out[13] = a[13] - b[13];
  out[14] = a[14] - b[14];
  out[15] = a[15] - b[15];
  return out;
}
/**
 * Multiply each element of the matrix by a scalar.
 *
 * @param {mat4} out the receiving matrix
 * @param {ReadonlyMat4} a the matrix to scale
 * @param {Number} b amount to scale the matrix's elements by
 * @returns {mat4} out
 */

function multiplyScalar(out, a, b) {
  out[0] = a[0] * b;
  out[1] = a[1] * b;
  out[2] = a[2] * b;
  out[3] = a[3] * b;
  out[4] = a[4] * b;
  out[5] = a[5] * b;
  out[6] = a[6] * b;
  out[7] = a[7] * b;
  out[8] = a[8] * b;
  out[9] = a[9] * b;
  out[10] = a[10] * b;
  out[11] = a[11] * b;
  out[12] = a[12] * b;
  out[13] = a[13] * b;
  out[14] = a[14] * b;
  out[15] = a[15] * b;
  return out;
}
/**
 * Adds two mat4's after multiplying each element of the second operand by a scalar value.
 *
 * @param {mat4} out the receiving vector
 * @param {ReadonlyMat4} a the first operand
 * @param {ReadonlyMat4} b the second operand
 * @param {Number} scale the amount to scale b's elements by before adding
 * @returns {mat4} out
 */

function multiplyScalarAndAdd(out, a, b, scale) {
  out[0] = a[0] + b[0] * scale;
  out[1] = a[1] + b[1] * scale;
  out[2] = a[2] + b[2] * scale;
  out[3] = a[3] + b[3] * scale;
  out[4] = a[4] + b[4] * scale;
  out[5] = a[5] + b[5] * scale;
  out[6] = a[6] + b[6] * scale;
  out[7] = a[7] + b[7] * scale;
  out[8] = a[8] + b[8] * scale;
  out[9] = a[9] + b[9] * scale;
  out[10] = a[10] + b[10] * scale;
  out[11] = a[11] + b[11] * scale;
  out[12] = a[12] + b[12] * scale;
  out[13] = a[13] + b[13] * scale;
  out[14] = a[14] + b[14] * scale;
  out[15] = a[15] + b[15] * scale;
  return out;
}
/**
 * Returns whether or not the matrices have exactly the same elements in the same position (when compared with ===)
 *
 * @param {ReadonlyMat4} a The first matrix.
 * @param {ReadonlyMat4} b The second matrix.
 * @returns {Boolean} True if the matrices are equal, false otherwise.
 */

function exactEquals$2(a, b) {
  return (
    a[0] === b[0] &&
    a[1] === b[1] &&
    a[2] === b[2] &&
    a[3] === b[3] &&
    a[4] === b[4] &&
    a[5] === b[5] &&
    a[6] === b[6] &&
    a[7] === b[7] &&
    a[8] === b[8] &&
    a[9] === b[9] &&
    a[10] === b[10] &&
    a[11] === b[11] &&
    a[12] === b[12] &&
    a[13] === b[13] &&
    a[14] === b[14] &&
    a[15] === b[15]
  );
}
/**
 * Returns whether or not the matrices have approximately the same elements in the same position.
 *
 * @param {ReadonlyMat4} a The first matrix.
 * @param {ReadonlyMat4} b The second matrix.
 * @returns {Boolean} True if the matrices are equal, false otherwise.
 */

function equals$2(a, b) {
  var a0 = a[0],
    a1 = a[1],
    a2 = a[2],
    a3 = a[3];
  var a4 = a[4],
    a5 = a[5],
    a6 = a[6],
    a7 = a[7];
  var a8 = a[8],
    a9 = a[9],
    a10 = a[10],
    a11 = a[11];
  var a12 = a[12],
    a13 = a[13],
    a14 = a[14],
    a15 = a[15];
  var b0 = b[0],
    b1 = b[1],
    b2 = b[2],
    b3 = b[3];
  var b4 = b[4],
    b5 = b[5],
    b6 = b[6],
    b7 = b[7];
  var b8 = b[8],
    b9 = b[9],
    b10 = b[10],
    b11 = b[11];
  var b12 = b[12],
    b13 = b[13],
    b14 = b[14],
    b15 = b[15];
  return (
    Math.abs(a0 - b0) <= EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) &&
    Math.abs(a1 - b1) <= EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)) &&
    Math.abs(a2 - b2) <= EPSILON * Math.max(1.0, Math.abs(a2), Math.abs(b2)) &&
    Math.abs(a3 - b3) <= EPSILON * Math.max(1.0, Math.abs(a3), Math.abs(b3)) &&
    Math.abs(a4 - b4) <= EPSILON * Math.max(1.0, Math.abs(a4), Math.abs(b4)) &&
    Math.abs(a5 - b5) <= EPSILON * Math.max(1.0, Math.abs(a5), Math.abs(b5)) &&
    Math.abs(a6 - b6) <= EPSILON * Math.max(1.0, Math.abs(a6), Math.abs(b6)) &&
    Math.abs(a7 - b7) <= EPSILON * Math.max(1.0, Math.abs(a7), Math.abs(b7)) &&
    Math.abs(a8 - b8) <= EPSILON * Math.max(1.0, Math.abs(a8), Math.abs(b8)) &&
    Math.abs(a9 - b9) <= EPSILON * Math.max(1.0, Math.abs(a9), Math.abs(b9)) &&
    Math.abs(a10 - b10) <=
      EPSILON * Math.max(1.0, Math.abs(a10), Math.abs(b10)) &&
    Math.abs(a11 - b11) <=
      EPSILON * Math.max(1.0, Math.abs(a11), Math.abs(b11)) &&
    Math.abs(a12 - b12) <=
      EPSILON * Math.max(1.0, Math.abs(a12), Math.abs(b12)) &&
    Math.abs(a13 - b13) <=
      EPSILON * Math.max(1.0, Math.abs(a13), Math.abs(b13)) &&
    Math.abs(a14 - b14) <=
      EPSILON * Math.max(1.0, Math.abs(a14), Math.abs(b14)) &&
    Math.abs(a15 - b15) <= EPSILON * Math.max(1.0, Math.abs(a15), Math.abs(b15))
  );
}
/**
 * Alias for {@link mat4.multiply}
 * @function
 */

var mul$2 = multiply$3;
/**
 * Alias for {@link mat4.subtract}
 * @function
 */

var sub$2 = subtract$2;

var mat4 = /*#__PURE__*/ Object.freeze({
  __proto__: null,
  create: create$2,
  clone: clone$2,
  copy: copy$3,
  fromValues: fromValues$2,
  set: set$2,
  identity: identity,
  transpose: transpose,
  invert: invert,
  adjoint: adjoint,
  determinant: determinant,
  multiply: multiply$3,
  translate: translate,
  scale: scale$2,
  rotate: rotate$1,
  rotateX: rotateX,
  rotateY: rotateY,
  rotateZ: rotateZ,
  fromTranslation: fromTranslation,
  fromScaling: fromScaling,
  fromRotation: fromRotation,
  fromXRotation: fromXRotation,
  fromYRotation: fromYRotation,
  fromZRotation: fromZRotation,
  fromRotationTranslation: fromRotationTranslation,
  fromQuat2: fromQuat2,
  getTranslation: getTranslation,
  getScaling: getScaling,
  getRotation: getRotation,
  fromRotationTranslationScale: fromRotationTranslationScale,
  fromRotationTranslationScaleOrigin: fromRotationTranslationScaleOrigin,
  fromQuat: fromQuat,
  frustum: frustum,
  perspectiveNO: perspectiveNO,
  perspective: perspective,
  perspectiveZO: perspectiveZO,
  perspectiveFromFieldOfView: perspectiveFromFieldOfView,
  orthoNO: orthoNO,
  ortho: ortho,
  orthoZO: orthoZO,
  lookAt: lookAt,
  targetTo: targetTo,
  str: str$2,
  frob: frob,
  add: add$2,
  subtract: subtract$2,
  multiplyScalar: multiplyScalar,
  multiplyScalarAndAdd: multiplyScalarAndAdd,
  exactEquals: exactEquals$2,
  equals: equals$2,
  mul: mul$2,
  sub: sub$2,
});

/**
 * 2 Dimensional Vector
 * @module vec2
 */

/**
 * Creates a new, empty vec2
 *
 * @returns {vec2} a new 2D vector
 */

function create$1() {
  var out = new ARRAY_TYPE(2);

  if (ARRAY_TYPE != Float32Array) {
    out[0] = 0;
    out[1] = 0;
  }

  return out;
}
/**
 * Creates a new vec2 initialized with values from an existing vector
 *
 * @param {ReadonlyVec2} a vector to clone
 * @returns {vec2} a new 2D vector
 */

function clone$1(a) {
  var out = new ARRAY_TYPE(2);
  out[0] = a[0];
  out[1] = a[1];
  return out;
}
/**
 * Creates a new vec2 initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @returns {vec2} a new 2D vector
 */

function fromValues$1(x, y) {
  var out = new ARRAY_TYPE(2);
  out[0] = x;
  out[1] = y;
  return out;
}
/**
 * Copy the values from one vec2 to another
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a the source vector
 * @returns {vec2} out
 */

function copy$2(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  return out;
}
/**
 * Set the components of a vec2 to the given values
 *
 * @param {vec2} out the receiving vector
 * @param {Number} x X component
 * @param {Number} y Y component
 * @returns {vec2} out
 */

function set$1(out, x, y) {
  out[0] = x;
  out[1] = y;
  return out;
}
/**
 * Adds two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a the first operand
 * @param {ReadonlyVec2} b the second operand
 * @returns {vec2} out
 */

function add$1(out, a, b) {
  out[0] = a[0] + b[0];
  out[1] = a[1] + b[1];
  return out;
}
/**
 * Subtracts vector b from vector a
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a the first operand
 * @param {ReadonlyVec2} b the second operand
 * @returns {vec2} out
 */

function subtract$1(out, a, b) {
  out[0] = a[0] - b[0];
  out[1] = a[1] - b[1];
  return out;
}
/**
 * Multiplies two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a the first operand
 * @param {ReadonlyVec2} b the second operand
 * @returns {vec2} out
 */

function multiply$2(out, a, b) {
  out[0] = a[0] * b[0];
  out[1] = a[1] * b[1];
  return out;
}
/**
 * Divides two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a the first operand
 * @param {ReadonlyVec2} b the second operand
 * @returns {vec2} out
 */

function divide$1(out, a, b) {
  out[0] = a[0] / b[0];
  out[1] = a[1] / b[1];
  return out;
}
/**
 * Math.ceil the components of a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a vector to ceil
 * @returns {vec2} out
 */

function ceil$2(out, a) {
  out[0] = Math.ceil(a[0]);
  out[1] = Math.ceil(a[1]);
  return out;
}
/**
 * Math.floor the components of a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a vector to floor
 * @returns {vec2} out
 */

function floor$4(out, a) {
  out[0] = Math.floor(a[0]);
  out[1] = Math.floor(a[1]);
  return out;
}
/**
 * Returns the minimum of two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a the first operand
 * @param {ReadonlyVec2} b the second operand
 * @returns {vec2} out
 */

function min$2(out, a, b) {
  out[0] = Math.min(a[0], b[0]);
  out[1] = Math.min(a[1], b[1]);
  return out;
}
/**
 * Returns the maximum of two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a the first operand
 * @param {ReadonlyVec2} b the second operand
 * @returns {vec2} out
 */

function max$1(out, a, b) {
  out[0] = Math.max(a[0], b[0]);
  out[1] = Math.max(a[1], b[1]);
  return out;
}
/**
 * Math.round the components of a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a vector to round
 * @returns {vec2} out
 */

function round$4(out, a) {
  out[0] = Math.round(a[0]);
  out[1] = Math.round(a[1]);
  return out;
}
/**
 * Scales a vec2 by a scalar number
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {vec2} out
 */

function scale$1(out, a, b) {
  out[0] = a[0] * b;
  out[1] = a[1] * b;
  return out;
}
/**
 * Adds two vec2's after scaling the second operand by a scalar value
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a the first operand
 * @param {ReadonlyVec2} b the second operand
 * @param {Number} scale the amount to scale b by before adding
 * @returns {vec2} out
 */

function scaleAndAdd$1(out, a, b, scale) {
  out[0] = a[0] + b[0] * scale;
  out[1] = a[1] + b[1] * scale;
  return out;
}
/**
 * Calculates the euclidian distance between two vec2's
 *
 * @param {ReadonlyVec2} a the first operand
 * @param {ReadonlyVec2} b the second operand
 * @returns {Number} distance between a and b
 */

function distance$1(a, b) {
  var x = b[0] - a[0],
    y = b[1] - a[1];
  return Math.hypot(x, y);
}
/**
 * Calculates the squared euclidian distance between two vec2's
 *
 * @param {ReadonlyVec2} a the first operand
 * @param {ReadonlyVec2} b the second operand
 * @returns {Number} squared distance between a and b
 */

function squaredDistance$1(a, b) {
  var x = b[0] - a[0],
    y = b[1] - a[1];
  return x * x + y * y;
}
/**
 * Calculates the length of a vec2
 *
 * @param {ReadonlyVec2} a vector to calculate length of
 * @returns {Number} length of a
 */

function length$1(a) {
  var x = a[0],
    y = a[1];
  return Math.hypot(x, y);
}
/**
 * Calculates the squared length of a vec2
 *
 * @param {ReadonlyVec2} a vector to calculate squared length of
 * @returns {Number} squared length of a
 */

function squaredLength$1(a) {
  var x = a[0],
    y = a[1];
  return x * x + y * y;
}
/**
 * Negates the components of a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a vector to negate
 * @returns {vec2} out
 */

function negate$1(out, a) {
  out[0] = -a[0];
  out[1] = -a[1];
  return out;
}
/**
 * Returns the inverse of the components of a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a vector to invert
 * @returns {vec2} out
 */

function inverse$1(out, a) {
  out[0] = 1.0 / a[0];
  out[1] = 1.0 / a[1];
  return out;
}
/**
 * Normalize a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a vector to normalize
 * @returns {vec2} out
 */

function normalize$1(out, a) {
  var x = a[0],
    y = a[1];
  var len = x * x + y * y;

  if (len > 0) {
    //TODO: evaluate use of glm_invsqrt here?
    len = 1 / Math.sqrt(len);
  }

  out[0] = a[0] * len;
  out[1] = a[1] * len;
  return out;
}
/**
 * Calculates the dot product of two vec2's
 *
 * @param {ReadonlyVec2} a the first operand
 * @param {ReadonlyVec2} b the second operand
 * @returns {Number} dot product of a and b
 */

function dot$1(a, b) {
  return a[0] * b[0] + a[1] * b[1];
}
/**
 * Computes the cross product of two vec2's
 * Note that the cross product must by definition produce a 3D vector
 *
 * @param {vec3} out the receiving vector
 * @param {ReadonlyVec2} a the first operand
 * @param {ReadonlyVec2} b the second operand
 * @returns {vec3} out
 */

function cross$1(out, a, b) {
  var z = a[0] * b[1] - a[1] * b[0];
  out[0] = out[1] = 0;
  out[2] = z;
  return out;
}
/**
 * Performs a linear interpolation between two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a the first operand
 * @param {ReadonlyVec2} b the second operand
 * @param {Number} t interpolation amount, in the range [0-1], between the two inputs
 * @returns {vec2} out
 */

function lerp$2(out, a, b, t) {
  var ax = a[0],
    ay = a[1];
  out[0] = ax + t * (b[0] - ax);
  out[1] = ay + t * (b[1] - ay);
  return out;
}
/**
 * Generates a random vector with the given scale
 *
 * @param {vec2} out the receiving vector
 * @param {Number} [scale] Length of the resulting vector. If ommitted, a unit vector will be returned
 * @returns {vec2} out
 */

function random$1(out, scale) {
  scale = scale || 1.0;
  var r = RANDOM() * 2.0 * Math.PI;
  out[0] = Math.cos(r) * scale;
  out[1] = Math.sin(r) * scale;
  return out;
}
/**
 * Transforms the vec2 with a mat2
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a the vector to transform
 * @param {ReadonlyMat2} m matrix to transform with
 * @returns {vec2} out
 */

function transformMat2(out, a, m) {
  var x = a[0],
    y = a[1];
  out[0] = m[0] * x + m[2] * y;
  out[1] = m[1] * x + m[3] * y;
  return out;
}
/**
 * Transforms the vec2 with a mat2d
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a the vector to transform
 * @param {ReadonlyMat2d} m matrix to transform with
 * @returns {vec2} out
 */

function transformMat2d(out, a, m) {
  var x = a[0],
    y = a[1];
  out[0] = m[0] * x + m[2] * y + m[4];
  out[1] = m[1] * x + m[3] * y + m[5];
  return out;
}
/**
 * Transforms the vec2 with a mat3
 * 3rd vector component is implicitly '1'
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a the vector to transform
 * @param {ReadonlyMat3} m matrix to transform with
 * @returns {vec2} out
 */

function transformMat3(out, a, m) {
  var x = a[0],
    y = a[1];
  out[0] = m[0] * x + m[3] * y + m[6];
  out[1] = m[1] * x + m[4] * y + m[7];
  return out;
}
/**
 * Transforms the vec2 with a mat4
 * 3rd vector component is implicitly '0'
 * 4th vector component is implicitly '1'
 *
 * @param {vec2} out the receiving vector
 * @param {ReadonlyVec2} a the vector to transform
 * @param {ReadonlyMat4} m matrix to transform with
 * @returns {vec2} out
 */

function transformMat4$1(out, a, m) {
  var x = a[0];
  var y = a[1];
  out[0] = m[0] * x + m[4] * y + m[12];
  out[1] = m[1] * x + m[5] * y + m[13];
  return out;
}
/**
 * Rotate a 2D vector
 * @param {vec2} out The receiving vec2
 * @param {ReadonlyVec2} a The vec2 point to rotate
 * @param {ReadonlyVec2} b The origin of the rotation
 * @param {Number} rad The angle of rotation in radians
 * @returns {vec2} out
 */

function rotate(out, a, b, rad) {
  //Translate point to the origin
  var p0 = a[0] - b[0],
    p1 = a[1] - b[1],
    sinC = Math.sin(rad),
    cosC = Math.cos(rad); //perform rotation and translate to correct position

  out[0] = p0 * cosC - p1 * sinC + b[0];
  out[1] = p0 * sinC + p1 * cosC + b[1];
  return out;
}
/**
 * Get the angle between two 2D vectors
 * @param {ReadonlyVec2} a The first operand
 * @param {ReadonlyVec2} b The second operand
 * @returns {Number} The angle in radians
 */

function angle(a, b) {
  var x1 = a[0],
    y1 = a[1],
    x2 = b[0],
    y2 = b[1],
    // mag is the product of the magnitudes of a and b
    mag = Math.sqrt(x1 * x1 + y1 * y1) * Math.sqrt(x2 * x2 + y2 * y2),
    // mag &&.. short circuits if mag == 0
    cosine = mag && (x1 * x2 + y1 * y2) / mag; // Math.min(Math.max(cosine, -1), 1) clamps the cosine between -1 and 1

  return Math.acos(Math.min(Math.max(cosine, -1), 1));
}
/**
 * Set the components of a vec2 to zero
 *
 * @param {vec2} out the receiving vector
 * @returns {vec2} out
 */

function zero$1(out) {
  out[0] = 0.0;
  out[1] = 0.0;
  return out;
}
/**
 * Returns a string representation of a vector
 *
 * @param {ReadonlyVec2} a vector to represent as a string
 * @returns {String} string representation of the vector
 */

function str$1(a) {
  return "vec2(" + a[0] + ", " + a[1] + ")";
}
/**
 * Returns whether or not the vectors exactly have the same elements in the same position (when compared with ===)
 *
 * @param {ReadonlyVec2} a The first vector.
 * @param {ReadonlyVec2} b The second vector.
 * @returns {Boolean} True if the vectors are equal, false otherwise.
 */

function exactEquals$1(a, b) {
  return a[0] === b[0] && a[1] === b[1];
}
/**
 * Returns whether or not the vectors have approximately the same elements in the same position.
 *
 * @param {ReadonlyVec2} a The first vector.
 * @param {ReadonlyVec2} b The second vector.
 * @returns {Boolean} True if the vectors are equal, false otherwise.
 */

function equals$1(a, b) {
  var a0 = a[0],
    a1 = a[1];
  var b0 = b[0],
    b1 = b[1];
  return (
    Math.abs(a0 - b0) <= EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) &&
    Math.abs(a1 - b1) <= EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1))
  );
}
/**
 * Alias for {@link vec2.length}
 * @function
 */

var len$1 = length$1;
/**
 * Alias for {@link vec2.subtract}
 * @function
 */

var sub$1 = subtract$1;
/**
 * Alias for {@link vec2.multiply}
 * @function
 */

var mul$1 = multiply$2;
/**
 * Alias for {@link vec2.divide}
 * @function
 */

var div$1 = divide$1;
/**
 * Alias for {@link vec2.distance}
 * @function
 */

var dist$2 = distance$1;
/**
 * Alias for {@link vec2.squaredDistance}
 * @function
 */

var sqrDist$1 = squaredDistance$1;
/**
 * Alias for {@link vec2.squaredLength}
 * @function
 */

var sqrLen$1 = squaredLength$1;
/**
 * Perform some operation over an array of vec2s.
 *
 * @param {Array} a the array of vectors to iterate over
 * @param {Number} stride Number of elements between the start of each vec2. If 0 assumes tightly packed
 * @param {Number} offset Number of elements to skip at the beginning of the array
 * @param {Number} count Number of vec2s to iterate over. If 0 iterates over entire array
 * @param {Function} fn Function to call for each vector in the array
 * @param {Object} [arg] additional argument to pass to fn
 * @returns {Array} a
 * @function
 */

var forEach$1 = (function () {
  var vec = create$1();
  return function (a, stride, offset, count, fn, arg) {
    var i, l;

    if (!stride) {
      stride = 2;
    }

    if (!offset) {
      offset = 0;
    }

    if (count) {
      l = Math.min(count * stride + offset, a.length);
    } else {
      l = a.length;
    }

    for (i = offset; i < l; i += stride) {
      vec[0] = a[i];
      vec[1] = a[i + 1];
      fn(vec, vec, arg);
      a[i] = vec[0];
      a[i + 1] = vec[1];
    }

    return a;
  };
})();

var vec2 = /*#__PURE__*/ Object.freeze({
  __proto__: null,
  create: create$1,
  clone: clone$1,
  fromValues: fromValues$1,
  copy: copy$2,
  set: set$1,
  add: add$1,
  subtract: subtract$1,
  multiply: multiply$2,
  divide: divide$1,
  ceil: ceil$2,
  floor: floor$4,
  min: min$2,
  max: max$1,
  round: round$4,
  scale: scale$1,
  scaleAndAdd: scaleAndAdd$1,
  distance: distance$1,
  squaredDistance: squaredDistance$1,
  length: length$1,
  squaredLength: squaredLength$1,
  negate: negate$1,
  inverse: inverse$1,
  normalize: normalize$1,
  dot: dot$1,
  cross: cross$1,
  lerp: lerp$2,
  random: random$1,
  transformMat2: transformMat2,
  transformMat2d: transformMat2d,
  transformMat3: transformMat3,
  transformMat4: transformMat4$1,
  rotate: rotate,
  angle: angle,
  zero: zero$1,
  str: str$1,
  exactEquals: exactEquals$1,
  equals: equals$1,
  len: len$1,
  sub: sub$1,
  mul: mul$1,
  div: div$1,
  dist: dist$2,
  sqrDist: sqrDist$1,
  sqrLen: sqrLen$1,
  forEach: forEach$1,
});

/**
 * 4 Dimensional Vector
 * @module vec4
 */

/**
 * Creates a new, empty vec4
 *
 * @returns {vec4} a new 4D vector
 */

function create() {
  var out = new ARRAY_TYPE(4);

  if (ARRAY_TYPE != Float32Array) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
  }

  return out;
}
/**
 * Creates a new vec4 initialized with values from an existing vector
 *
 * @param {ReadonlyVec4} a vector to clone
 * @returns {vec4} a new 4D vector
 */

function clone(a) {
  var out = new ARRAY_TYPE(4);
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  return out;
}
/**
 * Creates a new vec4 initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {vec4} a new 4D vector
 */

function fromValues(x, y, z, w) {
  var out = new ARRAY_TYPE(4);
  out[0] = x;
  out[1] = y;
  out[2] = z;
  out[3] = w;
  return out;
}
/**
 * Copy the values from one vec4 to another
 *
 * @param {vec4} out the receiving vector
 * @param {ReadonlyVec4} a the source vector
 * @returns {vec4} out
 */

function copy$1(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  return out;
}
/**
 * Set the components of a vec4 to the given values
 *
 * @param {vec4} out the receiving vector
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {vec4} out
 */

function set(out, x, y, z, w) {
  out[0] = x;
  out[1] = y;
  out[2] = z;
  out[3] = w;
  return out;
}
/**
 * Adds two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {ReadonlyVec4} a the first operand
 * @param {ReadonlyVec4} b the second operand
 * @returns {vec4} out
 */

function add(out, a, b) {
  out[0] = a[0] + b[0];
  out[1] = a[1] + b[1];
  out[2] = a[2] + b[2];
  out[3] = a[3] + b[3];
  return out;
}
/**
 * Subtracts vector b from vector a
 *
 * @param {vec4} out the receiving vector
 * @param {ReadonlyVec4} a the first operand
 * @param {ReadonlyVec4} b the second operand
 * @returns {vec4} out
 */

function subtract(out, a, b) {
  out[0] = a[0] - b[0];
  out[1] = a[1] - b[1];
  out[2] = a[2] - b[2];
  out[3] = a[3] - b[3];
  return out;
}
/**
 * Multiplies two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {ReadonlyVec4} a the first operand
 * @param {ReadonlyVec4} b the second operand
 * @returns {vec4} out
 */

function multiply$1(out, a, b) {
  out[0] = a[0] * b[0];
  out[1] = a[1] * b[1];
  out[2] = a[2] * b[2];
  out[3] = a[3] * b[3];
  return out;
}
/**
 * Divides two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {ReadonlyVec4} a the first operand
 * @param {ReadonlyVec4} b the second operand
 * @returns {vec4} out
 */

function divide(out, a, b) {
  out[0] = a[0] / b[0];
  out[1] = a[1] / b[1];
  out[2] = a[2] / b[2];
  out[3] = a[3] / b[3];
  return out;
}
/**
 * Math.ceil the components of a vec4
 *
 * @param {vec4} out the receiving vector
 * @param {ReadonlyVec4} a vector to ceil
 * @returns {vec4} out
 */

function ceil$1(out, a) {
  out[0] = Math.ceil(a[0]);
  out[1] = Math.ceil(a[1]);
  out[2] = Math.ceil(a[2]);
  out[3] = Math.ceil(a[3]);
  return out;
}
/**
 * Math.floor the components of a vec4
 *
 * @param {vec4} out the receiving vector
 * @param {ReadonlyVec4} a vector to floor
 * @returns {vec4} out
 */

function floor$3(out, a) {
  out[0] = Math.floor(a[0]);
  out[1] = Math.floor(a[1]);
  out[2] = Math.floor(a[2]);
  out[3] = Math.floor(a[3]);
  return out;
}
/**
 * Returns the minimum of two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {ReadonlyVec4} a the first operand
 * @param {ReadonlyVec4} b the second operand
 * @returns {vec4} out
 */

function min$1(out, a, b) {
  out[0] = Math.min(a[0], b[0]);
  out[1] = Math.min(a[1], b[1]);
  out[2] = Math.min(a[2], b[2]);
  out[3] = Math.min(a[3], b[3]);
  return out;
}
/**
 * Returns the maximum of two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {ReadonlyVec4} a the first operand
 * @param {ReadonlyVec4} b the second operand
 * @returns {vec4} out
 */

function max(out, a, b) {
  out[0] = Math.max(a[0], b[0]);
  out[1] = Math.max(a[1], b[1]);
  out[2] = Math.max(a[2], b[2]);
  out[3] = Math.max(a[3], b[3]);
  return out;
}
/**
 * Math.round the components of a vec4
 *
 * @param {vec4} out the receiving vector
 * @param {ReadonlyVec4} a vector to round
 * @returns {vec4} out
 */

function round$3(out, a) {
  out[0] = Math.round(a[0]);
  out[1] = Math.round(a[1]);
  out[2] = Math.round(a[2]);
  out[3] = Math.round(a[3]);
  return out;
}
/**
 * Scales a vec4 by a scalar number
 *
 * @param {vec4} out the receiving vector
 * @param {ReadonlyVec4} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {vec4} out
 */

function scale(out, a, b) {
  out[0] = a[0] * b;
  out[1] = a[1] * b;
  out[2] = a[2] * b;
  out[3] = a[3] * b;
  return out;
}
/**
 * Adds two vec4's after scaling the second operand by a scalar value
 *
 * @param {vec4} out the receiving vector
 * @param {ReadonlyVec4} a the first operand
 * @param {ReadonlyVec4} b the second operand
 * @param {Number} scale the amount to scale b by before adding
 * @returns {vec4} out
 */

function scaleAndAdd(out, a, b, scale) {
  out[0] = a[0] + b[0] * scale;
  out[1] = a[1] + b[1] * scale;
  out[2] = a[2] + b[2] * scale;
  out[3] = a[3] + b[3] * scale;
  return out;
}
/**
 * Calculates the euclidian distance between two vec4's
 *
 * @param {ReadonlyVec4} a the first operand
 * @param {ReadonlyVec4} b the second operand
 * @returns {Number} distance between a and b
 */

function distance(a, b) {
  var x = b[0] - a[0];
  var y = b[1] - a[1];
  var z = b[2] - a[2];
  var w = b[3] - a[3];
  return Math.hypot(x, y, z, w);
}
/**
 * Calculates the squared euclidian distance between two vec4's
 *
 * @param {ReadonlyVec4} a the first operand
 * @param {ReadonlyVec4} b the second operand
 * @returns {Number} squared distance between a and b
 */

function squaredDistance(a, b) {
  var x = b[0] - a[0];
  var y = b[1] - a[1];
  var z = b[2] - a[2];
  var w = b[3] - a[3];
  return x * x + y * y + z * z + w * w;
}
/**
 * Calculates the length of a vec4
 *
 * @param {ReadonlyVec4} a vector to calculate length of
 * @returns {Number} length of a
 */

function length(a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  var w = a[3];
  return Math.hypot(x, y, z, w);
}
/**
 * Calculates the squared length of a vec4
 *
 * @param {ReadonlyVec4} a vector to calculate squared length of
 * @returns {Number} squared length of a
 */

function squaredLength(a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  var w = a[3];
  return x * x + y * y + z * z + w * w;
}
/**
 * Negates the components of a vec4
 *
 * @param {vec4} out the receiving vector
 * @param {ReadonlyVec4} a vector to negate
 * @returns {vec4} out
 */

function negate(out, a) {
  out[0] = -a[0];
  out[1] = -a[1];
  out[2] = -a[2];
  out[3] = -a[3];
  return out;
}
/**
 * Returns the inverse of the components of a vec4
 *
 * @param {vec4} out the receiving vector
 * @param {ReadonlyVec4} a vector to invert
 * @returns {vec4} out
 */

function inverse(out, a) {
  out[0] = 1.0 / a[0];
  out[1] = 1.0 / a[1];
  out[2] = 1.0 / a[2];
  out[3] = 1.0 / a[3];
  return out;
}
/**
 * Normalize a vec4
 *
 * @param {vec4} out the receiving vector
 * @param {ReadonlyVec4} a vector to normalize
 * @returns {vec4} out
 */

function normalize(out, a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  var w = a[3];
  var len = x * x + y * y + z * z + w * w;

  if (len > 0) {
    len = 1 / Math.sqrt(len);
  }

  out[0] = x * len;
  out[1] = y * len;
  out[2] = z * len;
  out[3] = w * len;
  return out;
}
/**
 * Calculates the dot product of two vec4's
 *
 * @param {ReadonlyVec4} a the first operand
 * @param {ReadonlyVec4} b the second operand
 * @returns {Number} dot product of a and b
 */

function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
}
/**
 * Returns the cross-product of three vectors in a 4-dimensional space
 *
 * @param {ReadonlyVec4} result the receiving vector
 * @param {ReadonlyVec4} U the first vector
 * @param {ReadonlyVec4} V the second vector
 * @param {ReadonlyVec4} W the third vector
 * @returns {vec4} result
 */

function cross(out, u, v, w) {
  var A = v[0] * w[1] - v[1] * w[0],
    B = v[0] * w[2] - v[2] * w[0],
    C = v[0] * w[3] - v[3] * w[0],
    D = v[1] * w[2] - v[2] * w[1],
    E = v[1] * w[3] - v[3] * w[1],
    F = v[2] * w[3] - v[3] * w[2];
  var G = u[0];
  var H = u[1];
  var I = u[2];
  var J = u[3];
  out[0] = H * F - I * E + J * D;
  out[1] = -(G * F) + I * C - J * B;
  out[2] = G * E - H * C + J * A;
  out[3] = -(G * D) + H * B - I * A;
  return out;
}
/**
 * Performs a linear interpolation between two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {ReadonlyVec4} a the first operand
 * @param {ReadonlyVec4} b the second operand
 * @param {Number} t interpolation amount, in the range [0-1], between the two inputs
 * @returns {vec4} out
 */

function lerp$1(out, a, b, t) {
  var ax = a[0];
  var ay = a[1];
  var az = a[2];
  var aw = a[3];
  out[0] = ax + t * (b[0] - ax);
  out[1] = ay + t * (b[1] - ay);
  out[2] = az + t * (b[2] - az);
  out[3] = aw + t * (b[3] - aw);
  return out;
}
/**
 * Generates a random vector with the given scale
 *
 * @param {vec4} out the receiving vector
 * @param {Number} [scale] Length of the resulting vector. If ommitted, a unit vector will be returned
 * @returns {vec4} out
 */

function random(out, scale) {
  scale = scale || 1.0; // Marsaglia, George. Choosing a Point from the Surface of a
  // Sphere. Ann. Math. Statist. 43 (1972), no. 2, 645--646.
  // http://projecteuclid.org/euclid.aoms/1177692644;

  var v1, v2, v3, v4;
  var s1, s2;

  do {
    v1 = RANDOM() * 2 - 1;
    v2 = RANDOM() * 2 - 1;
    s1 = v1 * v1 + v2 * v2;
  } while (s1 >= 1);

  do {
    v3 = RANDOM() * 2 - 1;
    v4 = RANDOM() * 2 - 1;
    s2 = v3 * v3 + v4 * v4;
  } while (s2 >= 1);

  var d = Math.sqrt((1 - s1) / s2);
  out[0] = scale * v1;
  out[1] = scale * v2;
  out[2] = scale * v3 * d;
  out[3] = scale * v4 * d;
  return out;
}
/**
 * Transforms the vec4 with a mat4.
 *
 * @param {vec4} out the receiving vector
 * @param {ReadonlyVec4} a the vector to transform
 * @param {ReadonlyMat4} m matrix to transform with
 * @returns {vec4} out
 */

function transformMat4(out, a, m) {
  var x = a[0],
    y = a[1],
    z = a[2],
    w = a[3];
  out[0] = m[0] * x + m[4] * y + m[8] * z + m[12] * w;
  out[1] = m[1] * x + m[5] * y + m[9] * z + m[13] * w;
  out[2] = m[2] * x + m[6] * y + m[10] * z + m[14] * w;
  out[3] = m[3] * x + m[7] * y + m[11] * z + m[15] * w;
  return out;
}
/**
 * Transforms the vec4 with a quat
 *
 * @param {vec4} out the receiving vector
 * @param {ReadonlyVec4} a the vector to transform
 * @param {ReadonlyQuat} q quaternion to transform with
 * @returns {vec4} out
 */

function transformQuat(out, a, q) {
  var x = a[0],
    y = a[1],
    z = a[2];
  var qx = q[0],
    qy = q[1],
    qz = q[2],
    qw = q[3]; // calculate quat * vec

  var ix = qw * x + qy * z - qz * y;
  var iy = qw * y + qz * x - qx * z;
  var iz = qw * z + qx * y - qy * x;
  var iw = -qx * x - qy * y - qz * z; // calculate result * inverse quat

  out[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
  out[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
  out[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx;
  out[3] = a[3];
  return out;
}
/**
 * Set the components of a vec4 to zero
 *
 * @param {vec4} out the receiving vector
 * @returns {vec4} out
 */

function zero(out) {
  out[0] = 0.0;
  out[1] = 0.0;
  out[2] = 0.0;
  out[3] = 0.0;
  return out;
}
/**
 * Returns a string representation of a vector
 *
 * @param {ReadonlyVec4} a vector to represent as a string
 * @returns {String} string representation of the vector
 */

function str(a) {
  return "vec4(" + a[0] + ", " + a[1] + ", " + a[2] + ", " + a[3] + ")";
}
/**
 * Returns whether or not the vectors have exactly the same elements in the same position (when compared with ===)
 *
 * @param {ReadonlyVec4} a The first vector.
 * @param {ReadonlyVec4} b The second vector.
 * @returns {Boolean} True if the vectors are equal, false otherwise.
 */

function exactEquals(a, b) {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
}
/**
 * Returns whether or not the vectors have approximately the same elements in the same position.
 *
 * @param {ReadonlyVec4} a The first vector.
 * @param {ReadonlyVec4} b The second vector.
 * @returns {Boolean} True if the vectors are equal, false otherwise.
 */

function equals(a, b) {
  var a0 = a[0],
    a1 = a[1],
    a2 = a[2],
    a3 = a[3];
  var b0 = b[0],
    b1 = b[1],
    b2 = b[2],
    b3 = b[3];
  return (
    Math.abs(a0 - b0) <= EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) &&
    Math.abs(a1 - b1) <= EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)) &&
    Math.abs(a2 - b2) <= EPSILON * Math.max(1.0, Math.abs(a2), Math.abs(b2)) &&
    Math.abs(a3 - b3) <= EPSILON * Math.max(1.0, Math.abs(a3), Math.abs(b3))
  );
}
/**
 * Alias for {@link vec4.subtract}
 * @function
 */

var sub = subtract;
/**
 * Alias for {@link vec4.multiply}
 * @function
 */

var mul = multiply$1;
/**
 * Alias for {@link vec4.divide}
 * @function
 */

var div = divide;
/**
 * Alias for {@link vec4.distance}
 * @function
 */

var dist$1 = distance;
/**
 * Alias for {@link vec4.squaredDistance}
 * @function
 */

var sqrDist = squaredDistance;
/**
 * Alias for {@link vec4.length}
 * @function
 */

var len = length;
/**
 * Alias for {@link vec4.squaredLength}
 * @function
 */

var sqrLen = squaredLength;
/**
 * Perform some operation over an array of vec4s.
 *
 * @param {Array} a the array of vectors to iterate over
 * @param {Number} stride Number of elements between the start of each vec4. If 0 assumes tightly packed
 * @param {Number} offset Number of elements to skip at the beginning of the array
 * @param {Number} count Number of vec4s to iterate over. If 0 iterates over entire array
 * @param {Function} fn Function to call for each vector in the array
 * @param {Object} [arg] additional argument to pass to fn
 * @returns {Array} a
 * @function
 */

var forEach = (function () {
  var vec = create();
  return function (a, stride, offset, count, fn, arg) {
    var i, l;

    if (!stride) {
      stride = 4;
    }

    if (!offset) {
      offset = 0;
    }

    if (count) {
      l = Math.min(count * stride + offset, a.length);
    } else {
      l = a.length;
    }

    for (i = offset; i < l; i += stride) {
      vec[0] = a[i];
      vec[1] = a[i + 1];
      vec[2] = a[i + 2];
      vec[3] = a[i + 3];
      fn(vec, vec, arg);
      a[i] = vec[0];
      a[i + 1] = vec[1];
      a[i + 2] = vec[2];
      a[i + 3] = vec[3];
    }

    return a;
  };
})();

var vec4 = /*#__PURE__*/ Object.freeze({
  __proto__: null,
  create: create,
  clone: clone,
  fromValues: fromValues,
  copy: copy$1,
  set: set,
  add: add,
  subtract: subtract,
  multiply: multiply$1,
  divide: divide,
  ceil: ceil$1,
  floor: floor$3,
  min: min$1,
  max: max,
  round: round$3,
  scale: scale,
  scaleAndAdd: scaleAndAdd,
  distance: distance,
  squaredDistance: squaredDistance,
  length: length,
  squaredLength: squaredLength,
  negate: negate,
  inverse: inverse,
  normalize: normalize,
  dot: dot,
  cross: cross,
  lerp: lerp$1,
  random: random,
  transformMat4: transformMat4,
  transformQuat: transformQuat,
  zero: zero,
  str: str,
  exactEquals: exactEquals,
  equals: equals,
  sub: sub,
  mul: mul,
  div: div,
  dist: dist$1,
  sqrDist: sqrDist,
  len: len,
  sqrLen: sqrLen,
  forEach: forEach,
});

// Randomly returns one of the arguments.
function choose() {
  return arguments[randInt(arguments.length - 1)];
}

// Set every property of an object to a certain value.
function every(obj, value) {
  Object.keys(obj).forEach((k) => (obj[k] = value));
}

// Returns a random value from an object.
function any(obj) {
  const keys = Object.keys(obj);
  return obj[keys[(keys.length * Math.random()) << 0]];
}

// Run a function on every value in an object.
// Ex. each(obj, (value, key) => console.log(value, key));
function each(obj, fn) {
  Object.entries(obj).forEach(([key, obj]) => fn(obj, key));
}

// Run a function `n` times, passing in `i` on each iteration.
function repeat(n, fn) {
  for (let i = 0; i < n; i += 1) fn(i);
}

// 🧮 Numbers

// Returns true if the number is even, and false otherwise.
function even(n) {
  return n % 2 === 0;
}

// Accepts integer from 0–16
// Yields 17 different values between 0–255.
function byteInterval17(i16) {
  return Math.min(i16 * 16, 255);
}

// Generates an integer from 0-n (inclusive)
function randInt(n) {
  return Math.floor(Math.random() * (n + 1));
}

// Generates an array of random integers from 0-n (inclusive)
// TODO: How could this be made more generic? 22.1.5
// TODO: How to make this account for range? 2022.01.17.00.33
function randIntArr(n, count) {
  return Array(count).fill(n).map(randInt);
}

// Generates an integer from low-high (inclusive)
function randIntRange(low, high) {
  return low + randInt(high - low);
}

// Multiplies one or more [] operands by n and returns a Number or Array.
function multiply(operands, n) {
  if (Array.isArray(operands)) {
    return operands.map((o) => o * n);
  } else {
    return operands * n;
  }
}

// Gets the distance between two points.
// (4) x1, y1, x2, y1
// (2) {x, y}, {x, y}
function dist() {
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

// Converts degrees to radians.
function radians(deg) {
  return deg * (Math.PI / 180);
}

// Keeps a value between min and max.
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

// Slides a number between a and by a normalized amount.
function lerp(a, b, amount) {
  return a + (b - a) * clamp(amount, 0, 1);
}

// Returns a string of numbers based on local system time. YYYY.MM.DD.HH.MM.SS
function timestamp() {
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
class Track {
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

// 🧮 Geometry

const { abs: abs$1, floor: floor$2 } = Math;

// A generic circle model for algorithmic use.
class Circle {
  x;
  y;
  radius;

  constructor(x, y, radius = 8) {
    this.x = x;
    this.y = y;
    this.radius = radius;
  }

  // Returns a random (x, y) point within the circle by recursively generating
  // random points within a bounding box and checking to see if they are within
  // the radius.
  random() {
    const sq = [-this.radius, this.radius];
    const np = {
      x: this.x + randIntRange(...sq),
      y: this.y + randIntRange(...sq),
    };

    if (dist(this.x, this.y, np.x, np.y) < this.radius) {
      return np;
    } else {
      return this.random(this.radius);
    }
  }
}

// A dynamic box defined by x, y, w, h with methods that mutate the state.
class Box {
  x = 0;
  y = 0;
  w = 1;
  h = 1;

  constructor(x, y, w, h = w) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;

    if (this.w === 0) this.w = 1;
    if (this.h === 0) this.h = 1;
  }

  // Yields a new box that is a copy of an existing old one.
  static copy(box) {
    return new Box(box.x, box.y, box.w, box.h);
  }

  get area() {
    return abs$1(this.w * this.h);
  }

  // Yields a box where x, y is at the top left and w, h are positive.
  get abs() {
    let { x, y, w, h } = this;

    if (w < 0) {
      x += w;
      w = Math.abs(w);
    }

    if (h < 0) {
      y += h;
      h = Math.abs(h);
    }

    return new Box(x, y, w, h);
  }

  // Calculates a y value, representing the bottom of the box.
  // Note: Returns y if the height is 1.
  get bottom() {
    return this.h === 1 ? this.y : this.y + this.h;
    //return this.y + this.h;
  }

  // Calculates an x value, representing the right of the box.
  // Note: Returns x if the width is 1.
  get right() {
    return this.w === 1 ? this.x : this.x + this.w;
  }

  // Crops one box to another.
  crop(toX, toY, toW, toH) {
    let { x, y, w, h } = this;

    if (x >= toW || y >= toH) return; // Return `undefined` if x or y is out of bounds.

    // Crop left side.
    if (x < toX) {
      w += x;
      x = toX;
    }
    // Crop right side.
    if (x + w > toW) w = toW - x;
    // Crop top side.
    if (y < toY) {
      h += y;
      y = toY;
    }
    // Crop bottom side.
    if (y + h > toH) h = toH - y;

    return new Box(x, y, w, h);
  }

  // Moves the box by x and y.
  move({ x, y }) {
    this.x += x;
    this.y += y;
  }

  // Returns true if this box contains the point {x, y}.
  contains({ x, y }) {
    return (
      this.x <= x && x < this.x + this.w && this.y <= y && y < this.y + this.h
    );
  }

  // The opposite of contains.
  misses(o) {
    return !this.contains(o);
  }
}

// High level behavior for points: {x, y} (See also: num.vec2)
class Point {
  static equals(p1, p2) {
    return p1.x === p2.x && p1.y === p2.y;
  }
}

// A 2 dimensional uniform grid, using a box as the frame (with scaling).
class Grid {
  box;
  scale;
  // TODO: Could rotation eventually be added here? 2021.12.08.10.51

  #halfScale;
  centerOffset;

  constructor(x, y, w, h, s) {
    // Takes the same arguments as box.
    this.box = new Box(x, y, w, h);
    this.scale = s;
    this.#halfScale = this.scale / 2;
    this.centerOffset = floor$2(this.#halfScale);
  }

  // Returns unscaled point `{x, y}` in `grid` for given display coordinate
  // `pos`, or `false` if `pos` is outside of `grid`.
  under({ x, y }, cb) {
    const { scale, box } = this;

    // Get original (unscaled) grid position.
    const gx = floor$2((x - box.x) / scale);
    const gy = floor$2((y - box.y) / scale);

    // Generate display (x, y) box and grid (gx, gy) position,
    // and whether we are in the grid or not.
    const gridSquare = {
      x: box.x + gx * scale,
      y: box.y + gy * scale,
      w: scale,
      h: scale,
      gx,
      gy,
      in: this.scaled.contains({ x, y }),
    };

    if (gridSquare.in && cb) cb(gridSquare);
    return gridSquare;
  }

  // Returns display coordinates from local, untransformed ones.
  get(x, y) {
    return [this.box.x + x * this.scale, this.box.y + y * this.scale];
  }

  // Yields the grid's transformed bounding box according to `scale`.
  get scaled() {
    return new Box(
      this.box.x,
      this.box.y,
      this.box.w * this.scale,
      this.box.h * this.scale
    );
  }

  center(x, y) {
    const scaled = this.get(x, y);
    // TODO: This can be replaced with a vec2.add
    scaled[0] += Math.floor(this.#halfScale);
    scaled[1] += Math.floor(this.#halfScale);
    return scaled;
  }

  // Yields an array of offset points that can be plotted to mark the center of
  // each grid square. (Useful for editors, development and debugging.)
  // Tries to find the exact center point, but if that doesn't exist then
  // this function produces 4 points in the center.
  get centers() {
    const o = this.centerOffset;

    let points = [];

    // Find exact center point of grid square if possible.
    if (this.#halfScale % 1 === 0.5 && this.#halfScale > 0.5) {
      // We have a perfect middle square.
      points.push({ x: o, y: o });
    } else if (this.scale >= 4) {
      // We can assume we are even here, so we return 4 pixels to mark
      // the center.
      points.push(
        { x: o, y: o },
        { x: o - 1, y: o - 1 },
        { x: o - 1, y: o },
        { x: o, y: o - 1 }
      );
    }
    return points;
  }
}

// This box model uses `soil` to build a dirty rectangle out of points
// in order to optimize rendering.
class DirtyBox {
  box;
  #left;
  #top;
  #right;
  #bottom;
  soiled = false;

  constructor() {
    this.box = new Box(0, 0, 0); // Note: I probably don't need all the features of `box` here.
  }

  soil({ x, y }) {
    if (this.#left === undefined) {
      this.#left = x;
      this.#right = this.#left;
    }
    if (this.#top === undefined) {
      this.#top = y;
      this.#bottom = this.#top;
    }

    if (x < this.#left) this.#left = x;
    if (y < this.#top) this.#top = y;

    if (x > this.#right) this.#right = x;
    if (y > this.#bottom) this.#bottom = y;

    this.box.x = this.#left;
    this.box.y = this.#top;

    this.box.w = this.#right - this.#left + 1;
    this.box.h = this.#bottom - this.#top + 1;

    this.soiled = true;
  }

  // Crops pixels from an image and returns the new one.
  // - `image` has { width, height, pixels }
  crop(image) {
    const b = this.croppedBox(image);
    const p = image.pixels;
    const newP = new Uint8ClampedArray(b.w * b.h * 4);

    // Copy rows from `p` -> `newP`
    for (let row = 0; row < b.h; row += 1) {
      const index = (b.x + (b.y + row) * image.width) * 4;
      newP.set(p.subarray(index, index + b.w * 4), row * b.w * 4);
    }

    return newP;
  }

  croppedBox(image) {
    return this.box.crop(0, 0, image.width, image.height);
  }
}

// ✍️ Pen
// TODO: Clean up this whole class and its connections to the system.
const { assign: assign$1 } = Object;
const { round: round$2 } = Math;

class Pen {
  x;
  y;
  delta;
  pressure;
  pointerType;
  untransformedPosition;
  point;
  changedInPiece = false;
  #lastP;

  down = false;
  changed = false;

  event = "";
  events = [];

  cursorCode;
  penCursor = false;

  lastPenX;
  lastPenY;

  lastPenCursor;

  dragBox;

  #dragging = false;
  #lastPenDown;
  #penDragStartPos;

  // `point` is a transform function for projecting coordinates from screen
  // space to virtual screen space.
  constructor(point) {
    this.point = point;

    // Add pointer events.
    const pen = this;

    let forceTouchPressure = 0;
    let forceTouchEnabled = false;

    // Prevent double-tap delay: https://stackoverflow.com/a/71025095
    window.addEventListener(
      "touchend",
      (event) => {
        // Only prevent double tap to Zoom if native-cursor is enabled.
        if (document.body.classList.contains("native-cursor") === false) {
          event.preventDefault();
          event.stopImmediatePropagation();
        }
      },
      {
        passive: false,
      }
    );

    // Touch
    window.addEventListener("pointerdown", (e) => {
      if (!e.isPrimary) return;
      pen.pointerType = e.pointerType;

      assign$1(pen, point(e.x, e.y));
      this.untransformedPosition = { x: e.x, y: e.y };

      pen.pressure = reportPressure(e);

      pen.down = true;
      pen.#dragging = true;
      pen.#penDragStartPos = { x: pen.x, y: pen.y };
      pen.#event("touch");

      pen.changed = true;
      pen.penCursor = true;
      if (e.pointerType !== "mouse") pen.penCursor = false;
    });

    // Hover and Draw
    window.addEventListener("pointermove", (e) => {
      if (!e.isPrimary) return;
      pen.pointerType = e.pointerType;

      assign$1(pen, point(e.x, e.y));
      this.untransformedPosition = { x: e.x, y: e.y };

      pen.pressure = reportPressure(e);

      if (pen.#dragging) {
        // draw
        const penDragAmount = {
          x: pen.x - pen.#penDragStartPos.x,
          y: pen.y - pen.#penDragStartPos.y,
        };

        pen.dragBox = {
          x: pen.#penDragStartPos.x,
          y: pen.#penDragStartPos.y,
          w: penDragAmount.x,
          h: penDragAmount.y,
        };

        // Only send an event if the new point differs from the last.
        pointerMoveEvent("draw");
      } else {
        pointerMoveEvent("move");
      }

      pen.changed = true;
      pen.penCursor = true;
      if (e.pointerType !== "mouse") pen.penCursor = false;
    });

    function pointerMoveEvent(type) {
      if (!Point.equals(pen, { x: pen.lastPenX, y: pen.lastPenY })) {
        pen.#event(type);
      }
    }

    // Lift
    window.addEventListener("pointerup", (e) => {
      if (!e.isPrimary) return;
      pen.pointerType = e.pointerType;

      pen.down = false;
      if (pen.#dragging) pen.#event("lift");

      pen.#dragging = false;

      pen.changed = true;
      pen.penCursor = true;
      if (e.pointerType !== "mouse") pen.penCursor = false;
    });

    // MacBook Trackpad Pressure (in Safari)
    // TODO: When shipping natively for macOS:
    //       - Report or re-report actual pen events for:
    //         https://developer.mozilla.org/en-US/docs/Web/API/Force_Touch_events
    // When webkitForce > 2 the button is held down quickly,
    // so we don't report anything. (It's a separate gesture)
    // Otherwise, normalize the pressure from 0-1.
    // Note: e.webkitForce reports from 1-3 by default.
    window.addEventListener("webkitmouseforcechanged", (e) => {
      forceTouchEnabled = true;
      if (e.webkitForce >= 2) {
        forceTouchPressure = 0;
      } else {
        forceTouchPressure = Math.max(0, e.webkitForce - 1);
      }
    });

    function reportPressure(e) {
      let pressure;
      // If the device is a trackpad (probably on a MacBook and in Safari)
      if (forceTouchEnabled) {
        pressure = forceTouchPressure;
      } else {
        // If pressure sensitivity doesn't exist then force it to be 1.
        pressure = e.pressure || 1;
        // Unless the device type is a pen, then make it 0. This assumes all pens
        // have pressure sensitivity.
        if (pen.pointerType === "pen" && pressure === 1) {
          pressure = 0;
        }
        // If the device is a mouse, then set it to 1.
        if (pen.pointerType === "mouse") pressure = 1;
      }
      return pressure;
    }

    return pen;
  }

  retransformPosition() {
    assign$1(
      this,
      this.point(this.untransformedPosition?.x, this.untransformedPosition?.y)
    );
  }

  normalizedPosition(rect) {
    if (this.untransformedPosition) {
      return {
        x: (this.untransformedPosition.x - rect.x) / rect.width,
        y: (this.untransformedPosition.y - rect.y) / rect.height,
      };
    } else {
      return { x: undefined, y: undefined };
    }
  }

  // TODO: Merge this logic into the above events & consolidate class properties.
  // Check the hardware for any changes.
  #event(name) {
    this.event = name;

    const delta = {
      x: this.x - this.lastPenX || 0,
      y: this.y - this.lastPenY || 0,
    };

    this.delta = delta;

    // This field detects whether the pen projection to the current resolution has changed or not.
    // Note: Original data is not sent at the moment. It could be calculated and sent
    //       similar to `Pen`s `untransformedPosition`
    this.changedInPiece = delta.x !== 0 || delta.y !== 0;

    this.events.push({
      name: this.event,
      device: this.pointerType,
      x: this.x,
      y: this.y,
      delta,
      penChanged: this.changedInPiece,
      pressure: this.pressure,
      drag: this.dragBox,
    });

    this.lastPenCursor = this.penCursor;
    this.#lastPenDown = this.down;
    this.lastPenX = this.x;
    this.lastPenY = this.y;
  }

  render(ctx, bouRect) {
    const p = this.untransformedPosition;
    if (!p) return;

    const s = 10 + 4,
      r = bouRect;

    // Erase the last cursor that was drawn.
    if (!this.#lastP) this.#lastP = { x: p.x, y: p.y };
    else
      ctx.clearRect(
        this.#lastP.x - r.x - s,
        this.#lastP.y - r.y - s,
        s * 2,
        s * 2
      );

    assign$1(this.#lastP, p);

    // Remove native cursor if it was turned off.
    if (this.cursorCode != "native") {
      if (document.body.classList.contains("native-cursor")) {
        document.body.classList.remove("native-cursor");
      }
    }

    if (!this.cursorCode || this.cursorCode === "precise") {
      // 🎯 Precise
      ctx.lineCap = "round";

      ctx.save();
      ctx.translate(round$2(p.x - r.x), round$2(p.y - r.y));

      // A. Make circle in center.
      const radius = 2;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, 2 * Math.PI);

      ctx.fillStyle = "white";
      ctx.fill();

      const gap = 7.5,
        to = 10;

      ctx.beginPath();
      ctx.moveTo(0, -gap); // Over
      ctx.lineTo(0, -to);
      ctx.moveTo(0, gap); // Under
      ctx.lineTo(0, to);
      ctx.moveTo(-gap, 0); // Left
      ctx.lineTo(-to, 0);
      ctx.moveTo(gap, 0); // Right
      ctx.lineTo(to, 0);

      ctx.strokeStyle = "rgb(0, 255, 255)";
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.restore();
    } else if (this.cursorCode === "tiny") {
      // 🦐 Tiny
      const l = 4;
      ctx.save();
      ctx.translate(round$2(p.x - r.x), round$2(p.y - r.y));

      ctx.beginPath();
      ctx.moveTo(0, -l); // Over
      ctx.lineTo(0, -l);
      ctx.moveTo(0, l); // Under
      ctx.lineTo(0, l);
      ctx.moveTo(-l, 0); // Left
      ctx.lineTo(-l, 0);
      ctx.moveTo(l, 0); // Right
      ctx.lineTo(l, 0);

      ctx.strokeStyle = "rgba(255, 255, 0, 0.75)";
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.restore();
    } else if (this.cursorCode === "dot") {
      ctx.save();
      ctx.translate(round$2(p.x - r.x), round$2(p.y - r.y));
      ctx.beginPath();
      ctx.lineTo(0, 0); // bottom right

      ctx.strokeStyle = "rgba(255, 0, 0, 0.9)";
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.restore();
    } else if (this.cursorCode === "none");
    else if (this.cursorCode === "native") {
      if (document.body.classList.contains("native-cursor") === false) {
        document.body.classList.add("native-cursor");
      }
    }
    this.changed = false;
  }

  setCursorCode(code) {
    this.cursorCode = code;
  }
}

// ⌨ Keyboard

// TODO: Add more of these properties as needed:
//       https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent

class Keyboard {
  events = [];

  constructor() {
    window.addEventListener("keydown", (e) => {
      this.events.push({
        name: "keyboard:down",
        key: e.key,
        shift: e.shiftKey,
        alt: e.altKey,
        ctrl: e.ctrlKey,
      });
    });

    window.addEventListener("keyup", (e) => {
      this.events.push({ name: "keyboard:up", key: e.key });
    });
  }
}

const { abs, sign, ceil, floor: floor$1, sin, cos } = Math;

let width, height, pixels;
const depthBuffer = [];
const c = [255, 255, 255, 255];
const panTranslation = { x: 0, y: 0 }; // For 2d shifting using `pan` and `unpan`.
const skips = [];

// 1. Configuration & State

// TODO: Can't fill process have just one argument coming in?

function makeBuffer(width, height, fillProcess, painting) {
  const imageData = new ImageData(width, height);

  const buffer = {
    pixels: imageData.data,
    width: imageData.width,
    height: imageData.height,
  };

  if (typeof fillProcess === "function") {
    // Remember the current buffer and color.
    const savedBuffer = getBuffer();
    const rc = c; // Remember color.
    setBuffer(buffer);
    const api = { width, height, pixels };
    Object.assign(api, painting.api);
    fillProcess(api); // Every fill process gets a painting API.
    painting.paint();
    // Restore old buffer and color.
    setBuffer(savedBuffer);
    color(...rc);
  }

  return buffer;
}

function getBuffer() {
  return { width, height, pixels };
}

function setBuffer(buffer) {
  ({ width, height, pixels } = buffer);
}

function color(r, g, b, a = 255) {
  c[0] = floor$1(r);
  c[1] = floor$1(g);
  c[2] = floor$1(b);
  c[3] = floor$1(a);
}

// 2. 2D Drawing

function clear$1() {
  // Note: I believe this would be the fastest method but would have to test it.
  // Would have to copy up by doubling until we hit the length!
  // pixels[0] = 255;
  // pixels[1] = 255;
  // pixels[2] = 255;
  // pixels[3] = 255;
  // pixels.copyWithin(4, 0);

  for (let i = 0; i < pixels.length; i += 4) {
    pixels[i] = c[0]; // r
    pixels[i + 1] = c[1]; // g
    pixels[i + 2] = c[2]; // b
    pixels[i + 3] = c[3]; // alpha
  }
}

/**
 * Plot a single pixel using (x, y) or {x, y} if only x is given.
 * (1) {x, y}
 * (2) (x, y)
 */
// Where a pixel is a region in which we draw from the upper left corner. (2D)
function plot() {
  let x, y;
  arguments.length === 1 ? ([x, y] = arguments[0]) : ([x, y] = arguments);

  x = floor$1(x);
  y = floor$1(y);

  // Skip pixels that are offscreen and/or found in the `skips` list.
  if (x < 0 || x >= width || y < 0 || y >= height) return;
  for (const s of skips) if (x === s.x && y === s.y) return;

  // Plot our pixel.
  const i = (x + y * width) * 4;
  const alpha = c[3];

  if (alpha === 255) {
    // No alpha blending, just copy.
    pixels[i] = c[0];
    pixels[i + 1] = c[1];
    pixels[i + 2] = c[2];
    pixels[i + 3] = c[3];
  } else if (alpha !== 0) {
    // Lerp to blend.
    pixels[i] = lerp(pixels[i], c[0], alpha / 255);
    pixels[i + 1] = lerp(pixels[i + 1], c[1], alpha / 255);
    pixels[i + 2] = lerp(pixels[i + 2], c[2], alpha / 255);
    // TODO: Is this the best way to alpha blend? What kind is this? 2021.12.10.15.43
    pixels[i + 3] = Math.min(255, pixels[i + 3] + c[3]);
    //pixels[i + 3] = floor(255, (pixels[i + 3] + c[3]) / 2);
  }
}

// Adds a point to the skip list which ignores these points from being drawn
// in `plot`. Passing `null` will clear the skip list.
// TODO: Should the skip list clear automatically on every paint? 2022.02.03.01.16
// TODO: Leaving skip blank will default to a random skipping algorithm?
//       Writing a function will allow you to dynamically skip pixels.
function skip(...args) {
  if (args[0] === null) skips.length = 0;
  else
    args.forEach((p) => {
      skips.push({
        x: floor$1(p.x) + panTranslation.x,
        y: floor$1(p.y) + panTranslation.y,
      });
    });
}

// Plots a single pixel within the panned coordinate space.
// Basically a wrapper over plot, which should ultimately be renamed to set?
// Accepts x, y or {x, y}
function point(...args) {
  let x, y;

  if (args.length === 1) {
    x = args[0].x;
    y = args[0].y;
  } else if (args.length === 2) {
    x = args[0];
    y = args[1];
  }

  // TODO: Add support for {x, y} single argument. 2022.02.02.20.39
  x += panTranslation.x;
  y += panTranslation.y;
  // TODO: Eventually add rotation and scale etc.
  plot(x, y);
}

// TODO: Implement panTranslation for primitives other than line?
function pan(x, y) {
  if (y === undefined) y = x;
  panTranslation.x += floor$1(x);
  panTranslation.y += floor$1(y);
}

function unpan() {
  panTranslation.x = 0;
  panTranslation.y = 0;
}

function copy(destX, destY, srcX, srcY, src, alpha = 1.0) {
  destX = Math.round(destX);
  destY = Math.round(destY);
  srcX = Math.round(srcX);
  srcY = Math.round(srcY);

  // Skip pixels that are offscreen.
  // TODO: Is this necessary? How slow is it?
  if (
    destX < 0 ||
    destX >= width ||
    destY < 0 ||
    destY >= height ||
    srcX < 0 ||
    srcX >= src.width ||
    srcY < 0 ||
    srcY >= src.height
  ) {
    return;
  }

  const destIndex = (destX + destY * width) * 4;
  const srcIndex = (srcX + srcY * src.width) * 4;

  const srcAlpha = src.pixels[srcIndex + 3] / 255;

  // if (alpha === 1) {

  /*
  pixels[destIndex] = src.pixels[srcIndex] * alpha; // R
  pixels[destIndex + 1] = src.pixels[srcIndex + 1] * alpha; // G
  pixels[destIndex + 2] = src.pixels[srcIndex + 2] * alpha; // B
  pixels[destIndex + 3] = src.pixels[srcIndex + 3]; // A
  */

  // console.log(srcAlpha);

  pixels[destIndex] =
    lerp(pixels[destIndex], src.pixels[srcIndex], srcAlpha) * alpha;
  pixels[destIndex + 1] =
    lerp(pixels[destIndex + 1], src.pixels[srcIndex + 1], srcAlpha) * alpha;
  pixels[destIndex + 2] =
    lerp(pixels[destIndex + 2], src.pixels[srcIndex + 2], srcAlpha) * alpha;
  pixels[destIndex + 3] = 255;

  // TODO: Blend alpha.
  /*
  pixels[i + 1] = lerp(pixels[i + 1], c[1], alpha / 255);
  pixels[i + 2] = lerp(pixels[i + 2], c[2], alpha / 255);
  // TODO: Is this the best way to alpha blend? What kind is this? 2021.12.10.15.43
  // pixels[i + 3] = Math.min(255, pixels[i + 3] + c[3]);
  pixels[i + 3] = floor(255, (pixels[i + 3] + c[3]) / 2);
   */

  //} else {
  //  console.warn("Copy alpha not available.");
  //}
}

/*
function copyRow(destX, destY, srcX, srcY, src) {
  destX = Math.round(destX);
  destY = Math.round(destY);
  srcX = Math.round(srcX);
  srcY = Math.round(srcY);

  const destIndex = (destX + destY * width) * 4;
  const srcIndex = (srcX + srcY * src.width) * 4;
  const rowLength = src.width * 4 - destX * 4;

  let srcStart = srcIndex;
  let srcEnd = srcIndex + src.width * 4;

  const sub = src.pixels.subarray(srcStart, srcEnd);

  pixels.set(sub, destIndex);
}
 */

// Copies pixels from a source buffer to the active buffer and returns
// the source buffer.
// TODO: Add dirty rectangle support here...
//       - What would the best parameter set be?
function paste(from, destX = 0, destY = 0) {
  // TODO: See if from has a dirtyBox attribute.
  if (from.crop) {
    // A cropped copy.
    // TODO: This could be sped up quite a bit by going row by row.
    for (let x = 0; x < from.crop.w; x += 1) {
      for (let y = 0; y < from.crop.h; y += 1) {
        // console.log(destX, destY, from.crop.x, from.crop.y);
        copy(
          destX + x,
          destY + y,
          from.crop.x + x,
          from.crop.y + y,
          from.painting
        );
      }
    }
  } else {
    // A regular copy.

    // Check to see if we can perform a full copy here.
    {
      // TODO: Otherwise, copy in "cropped" rows.
      // TODO: Fix row algorithm... 2022.04.07.04.36
      // TODO: Get copy by row working!
      /*
      let fromY = 0;

      if (destY < 0) {
        fromY = Math.abs(destY);
      }

      let fromHeight = from.height - Math.abs(destY);

      for (let fy = fromY; fy < fromHeight; fy += 1) {
        let fromX = Math.abs(destX);
        let fromWidth = from.width - Math.abs(destX);

        const fromXIndex = (fromX + fy * from.width) * 4;

        const sub = from.pixels.subarray(
          fromXIndex,
          fromXIndex + fromWidth * 4
        );

        const destIndex = (destX + destY * width) * 4;

        pixels.set(sub, fromXIndex);

        //copyRow(destX, destY + y, fromX, fromWidth, from);
      }
      */
      // console.log(destX);
      // Pixel by pixel fallback.
      for (let x = 0; x < from.width; x += 1) {
        for (let y = 0; y < from.height; y += 1) {
          copy(destX + x, destY + y, x, y, from);
        }
      }
    }
  }
}

// Draws a line
// (2) p1, p2: pairs of {x, y} or [x, y]
// (4) x0, y0, x1, y1
function line() {
  let x0, y0, x1, y1;

  if (arguments.length === 4) {
    x0 = arguments[0];
    y0 = arguments[1];
    x1 = arguments[2];
    y1 = arguments[3];
  } else if (arguments.length === 2) {
    if (Array.isArray(arguments[0])) {
      // assume [x, y], [x, y]
      x0 = arguments[0][0];
      x1 = arguments[0][1];
      y0 = arguments[1][0];
      y1 = arguments[1][1];
    } else {
      // assume {x, y}, {x, y}
      x0 = arguments[0].x;
      y0 = arguments[0].y;
      x1 = arguments[1].x;
      y1 = arguments[1].y;
    }
  } else {
    console.warn(
      "Line did not use the correct number of arguments:",
      arguments
    );
  }

  if (isNaN(x0) || isNaN(y0) || isNaN(x1) || isNaN(y1)) {
    return console.error("Invalid line arguments:", x0, y0, x1, y1);
  }

  // Add any panTranslations.
  x0 += panTranslation.x;
  y0 += panTranslation.y;
  x1 += panTranslation.x;
  y1 += panTranslation.y;

  // TODO: Check if line is perfectly horizontal and then skip bresenham and
  //       optimize by filling the whole buffer with the current color.
  bresenham(x0, y0, x1, y1).forEach((p) => plot(p.x, p.y));
}

// Draws a 1px aliased circle: http://rosettacode.org/wiki/Bitmap/Midpoint_circle_algorithm#C
function circle(x0, y0, radius) {
  x0 = floor$1(x0);
  y0 = floor$1(y0);
  radius = floor$1(radius);

  let f = 1 - radius,
    ddF_x = 0,
    ddF_y = -2 * radius,
    x = 0,
    y = radius;

  plot(x0, y0 + radius);
  plot(x0, y0 - radius);
  plot(x0 + radius, y0);
  plot(x0 - radius, y0);

  while (x < y) {
    if (f >= 0) {
      y -= 1;
      ddF_y += 2;
      f += ddF_y;
    }
    x += 1;
    ddF_x += 2;
    f += ddF_x + 1;
    plot(x0 + x, y0 + y);
    plot(x0 - x, y0 + y);
    plot(x0 + x, y0 - y);
    plot(x0 - x, y0 - y);
    plot(x0 + y, y0 + x);
    plot(x0 - y, y0 + x);
    plot(x0 + y, y0 - x);
    plot(x0 - y, y0 - x);
  }
}

// Draws a series of lines without overlapping / overdrawing points.
function poly(coords) {
  let last = coords[0];
  coords.forEach((current, i) => {
    if (i < coords.length - 1) skip(current);
    line(last, current);
    skip(null);
    last = current;
  });
}

/**
 * Bresenham's Line Algorithm
 * @description - Returns an array of integer points that make up an aliased line from {x0, y0} to {x1, y1}.
 * - This function is "abstract" and does not render anything... but outputs points.
 * @param x0
 * @param y0
 * @param x1
 * @param y1
 * @returns {*[]}
 */
function bresenham(x0, y0, x1, y1) {
  const points = [];

  // Make sure everything is floor'd.
  x0 = floor$1(x0);
  y0 = floor$1(y0);
  x1 = floor$1(x1);
  y1 = floor$1(y1);

  // Bresenham's Algorithm
  const dx = abs(x1 - x0);
  const dy = abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;

  while (true) {
    points.push({ x: x0, y: y0 });

    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x0 += sx;
    }
    if (e2 < dx) {
      err += dx;
      y0 += sy;
    }
  }

  return points;
}

// Takes in x, y, width and height and draws an
// outline, inline (1px) or filled rectangle, optionally
// from the center by inputting eg: "inline*center" in mode.
const BOX_CENTER = "*center";
// Parameters
// (1) box (any object with {x, y, w, h} properties) (1)
// (2) box, mode (2)
// (3) x, y, size (3)
// (4) x, y, w, h (4)
// (4) x, y, size, mode:string (4)
// (5) x, y, w, h, mode (5)
function box() {
  let x,
    y,
    w,
    h,
    mode = "fill";

  if (arguments.length === 1) {
    // Array(4)
    if (Array.isArray(arguments[0])) {
      x = arguments[0][0];
      y = arguments[0][1];
      w = arguments[0][2];
      h = arguments[0][3];
    } else {
      // Object {x, y, w, h}
      x = arguments[0].x;
      y = arguments[0].y;
      w = arguments[0].w;
      h = arguments[0].h || arguments[0].w;
      if (x === undefined || y === undefined || w === undefined) {
        return console.error(
          "Could not make a box {x,y,w,h} from:",
          arguments[0]
        );
      }
    }
  } else if (arguments.length === 2) {
    // box, mode
    x = arguments[0].x;
    y = arguments[0].y;
    w = arguments[0].w;
    h = arguments[0].h;
    mode = arguments[1];
  } else if (arguments.length === 3) {
    // x, y, size
    x = arguments[0];
    y = arguments[1];
    w = arguments[2];
    h = arguments[2];
  } else if (arguments.length === 4) {
    if (typeof arguments[3] === "number") {
      // x, y, w, h
      x = arguments[0];
      y = arguments[1];
      w = arguments[2];
      h = arguments[3];
    } else {
      // x, y, size, mode
      x = arguments[0];
      y = arguments[1];
      w = arguments[2];
      h = arguments[2];
      mode = arguments[3];
    }
  } else if (arguments.length === 5) {
    // x, y, w, h, mode
    x = arguments[0];
    y = arguments[1];
    w = arguments[2];
    h = arguments[3];
    mode = arguments[4];
  } else {
    return console.error("Invalid box call.");
  }

  // Check for "Center" at the end of mode.
  if (mode.endsWith(BOX_CENTER)) {
    x = x - w / 2;
    y = y - h / 2;
    mode = mode.slice(0, -BOX_CENTER.length); // Remove it.
  }

  if (mode === "outline") {
    line(x - 1, y - 1, x + w, y - 1); // Top
    line(x - 1, y + h, x + w, y + h); // Bottom
    line(x - 1, y, x - 1, y + h - 1); // Left
    line(x + w, y, x + w, y + h - 1); // Right
  } else if (mode === "inline") {
    line(x, y, x + w - 1, y); // Top
    line(x, y + h - 1, x + w - 1, y + h - 1); // Bottom
    line(x, y + 1, x, y + h - 2); // Left
    line(x + w - 1, y + 1, x + w - 1, y + h - 2); // Right
  } else if (mode === "fill") {
    w -= 1;
    if (sign(height) === 1) {
      for (let row = 0; row < h; row += 1) {
        line(x, y + row, x + w, y + row);
      }
    } else {
      for (let row = 0; row > h; row -= 1) {
        line(x, y + row, x + w, y + row);
      }
    }
  }
}

// TODO: The most efficient algorithm I could find for filling:
//       https://gist.github.com/ideasman42/983738130f754ef58ffa66bcdbbab892
function shape() {
  if (arguments % 2 !== 0) {
    // Split arguments into points.
    let points = [];

    for (let p = 0; p < arguments.length; p += 2) {
      points.push([arguments[p], arguments[p + 1]]);
    }

    // Make lines from 1->2->3->...->1
    // Draw white points for each.
    points.forEach((p, i) => {
      color(0, 255, 0, 100);
      const lastPoint = i < points.length - 1 ? points[i + 1] : points[0];
      line(...p, ...lastPoint);
      color(255, 255, 255);
      point(...p);
    });
  } else {
    console.error("Shape requires an even number of arguments: x,y,x,y...");
  }
}

// Renders a square grid at x, y given cols, rows, and scale.
// Buffer is optional, and if present will render the pixels at scale starting
// from the top left corner of the buffer, repeating if needed to fill the grid.
function grid({ box: { x, y, w: cols, h: rows }, scale, centers }, buffer) {
  const oc = c.slice(); // Remember the original color.

  const w = cols * scale;
  const h = rows * scale;

  // TODO: Where to add currying back into this API so I can do color().plot().plot() 2021.12.06.21.32
  // - Make the API object here in this file and wrap the functions as curries?

  const colPix = floor$1(w / cols),
    rowPix = floor$1(h / rows);

  if (buffer) {
    // Draw a scaled image if the buffer is present.
    for (let j = 0; j < rows; j += 1) {
      const plotY = y + rowPix * j;
      for (let i = 0; i < cols; i += 1) {
        const plotX = x + colPix * i;

        // Repeat (tile) the source over X and Y if we run out of pixels.
        const repeatX = i % buffer.width;
        const repeatY = j % buffer.height;
        const repeatCols = buffer.width;

        // Loop over the buffer and find the proper color.
        const pixIndex = (repeatX + repeatCols * repeatY) * 4;

        if (pixIndex < buffer.pixels.length) {
          color(...buffer.pixels.subarray(pixIndex, pixIndex + 4));
          box(plotX, plotY, scale);
        }
      }
    }
  } else {
    // Draw a debug / blueprint grid if no buffer is present.

    // Plot a point in each of the four corners.
    const right = x + w - 1,
      bottom = y + h - 1;

    color(64, 64, 64);
    plot(x, y);
    plot(right, y);
    plot(x, bottom);
    plot(right, bottom);
    color(...oc);

    // Draw each grid square, with optional center points.
    for (let i = 0; i < cols; i += 1) {
      const plotX = x + colPix * i;
      for (let j = 0; j < rows; j += 1) {
        const plotY = y + rowPix * j;

        // Lightly shade this grid square, alternating tint on evens and odds.
        const alphaMod = oc[3] / 255;
        color(oc[0], oc[1], oc[2], even(i + j) ? 50 * alphaMod : 75 * alphaMod);
        box(plotX, plotY, scale);

        // Color in the centers of each grid square.
        centers.forEach((p) => {
          color(oc[0], oc[1], oc[2], 100);
          plot(plotX + p.x, plotY + p.y);
        });
      }
    }

    color(...oc); // Restore color.
  }
}

// Loading & rendering stored drawings. TODO: Store this on another layer of
//                                            abstraction? 2021.12.13.22.04
// Silently fails if `drawing` is left `undefined`.
function draw(drawing, x, y, scale = 1, angle = 0) {
  if (drawing === undefined) return;

  // TODO: Eventually make this the call: rotatePoint(args[0], args[1], 0, 0);
  angle = radians(angle);
  const s = sin(angle);
  const c = cos(angle);

  pan(x, y);
  drawing.commands.forEach(({ name, args }) => {
    args = args.map((a) => a * scale); // TODO: Add scale in addition to pan.

    if (name === "line") {
      let x1 = args[0]; // x1
      let y1 = args[1]; // y1

      let x2 = args[2]; // x2
      let y2 = args[3]; // y2

      let nx1 = x1 * c - y1 * s;
      let ny1 = x1 * s + y1 * c;

      let nx2 = x2 * c - y2 * s;
      let ny2 = x2 * s + y2 * c;

      line(nx1, ny1, nx2, ny2);
    } else if (name === "point") point(...args);
  });
  unpan();
}

// Write out a line of text.
// TODO: Add directionality using a bresenham algorithm.
//       - Must know about height.
// TODO: Abstract this to another level, similar to 'draw' above.
//       - I would need to get the final drawing API and pass that to
//         a module that builds on it, then also has functions that
//         get added back to it. This would be *graph: layer 2*.
function printLine(
  text,
  font,
  startX,
  startY,
  width = 6,
  scale = 1,
  xOffset = 0
) {
  [...text.toString()].forEach((char, i) => {
    draw(font[char], startX + width * scale * i + xOffset, startY, scale);
  });
}

function noise16() {
  for (let i = 0; i < pixels.length; i += 4) {
    pixels[i] = byteInterval17(randInt(16)); // r
    pixels[i + 1] = byteInterval17(randInt(16)); // g
    pixels[i + 2] = byteInterval17(randInt(16)); // b
    pixels[i + 3] = 255; // a
  }
}

function noise16DIGITPAIN() {
  for (let i = 0; i < pixels.length; i += 4) {
    pixels[i] = byteInterval17(randInt(16)) * 0.6; // r
    pixels[i + 1] = byteInterval17(randInt(16)) * 0.15; // g
    pixels[i + 2] = byteInterval17(randInt(16)) * 0.55; // b
    pixels[i + 3] = 255; // a
  }
}

function noiseTinted(tint, amount, saturation) {
  // console.log("Tinting:", tint, amount, saturation);
  for (let i = 0; i < pixels.length; i += 4) {
    const grayscale = randInt(255);
    pixels[i] = lerp(
      lerp(grayscale, randInt(255), saturation),
      tint[0],
      amount
    ); // r
    pixels[i + 1] = lerp(
      lerp(grayscale, randInt(255), saturation),
      tint[1],
      amount
    ); // g
    pixels[i + 2] = lerp(
      lerp(grayscale, randInt(255), saturation),
      tint[2],
      amount
    ); // b
    pixels[i + 3] = 255; // a
  }
}

// 3. 3D Drawing (Kinda mixed with some 2D)

// a. Globals

const X = 0;
const Y = 1;
const Z = 2;
const W = 3;

// b. Geometric Abstractions

class Camera {
  matrix;
  x = 0;
  y = 0;
  #z = 0;

  #perspectiveMatrix;
  #transformMatrix;

  constructor(fov) {
    this.#perspective(fov);
    this.#transform();
    //this.#screen();
    this.matrix = this.#transformMatrix;
  }

  set z(n) {
    this.#z = n;
    this.#transform();
    this.matrix = this.#transformMatrix;
  }

  get z() {
    return this.#z;
  }

  forward(n) {
    this.#z -= n;
    this.#transform();
    this.matrix = this.#transformMatrix;
  }

  #perspective(fov) {
    const zNear = 0.1;
    const zFar = 1000;

    this.#perspectiveMatrix = perspective(
      create$2(),
      radians(fov),
      width / height,
      0.1,
      1000
    );

    // See: https://github.com/BennyQBD/3DSoftwareRenderer/blob/641f59125351d9565e744a90ad86256c3970a724/src/Matrix4f.java#L89
    // And compare it with: https://glmatrix.net/docs/mat4.js.html#line1508
    const zRange = zNear - zFar;
    const ten = (-zNear - zFar) / zRange;
    const eleven = (2 * zFar * zNear) / zRange;

    this.#perspectiveMatrix[10] = ten; // Set this Z component to 0.
    this.#perspectiveMatrix[14] = eleven;
    this.#perspectiveMatrix[11] = 1; // Flip the Y so we see things rightside up.
  }

  #transform() {
    // Camera pan / move:
    this.#transformMatrix = translate(create$2(), this.#perspectiveMatrix, [
      this.x,
      this.y,
      this.#z,
    ]);

    // Camera rotate:
    // mat4.rotate(perspective, perspective, radians(cr), [0, 0, 1]);
  }
}

// Mesh
class Form {
  // #primitive = "triangle";

  // Model
  vertices = [];
  indices;

  // TODO: Texture and color should be optional, and perhaps based on type.
  // TODO: Should this use a parameter called shader?
  texture; // = makeBuffer(32, 32);

  #gradientColors = [
    [1.0, 0.0, 0.0, 1.0],
    [0.0, 1.0, 0.0, 1.0],
    [0.0, 0.0, 1.0, 1.0],
  ];

  /*
  #texCoords = [
    [0.0, 0.0, 0.0, 0.0],
    [0.0, 1.0, 0.0, 0.0],
    [1.0, 1.0, 0.0, 0.0],
  ];
  */

  // Transform
  position = [0, 0, 0];
  rotation = [0, 0, 0];
  scale = [1, 1, 1];

  // Blending
  alpha = 1.0;

  constructor(
    // Model
    { positions, indices },
    fill,
    // Transform
    position = [0, 0, 0],
    rotation = [0, 0, 0],
    scale = [1, 1, 1]
  ) {
    // 1. Import a Model

    // Create new vertices from incoming positions.
    for (let i = 0; i < positions.length; i++) {
      // Generate texCoord from position instead of loading.
      // (Vertex / 2) + 0.5 // Vertex to UV
      // See also: (Vertex - 0.5) * 2 // UV to Vertex
      // TODO: This only works for quads right now.
      const texCoord = [
        positions[i][X] / 2 + 0.5,
        positions[i][Y] / 2 + 0.5,
        0, //positions[i][Z] / 2 + 0.5, // TODO: Is this necessary to calculate for UV?
        0,
      ];

      this.vertices.push(
        new Vertex(
          positions[i],
          this.#gradientColors[i % 3],
          texCoord //this.#texCoords[i % 3]
        )
      );
    }

    // Create indices from pre-indexed positions.
    this.indices = indices;

    // Assign texture or color.
    if (fill.texture) {
      this.texture = fill.texture;
    }

    // TODO: Set this.#type here from type.

    this.position = position;
    this.rotation = rotation;
    this.scale = scale;
  }

  graph({ matrix: cameraMatrix }) {
    // Build a matrix to represent this form's position, rotation and scale.

    const translate = fromTranslation(create$2(), this.position);
    const rotateY = fromYRotation(create$2(), radians(this.rotation[Y]));

    const rotateX = fromXRotation(create$2(), radians(this.rotation[X]));

    const rotateZ = fromZRotation(create$2(), radians(this.rotation[Z]));

    const rotate = mul$2(create$2(), rotateY, rotateX);
    mul$2(rotate, rotate, rotateZ);

    // Apply translation and rotation.
    const matrix = mul$2(create$2(), translate, rotate);

    // Apply scale.
    scale$2(matrix, matrix, this.scale);

    // Apply the camera matrix.
    mul$2(matrix, cameraMatrix, matrix);

    const transformedVertices = [];

    // Transform each vertex by the matrix.
    this.vertices.forEach((vertex) => {
      transformedVertices.push(vertex.transform(matrix));
    });

    // TODO: Switch on render type here. Right now it's only triangles.

    // Loop indices list to draw each triangle.
    for (let i = 0; i < this.indices.length; i += 3) {
      // Draw each triangle by applying the screen transform &
      // perspective divide (with clipping).
      drawTriangle(
        transformedVertices[i],
        transformedVertices[i + 1],
        transformedVertices[i + 2],
        // Eventually pass in a "shader" function instead of texture or alpha..
        this.texture,
        this.alpha
      );
    }
  }

  angle(x, y, z) {
    this.rotation[X] = x;
    this.rotation[Y] = y;
    this.rotation[Z] = z;
  }
}

/*
class Model {
  positions;
  texCoords;

  constructor(positions, texCoords) {
    this.positions = positions;
    this.texCoords = texCoords;
  }
}
*/

class Vertex {
  pos; // vec4
  color; // vec4
  texCoords; // vec4

  get x() {
    return this.pos[X];
  }

  get y() {
    return this.pos[Y];
  }

  get color24bit() {
    // 0-255
    return this.color.map((c) => floor$1(c * 255));
  }

  constructor(
    pos = [0, 0, 0, 1],
    color = [...c, 1.0],
    texCoords = [0, 0, 0, 0]
  ) {
    this.pos = fromValues(...pos);
    this.color = fromValues(...color);
    // if (Array.isArray(texCoords)) {
    this.texCoords = fromValues(...texCoords);
    // }
  }

  transform(matrix) {
    return new Vertex(
      transformMat4(create(), this.pos, matrix),
      this.color,
      this.texCoords
    );
  }

  perspectiveDivide() {
    return new Vertex(
      fromValues(
        this.pos[X] / this.pos[W],
        this.pos[Y] / this.pos[W],
        this.pos[Z] / this.pos[W],
        this.pos[W]
      ),
      this.color,
      this.texCoords
    );
  }
}

function initScreenSpaceTransformMatrix(halfWidth, halfHeight) {
  const m = create$2();
  translate(m, m, [halfWidth - 0.5, halfHeight - 0.5, 0]);
  scale$2(m, m, [halfWidth, -halfHeight, 1]);
  return m;
}

function isInsideViewFrustum(v4) {
  return (
    abs(v4[X]) <= abs(v4[W]) &&
    abs(v4[Y]) <= abs(v4[W]) &&
    abs(v4[Z]) <= abs(v4[W])
  );
}

// c. Rendering Procedures

class Edge {
  #x;
  #yStart;
  #yEnd;

  color;
  #colorStep;

  texCoordX;
  #texCoordXStep;
  texCoordY;
  #texCoordYStep;

  oneOverZ;
  #oneOverZStep;

  depth;
  #depthStep;

  get x() {
    return this.#x;
  }

  get yStart() {
    return this.#yStart;
  }

  get yEnd() {
    return this.#yEnd;
  }

  #xStep;

  constructor(gradients, minYVert, maxYVert, minYVertIndex) {
    this.#yStart = ceil(minYVert.y);
    this.#yEnd = ceil(maxYVert.y);

    const yDist = maxYVert.y - minYVert.y;
    const xDist = maxYVert.x - minYVert.x;

    const yPrestep = this.#yStart - minYVert.y;

    this.#xStep = xDist / yDist;
    this.#x = minYVert.x + yPrestep * this.#xStep;

    const xPrestep = this.#x - minYVert.x;

    // Texture

    this.texCoordX =
      gradients.texCoordX[minYVertIndex] +
      gradients.texCoordXXStep * xPrestep +
      gradients.texCoordXYStep * yPrestep;

    this.#texCoordXStep =
      gradients.texCoordXYStep + gradients.texCoordXXStep * this.#xStep;

    this.texCoordY =
      gradients.texCoordY[minYVertIndex] +
      gradients.texCoordYXStep * xPrestep +
      gradients.texCoordYYStep * yPrestep;

    this.#texCoordYStep =
      gradients.texCoordYYStep + gradients.texCoordYXStep * this.#xStep;

    this.oneOverZ =
      gradients.oneOverZ[minYVertIndex] +
      gradients.oneOverZXStep * xPrestep +
      gradients.oneOverZYStep * yPrestep;

    this.#oneOverZStep =
      gradients.oneOverZYStep + gradients.oneOverZXStep * this.#xStep;

    this.depth =
      gradients.depth[minYVertIndex] +
      gradients.depthXStep * xPrestep +
      gradients.depthYStep * yPrestep;

    this.#depthStep = gradients.depthYStep + gradients.depthXStep * this.#xStep;

    // Color
    {
      const vec = gradients.color[minYVertIndex].slice();
      add(vec, vec, scale(create(), gradients.colorYStep, yPrestep));
      add(vec, vec, scale(create(), gradients.colorXStep, xPrestep));
      this.color = vec;
    }

    {
      const vec = gradients.colorYStep.slice();
      const scaled = scale(create(), gradients.colorXStep, this.#xStep);
      add(vec, vec, scaled);
      this.#colorStep = vec;
    }
  }

  step() {
    this.#x += this.#xStep; // add xStep

    add(this.color, this.color, this.#colorStep); // add colorStep

    this.texCoordX += this.#texCoordXStep;
    this.texCoordY += this.#texCoordYStep;
    this.oneOverZ += this.#oneOverZStep;
    this.depth += this.#depthStep;

    // this.#lighting += this.#lightingStep // TODO: Add lighting.
  }
}

class Gradients {
  // See also: https://github.com/BennyQBD/3DSoftwareRenderer/blob/8f196cd3d9811c47638d102e08988162afffc04e/src/Gradients.java.
  // https://youtu.be/4sSL0kGMjMQ?t=1016

  oneOverZ;
  texCoordX;
  texCoordY;
  depth;

  texCoordXXStep;
  texCoordXYStep;
  texCoordYXStep;
  texCoordYYStep;

  oneOverZXStep;
  oneOverZYStep;

  depthXStep;
  depthYStep;

  color;
  colorYStep;
  colorXStep;

  constructor(minYVert, midYVert, maxYVert) {
    this.color = [minYVert.color, midYVert.color, maxYVert.color];

    const oneOverdX =
      1 /
      ((midYVert.x - maxYVert.x) * (minYVert.y - maxYVert.y) -
        (minYVert.x - maxYVert.x) * (midYVert.y - maxYVert.y));

    const oneOverdY = -oneOverdX;

    // Texture

    this.oneOverZ = [
      1 / minYVert.pos[W],
      1 / midYVert.pos[W],
      1 / maxYVert.pos[W],
    ];

    this.texCoordX = [
      minYVert.texCoords[X] * this.oneOverZ[0],
      midYVert.texCoords[X] * this.oneOverZ[1],
      maxYVert.texCoords[X] * this.oneOverZ[2],
    ];

    this.texCoordY = [
      minYVert.texCoords[Y] * this.oneOverZ[0],
      midYVert.texCoords[Y] * this.oneOverZ[1],
      maxYVert.texCoords[Y] * this.oneOverZ[2],
    ];

    this.depth = [minYVert.pos[Z], midYVert.pos[Z], maxYVert.pos[Z]];

    // Note that the W component is the perspective Z value;
    // The Z component is the occlusion Z value
    this.texCoordXXStep = Gradients.calcXStep(
      this.texCoordX,
      minYVert,
      midYVert,
      maxYVert,
      oneOverdX
    );

    this.texCoordXYStep = Gradients.calcYStep(
      this.texCoordX,
      minYVert,
      midYVert,
      maxYVert,
      oneOverdY
    );

    this.texCoordYXStep = Gradients.calcXStep(
      this.texCoordY,
      minYVert,
      midYVert,
      maxYVert,
      oneOverdX
    );

    this.texCoordYYStep = Gradients.calcYStep(
      this.texCoordY,
      minYVert,
      midYVert,
      maxYVert,
      oneOverdY
    );

    this.oneOverZXStep = Gradients.calcXStep(
      this.oneOverZ,
      minYVert,
      midYVert,
      maxYVert,
      oneOverdX
    );

    this.oneOverZYStep = Gradients.calcYStep(
      this.oneOverZ,
      minYVert,
      midYVert,
      maxYVert,
      oneOverdY
    );

    this.depthXStep = Gradients.calcXStep(
      this.depth,
      minYVert,
      midYVert,
      maxYVert,
      oneOverdX
    );

    this.depthYStep = Gradients.calcYStep(
      this.depth,
      minYVert,
      midYVert,
      maxYVert,
      oneOverdY
    );

    // Color

    // (c1 - c2) * (y0 - y2) - (c0 - c2) * (y1 - y2)
    // a           b           c           d
    {
      const a = sub(create(), this.color[1], this.color[2]);
      const b = minYVert.y - maxYVert.y;

      const c = sub(create(), this.color[0], this.color[2]);
      const d = midYVert.y - maxYVert.y;

      const left = scale(create(), a, b);
      const right = scale(create(), c, d);

      const sub$1 = sub(create(), left, right);

      this.colorXStep = scale(create(), sub$1, oneOverdX);
    }

    // (c1 - c2) * (x0 - x2) - (c0 - c2) * (x1 - x2)
    // a           b           c           d
    {
      const a = sub(create(), this.color[1], this.color[2]);
      const b = minYVert.x - maxYVert.x;

      const c = sub(create(), this.color[0], this.color[2]);
      const d = midYVert.x - maxYVert.x;

      const left = scale(create(), a, b);
      const right = scale(create(), c, d);

      const sub$1 = sub(create(), left, right);

      this.colorYStep = scale(create(), sub$1, oneOverdY);
    }
  }

  static calcXStep(values, minYVert, midYVert, maxYVert, oneOverdX) {
    return (
      ((values[1] - values[2]) * (minYVert.y - maxYVert.y) -
        (values[0] - values[2]) * (midYVert.y - maxYVert.y)) *
      oneOverdX
    );
  }

  static calcYStep(values, minYVert, midYVert, maxYVert, oneOverdY) {
    return (
      ((values[1] - values[2]) * (minYVert.x - maxYVert.x) -
        (values[0] - values[2]) * (midYVert.x - maxYVert.x)) *
      oneOverdY
    );
  }
}

// d. Triangle Rendering

function drawTriangle(v1, v2, v3, texture, alpha) {
  if (
    isInsideViewFrustum(v1.pos) &&
    isInsideViewFrustum(v2.pos) &&
    isInsideViewFrustum(v3.pos)
  ) {
    fillTriangle(v1, v2, v3, texture, alpha);
    return;
  }

  // TODO: Fix clipping.
  // return;

  /*
  const vertices = [v1, v2, v3];
  const auxillaryList = [];

  if (
    clipPolygonAxis(vertices, auxillaryList, 0) &&
    clipPolygonAxis(vertices, auxillaryList, 1) &&
    clipPolygonAxis(vertices, auxillaryList, 2)
  ) {
    const initialVertex = vertices[0];
    for (let i = 1; i < vertices.length - 1; i += 1) {
      fillTriangle(initialVertex, vertices[i], vertices[i + 1], texture, alpha);
    }
  }
   */
}

function fillTriangle(minYVert, midYVert, maxYVert, texture, alpha) {
  const screenMatrix = initScreenSpaceTransformMatrix(width / 2, height / 2);

  minYVert = minYVert.transform(screenMatrix).perspectiveDivide();
  midYVert = midYVert.transform(screenMatrix).perspectiveDivide();
  maxYVert = maxYVert.transform(screenMatrix).perspectiveDivide();

  // Backface culling by checking if Z normal is negative.

  // TODO: Add normal to vertex (for basic lighting) here?

  /*
                                                        if (triangleAreaDouble(minYVert, maxYVert, midYVert) >= 0) {
                                                          return;
                                                        }
                                                         */

  if (maxYVert.y < midYVert.y) {
    const temp = maxYVert;
    maxYVert = midYVert;
    midYVert = temp;
  }

  if (midYVert.y < minYVert.y) {
    const temp = midYVert;
    midYVert = minYVert;
    minYVert = temp;
  }

  if (maxYVert.y < midYVert.y) {
    const temp = maxYVert;
    maxYVert = midYVert;
    midYVert = temp;
  }

  const handedness = triangleAreaDouble(minYVert, maxYVert, midYVert) >= 0;

  scanTriangle(minYVert, midYVert, maxYVert, handedness, texture, alpha);

  // Debug / Wireframes
  // TODO: How to accurately outline a triangle?
  // in drawScanLine: Add border at xMin and xMax and also use j to know if we are at the bottom.

  // const tempColor = c.slice();
  // color(127, 127, 127);
  // line(minYVert.x, minYVert.y, midYVert.x, midYVert.y);
  // line(midYVert.x, midYVert.y, maxYVert.x, maxYVert.y);
  // line(minYVert.x, minYVert.y, maxYVert.x, maxYVert.y);
  //
  // color(...tempColor);
  //
  // color(...minYVert.color24bit);
  // plot(minYVert.x, minYVert.y);
  //
  // color(...midYVert.color24bit);
  // plot(midYVert.x, midYVert.y);
  //
  // color(...maxYVert.color24bit);
  // plot(maxYVert.x, maxYVert.y);
}

function triangleAreaDouble(a, b, c) {
  const x1 = b.x - a.x;
  const y1 = b.y - a.y;
  const x2 = c.x - a.x;
  const y2 = c.y - a.y;
  return x1 * y2 - x2 * y1;
}

function scanTriangle(
  minYVert,
  midYVert,
  maxYVert,
  handedness,
  texture,
  alpha
) {
  const gradients = new Gradients(minYVert, midYVert, maxYVert);
  const topToBottom = new Edge(gradients, minYVert, maxYVert, 0);
  const topToMiddle = new Edge(gradients, minYVert, midYVert, 0);
  const middleToBottom = new Edge(gradients, midYVert, maxYVert, 1);
  scanEdges(gradients, topToBottom, topToMiddle, handedness, texture, alpha);
  scanEdges(gradients, topToBottom, middleToBottom, handedness, texture, alpha);
}

function scanEdges(gradients, a, b, handedness, texture, alpha) {
  let left = a;
  let right = b;
  if (handedness) {
    let temp = left;
    left = right;
    right = temp;
  }

  const yStart = b.yStart;
  const yEnd = b.yEnd;

  for (let i = yStart; i < yEnd; i += 1) {
    drawScanLine(gradients, left, right, i, texture, alpha);
    left.step();
    right.step();
  }
}

function drawScanLine(gradients, left, right, j, texture, alpha) {
  const xMin = ceil(left.x);
  const xMax = ceil(right.x);

  const xPrestep = xMin - left.x;

  // Texture

  const xDist = right.x - left.x;
  const texCoordXXStep = (right.texCoordX - left.texCoordX) / xDist;
  const texCoordYXStep = (right.texCoordY - left.texCoordY) / xDist;
  const oneOverZXStep = (right.oneOverZ - left.oneOverZ) / xDist;

  const depthXStep = (right.depth - left.depth) / xDist;

  let texCoordX = left.texCoordX + texCoordXXStep * xPrestep;
  let texCoordY = left.texCoordY + texCoordYXStep * xPrestep;
  let oneOverZ = left.oneOverZ + oneOverZXStep * xPrestep;
  let depth = left.depth + depthXStep * xPrestep;

  // Color
  const gradientColor = add(
    create(),
    left.color,
    scale(create(), gradients.colorXStep, xPrestep)
  );

  for (let i = xMin; i < xMax; i += 1) {
    const index = i + j * width;

    if (depth < depthBuffer[index]) {
      depthBuffer[index] = depth;

      // TODO: Add color and fog.
      // const stretchedDepth = 1 - (depth - 0.9) * 10;
      // console.log(stretchedDepth);
      // const r = Math.floor(gradientColor[X] * 255 + 0.5);
      // const g = Math.floor(gradientColor[Y] * 255 + 0.5);
      // const b = Math.floor(gradientColor[Z] * 255 + 0.5);
      // color(255 * stretchedDepth, 255 * stretchedDepth, 255 * stretchedDepth);
      // plot(i, j);

      const z = 1 / oneOverZ;

      const srcX = texCoordX * z * (texture.width - 1) + 0.5;
      const srcY = texCoordY * z * (texture.height - 1) + 0.5;

      copy(i, j, srcX, srcY, texture, alpha); // TODO: Eventually remove alpha from here.
    }

    add(gradientColor, gradientColor, gradients.colorXStep);
    texCoordX += texCoordXXStep;
    texCoordY += texCoordYXStep;
    oneOverZ += oneOverZXStep;
    depth += depthXStep;
  }
}

/*
function graphicLog(log) {
  graphicLogCount = Math.min(graphicLogCount + 1, graphicLogMax);
  if (graphicLogCount < graphicLogMax) {
    console.log(log);
  }
}
*/

const { round: round$1 } = Math;

function spinner(ctx, timePassed) {
  const gap = 12,
    s = 6;

  ctx.save();
  ctx.translate(s + gap, s + gap);
  ctx.rotate(radians(timePassed % 360) * 1);

  ctx.beginPath();
  // \ of the X
  ctx.moveTo(-s, -s); // top left
  ctx.lineTo(s, s); // bottom right
  // / of the X
  //ctx.moveTo(-s, s); // bottom left
  //ctx.lineTo(s, -s); // top right

  ctx.strokeStyle = "rgb(255, 255, 0)";
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.stroke();

  ctx.restore();
}

function cached(ctx) {
  const gap = 4,
    s = 20;

  ctx.save();
  ctx.translate(round$1(gap / 2) + 6, round$1(gap / 2) + 4); // TODO: Translate before clearing to save some lines? 2022.02.02.03.30

  ctx.beginPath();

  ctx.moveTo(gap, gap); // left
  ctx.lineTo(gap, s);
  ctx.moveTo(gap * 3.5, gap); // right
  ctx.lineTo(gap * 3.5, s);

  ctx.strokeStyle = "rgb(0, 255, 255)";
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.stroke();

  ctx.restore();
}

class Button {
  box;
  down = false;
  icon;

  constructor() {
    if (arguments.length === 1) {
      // Assume we are passing in a box {x,y,w,h} object.
      this.box = Box.copy(arguments[0]);
    } else this.box = new Box(...arguments); // Otherwise: x, y, w, h for a box.
  }

  act(e, pushCb) {
    // 1. Down: Enable the button if we touched over it.
    if (e.is("touch") && this.box.contains(e)) this.down = true;

    // 2. Cancel: Disable the button if it has been pressed and was dragged off.
    if (e.is("draw") && !this.box.contains(e)) this.down = false;

    // 3. Push: Trigger the button if we push it.
    if (e.is("lift") && this.down) {
      if (this.box.contains(e)) pushCb(); // TODO: Params for the cb? 2021.12.11.16.56
      this.down = false;
    }
  }
}

// 🌚 Glaze (Shader Uniforms) 2022.04.11.04.52
// Already available: iTexture, iTexturePost, iTime, iMouse, iResolution

// ⚠️ This file is for exposing remote customization of uniforms to pieces.
//    These values are set every frame, currently just for the `frag` stage of
//    the pipeline.

const uniforms = {};

uniforms.digitpain0 = {
  // "1i:testInteger": 0,
};

// Used for the `prompt` piece.
uniforms.prompt = {
  "1i:fogIterations": 20,
  "1i:shadowIterations": 5,
  "1f:focalLength": 1,
  "1f:screenScale": 1,
  "1f:shadowRange": 1,
  "1f:cameraDistance": 2.236,
  "1f:volumeRadius": 0.005,
  "1f:inputRadius": 0.005,
  "1f:innerDensity": 20,
  "1f:outerDensity": 10.1,
  "1f:anisotropy": -0.123,
  "1f:lightPower": 4,
  "3f:lightColor": [1, 1, 1], // r, g, b
  "3f:lightDirection": [-1, -1, -0.05], // x, y, z
  "3f:bgColor": [0.084, 0.0533, 0.078], // r, g, b,
};

// 📚 Helpers

/*
export function times(n, fun) {
  const accum = Array(Math.max(0, n));
  for (let i = 0; i < n; i += 1) accum[i] = fun();
  return accum;
}
*/

// Generate a sealed object with named keys set to undefined.
function apiObject() {
  const obj = {};
  for (const key of arguments) obj[key] = undefined;
  return Object.seal(obj);
}

function extension(filename) {
  // https://stackoverflow.com/a/680982
  return /(?:\.([^.]+))?$/.exec(filename)[1];
}

// Returns true if the object is not an Array.
function notArray(obj) {
  return !Array.isArray(obj);
}

// Wraps anything other than undefined & null that isn't an array with `[any]`.
// Undefined or null yields: `[]`.
function wrapNotArray(any) {
  if (any !== undefined && any !== null && notArray(any)) return [any];
  else if (Array.isArray(any)) return any;
  else return [];
}

// Returns content remaining after the last "\" of a string.
// Used for URL path resolution.
function pathEnd(path) {
  return path.substring(path.lastIndexOf("/") + 1);
}

// ✨ Glaze 2022.02.06.15.09
// This creates a nice webgl2 rendering layer
// over the scaled software rasterizer.

// TODO: Rename the pipeline stages from frag->compute->display to something
//       that makes the most sense for @mxsage.

// TODO: Change `setCustomUniforms` to `setCustomFragUniforms` after renaming
//       frag to something else.

const { keys } = Object;

class Glaze {
  loaded = false;
  shadersLoaded = false;
  uniformNames;
  frag;

  #uniforms;
  #type;

  constructor(type = "prompt") {
    this.#type = type;
    this.#uniforms = uniforms[type];
    this.uniformNames = keys(this.#uniforms).map((id) => id.split(":")[1]);
  }

  async load(callback) {
    const names = [
      `./glazes/${this.#type}/${this.#type}-frag`,
      `./glazes/${this.#type}/${this.#type}-compute`,
      `./glazes/${this.#type}/${this.#type}-display`,
    ];
    const shaders = await preloadShaders(names);
    this.frag = shaders[pathEnd(names[0])];
    this.compute = shaders[pathEnd(names[1])];
    this.display = shaders[pathEnd(names[2])];
    this.shadersLoaded = true;
    callback();
  }

  // Export a list of clean uniform names... everything after the ":".
  setCustomUniforms(locations, gl) {
    // Parse every key in custom uniforms, then apply the uniform values.
    keys(this.#uniforms).forEach((uniformIdentifier) => {
      const [type, name] = uniformIdentifier.split(":");
      gl[`uniform${type}`](
        locations[name],
        ...wrapNotArray(this.#uniforms[uniformIdentifier])
      );
    });
  }
}

let gl, canvas;
let glaze;

(await preloadShaders(["glazes/passthrough-vert"]))["passthrough-vert"];

let customProgram, computeProgram, displayProgram;
let fb; // Frame-buffer.
let texSurf, texFbSurfA, texFbSurfB; // Original aesthetic.computer surface texture,
// in addition to a double-buffer.
let texSurfWidth, texSurfHeight;
let vao;

let customUniformLocations = {};
const displayUniformLocations = {};

let offed = false;

// Turn glaze off if it has already been turned on.
function off() {
  if (offed && canvas) canvas.style.opacity = 0;
  offed = true;
}

// Turn glaze on if it has already been turned off.
async function on(w, h, rect, nativeWidth, nativeHeight, wrapper, type) {
  glaze = new Glaze(type);
  await glaze.load(() => {
    this.frame(w, h, rect, nativeWidth, nativeHeight, wrapper);
    offed = false;
  });
  return glaze;
}

// Update the texture either in whole or in part based on a dirtyRect from `bios`.
function update(texture, x = 0, y = 0) {
  if (glaze === undefined || glaze.loaded === false) return;

  gl.bindTexture(gl.TEXTURE_2D, texSurf);

  // TODO: I could pass in a subrectangle and do texSubImage2D here.
  // texSubImage2D(target: GLenum, level: GLint, xoffset: GLint, yoffset: GLint, width: GLsizei, height: GLsizei, format: GLenum, type: GLenum, pixels: ArrayBufferView | null): void;

  gl.texSubImage2D(
    gl.TEXTURE_2D,
    0,
    x,
    y,
    texture.width,
    texture.height,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    texture // Note: passing in canvasTexture did not work in Safari 15.2 so I am passing in imageData instead.
  );
}

// Draw the current output to a scaled freeze frame if the system is changing resolutions and neeeds a hold.
function freeze(fCtx) {
  fCtx.drawImage(canvas, 0, 0, fCtx.canvas.width, fCtx.canvas.height);
  clear();
  canvas.style.opacity = 0;
}

function render(canvasTexture, time, mouse) {
  if (glaze === undefined || glaze.loaded === false) return;

  // 🅰️ Render Surface
  gl.useProgram(customProgram);

  gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

  gl.framebufferTexture2D(
    gl.FRAMEBUFFER,
    gl.COLOR_ATTACHMENT0,
    gl.TEXTURE_2D,
    texFbSurfA,
    0
  );

  // Resolution of custom filter.
  // TODO: Add the option to switch to full "native" resolution mode. 2022.04.11.03.48
  gl.viewport(0, 0, texSurfWidth, texSurfHeight);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texSurf);
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, texFbSurfB);

  gl.uniform1i(customUniformLocations.iTexture, 0);
  gl.uniform1i(customUniformLocations.iTexturePost, 1);
  gl.uniform1f(customUniformLocations.iTime, time);
  gl.uniform2f(customUniformLocations.iMouse, mouse.x, mouse.y);
  gl.uniform2f(customUniformLocations.iResolution, texSurfWidth, texSurfHeight);

  glaze.setCustomUniforms(customUniformLocations, gl);

  gl.bindVertexArray(vao);
  gl.drawElementsInstanced(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0, 1);

  // 🅱️ Compute Surface
  gl.useProgram(computeProgram);

  gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

  gl.framebufferTexture2D(
    gl.FRAMEBUFFER,
    gl.COLOR_ATTACHMENT0,
    gl.TEXTURE_2D,
    texFbSurfB,
    0
  );

  gl.viewport(0, 0, texSurfWidth, texSurfHeight);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texSurf);
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, texFbSurfA);

  gl.uniform1i(gl.getUniformLocation(computeProgram, "iTexture"), 0);
  gl.uniform1i(gl.getUniformLocation(computeProgram, "iTexturePost"), 1);
  gl.uniform1f(gl.getUniformLocation(computeProgram, "iTime"), time);
  gl.uniform2f(
    gl.getUniformLocation(computeProgram, "iMouse"),
    mouse.x,
    mouse.y
  );
  gl.uniform2f(
    gl.getUniformLocation(computeProgram, "iResolution"),
    texSurfWidth,
    texSurfHeight
  );

  //glaze.setComputeUniforms(computeUniformLocations, gl);

  gl.bindVertexArray(vao);
  gl.drawElementsInstanced(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0, 1);

  //©️ Display Surface
  gl.useProgram(displayProgram);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texSurf);

  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, texFbSurfB);

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  gl.uniform1i(displayUniformLocations.iTexture, 0);
  gl.uniform1i(displayUniformLocations.iTexturePost, 1);
  gl.uniform2f(displayUniformLocations.iMouse, mouse.x, mouse.y);
  gl.uniform2f(
    displayUniformLocations.iResolution,
    gl.canvas.width,
    gl.canvas.height
  );
  gl.uniform1f(displayUniformLocations.iTime, time);
  gl.drawElementsInstanced(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0, 1);
}

// Loads shader sources from a list of filenames: [url1, url2...]
// Then adds them to lib[].
async function preloadShaders(pathArray) {
  const sources = await Promise.all(
    pathArray.map((path) =>
      fetch("aesthetic.computer/lib/" + path + ".glsl").then((file) => {
        return file.text();
      })
    )
  );

  const lib = {};
  pathArray.forEach((path, i) => (lib[pathEnd(path)] = sources[i]));
  return lib;
}

function clear(r = 0, g = 1, b = 0) {
  gl?.clearColor(r, g, b, 1);
  gl?.clear(gl.COLOR_BUFFER_BIT);
}

/*
function getSample(point, w = 1, h = 1) {
  const x = Math.floor(point[0] * gl.canvas.width);
  const y = Math.floor(point[1] * gl.canvas.height);
  const sample = new Uint8Array(3 * w * h); // A 1 pixel, RGB sample
  gl.readPixels(x, y, w, h, gl.RGB, gl.UNSIGNED_BYTE, sample);
  console.log("Glaze sample:", sample);
  return sample;
}
*/

// 💻 BIOS

const { assign } = Object;
const { round, floor, min } = Math;

// 💾 Boot the system and load a disk.
async function boot$1(
  path = "index",
  bpm = 60,
  host = window.location.host,
  resolution,
  debug
) {
  // Title
  console.log(
    "%caesthetic.computer",
    `background: rgb(10, 20, 40);
     color: rgb(120, 120, 170);
     font-size: 120%;
     padding: 0 0.25em;
     border-radius: 0.15em;
     border-bottom: 0.75px solid rgb(120, 120, 170);
     border-right: 0.75px solid rgb(120, 120, 170);`
  ); // Print a pretty title in the console.

  // Global Keyboard Shortcuts
  console.log(
    `%cFullscreen: C-x, Prompt: ~`,
    `background-color: black;
     color: grey;
     padding: 0 0.25em;
     border-left: 0.75px solid rgb(60, 60, 60);
     border-right: 0.75px solid rgb(60, 60, 60);`
  );

  // What words to type in?
  console.log(
    "%cgithub.com/digitpain/aesthetic.computer",
    `color: rgb(100, 100, 100);
     background-color: black;
     padding: 0 0.25em;
     border-left: 0.75px solid rgb(60, 60, 60);
     border-right: 0.75px solid rgb(60, 60, 60);`
  );

  if (debug) {
    if (window.isSecureContext) {
      console.log("🔒 Secure");
    } else {
      console.warn("🔓 Insecure");
    }
  }

  let pen, keyboard;
  let timePassed = 0;

  let diskSupervisor;
  let currentPiece = null; // Gets set to a path after `loaded`.

  // 0. Video storage
  const videos = [];

  // 1. Rendering

  // Wrap everything in an #aesthetic-computer div.
  const wrapper = document.createElement("div");
  wrapper.id = "aesthetic-computer";

  // Our main display surface.
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  // A ui canvas for rendering a native resolution ui on top of everything.
  const uiCanvas = document.createElement("canvas");
  const uiCtx = uiCanvas.getContext("2d");
  uiCanvas.dataset.type = "ui";

  // A buffer for nicer resolution switches, nice when moving from
  // low resolution back to high resolution. Could eventually be used
  // for transition effects.
  const freezeFrameCan = document.createElement("canvas");
  const ffCtx = freezeFrameCan.getContext("2d");
  freezeFrameCan.dataset.type = "freeze";

  let imageData;
  let fixedWidth, fixedHeight;
  let projectedWidth, projectedHeight;
  let canvasRect;

  let glaze = { on: false };

  let needsReframe = false;
  let needsReappearance = false;
  let freezeFrame = false,
    freezeFrameGlaze = false;

  const screen = apiObject("pixels", "width", "height");

  const REFRAME_DELAY = 250;
  let curReframeDelay = REFRAME_DELAY;
  let gap = 0;
  let density = 1; // added to window.devicePixelRatio

  function frame(width, height) {
    // Cache the current canvas if needed.
    if (freezeFrame && imageData) {
      console.log(
        "🥶 Freezing:",
        freezeFrame,
        imageData.width,
        imageData.height
      );

      freezeFrameCan.width = imageData.width;
      freezeFrameCan.height = imageData.height;

      freezeFrameCan.style.width = canvas.getBoundingClientRect().width;
      freezeFrameCan.style.height = canvas.getBoundingClientRect().height;

      // TODO: Get margin of canvasRect or make freezeFrame work on top of everything...
      // Is this still relevant? 2022.4.09

      /*
      console.log(
        "Freezeframe offset",
        wrapper.offsetLeft,
        canvasRect.x,
        canvasRect.width - canvasRect.x
      );
       */

      freezeFrameCan.style.left = canvasRect.x + "px";
      freezeFrameCan.style.top = canvasRect.y + "px";

      // TODO: Save the Glaze canvas if glaze is enabled / figure out how to deal
      //       with Glaze.

      if (freezeFrameGlaze) {
        console.log("Freeze glaze!");
        freeze(ffCtx);
        // ffCtx.fillStyle = "lime";
        // ffCtx.fillRect(0, 0, ffCtx.canvas.width, ffCtx.canvas.height);
        freezeFrameGlaze = false;
      } else {
        ffCtx.putImageData(imageData, 0, 0);
      }

      if (!wrapper.contains(freezeFrameCan)) wrapper.append(freezeFrameCan);
      else freezeFrameCan.style.removeProperty("opacity");
      canvas.style.opacity = 0;
    }

    // Find the width and height of our default screen and native projection.
    width = width || fixedWidth;
    height = height || fixedHeight;

    const gapSize = gap * window.devicePixelRatio;

    if (width === undefined && height === undefined) {
      // Automatically set and frame a reasonable resolution.
      // Or pull from density.
      if (window.devicePixelRatio === 1) density = 2; // Always force a screen density of 3 on non-retina displays.
      const subdivisions = density + window.devicePixelRatio;
      width = floor(window.innerWidth / subdivisions);
      height = floor(window.innerHeight / subdivisions);
      projectedWidth = width * subdivisions - gapSize;
      projectedHeight = height * subdivisions - gapSize;
    } else {
      // Or do it manually if both width and height are defined.
      fixedWidth = width;
      fixedHeight = height;

      const scale = min(window.innerWidth / width, window.innerHeight / height);

      console.log(window.innerWidth, window.innerHeight);

      projectedWidth = floor(width * scale - gapSize);
      projectedHeight = floor(height * scale - gapSize);
    }

    if (debug)
      console.info(
        "🔭 View:",
        width,
        height,
        "🖥 Window:",
        window.innerWidth,
        window.innerHeight
      );

    // Send a message about this new width and height to any hosting frames.
    // parent.postMessage({ width: projectedWidth, height: projectedHeight }, "*");

    canvas.width = width;
    canvas.height = height;

    uiCanvas.width = projectedWidth * window.devicePixelRatio;
    uiCanvas.height = projectedHeight * window.devicePixelRatio;

    // Add some fancy ratios to the canvas and uiCanvas.
    canvas.style.width = `calc(100vw - ${gapSize}px)`;
    canvas.style.height = `calc(calc(${
      height / width
    } * 100vw) - ${gapSize}px)`;
    canvas.style.maxHeight = `calc(100vh - ${gapSize}px)`;
    canvas.style.maxWidth = `calc(calc(${
      width / height
    } * 100vh) - ${gapSize}px)`;

    uiCanvas.style.width = `calc(100vw - ${gapSize}px)`;
    uiCanvas.style.height = `calc(calc(${
      height / width
    } * 100vw) - ${gapSize}px)`;
    uiCanvas.style.maxHeight = `calc(100vh - ${gapSize}px)`;
    uiCanvas.style.maxWidth = `calc(calc(${
      width / height
    } * 100vh) - ${gapSize}px)`;

    if (imageData) ctx.putImageData(imageData, 0, 0);

    imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    assign(screen, { pixels: imageData.data, width, height });

    // Add the canvas & uiCanvas when we first boot up.
    if (!wrapper.contains(canvas)) {
      wrapper.append(canvas);
      wrapper.append(uiCanvas);
      document.body.append(wrapper);

      // Trigger it to re-draw whenever the window resizes.
      let timeout;
      window.addEventListener("resize", (e) => {
        // Check to see if we are in "native-cursor" mode and hide
        // #aesthetic.computer for the resize if we aren't.
        if (document.body.classList.contains("native-cursor") === false) {
          wrapper.classList.add("hidden");
        }

        window.clearTimeout(timeout); // Small timer to save on performance.

        timeout = setTimeout(() => {
          needsReframe = true; // This makes zooming work / not work.
          curReframeDelay = REFRAME_DELAY;
        }, curReframeDelay); // Is this needed?
      });

      // Prevent canvas touchstart events from triggering magnifying glass on
      // iOS Safari.
      canvas.addEventListener(
        "touchstart",
        function (event) {
          event.preventDefault();
        },
        false
      );
    }

    canvasRect = canvas.getBoundingClientRect();

    clear(); // TODO: Should this be here?

    // A native resolution canvas for drawing cursors, system UI, and effects.
    if (glaze.on) {
      on(
        canvas.width,
        canvas.height,
        canvasRect,
        projectedWidth,
        projectedHeight,
        wrapper,
        glaze.type
      );

      canvas.style.opacity = 0;
    } else {
      off();
    }

    needsReframe = false;
    needsReappearance = true; // Only for `native-cursor` mode.
    send({ type: "needs-paint" });
  }

  // 2. Audio
  const sound = {
    bpm: new Float32Array(1),
  };

  let updateMetronome,
    updateSquare,
    updateBubble,
    attachMicrophone,
    audioContext;

  function startSound() {
    audioContext = new AudioContext({
      latencyHint: "interactive",
      // TODO: Eventually choose a good sample rate and/or make it settable via
      //       the current disk.
      sampleRate: 44100,
      // sampleRate: 48000,
      // sampleRate: 96000,
      // sampleRate: 192000,
    });

    if (audioContext.state === "running") {
      audioContext.suspend();
    }

    // TODO: Check to see if there is support for AudioWorklet or not...
    //       and and use ScriptProcessorNode as a fallback. 2022.01.13.21.00

    // Microphone Input Processor
    // (Gets attached via a message from the running disk.)
    attachMicrophone = async (data) => {
      console.log("Attaching microphone:", data);

      const micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          latency: 0,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });

      const micNode = new MediaStreamAudioSourceNode(audioContext, {
        mediaStream: micStream,
      });

      await audioContext.audioWorklet.addModule(
        "aesthetic.computer/lib/microphone.js"
      );
      const playerNode = new AudioWorkletNode(audioContext, "microphone", {
        outputChannelCount: [2],
      });

      micNode.connect(playerNode);
      playerNode.connect(audioContext.destination);
    };

    // Sound Synthesis Processor
    (async () => {
      await audioContext.audioWorklet.addModule(
        "aesthetic.computer/lib/speaker.js"
      );
      const soundProcessor = new AudioWorkletNode(
        audioContext,
        "sound-processor",
        { outputChannelCount: [2], processorOptions: { bpm: sound.bpm[0] } }
      );

      updateMetronome = function (newBPM) {
        soundProcessor.port.postMessage({
          type: "new-bpm",
          data: newBPM,
        });
      };

      updateSquare = function (square) {
        soundProcessor.port.postMessage({
          type: "square",
          data: square,
        });
      };

      updateBubble = function (bubble) {
        soundProcessor.port.postMessage({
          type: "bubble",
          data: bubble,
        });
      };

      soundProcessor.port.onmessage = (e) => {
        const time = e.data;
        diskSupervisor.requestBeat?.(time);
      };

      soundProcessor.connect(audioContext.destination);
    })();

    window.addEventListener("pointerdown", async () => {
      if (["suspended", "interrupted"].includes(audioContext.state)) {
        audioContext.resume();
      }
    });

    window.addEventListener("keydown", async () => {
      if (["suspended", "interrupted"].includes(audioContext.state)) {
        audioContext.resume();
      }
    });
  }

  // TODO: Add mute
  // function mute() {
  //   audioContext.suspend();
  //   // Or... audioContext.resume();
  // }

  // Grab query parameters.
  const search = new URL(self.location).search;

  // Try to load the disk boilerplate as a worker first.
  // Safari and FF support is coming for worker module imports: https://bugs.webkit.org/show_bug.cgi?id=164860
  const worker = new Worker("./aesthetic.computer/disk-out.js", {
    type: "module",
  });
  const params = path.split(":");
  const program = params[0];
  params.shift(); // Strip the program out of params.
  const firstMessage = { path: program, params, host, search, debug };

  // Rewire things a bit if workers with modules are not supported (Firefox).
  worker.onerror = async (err) => {
    if (
      err.message ===
      "SyntaxError: import declarations may only appear at top level of a module"
    ) {
      console.error(
        "🟡 Disk module workers unsupported. Continuing with dynamic import..."
      );
      const module = await Promise.resolve().then(function () {
        return disk;
      });
      module.noWorker.postMessage = (e) => onMessage(e); // Define the disk's postMessage replacement.
      send = (e) => module.noWorker.onMessage(e); // Hook up our post method to disk's onmessage replacement.
      send(firstMessage);
    } else {
      console.error("🛑 Disk error:", err);
      // TODO: Try and save the crash here by restarting the worker
      //       without a full system reload?
    }
  };

  let send = (e) => worker.postMessage(e);
  let onMessage = loaded;

  worker.onmessage = (e) => onMessage(e);

  // Start everything once the disk is loaded.
  function loaded(e) {
    if (e.data.loaded === true) {
      //console.log("💾", path, "🌐", host);
      onMessage = receivedChange;
      diskSupervisor = { requestBeat, requestFrame };
      // Set currentPiece to be the last segment of the path.

      // Pen (also handles touch & pointer events)
      pen = new Pen((x, y) => {
        return {
          x: floor(((x - canvasRect.x) / projectedWidth) * screen.width),
          y: floor(((y - canvasRect.y) / projectedHeight) * screen.height),
        };
      });

      // ⌨️ Keyboard
      keyboard = new Keyboard();
      {
        /**
         * Insert a hidden input element that is used to toggle the software
         * keyboard on touchscreen devices like iPhones and iPads.
         * *Only works in "disks/prompt".
         */
        const input = document.createElement("input");
        input.id = "software-keyboard-input";
        input.type = "text";
        input.style.opacity = 0;
        input.style.width = 0;
        input.style.height = 0;
        input.style.position = "absolute";
        wrapper.append(input);

        input.addEventListener("input", (e) => (e.target.value = null));

        let touching = false;
        let keyboardOpen = false;

        // TODO: The input element could be created and added to the DOM here
        //       if it didn't already exist?
        window.addEventListener("touchstart", () => (touching = true));

        window.addEventListener("focusout", (e) => {
          if (keyboardOpen) {
            keyboard.events.push({ name: "keyboard:close" });
            keyboardOpen = false;
          }
        });

        // Make a pointer "tap" gesture with an `inTime` window of 250ms to
        // trigger the keyboard on all browsers.
        let down = false;
        let downPos;
        let inTime = false;

        window.addEventListener("pointerdown", (e) => {
          if (currentPiece === "aesthetic.computer/disks/prompt") {
            down = true;
            downPos = { x: e.x, y: e.y };
            inTime = true;
            setTimeout(() => (inTime = false), 250);
            e.preventDefault();
          }
        });

        window.addEventListener("pointerup", (e) => {
          if (
            down &&
            dist(downPos.x, downPos.y, e.x, e.y) < 8 &&
            inTime &&
            currentPiece === "aesthetic.computer/disks/prompt" &&
            // Commenting the above allows iframes to capture keyboard events. 2022.04.07.02.10
            document.activeElement !== input
          ) {
            input.focus();
            if (touching) {
              touching = false;
              keyboard.events.push({ name: "keyboard:open" });
              keyboardOpen = true;
            }
            down = false;
            e.preventDefault();
          }
        });

        input.addEventListener("focus", (e) => {
          keyboard.events.push({ name: "typing-input-ready" });
        });
      }

      // 🖥️ Display
      frame(resolution?.width, resolution?.height);

      // 🔊 Sound
      // TODO: Disable sound engine entirely... unless it is enabled by a disk. 2022.04.07.03.33
      // Only start this after a user-interaction to prevent warnings.
      window.addEventListener(
        "pointerdown",
        function down() {
          startSound();
        },
        { once: true }
      );

      // ➰ Core Loops for User Input, Music, Object Updates, and Rendering
      start(
        () => {
          // TODO: What is this now?
          // pen.poll();
          // TODO: Key.input();
          // TODO: Voice.input();
        },
        function (needsRender, updateTimes) {
          // console.log(updateTimes); // Note: No updates happen yet before a render.
          diskSupervisor.requestFrame?.(needsRender, updateTimes);
        }
      );
    }
  }

  // The initial message sends the path and host to load the disk.
  send(firstMessage);

  // Beat

  // Set the default bpm.
  sound.bpm.fill(bpm);

  function requestBeat(time) {
    send(
      {
        type: "beat",
        content: {
          time,
          bpm: sound.bpm,
        },
      },
      [sound.bpm] // TODO: Why not just send the number here?
    );
  }

  function receivedBeat(content) {
    // BPM
    if (sound.bpm[0] !== content.bpm[0]) {
      sound.bpm = new Float32Array(content.bpm);
      updateMetronome(sound.bpm[0]);
    }

    // SQUARE
    for (const square of content.squares) updateSquare(square);
    for (const bubble of content.bubbles) updateBubble(bubble);
  }

  // Update & Render
  let frameAlreadyRequested = false;

  function requestFrame(needsRender, updateCount) {
    if (needsReframe) {
      frame();
      pen.retransformPosition();
    }

    if (frameAlreadyRequested) return;
    frameAlreadyRequested = true;

    // TODO: 📏 Measure performance of frame: test with different resolutions.
    performance.now();

    // Build the data to send back to the disk thread.
    send({
      type: "frame",
      content: {
        needsRender,
        updateCount,
        inFocus: document.hasFocus(),
        audioTime: audioContext?.currentTime,
        audioBpm: sound.bpm[0], // TODO: Turn this into a messaging thing.
        width: canvas.width,
        height: canvas.height,
        pen: pen.events, // TODO: Should store an array of states that get ingested by the worker.
        keyboard: keyboard.events, // TODO: Should store an array of states that get ingested by the worker.
      },
    });

    // Time budgeting stuff...
    //const updateDelta = performance.now() - updateNow;
    //console.log("Update Budget: ", round((updateDelta / updateRate) * 100));
    // TODO: Output this number graphically.

    //const renderNow = performance.now();
    //const renderDelta = performance.now() - renderNow;
    //console.log("Render Budget: ", round((renderDelta / renderRate) * 100));
    // TODO: Output this number graphically.

    // Clear pen events.
    pen.events.length = 0;

    // Clear keyboard events.
    keyboard.events.length = 0;
  }

  let frameCached = false;
  let pixelsDidChange = false; // TODO: Can this whole thing be removed? 2021.11.28.03.50

  let contentFrame;

  async function receivedChange({ data: { type, content } }) {
    // *** Route to different functions if this change is not a full frame update.

    if (type === "content-create") {
      // Create a DOM container, if it doesn't already exist,
      // and add it here along with the requested content in the
      // template.
      if (!contentFrame) {
        contentFrame = document.createElement("div");
        contentFrame.id = "content";
        wrapper.appendChild(contentFrame);

        contentFrame.innerHTML += content.content; // Add content to contentFrame.

        // Evaluate the first script inside of contentFrame.
        // TODO: This should only evaluate new scripts, as they are added...
        const script = contentFrame.querySelector("script");

        if (script.src) {
          const s = document.createElement("script");
          s.type = "module";
          // s.onload = callback; // s.onerror = callback;

          // The hash `time` parameter busts the cache so that the environment is
          // reset if a disk is re-entered while the system is running.
          // Why a hash? See also: https://github.com/denoland/deno/issues/6946#issuecomment-668230727
          s.src = script.src + "#" + Date.now();
          contentFrame.appendChild(s); // Re-insert the new script tag.
          script.remove(); // Remove old script element.
        } else {
          window.eval(script.innerText);
        }
      }

      send({
        type: "content-created",
        content: { id: content.id, response: "Content was made!" }, // TODO: Return an API / better object?
      });
      return;
    }

    if (type === "title") {
      document.title = content; // Change the page title.
      return;
    }

    if (type === "refresh") {
      window.location.reload();
      return;
    }

    if (type === "web") {
      window.location.href = content;
      return;
    }

    if (type === "beat") {
      receivedBeat(content);
      return;
    }

    if (type === "download") {
      receivedDownload(content);
      return;
    }

    if (type === "upload") {
      receivedUpload(content);
      return;
    }

    if (type === "microphone") {
      receivedMicrophone(content);
      return;
    }

    if (type === "video") {
      receivedVideo(content);
      return;
    }

    if (type === "load-bitmap") {
      fetch(content).then(async (response) => {
        if (!response.ok) {
          send({
            type: "loaded-bitmap-rejection",
            content: { url: content },
          });
        } else {
          const blob = await response.blob();
          const bitmap = await createImageBitmap(blob);

          const ctx = document.createElement("canvas").getContext("2d");
          ctx.canvas.width = bitmap.width;
          ctx.canvas.height = bitmap.height;
          ctx.drawImage(bitmap, 0, 0);
          const iD = ctx.getImageData(0, 0, bitmap.width, bitmap.height);

          send(
            {
              type: "loaded-bitmap-success",
              content: {
                url: content,
                img: {
                  width: iD.width,
                  height: iD.height,
                  pixels: iD.data,
                },
              },
            },
            [iD.data]
          );
        }
      });
      return;
    }

    if (type === "fullscreen-toggle") {
      curReframeDelay = 0;
      toggleFullscreen();
      return;
    }

    if (type === "fps-change") {
      console.log("🎞️ FPS:", content);
      frameRate(content);
      return;
    }

    if (type === "gap-change") {
      if (debug) console.log("🕳️ Gap:", content);
      if (gap !== content) {
        gap = content;
        needsReframe = true;
      }
      return;
    }

    if (type === "density-change") {
      if (debug) console.log("💻️ Density:", content);
      if (density !== content) {
        density = content;
        needsReframe = true;
      }
      return;
    }

    if (type === "glaze") {
      if (debug)
        console.log("🪟 Glaze:", content, "Type:", content.type || "prompt");
      glaze = content;
      if (glaze.on === false) {
        off();
        canvas.style.removeProperty("opacity");
      }
      // Note: Glaze gets turned on only on a call to `resize` via a piece.
      return;
    }

    if (type === "disk-loaded") {
      // Emit a push state for the old disk if it was not the first. This is so
      // a user can use browser history to switch between disks.
      if (content.pieceCount > 0) {
        let url =
          content.path === content.firstPiece
            ? ""
            : // Set hash to be the last segment of the currentPiece path.
              "#" + content.path.substring(content.path.lastIndexOf("/") + 1);
        if (content.params.length > 0) {
          url += ":" + content.params.join(" ");
        }
        if (content.fromHistory === false) {
          history.pushState("", document.title, url);
        }
      }
      currentPiece = content.path;
      return;
    }

    if (type === "back-to-piece") {
      history.back();
      return false;
    }

    if (type === "disk-unload") {
      contentFrame?.remove(); // Remove the contentFrame if it exists.
      contentFrame = undefined;

      // Remove existing video tags.
      videos.forEach(({ video, buffer, getAnimationRequest }) => {
        console.log("🎥 Removing:", video, buffer, getAnimationRequest());
        video.remove();
        buffer.remove();
        cancelAnimationFrame(getAnimationRequest());
      });
      // Note: Any other disk state cleanup that needs to take place on unload
      //       should happen here.

      // Reset the framing to a system default when unloading a disk if using
      // a customized resolution.
      // TODO: Do disks with custom resolutions need to be reset
      //       if they are being reloaded?
      if (fixedWidth && fixedHeight) {
        freezeFrame = true;
        freezeFrameGlaze = glaze.on;

        fixedWidth = undefined;
        fixedHeight = undefined;
        needsReframe = true;
      }

      if (gap !== 0) {
        gap = 0;
        needsReframe = true;
      }

      // Turn off glaze.
      glaze.on = false;

      canvas.style.removeProperty("opacity");

      // Clear pen events.
      pen.events.length = 0;

      // Clear keyboard events.
      keyboard.events.length = 0;

      // Close (defocus) software keyboard if it exists.
      document.querySelector("#software-keyboard-input")?.blur();

      return;
    }

    // TODO: Filter out update from bottom of `disk.js` because I may not need to be
    //       sending them at all? 2022.01.30.13.01
    if (type === "update") {
      frameAlreadyRequested = false; // 🗨️ Tell the system we are ready for another frame.
      return;
    }

    // 🌟 Assume that `type` is "render" from now on.

    // Check for a change in resolution.
    if (content.reframe) {
      // Reframe the captured pixels.
      frame(content.reframe.width, content.reframe.height);
      pen.retransformPosition();
    }

    if (content.cursorCode) pen.setCursorCode(content.cursorCode);

    // About the render if pixels don't match.
    if (
      content.dirtyBox === undefined &&
      content.pixels?.length !== undefined &&
      content.pixels?.length !== screen.pixels.length
    ) {
      console.warn("Aborted render. Pixel buffers did not match.");
      console.log(
        "Content pixels:",
        content.pixels.length,
        "Screen:",
        screen.pixels.length,
        content.didntRender,
        content.reframe,
        "Freeze:",
        freezeFrame
      );
      frameAlreadyRequested = false; // 🗨️ Tell the system we are ready for another frame.
      return;
    }

    let dirtyBoxBitmapCan;

    // 👌 Otherwise, grab all the pixels, or some, if `dirtyBox` is present.
    if (content.dirtyBox) {
      // 🅰️ Cropped update.
      const imageData = new ImageData(
        content.pixels, // Is this the only necessary part?
        content.dirtyBox.w,
        content.dirtyBox.h
      );

      // Paint everything to a secondary canvas buffer.
      // TODO: Maybe this should be instantiated when the system starts to better
      //       optimize things? (Only if it's ever slow...)
      // TODO: Use ImageBitmap objects to make this faster once it lands in Safari.
      dirtyBoxBitmapCan = document.createElement("canvas");
      dirtyBoxBitmapCan.width = imageData.width;
      dirtyBoxBitmapCan.height = imageData.height;

      const dbCtx = dirtyBoxBitmapCan.getContext("2d");
      dbCtx.putImageData(imageData, 0, 0);

      // Use this alternative once it's faster. 2022.01.29.02.46
      // const dbCtx = dirtyBoxBitmapCan.getContext("bitmaprenderer");
      // dbCtx.transferFromImageBitmap(dirtyBoxBitmap);
    } else if (content.paintChanged) {
      // 🅱️ Normal full-screen update.
      imageData = new ImageData(content.pixels, canvas.width, canvas.height);
    }

    pixelsDidChange = content.paintChanged || false;

    function draw() {
      // 🅰️ Draw updated content from the piece.

      const db = content.dirtyBox;
      if (db) {
        ctx.drawImage(dirtyBoxBitmapCan, db.x, db.y);
        if (glaze.on) update(dirtyBoxBitmapCan, db.x, db.y);
      } else if (pixelsDidChange) {
        ctx.putImageData(imageData, 0, 0); // Comment out for a `dirtyBox` visualization.
        if (glaze.on) update(imageData);
      }

      if (glaze.on) {
        render(ctx.canvas, timePassed, pen.normalizedPosition(canvasRect));
      } else {
        off();
      }

      // 🅱️ Draw anything from the system UI layer on top.

      const dpi = window.devicePixelRatio;

      uiCtx.scale(dpi, dpi);

      uiCtx.clearRect(0, 0, 64, 64); // Clear 64 pixels from the top left to remove any
      //                                previously rendered corner icons.

      pen.render(uiCtx, canvasRect); // ️ 🐭 Draw the cursor.

      if (content.loading === true) {
        spinner(uiCtx, timePassed);
      }

      if (debug && frameCached && content.loading !== true) cached(uiCtx); // Pause icon.

      uiCtx.resetTransform();
    }

    if (pixelsDidChange || pen.changedInPiece) {
      frameCached = false;
      pen.changedInPiece = false;
      draw();
    } else if (frameCached === false) {
      frameCached = true;
      draw();
      //console.log("Caching frame...");
      // } else if (content.loading === true && debug === true) {
    } else if (content.loading === true) {
      draw();
    } else;

    if (freezeFrame) {
      if (glaze.on === false);
      //freezeFrameCan.style.opacity = 0;
      freezeFrameCan.remove();
      freezeFrame = false;
      freezeFrameGlaze = false;
    }

    if (glaze.on);
    else {
      canvas.style.removeProperty("opacity");
    }

    // TODO: Put this in a budget / progress bar system, related to the current refresh rate.
    // console.log("🎨", (performance.now() - startTime).toFixed(4), "ms");

    if (needsReappearance && wrapper.classList.contains("hidden")) {
      wrapper.classList.remove("hidden");
      needsReappearance = false;
    }

    timePassed = performance.now();
    frameAlreadyRequested = false; // 🗨️ Tell the system we are ready for another frame.
  }

  // Reads the extension off of filename to determine the mimetype and then
  // handles the data accordingly and downloads the file in the browser.
  function receivedDownload({ filename, data }) {
    let MIME = "application/octet-stream"; // TODO: Default content type?

    if (extension(filename) === "json") {
      MIME = "application/json";
    }

    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([data], { type: MIME }));
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  // Opens a file chooser that is filtered by a given extension / mimetype list.
  // And sends the text contents of an individual file back to the disk.
  function receivedUpload(type) {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = type;

    input.onchange = (e) => {
      // Grab the only selected file in the file input.
      const file = e.target.files[0];

      // Does type match nothing in the comma separated `input.accept` list?
      const noMatch = type.split(",").every((t) => {
        return t !== file.type && t !== `.${extension(file.name)}`;
      });

      // Relay error if chosen file does not match the `input.accept` list.
      if (noMatch) {
        send({
          type: "upload",
          content: {
            result: "error",
            data: `Chosen file was not of type "${type}"`,
          },
        });
        return;
      }

      // Read the file.
      const reader = new FileReader();
      reader.readAsText(file);

      // Send the content back to the disk once the file loads.
      reader.onload = (e) => {
        send({
          type: "upload",
          content: { result: "success", data: e.target.result },
        });
      };

      // Relay an error if the file fails to load for any reason.
      reader.onerror = () => {
        send({
          type: "upload",
          content: { result: "error", data: reader.error },
        });
      };
    };

    input.click();
  }

  // Connects the Microphone to the current audioContext.
  function receivedMicrophone(data) {
    attachMicrophone?.(data);
  }

  // Takes a request for a video and then either uses a media query (for a camera)
  // or loads a video file from a given url.

  // Then it puts that into a new video tag and starts playing it,
  // sending the disk the thread frames as they update.
  function receivedVideo({ type, options }) {
    console.log("🎥", type, options);

    if (type === "camera") {
      // TODO: Give video and canvas a unique identifier that
      //       will create a link in the worker so that frame updates
      //       for multiple videos can be routed simultaneously.
      const video = document.createElement("video");
      const buffer = document.createElement("canvas");
      let animationRequest;

      function getAnimationRequest() {
        return animationRequest;
      }

      videos.push({ video, buffer, getAnimationRequest });

      buffer.width = options.width || 1280;
      buffer.height = options.height || 720;

      const bufferCtx = buffer.getContext("2d");

      wrapper.appendChild(video);
      wrapper.appendChild(buffer);

      video.style = `position: absolute;
                     top: 0;
                     left: 0;
                     width: 300px;
                     opacity: 0;`;

      buffer.style = `position: absolute;
                      opacity: 0;`;

      navigator.mediaDevices
        .getUserMedia({
          video: { width: { min: 1280 }, height: { min: 720 } },
          audio: false,
        })
        .then((stream) => {
          video.srcObject = stream;
          video.play();
          process();
        })
        .catch((err) => {
          console.log(err);
        });

      function process() {
        bufferCtx.drawImage(
          video,
          0,
          0,
          bufferCtx.canvas.width,
          bufferCtx.canvas.height
        );

        const pixels = bufferCtx.getImageData(
          0,
          0,
          buffer.clientWidth,
          buffer.clientHeight
        );

        send(
          {
            type: "video-frame",
            content: {
              width: pixels.width,
              height: pixels.height,
              pixels: pixels.data,
            },
          },
          [pixels.data]
        );

        animationRequest = requestAnimationFrame(process);
      }
    }
  }

  // 🚨 Signal (Used to pass messages via window... important for embedded HTML
  //           `content` used within pieces that needs communication with the
  //           main system)
  window.signal = function (message) {
    if (debug) console.log("🚨 Signal:", message);
    send({
      type: "signal",
      content: message,
    });
  };

  // 📚 History
  // TODO: Extract all the history features into a class of some kind?
  // TODO: Eventually add an API so that a disk can list all the history of
  //       a user's session. This could also be used for autocompletion of
  //       pieces / up + down arrow prev-next etc.
  window.onpopstate = function (e) {
    send({
      type: "history-load",
      content: document.location.hash.substring(1),
    });
  };

  // Fullscreen
  // Note: This doesn't work in Safari because you can't fullscreen the body element.
  //       (Or anything other than a video element?) 22.2.13

  const requestFullscreen =
    document.body.requestFullscreen || wrapper.webkitRequestFullscreen;

  const exitFullscreen =
    document.exitFullscreen || document.webkitExitFullscreen;

  // Tries to toggle fullscreen. Must be called within a user interaction.
  function toggleFullscreen() {
    const fullscreenElement =
      document.fullscreenElement || document.webkitFullscreenElement;

    if (!fullscreenElement) {
      requestFullscreen.apply(document.body)?.catch((e) => console.error(e));
    } else {
      exitFullscreen();
    }
  }

  document.body.onfullscreenchange = (event) => {
    const fullscreenElement =
      document.fullscreenElement || document.webkitFullscreenElement;

    if (fullscreenElement) {
      console.log("😱 Entered fullscreen mode!", fullscreenElement);
    } else {
      console.log("😱 Leaving fullscreen mode!");
    }
  };
}

let host;
let debug$1;

if (window.acDEBUG === true || window.acDEBUG === false) {
  // Check for the DEBUG constant in the index.
  debug$1 = window.acDEBUG;
} else {
  debug$1 = true;
  window.acDEBUG = debug$1;
}

if (window.location.hostname === "aesthetic.computer") {
  host = "aesthetic.computer"; // Production
  debug$1 = false;
  window.acDEBUG = debug$1;
} else {
  // Build a hostname (with a path if one exists) from the current location.
  // Hosts can also be remote domains. (HTTPS is assumed)
  host = window.location.hostname;
  if (window.location.pathname.length > 1) {
    // TODO: Split the path into slashes, then remove the last one if it ends
    //       with index.html, then concatenate them all.
    const pathSegments = window.location.pathname.split("/");
    if (pathSegments[pathSegments.length - 1].endsWith(".html")) {
      pathSegments.pop();
    }

    host += pathSegments.join("/");
  }
}

const bpm = 120;

if (window.location.hash.length > 0) {
  boot$1(window.location.hash.slice(1), bpm, host, undefined, debug$1);
} else {
  if (window.acSTARTING_PIECE) {
    boot$1(window.acSTARTING_PIECE, bpm, host, undefined, debug$1);
  } else {
    boot$1("prompt", bpm, host, undefined, debug$1);
  }
}

// Incoming Message Responder
// -- At the moment it is just for a work-in-progress figma widget but any
//    window messages to be received here.
// TODO: Finish FigJam Widget with iframe message based input & output.
//         See also: https://www.figma.com/plugin-docs/working-with-images/
function receive(event) {
  // console.log("🌟 Event:", event);
  if (event.data.type === "figma-image-input") {
    // TODO: Build image with width and height.
    console.log("Bytes:", event.data.bytes.length);
  }
}
window.addEventListener("message", receive);

// TODO: Rewrite this snippet.
// Decoding an image can be done by sticking it in an HTML
// canvas, as we can read individual pixels off the canvas.
/*
async function decode(canvas, ctx, bytes) {
  const url = URL.createObjectURL(new Blob([bytes]));
  const image = await new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject();
    img.src = url;
  });
  canvas.width = image.width;
  canvas.height = image.height;
  ctx.drawImage(image, 0, 0);
  const imageData = ctx.getImageData(0, 0, image.width, image.height);
  return imageData;
}
*/

// ⚙️ Gizmos
// These are designed to work well with 'sim' and run off of ticks.

class Hourglass {
  ticks = 0;
  max = 1;
  complete = false;
  #completedCb;
  #flippedCb;
  #autoFlip = false;

  constructor(
    max = 1,
    { completed, flipped, autoFlip = false } = {},
    startingTicks = 0
  ) {
    this.max = max;
    this.ticks = startingTicks;
    this.#autoFlip = autoFlip;
    this.#completedCb = completed;
    this.#flippedCb = flipped;
  }

  step() {
    if (this.complete === true) return console.log("⌛ Already complete.");

    this.ticks += 1;
    if (this.ticks === this.max) {
      this.complete = true;
      this.#completedCb?.(this);
      if (this.#autoFlip) this.flip();
    }
  }

  get progress() {
    return this.ticks / this.max;
  }

  flip() {
    this.ticks = 0;
    this.complete = false;
    this.#flippedCb?.(...arguments);
  }
}

class Socket {
  #killSocket = false;
  #ws;
  #reconnectTime = 1000;

  constructor(host, receive, reload) {
    this.#connect(host, receive, reload);
  }

  // Connects a WebSocket object and takes a handler for messages.
  #connect(host, receive, reload) {
    this.#ws = new WebSocket(`wss://${host}`);
    const ws = this.#ws;

    // Send a message to the console after the first connection.
    ws.onopen = (e) => {
      console.log("📡 Connected");
      this.#reconnectTime = 1000;
    };

    // Respond to incoming messages and assume `e.data` is a JSON String.
    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      this.#preReceive(msg, receive, reload);
    };

    // Recursively re-connect after every second upon close or failed connection.
    ws.onclose = (e) => {
      console.log("📡 Disconnected...", e.reason);
      if (this.#killSocket === false) {
        console.log("📡 Reconnecting in:", this.#reconnectTime, "ms");
        setTimeout(() => {
          this.#connect(host, receive, reload);
        }, this.#reconnectTime);
        this.#reconnectTime = Math.min(this.#reconnectTime * 2, 32000);
      }
    };

    // Close on error.
    ws.onerror = (err) => {
      console.error("📡 Error:", err);
      ws.close();
    };
  }

  // Send a formatted message to the connected WebSocket server.
  // Passes silently on no connection.
  send(type, content) {
    if (this.#ws.readyState === WebSocket.OPEN)
      this.#ws.send(JSON.stringify({ type, content }));
  }

  // Kills the socket permanently.
  kill() {
    this.#killSocket = true;
    this.#ws.close();
  }

  // Before passing messages to disk code, handle some system messages here.
  // Note: "reload" should only be defined when developing.
  #preReceive({ id, type, content }, receive, reload) {
    if (type === "message") {
      console.log(`📡 ${content}`);
    } else if (type === "reload" && reload) {
      if (content === "disk") {
        console.log("💾️ Reloading disk...");
        this.kill();
        reload(); // TODO: Should reload be passed all the way in here?
      } else if (content === "system" && reload) {
        console.log("💥️ Restarting system...");
        reload("refresh"); // Reload the whole page.
      }
    } else {
      receive?.(id, type, content);
    }
  }
}

// 👩‍💻 Disk (Jockey) aka the tape / piece player?

const servers = {
  main: "server.aesthetic.computer",
  local: "localhost:8082",
  julias: "192.168.1.120:8082",
  lucias: "192.168.1.245:8082",
  ashland_mbp: "192.168.1.18",
};

let debug = false; // This can be overwritten on boot.

const defaults = {
  boot: ($) => {
    $.cursor("native");
    $.gap(0);
  }, // aka Setup
  sim: () => false, // A framerate independent of rendering.
  paint: ($) => {
    // TODO: Make this a boot choice via the index.html file?
    //$.noise16DIGITPAIN();
    //$.noiseTinted([20, 20, 20], 0.8, 0.7);
    $.wipe(0, 0, 0);
  },
  beat: () => false, // Runs every bpm.
  act: () => false, // All user interaction.
};

let boot = defaults.boot;
let sim = defaults.sim;
let paint = defaults.paint;
let beat = defaults.beat;
let act = defaults.act;

let currentPath, currentHost, currentSearch, currentParams;
let loading = false;
let reframe;
let screen;
let cursorCode;
let pieceHistoryIndex = -1; // Gets incremented to 0 when first piece loads.
let paintCount = 0n;
let simCount = 0n;
let initialSim = true;
let noPaint = false;

let socket;
let penX, penY;
const store = {}; // This object is used to store and retrieve data across disks
//                 during individual sessions. It doesn't get cleared
//                 automatically unless the whole system refreshes.
let upload;
let activeVideo; // TODO: Eventually this can be a bank to store video textures.
let bitmapPromises = {};
let inFocus;
let loadFailure;

// 1. ✔ API

// For every function to access.
const $commonApi = {
  // content: added programmatically: see Content class
  num: {
    randInt: randInt,
    randIntArr: randIntArr,
    randIntRange: randIntRange,
    multiply: multiply,
    dist: dist,
    radians: radians,
    lerp: lerp,
    Track: Track,
    timestamp: timestamp,
    vec2: vec2,
    vec4: vec4,
    mat4: mat4,
  },
  geo: {
    Box: Box,
    DirtyBox: DirtyBox,
    Grid: Grid,
    Circle: Circle,
  },
  ui: {
    Button: Button,
  },
  help: {
    choose: choose,
    repeat: repeat,
    every: every,
    any: any,
    each: each,
  },
  gizmo: { Hourglass: Hourglass },
  net: {},
  needsPaint: () => (noPaint = false), // TODO: Does "paint" needs this?
  store,
  pieceCount: -1, // Incs to 0 when the first piece (usually the prompt) loads.
  //                 Increments by 1 each time a new piece loads.
  debug,
};

// Just for "update".
const $updateApi = {};

// 🖼 Painting

// Pre-fab models:
const SQUARE = {
  positions: [
    // Triangle 1 (Left Side)
    [-1, -1, 0, 1], // Bottom Left
    [-1, 1, 0, 1], // Top Left
    [1, 1, 0, 1], // Top Right
    // Triangle 2 (Right Side)
    [-1, -1, 0, 1], // Bottom Left
    [1, -1, 0, 1], // Bottom Right
    [1, 1, 0, 1], // Top Right
  ],
  indices: [
    // These are not re-used for now.
    // One
    0, 1, 2,
    //Two
    3, 4, 5,
  ],
};

const TRIANGLE = {
  positions: [
    [-1, -1, 0, 1], // Bottom Left
    [0, 1, 0, 1], // Top Left
    [1, -1, 0, 1], // Top Right
    // Triangle 2 (Right Side)
  ],
  indices: [0, 1, 2],
};

// Inputs: (r, g, b), (r, g, b, a) or an array of those.
//         (rgb) for grayscale or (rgb, a) for grayscale with alpha.
function ink() {
  let args = arguments;

  if (args.length === 1) {
    const isNumber = () => typeof args[0] === "number";
    const isArray = () => Array.isArray(args[0]);

    // If it's an object then randomly pick a value & re-run.
    if (!isNumber() && !isArray()) return ink(any(args[0]));

    // If single argument is a number then replicate it across the first 3 fields.
    if (isNumber()) {
      args = Array.from(args);
      args.push(args[0], args[0]);
    } else if (isArray()) {
      // Or if it's an array, then spread it out and re-ink.
      // args = args[0];
      return ink(...args[0]);
    }
  } else if (args.length === 2) {
    // rgb, a
    args = [arguments[0], arguments[0], arguments[0], arguments[1]];
  }

  color(...args);
}

const $paintApi = {
  // 3D Classes & Objects
  Camera: Camera,
  Form: Form,
  TRIANGLE,
  SQUARE,
};

const $paintApiUnwrapped = {
  page: setBuffer,
  ink, // Color
  // 2D
  wipe: function () {
    if (arguments.length > 0) ink(...arguments);
    clear$1();
  },
  copy: copy,
  paste: paste,
  plot: function () {
    if (arguments.length === 1) {
      plot(arguments[0].x, arguments[0].y);
    } else {
      plot(...arguments);
    }
  }, // TODO: Should this be renamed to set?
  point: point,
  line: line,
  circle: circle,
  poly: poly,
  box: box,
  shape: shape,
  grid: grid,
  draw: draw,
  printLine: printLine, // TODO: This is kind of ugly and I need a state machine for type.
  form: function (f, cam) {
    f.graph(cam);
  },
  pan: pan,
  unpan: unpan,
  skip: skip,
  noise16: noise16,
  noise16DIGITPAIN: noise16DIGITPAIN,
  noiseTinted: noiseTinted,
  // glaze: ...
};

// TODO: Eventually restructure this a bit. 2021.12.16.16.0
//       Should global state like color and transform be stored here?
class Painting {
  #layers = [];
  #layer = 0;
  api = {};

  constructor() {
    Object.assign(this.api, $paintApi);
    const p = this;

    // Filter for and then wrap every rendering behavior of $paintApi into a
    // system to be deferred in groups, using layer.
    for (const k in $paintApiUnwrapped) {
      if (typeof $paintApiUnwrapped[k] === "function") {
        // Wrap and then transfer to #api.
        p.api[k] = function () {
          if (notArray(p.#layers[p.#layer])) p.#layers[p.#layer] = [];
          p.#layers[p.#layer].push(() => $paintApiUnwrapped[k](...arguments));
          return p.api;
        };
      }
    }

    // Creates a new pixel buffer with its own layering wrapper / context
    // on top of the base painting API.
    this.api.painting = function () {
      return makeBuffer(...arguments, new Painting());
    };

    // Allows grouping & composing painting order using an AofA (Array of Arrays).
    // n: 0-n (Cannot be negative.)
    // fun: A callback that contains $paintApi commands or any other code.
    this.api.layer = function (n) {
      p.#layer = n;
      return p.api;
    };

    // This links to abstract, solitary graph functions that do not need
    // to be wrapped or deferred for rendering.
    // TODO: Maybe these functions should be under a graphics algorithms label?
    this.api.abstract = { bresenham: bresenham };
  }

  // Paints every layer.
  paint() {
    this.#layers.forEach((layer) => {
      layer.forEach((paint) => paint());
    });
    this.#layers.length = 0;
    this.#layer = 0;
  }
}

const painting = new Painting();
let glazeAfterReframe;

// 2. ✔ Loading the disk.
const { send, noWorker } = (() => {
  let loadHost; // = "disks.aesthetic.computer"; TODO: Add default host here.
  let firstLoad = true;
  let firstPiece, firstParams;

  async function load(
    path,
    host = loadHost,
    search = "",
    params = [],
    fromHistory = false
  ) {
    loadFailure = undefined;
    host = host.replace(/\/$/, ""); // Remove any trailing slash from host. Note: This fixes a preview bug on teia.art. 2022.04.07.03.00
    loadHost = host; // Memoize the host.
    pieceHistoryIndex += fromHistory === true ? -1 : 1;

    // Kill any existing socket that has remained open from a previous disk.
    socket?.kill();

    // Set the empty path to whatever the first piece was, or choose the prompt as the default.
    if (path === "") path = firstPiece || "prompt";
    if (path === firstPiece && params.length === 0) params = firstParams;
    // TODO: In larger multi-disk IPFS exports, a new root path should be defined.

    if (debug) console.log("💾", path, "🌐", host);

    // Set path to the first loaded disk if empty.
    if (path.indexOf("/") === -1) path = "aesthetic.computer/disks/" + path;

    if (path)
      if (debug) {
        console.log("🟡 Development");
      }

    if (loading === false) {
      loading = true;
    } else {
      // TODO: Implement some kind of loading screen system here?
      console.warn("Already loading another disk:", path);
      return;
    }

    let fullUrl = "https://" + host + "/" + path + ".js";
    // The hash `time` parameter busts the cache so that the environment is
    // reset if a disk is re-entered while the system is running.
    // Why a hash? See also: https://github.com/denoland/deno/issues/6946#issuecomment-668230727
    fullUrl += "#" + Date.now();

    // console.log("🕸", fullUrl);

    // const moduleLoadTime = performance.now();
    const module = await import(fullUrl).catch((err) => {
      loading = false;
      console.error(`😡 "${path}" load failure:`, err);
      loadFailure = err;
    });
    // console.log(performance.now() - moduleLoadTime, module);

    if (module === undefined) {
      loading = false;
      return;
    }

    // Add reload to the common api.
    $commonApi.reload = (type) => {
      if (type === "refresh") {
        send({ type: "refresh" }); // Refresh the browser.
      } else {
        load(currentPath, currentHost, currentSearch, currentParams); // Reload the disk.
      }
    };

    // Add title to the common api.
    $commonApi.title = (title) => {
      send({ type: "title", content: title }); // Change the page title.
    };

    // Add host to the networking api.
    $commonApi.net.host = host;

    // Add web to the networking api.
    $commonApi.net.web = (url) => {
      send({ type: "web", content: url }); // Jump the browser to a new url.
    };

    // Automatically connect a socket server if we are in debug mode.
    if (debug) {
      let receiver;
      socket = new Socket(
        servers.local,
        (id, type, content) => receiver?.(id, type, content),
        $commonApi.reload
      );

      $commonApi.net.socket = function (receive) {
        //console.log("📡 Mapping receiver.");
        receiver = receive;
        return socket;
      };
    } else {
      $commonApi.net.socket = function (
        receive,
        host = debug ? servers.local : servers.main
      ) {
        // TODO: Flesh out the rest of reload functionality here to extract it from
        //       Socket. 21.1.5
        socket = new Socket(host, receive);
        return socket;
      };
    }

    // Artificially imposed loading by at least 1/4 sec.
    setTimeout(() => {
      //console.clear();
      paintCount = 0n;
      simCount = 0n;
      initialSim = true;
      activeVideo = null; // reset activeVideo
      bitmapPromises = {};
      noPaint = false;
      currentPath = path;
      currentHost = host;
      currentSearch = search;
      currentParams = params;

      // Redefine the default event functions if they exist in the module.
      boot = module.boot || defaults.boot;
      sim = module.sim || defaults.sim;
      paint = module.paint || defaults.paint;
      beat = module.beat || defaults.beat;
      act = module.act || defaults.act;
      $commonApi.query = search;
      $commonApi.params = params || [];
      $commonApi.load = load;
      $commonApi.pieceCount += 1;
      $commonApi.content = new Content();
      cursorCode = "precise";
      loading = false;
      penX = undefined;
      penY = undefined;
      send({
        type: "disk-loaded",
        content: {
          path,
          params,
          pieceCount: $commonApi.pieceCount,
          firstPiece,
          fromHistory,
        },
      });
      if (firstLoad === false) {
        // Send a message to the bios to unload this disk if it is not the first disk.
        // This cleans up any bios state that is related to the disk and also
        // takes care of nice transitions between disks of different resolutions.
        send({ type: "disk-unload" });
      } else {
        firstLoad = false;
        firstPiece = path;
        firstParams = params;
      }
    }, 100);
  }

  const isWorker = typeof importScripts === "function";
  const noWorker = { onMessage: undefined, postMessage: undefined };

  // Start by responding to a load message, then change
  // the message response to makeFrame.
  if (isWorker) {
    onmessage = async function (e) {
      debug = e.data.debug;
      await load(e.data.path, e.data.host, e.data.search, e.data.params);
      onmessage = makeFrame;
      send({ loaded: true });
    };
  } else {
    // TODO: Get firefox working again.
    noWorker.onMessage = async (e) => {
      e = { data: e };
      debug = e.data.debug;
      await load(e.data.path, e.data.host, e.data.search, e.data.params);
      noWorker.onMessage = (d) => makeFrame({ data: d });
      send({ loaded: true });
    };
  }

  function send(data) {
    if (isWorker) {
      postMessage(data);
    } else {
      noWorker.postMessage({ data });
    }
  }

  return { load, send, noWorker };
})();

// 3. ✔ Add any APIs that require send.
//      Just the `content` API for now.
//      TODO: Move others from makeFrame into here.
class Content {
  nodes = [];
  #id = 0;
  constructor() {
    //console.log("📖 Content: On");
  }

  add(content) {
    // Make a request to add new content to the DOM.
    this.nodes.push({ id: this.#id });
    this.#id = this.nodes.length - 1;
    send({ type: "content-create", content: { id: this.#id, content } });
    return this.nodes[this.nodes.length - 1];
  }

  receive({ id, response }) {
    this.nodes[id].response = response;
  }

  update({ id, msg }) {
    send({ type: "content-update", content: { id, msg } });
  }
}

// 4. ✔ Respond to incoming messages, and probably produce a frame.
// Boot procedure:
// First `paint` happens after `boot`, then any `act` and `sim`s each frame
// before `paint`ing occurs. One `sim` always happens after `boot` and before
// any `act`. `paint` can return false to stop drawing every display frame,
// then, it must be manually restarted via `needsPaint();`).  2022.01.19.01.08
// TODO: Make simple needsPaint example.
// TODO: Try to remove as many API calls from here as possible.
// TODO: makeFrame is no longer a great name for this function, which actually
//       receives every message from the main thread, one of which renders a
//       frame.

let signal;

function makeFrame({ data: { type, content } }) {
  if (type === "signal") {
    signal = content;
    return;
  }

  if (type === "content-created") {
    $commonApi.content.receive(content);
    return;
  }

  // 1. Beat // One send (returns afterwards)
  if (type === "beat") {
    const $api = {};
    Object.assign($api, $commonApi);
    $api.graph = painting.api; // TODO: Should this eventually be removed?

    $api.sound = {
      time: content.time,
      bpm: function (newBPM) {
        if (newBPM) content.bpm[0] = newBPM;
        return content.bpm[0];
      },
    };

    // Attach the microphone.
    $api.sound.microphone = function (options) {
      send({ type: "microphone", content: options });
    };

    // TODO: Generalize square and bubble calls.
    // TODO: Move this stuff to a "sound" module.
    const squares = [];
    const bubbles = [];

    $api.sound.square = function ({
      tone = 440, // TODO: Make random.
      beats = Math.random(), // Wow, default func. params can be random!
      attack = 0,
      decay = 0,
      volume = 1,
      pan = 0,
    } = {}) {
      squares.push({ tone, beats, attack, decay, volume, pan });

      // Return a progress function so it can be used by rendering.
      const seconds = (60 / content.bpm) * beats;
      const end = content.time + seconds;
      return {
        progress: function (time) {
          return 1 - Math.max(0, end - time) / seconds;
        },
      };
    };

    $api.sound.bubble = function ({ radius, rise, volume = 1, pan = 0 } = {}) {
      bubbles.push({ radius: radius, rise, volume, pan });

      // Return a progress function so it can be used by rendering.
      /*
      const seconds = (60 / content.bpm) * beats;
      const end = content.time + seconds;
      return {
        progress: function (time) {
          return 1 - Math.max(0, end - time) / seconds;
        },
      };
      */
    };

    beat($api);

    send({ type: "beat", content: { bpm: content.bpm, squares, bubbles } }, [
      content.bpm,
    ]);

    squares.length = 0;
    bubbles.length = 0;

    return;
  }

  // 1a. Upload // One send (returns afterwards)
  // Here we are receiving file data from main thread that was requested
  // by $api.upload. We check to see if the upload promise exists and then
  // use it and/or throw it away.
  if (type === "upload" && upload) {
    if (content.result === "success") {
      upload?.resolve(content.data);
    } else if (content.result === "error") {
      console.error("File failed to load:", content.data);
      upload?.reject(content.data);
    }
    upload = undefined;
    return;
  }

  // 1b. Video frames.
  if (type === "video-frame") {
    activeVideo = content;
    return;
  }

  // 1c. Loading from History
  if (type === "history-load") {
    // TODO: Inherit search and params when loading from history.
    if (debug)
      console.log("Load from history:", content, currentSearch, currentParams);

    const params = content.split(":");
    const program = params[0];
    params.shift(); // Strip the program out of params.
    $commonApi.load(program, undefined, undefined, params, true);
    return;
  }

  // 1d. Loading Bitmaps
  if (type === "loaded-bitmap-success") {
    // console.log("Bitmap load success:", content);
    bitmapPromises[content.url].resolve(content.img);
    delete bitmapPromises[content];
    return;
  }

  if (type === "loaded-bitmap-rejection") {
    console.error("Bitmap load failure:", content);
    bitmapPromises[content.url].reject(content.url);
    delete bitmapPromises[content.url];
    return;
  }

  // Request a repaint (runs when the window is resized.)
  if (type === "needs-paint") {
    noPaint = false;
    return;
  }

  // 2. Frame
  // This is where each...
  if (type === "frame") {
    // Act & Sim (Occurs after first boot and paint.)
    if (paintCount > 0n) {
      const $api = {};
      Object.assign($api, $commonApi);
      Object.assign($api, $updateApi);
      Object.assign($api, painting.api);

      $api.inFocus = content.inFocus;

      $api.sound = { time: content.audioTime, bpm: content.audioBpm };

      // Don't pass pixels to updates.
      $api.screen = {
        width: content.width,
        height: content.height,
      };

      $api.cursor = (code) => (cursorCode = code);

      // 🤖 Sim // no send
      $api.seconds = function (s) {
        return s * 120; // TODO: Get 120 dynamically from the Loop setting. 2022.01.13.23.28
      };

      if (initialSim) {
        simCount += 1n;
        $api.simCount = simCount;
        sim($api);
        initialSim = false;
      } else if (content.updateCount > 0 && paintCount > 0n) {
        // Update the number of times that are needed.
        for (let i = content.updateCount; i--; ) {
          simCount += 1n;
          $api.simCount = simCount;
          sim($api);
        }
      }

      // 💾 Uploading + Downloading
      // Add download event to trigger a file download from the main thread.
      $api.download = (dl) => send({ type: "download", content: dl });

      // Add upload event to allow the main thread to open a file chooser.
      // type: Accepts N mimetypes or file extensions as comma separated string.
      // Usage: upload(".jpg").then((data) => ( ... )).catch((err) => ( ... ));
      $api.upload = (type) => {
        send({ type: "upload", content: type });
        return new Promise((resolve, reject) => {
          upload = { resolve, reject };
        });
      };

      // 🌟 Act
      // *Device Event Handling*

      // TODO: Shouldn't all these events come in as part of one array to
      //       keep their order of execution across devices?
      // TODO: Could "device" be removed in favor of "device:event" strings and
      //       if needed, a device method?

      // TODO: Add a focus event.

      // If a disk failed to load, then notify the disk that loaded it
      // by checking to see if loadFailure has anything set.
      if (loadFailure) {
        $api.event = {
          error: loadFailure,
          is: (e) => e === "load-error",
        };
        act($api);
        loadFailure = undefined;
      }

      // Signaling
      if (signal) {
        const data = { signal };
        Object.assign(data, {
          device: "none",
          is: (e) => e === "signal",
        });
        $api.event = data;
        act($api);
        signal = undefined;
      }

      // Window Events
      if (content.inFocus !== inFocus) {
        inFocus = content.inFocus;
        const data = {};
        Object.assign(data, {
          device: "none",
          is: (e) => e === (inFocus === true ? "focus" : "defocus"),
        });
        $api.event = data;
        act($api);
      }

      // Ingest all pen input events by running act for each event.
      // TODO: I could also be transforming pen coordinates here...
      // TODO: Keep track of lastPen to see if it changed.

      content.pen.forEach((data) => {
        Object.assign(data, {
          device: data.device,
          is: (e) => e === data.name,
        });
        penX = data.x;
        penY = data.y;
        $api.event = data;
        act($api);
      });

      // Ingest all keyboard input events by running act for each event.
      content.keyboard.forEach((data) => {
        Object.assign(data, { device: "keyboard", is: (e) => e === data.name });
        $api.event = data;
        act($api); // Execute piece shortcut.

        // 🌟 Global Keyboard Shortcuts

        if (data.name === "keyboard:down") {
          // [Escape]
          // If not on prompt, then move backwards through the history of
          // previously loaded pieces in a session.
          if (
            data.key === "Escape" &&
            currentPath !== "computer/disks/prompt"
          ) {
            if (pieceHistoryIndex > 0) {
              send({ type: "back-to-piece" });
            }
          }

          if (data.key === "~") {
            // Load prompt when typing tilde.
            $api.load("prompt");
          }

          // [Ctrl + X]
          // Enter and exit fullscreen mode.
          if (data.key === "x" && data.ctrl) {
            send({ type: "fullscreen-toggle" });
          }
        }
      });
    }

    // 🖼 Render // Two sends (Move one send up eventually? -- 2021.11.27.17.20)
    if (content.needsRender) {
      const $api = {};
      Object.assign($api, $commonApi);
      Object.assign($api, painting.api);
      $api.paintCount = Number(paintCount);

      $api.inFocus = content.inFocus;

      $api.glaze = function (content) {
        glazeAfterReframe = { type: "glaze", content };
      };

      // Make a screen buffer or resize it automatically if it doesn't exist.
      if (
        !screen ||
        screen.width !== content.width ||
        screen.height !== content.height
      ) {
        screen = {
          pixels: new Uint8ClampedArray(content.width * content.height * 4),
          width: content.width,
          height: content.height,
        };

        // TODO: Add the depth buffer back here.
        // Reset the depth buffer.
        // graph.depthBuffer.length = screen.width * screen.height;
        // graph.depthBuffer.fill(Number.MAX_VALUE);
      }

      // TODO: Disable the depth buffer for now... it doesn't need to be
      //       regenerated on every frame.
      // graph.depthBuffer.fill(Number.MAX_VALUE); // Clear depthbuffer.

      $api.screen = screen;

      $api.fps = function (newFps) {
        send({ type: "fps-change", content: newFps });
      };

      $api.gap = function (newGap) {
        send({ type: "gap-change", content: newGap });
      };

      $api.density = function (newDensity) {
        send({ type: "density-change", content: newDensity });
      };

      $api.resize = function (width, height) {
        // Don't do anything if there is no change.

        console.log(
          "🔭 Resize to:",
          width,
          height,
          "from",
          screen.width,
          screen.height
        );

        if (screen.width === width && screen.height === height) return;

        screen.width = width;
        screen.height = height;
        screen.pixels = new Uint8ClampedArray(screen.width * screen.height * 4);

        // Reset the depth buffer.
        // graph.depthBuffer.length = screen.width * screen.height;
        // graph.depthBuffer.fill(Number.MAX_VALUE);

        setBuffer(screen);
        reframe = { width, height };
      };

      $api.cursor = (code) => (cursorCode = code);

      $api.pen = { x: penX, y: penY }; // TODO: This object should not be persistent.

      /**
       * @function video
       * @descrption Make a live video feed. Returns an object that links to current frame.
       * @param {string} type
       * @param {object} options - *unimplemented* { src, width, height }
       */
      $api.video = function (type, options) {
        // Options could eventually be { src, width, height }
        send({ type: "video", content: { type, options } });

        // Return an object that can grab whatever the most recent frame of
        // video was.
        return function videoFrame() {
          return activeVideo;
        };
      };

      setBuffer(screen);

      // * Preload *
      // Add preload to the boot api.
      // Accepts paths local to the original disk server, full urls, and demos.
      // Usage:   preload("demo:drawings/2021.12.12.17.28.16.json") // pre-included
      //          preload("https://myserver.com/test.json") // remote
      //          preload("drawings/default.json") // hosted with disk
      // Results: preload().then((r) => ...).catch((e) => ...) // via promise

      // TODO: Add support for files other than .json and .png / .jpeg 2022.04.06.21.42

      // TODO: How to know when every preload finishes? 2021.12.16.18.55

      // TODO: Preload multiple files and load them into an assets folder with
      //       a complete handler. 2021.12.12.22.24
      $api.net.preload = function (path) {
        // console.log("Preload path:", path);

        const extension = path.split(".").pop();

        if (extension === "json") {
          path = encodeURIComponent(path);
        }

        try {
          const url = new URL(path);
          if (url.protocol === "demo:") {
            // Load from aesthetic.computer host.
            path = `/demo/${url.pathname}`;
          } else if (url.protocol === "https:") {
            // No need to change path because an original URL was specified.
          }
        } catch {
          // Not a valid URL so assume local file on disk server.
          path = `https://${$api.net.host}/${path}`;
        }

        // If we are loading a .json file then we can do it here.
        if (extension === "json") {
          return new Promise((resolve, reject) => {
            fetch(path)
              .then(async (response) => {
                if (!response.ok) {
                  reject(response.status);
                } else return response.json();
              })
              .then((json) => resolve(json))
              .catch(reject);
          });
        } else if (
          extension === "webp" ||
          extension === "jpg" ||
          extension === "png"
        ) {
          // Other-wise we should drop into the other thread and wait...
          return new Promise((resolve, reject) => {
            send({ type: "load-bitmap", content: path });
            bitmapPromises[path] = { resolve, reject };
          });
        }
      };

      // TODO: Set bpm from boot.
      /*
      $api.sound = {
        time: content.time,
        bpm: function (newBPM) {
          if (newBPM) {
            content.bpm[0] = newBPM;
          }
          return content.bpm[0];
        },
      };
       */

      // Run boot only once before painting for the first time.
      if (paintCount === 0n) {
        inFocus = content.inFocus; // Inherit our starting focus from host window.
        boot($api);
      }

      // We no longer need the preload api for painting.
      delete $api.net.preload;

      // Paint a frame, which can return false to enable caching via noPaint and by
      // default returns undefined (assume a repaint).
      // Once paint returns false and noPaint is marked true, `needsPaint` must be called.
      // Note: Always marked false on a disk's first frame.
      let painted = false;
      let dirtyBox;

      if (noPaint === false) {
        const paintOut = paint($api); // Returns `undefined`, `false`, or `DirtyBox`.

        // `DirtyBox` and `undefined` always set `noPaint` to `true`.
        noPaint =
          paintOut === false || (paintOut !== undefined && paintOut !== true);

        // Run everything that was queued to be painted, then devour paintLayers.
        painting.paint();
        painted = true;
        paintCount = paintCount + 1n;

        if (paintOut) dirtyBox = paintOut;
      }

      // Return frame data back to the main thread.
      let sendData = {};
      let transferredPixels;

      // Check to see if we have a dirtyBox to render from.
      const croppedBox = dirtyBox?.croppedBox?.(screen);

      if (croppedBox?.w > 0 && croppedBox?.h > 0) {
        transferredPixels = dirtyBox.crop(screen);
        sendData = {
          pixels: transferredPixels,
          dirtyBox: croppedBox,
        };
      } else if (painted === true) {
        // TODO: Toggling this causes a flicker in `line`... but helps prompt. 2022.01.29.13.21
        // Otherwise render everything if we drew anything!
        transferredPixels = screen.pixels;
        sendData = { pixels: transferredPixels };
      }

      // Optional messages to send.
      if (painted === true) sendData.paintChanged = true;
      if (loading === true) sendData.loading = true;

      // These fields are one time `signals`.
      if (reframe || glazeAfterReframe) {
        sendData.reframe = reframe || glazeAfterReframe !== undefined;
        if (glazeAfterReframe) {
          send(glazeAfterReframe);
          glazeAfterReframe = undefined;
        }
      }
      if (cursorCode) sendData.cursorCode = cursorCode;

      // Note: transferredPixels will be undefined when sendData === {}.
      send({ type: "render", content: sendData }, [transferredPixels]);

      // Flush the `signals` after sending.
      if (reframe) reframe = undefined;
      if (cursorCode) cursorCode = undefined;
    } else {
      // Send update (sim).
      // TODO: How necessary is this - does any info ever need to actually
      //       get sent?
      send({
        type: "update",
        content: { didntRender: true, loading },
      });
    }
  }
}

var disk = /*#__PURE__*/ Object.freeze({
  __proto__: null,
  noWorker: noWorker,
});
