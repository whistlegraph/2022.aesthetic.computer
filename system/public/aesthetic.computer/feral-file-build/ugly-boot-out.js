const updateFps = 120;
let renderFps = 165;
const updateRate = 1e3 / updateFps;
let renderRate = 1e3 / renderFps;
let updateTime = 0;
let renderTime = 0;
let lastNow;
let input;
let updateAndRender;
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
  renderRate = 1e3 / renderFps;
  renderTime = 0;
}
var EPSILON = 1e-6;
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
function transpose(out, a) {
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
  var b11 = a22 * a33 - a23 * a32;
  var det =
    b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
  if (!det) {
    return null;
  }
  det = 1 / det;
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
  var b11 = a22 * a33 - a23 * a32;
  return b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
}
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
    a33 = a[15];
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
  a23 = a[11];
  b00 = x * x * t + c;
  b01 = y * x * t + z * s;
  b02 = z * x * t - y * s;
  b10 = x * y * t - z * s;
  b11 = y * y * t + c;
  b12 = z * y * t + x * s;
  b20 = x * z * t + y * s;
  b21 = y * z * t - x * s;
  b22 = z * z * t + c;
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
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
  }
  return out;
}
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
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
  }
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
    out[4] = a[4];
    out[5] = a[5];
    out[6] = a[6];
    out[7] = a[7];
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
  }
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
    out[8] = a[8];
    out[9] = a[9];
    out[10] = a[10];
    out[11] = a[11];
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
  }
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
  t = 1 - c;
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
function fromXRotation(out, rad) {
  var s = Math.sin(rad);
  var c = Math.cos(rad);
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
function fromYRotation(out, rad) {
  var s = Math.sin(rad);
  var c = Math.cos(rad);
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
function fromZRotation(out, rad) {
  var s = Math.sin(rad);
  var c = Math.cos(rad);
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
function fromRotationTranslation(out, q, v) {
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
  var magnitude = bx * bx + by * by + bz * bz + bw * bw;
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
function getTranslation(out, mat) {
  out[0] = mat[12];
  out[1] = mat[13];
  out[2] = mat[14];
  return out;
}
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
    S = Math.sqrt(trace + 1) * 2;
    out[3] = 0.25 * S;
    out[0] = (sm23 - sm32) / S;
    out[1] = (sm31 - sm13) / S;
    out[2] = (sm12 - sm21) / S;
  } else if (sm11 > sm22 && sm11 > sm33) {
    S = Math.sqrt(1 + sm11 - sm22 - sm33) * 2;
    out[3] = (sm23 - sm32) / S;
    out[0] = 0.25 * S;
    out[1] = (sm12 + sm21) / S;
    out[2] = (sm31 + sm13) / S;
  } else if (sm22 > sm33) {
    S = Math.sqrt(1 + sm22 - sm11 - sm33) * 2;
    out[3] = (sm31 - sm13) / S;
    out[0] = (sm12 + sm21) / S;
    out[1] = 0.25 * S;
    out[2] = (sm23 + sm32) / S;
  } else {
    S = Math.sqrt(1 + sm33 - sm11 - sm22) * 2;
    out[3] = (sm12 - sm21) / S;
    out[0] = (sm31 + sm13) / S;
    out[1] = (sm23 + sm32) / S;
    out[2] = 0.25 * S;
  }
  return out;
}
function fromRotationTranslationScale(out, q, v, s) {
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
function fromRotationTranslationScaleOrigin(out, q, v, s, o) {
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
function perspectiveNO(out, fovy, aspect, near, far) {
  var f = 1 / Math.tan(fovy / 2),
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
var perspective = perspectiveNO;
function perspectiveZO(out, fovy, aspect, near, far) {
  var f = 1 / Math.tan(fovy / 2),
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
function perspectiveFromFieldOfView(out, fov, near, far) {
  var upTan = Math.tan((fov.upDegrees * Math.PI) / 180);
  var downTan = Math.tan((fov.downDegrees * Math.PI) / 180);
  var leftTan = Math.tan((fov.leftDegrees * Math.PI) / 180);
  var rightTan = Math.tan((fov.rightDegrees * Math.PI) / 180);
  var xScale = 2 / (leftTan + rightTan);
  var yScale = 2 / (upTan + downTan);
  out[0] = xScale;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = yScale;
  out[6] = 0;
  out[7] = 0;
  out[8] = -((leftTan - rightTan) * xScale * 0.5);
  out[9] = (upTan - downTan) * yScale * 0.5;
  out[10] = far / (near - far);
  out[11] = -1;
  out[12] = 0;
  out[13] = 0;
  out[14] = (far * near) / (near - far);
  out[15] = 0;
  return out;
}
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
var ortho = orthoNO;
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
    Math.abs(a0 - b0) <= EPSILON * Math.max(1, Math.abs(a0), Math.abs(b0)) &&
    Math.abs(a1 - b1) <= EPSILON * Math.max(1, Math.abs(a1), Math.abs(b1)) &&
    Math.abs(a2 - b2) <= EPSILON * Math.max(1, Math.abs(a2), Math.abs(b2)) &&
    Math.abs(a3 - b3) <= EPSILON * Math.max(1, Math.abs(a3), Math.abs(b3)) &&
    Math.abs(a4 - b4) <= EPSILON * Math.max(1, Math.abs(a4), Math.abs(b4)) &&
    Math.abs(a5 - b5) <= EPSILON * Math.max(1, Math.abs(a5), Math.abs(b5)) &&
    Math.abs(a6 - b6) <= EPSILON * Math.max(1, Math.abs(a6), Math.abs(b6)) &&
    Math.abs(a7 - b7) <= EPSILON * Math.max(1, Math.abs(a7), Math.abs(b7)) &&
    Math.abs(a8 - b8) <= EPSILON * Math.max(1, Math.abs(a8), Math.abs(b8)) &&
    Math.abs(a9 - b9) <= EPSILON * Math.max(1, Math.abs(a9), Math.abs(b9)) &&
    Math.abs(a10 - b10) <=
      EPSILON * Math.max(1, Math.abs(a10), Math.abs(b10)) &&
    Math.abs(a11 - b11) <=
      EPSILON * Math.max(1, Math.abs(a11), Math.abs(b11)) &&
    Math.abs(a12 - b12) <=
      EPSILON * Math.max(1, Math.abs(a12), Math.abs(b12)) &&
    Math.abs(a13 - b13) <=
      EPSILON * Math.max(1, Math.abs(a13), Math.abs(b13)) &&
    Math.abs(a14 - b14) <=
      EPSILON * Math.max(1, Math.abs(a14), Math.abs(b14)) &&
    Math.abs(a15 - b15) <= EPSILON * Math.max(1, Math.abs(a15), Math.abs(b15))
  );
}
var mul$2 = multiply$3;
var sub$2 = subtract$2;
var mat4 = Object.freeze({
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
function create$1() {
  var out = new ARRAY_TYPE(2);
  if (ARRAY_TYPE != Float32Array) {
    out[0] = 0;
    out[1] = 0;
  }
  return out;
}
function clone$1(a) {
  var out = new ARRAY_TYPE(2);
  out[0] = a[0];
  out[1] = a[1];
  return out;
}
function fromValues$1(x, y) {
  var out = new ARRAY_TYPE(2);
  out[0] = x;
  out[1] = y;
  return out;
}
function copy$2(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  return out;
}
function set$1(out, x, y) {
  out[0] = x;
  out[1] = y;
  return out;
}
function add$1(out, a, b) {
  out[0] = a[0] + b[0];
  out[1] = a[1] + b[1];
  return out;
}
function subtract$1(out, a, b) {
  out[0] = a[0] - b[0];
  out[1] = a[1] - b[1];
  return out;
}
function multiply$2(out, a, b) {
  out[0] = a[0] * b[0];
  out[1] = a[1] * b[1];
  return out;
}
function divide$1(out, a, b) {
  out[0] = a[0] / b[0];
  out[1] = a[1] / b[1];
  return out;
}
function ceil$2(out, a) {
  out[0] = Math.ceil(a[0]);
  out[1] = Math.ceil(a[1]);
  return out;
}
function floor$4(out, a) {
  out[0] = Math.floor(a[0]);
  out[1] = Math.floor(a[1]);
  return out;
}
function min$2(out, a, b) {
  out[0] = Math.min(a[0], b[0]);
  out[1] = Math.min(a[1], b[1]);
  return out;
}
function max$1(out, a, b) {
  out[0] = Math.max(a[0], b[0]);
  out[1] = Math.max(a[1], b[1]);
  return out;
}
function round$3(out, a) {
  out[0] = Math.round(a[0]);
  out[1] = Math.round(a[1]);
  return out;
}
function scale$1(out, a, b) {
  out[0] = a[0] * b;
  out[1] = a[1] * b;
  return out;
}
function scaleAndAdd$1(out, a, b, scale) {
  out[0] = a[0] + b[0] * scale;
  out[1] = a[1] + b[1] * scale;
  return out;
}
function distance$1(a, b) {
  var x = b[0] - a[0],
    y = b[1] - a[1];
  return Math.hypot(x, y);
}
function squaredDistance$1(a, b) {
  var x = b[0] - a[0],
    y = b[1] - a[1];
  return x * x + y * y;
}
function length$1(a) {
  var x = a[0],
    y = a[1];
  return Math.hypot(x, y);
}
function squaredLength$1(a) {
  var x = a[0],
    y = a[1];
  return x * x + y * y;
}
function negate$1(out, a) {
  out[0] = -a[0];
  out[1] = -a[1];
  return out;
}
function inverse$1(out, a) {
  out[0] = 1 / a[0];
  out[1] = 1 / a[1];
  return out;
}
function normalize$1(out, a) {
  var x = a[0],
    y = a[1];
  var len = x * x + y * y;
  if (len > 0) {
    len = 1 / Math.sqrt(len);
  }
  out[0] = a[0] * len;
  out[1] = a[1] * len;
  return out;
}
function dot$1(a, b) {
  return a[0] * b[0] + a[1] * b[1];
}
function cross$1(out, a, b) {
  var z = a[0] * b[1] - a[1] * b[0];
  out[0] = out[1] = 0;
  out[2] = z;
  return out;
}
function lerp$2(out, a, b, t) {
  var ax = a[0],
    ay = a[1];
  out[0] = ax + t * (b[0] - ax);
  out[1] = ay + t * (b[1] - ay);
  return out;
}
function random$1(out, scale) {
  scale = scale || 1;
  var r = RANDOM() * 2 * Math.PI;
  out[0] = Math.cos(r) * scale;
  out[1] = Math.sin(r) * scale;
  return out;
}
function transformMat2(out, a, m) {
  var x = a[0],
    y = a[1];
  out[0] = m[0] * x + m[2] * y;
  out[1] = m[1] * x + m[3] * y;
  return out;
}
function transformMat2d(out, a, m) {
  var x = a[0],
    y = a[1];
  out[0] = m[0] * x + m[2] * y + m[4];
  out[1] = m[1] * x + m[3] * y + m[5];
  return out;
}
function transformMat3(out, a, m) {
  var x = a[0],
    y = a[1];
  out[0] = m[0] * x + m[3] * y + m[6];
  out[1] = m[1] * x + m[4] * y + m[7];
  return out;
}
function transformMat4$1(out, a, m) {
  var x = a[0];
  var y = a[1];
  out[0] = m[0] * x + m[4] * y + m[12];
  out[1] = m[1] * x + m[5] * y + m[13];
  return out;
}
function rotate(out, a, b, rad) {
  var p0 = a[0] - b[0],
    p1 = a[1] - b[1],
    sinC = Math.sin(rad),
    cosC = Math.cos(rad);
  out[0] = p0 * cosC - p1 * sinC + b[0];
  out[1] = p0 * sinC + p1 * cosC + b[1];
  return out;
}
function angle(a, b) {
  var x1 = a[0],
    y1 = a[1],
    x2 = b[0],
    y2 = b[1],
    mag = Math.sqrt(x1 * x1 + y1 * y1) * Math.sqrt(x2 * x2 + y2 * y2),
    cosine = mag && (x1 * x2 + y1 * y2) / mag;
  return Math.acos(Math.min(Math.max(cosine, -1), 1));
}
function zero$1(out) {
  out[0] = 0;
  out[1] = 0;
  return out;
}
function str$1(a) {
  return "vec2(" + a[0] + ", " + a[1] + ")";
}
function exactEquals$1(a, b) {
  return a[0] === b[0] && a[1] === b[1];
}
function equals$1(a, b) {
  var a0 = a[0],
    a1 = a[1];
  var b0 = b[0],
    b1 = b[1];
  return (
    Math.abs(a0 - b0) <= EPSILON * Math.max(1, Math.abs(a0), Math.abs(b0)) &&
    Math.abs(a1 - b1) <= EPSILON * Math.max(1, Math.abs(a1), Math.abs(b1))
  );
}
var len$1 = length$1;
var sub$1 = subtract$1;
var mul$1 = multiply$2;
var div$1 = divide$1;
var dist$2 = distance$1;
var sqrDist$1 = squaredDistance$1;
var sqrLen$1 = squaredLength$1;
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
var vec2 = Object.freeze({
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
  round: round$3,
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
function clone(a) {
  var out = new ARRAY_TYPE(4);
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  return out;
}
function fromValues(x, y, z, w) {
  var out = new ARRAY_TYPE(4);
  out[0] = x;
  out[1] = y;
  out[2] = z;
  out[3] = w;
  return out;
}
function copy$1(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  return out;
}
function set(out, x, y, z, w) {
  out[0] = x;
  out[1] = y;
  out[2] = z;
  out[3] = w;
  return out;
}
function add(out, a, b) {
  out[0] = a[0] + b[0];
  out[1] = a[1] + b[1];
  out[2] = a[2] + b[2];
  out[3] = a[3] + b[3];
  return out;
}
function subtract(out, a, b) {
  out[0] = a[0] - b[0];
  out[1] = a[1] - b[1];
  out[2] = a[2] - b[2];
  out[3] = a[3] - b[3];
  return out;
}
function multiply$1(out, a, b) {
  out[0] = a[0] * b[0];
  out[1] = a[1] * b[1];
  out[2] = a[2] * b[2];
  out[3] = a[3] * b[3];
  return out;
}
function divide(out, a, b) {
  out[0] = a[0] / b[0];
  out[1] = a[1] / b[1];
  out[2] = a[2] / b[2];
  out[3] = a[3] / b[3];
  return out;
}
function ceil$1(out, a) {
  out[0] = Math.ceil(a[0]);
  out[1] = Math.ceil(a[1]);
  out[2] = Math.ceil(a[2]);
  out[3] = Math.ceil(a[3]);
  return out;
}
function floor$3(out, a) {
  out[0] = Math.floor(a[0]);
  out[1] = Math.floor(a[1]);
  out[2] = Math.floor(a[2]);
  out[3] = Math.floor(a[3]);
  return out;
}
function min$1(out, a, b) {
  out[0] = Math.min(a[0], b[0]);
  out[1] = Math.min(a[1], b[1]);
  out[2] = Math.min(a[2], b[2]);
  out[3] = Math.min(a[3], b[3]);
  return out;
}
function max(out, a, b) {
  out[0] = Math.max(a[0], b[0]);
  out[1] = Math.max(a[1], b[1]);
  out[2] = Math.max(a[2], b[2]);
  out[3] = Math.max(a[3], b[3]);
  return out;
}
function round$2(out, a) {
  out[0] = Math.round(a[0]);
  out[1] = Math.round(a[1]);
  out[2] = Math.round(a[2]);
  out[3] = Math.round(a[3]);
  return out;
}
function scale(out, a, b) {
  out[0] = a[0] * b;
  out[1] = a[1] * b;
  out[2] = a[2] * b;
  out[3] = a[3] * b;
  return out;
}
function scaleAndAdd(out, a, b, scale) {
  out[0] = a[0] + b[0] * scale;
  out[1] = a[1] + b[1] * scale;
  out[2] = a[2] + b[2] * scale;
  out[3] = a[3] + b[3] * scale;
  return out;
}
function distance(a, b) {
  var x = b[0] - a[0];
  var y = b[1] - a[1];
  var z = b[2] - a[2];
  var w = b[3] - a[3];
  return Math.hypot(x, y, z, w);
}
function squaredDistance(a, b) {
  var x = b[0] - a[0];
  var y = b[1] - a[1];
  var z = b[2] - a[2];
  var w = b[3] - a[3];
  return x * x + y * y + z * z + w * w;
}
function length(a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  var w = a[3];
  return Math.hypot(x, y, z, w);
}
function squaredLength(a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  var w = a[3];
  return x * x + y * y + z * z + w * w;
}
function negate(out, a) {
  out[0] = -a[0];
  out[1] = -a[1];
  out[2] = -a[2];
  out[3] = -a[3];
  return out;
}
function inverse(out, a) {
  out[0] = 1 / a[0];
  out[1] = 1 / a[1];
  out[2] = 1 / a[2];
  out[3] = 1 / a[3];
  return out;
}
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
function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
}
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
function random(out, scale) {
  scale = scale || 1;
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
function transformQuat(out, a, q) {
  var x = a[0],
    y = a[1],
    z = a[2];
  var qx = q[0],
    qy = q[1],
    qz = q[2],
    qw = q[3];
  var ix = qw * x + qy * z - qz * y;
  var iy = qw * y + qz * x - qx * z;
  var iz = qw * z + qx * y - qy * x;
  var iw = -qx * x - qy * y - qz * z;
  out[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
  out[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
  out[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx;
  out[3] = a[3];
  return out;
}
function zero(out) {
  out[0] = 0;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  return out;
}
function str(a) {
  return "vec4(" + a[0] + ", " + a[1] + ", " + a[2] + ", " + a[3] + ")";
}
function exactEquals(a, b) {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
}
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
    Math.abs(a0 - b0) <= EPSILON * Math.max(1, Math.abs(a0), Math.abs(b0)) &&
    Math.abs(a1 - b1) <= EPSILON * Math.max(1, Math.abs(a1), Math.abs(b1)) &&
    Math.abs(a2 - b2) <= EPSILON * Math.max(1, Math.abs(a2), Math.abs(b2)) &&
    Math.abs(a3 - b3) <= EPSILON * Math.max(1, Math.abs(a3), Math.abs(b3))
  );
}
var sub = subtract;
var mul = multiply$1;
var div = divide;
var dist$1 = distance;
var sqrDist = squaredDistance;
var len = length;
var sqrLen = squaredLength;
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
var vec4 = Object.freeze({
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
  round: round$2,
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
function even(n) {
  return n % 2 === 0;
}
function byteInterval17(i16) {
  return Math.min(i16 * 16, 255);
}
function randInt(n) {
  return Math.floor(Math.random() * (n + 1));
}
function randIntArr(n, count) {
  return Array(count).fill(n).map(randInt);
}
function randIntRange(low, high) {
  return low + randInt(high - low);
}
function multiply(operands, n) {
  if (Array.isArray(operands)) {
    return operands.map((o) => o * n);
  } else {
    return operands * n;
  }
}
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
function radians(deg) {
  return deg * (Math.PI / 180);
}
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
function lerp(a, b, amount) {
  return a + (b - a) * clamp(amount, 0, 1);
}
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
const { abs: abs$1, floor: floor$2 } = Math;
class Circle {
  x;
  y;
  radius;
  constructor(x, y, radius = 8) {
    this.x = x;
    this.y = y;
    this.radius = radius;
  }
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
  static copy(box) {
    return new Box(box.x, box.y, box.w, box.h);
  }
  get area() {
    return abs$1(this.w * this.h);
  }
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
  get bottom() {
    return this.h === 1 ? this.y : this.y + this.h;
  }
  get right() {
    return this.w === 1 ? this.x : this.x + this.w;
  }
  crop(toX, toY, toW, toH) {
    let { x, y, w, h } = this;
    if (x >= toW || y >= toH) return;
    if (x < toX) {
      w += x;
      x = toX;
    }
    if (x + w > toW) w = toW - x;
    if (y < toY) {
      h += y;
      y = toY;
    }
    if (y + h > toH) h = toH - y;
    return new Box(x, y, w, h);
  }
  move({ x, y }) {
    this.x += x;
    this.y += y;
  }
  contains({ x, y }) {
    return (
      this.x <= x && x < this.x + this.w && this.y <= y && y < this.y + this.h
    );
  }
  misses(o) {
    return !this.contains(o);
  }
}
class Point {
  static equals(p1, p2) {
    return p1.x === p2.x && p1.y === p2.y;
  }
}
class Grid {
  box;
  scale;
  #halfScale;
  centerOffset;
  constructor(x, y, w, h, s) {
    this.box = new Box(x, y, w, h);
    this.scale = s;
    this.#halfScale = this.scale / 2;
    this.centerOffset = floor$2(this.#halfScale);
  }
  under({ x, y }, cb) {
    const { scale, box } = this;
    const gx = floor$2((x - box.x) / scale);
    const gy = floor$2((y - box.y) / scale);
    const gridSquare = {
      x: box.x + gx * scale,
      y: box.y + gy * scale,
      w: scale,
      h: scale,
      gx: gx,
      gy: gy,
      in: this.scaled.contains({ x: x, y: y }),
    };
    if (gridSquare.in && cb) cb(gridSquare);
    return gridSquare;
  }
  get(x, y) {
    return [this.box.x + x * this.scale, this.box.y + y * this.scale];
  }
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
    scaled[0] += Math.floor(this.#halfScale);
    scaled[1] += Math.floor(this.#halfScale);
    return scaled;
  }
  get centers() {
    const o = this.centerOffset;
    let points = [];
    if (this.#halfScale % 1 === 0.5 && this.#halfScale > 0.5) {
      points.push({ x: o, y: o });
    } else if (this.scale >= 4) {
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
class DirtyBox {
  box;
  #left;
  #top;
  #right;
  #bottom;
  soiled = false;
  constructor() {
    this.box = new Box(0, 0, 0);
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
  crop(image) {
    const b = this.croppedBox(image);
    const p = image.pixels;
    const newP = new Uint8ClampedArray(b.w * b.h * 4);
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
const { assign: assign$1 } = Object;
const { round: round$1 } = Math;
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
  constructor(point) {
    this.point = point;
    const pen = this;
    let forceTouchPressure = 0;
    let forceTouchEnabled = false;
    window.addEventListener(
      "touchend",
      (event) => {
        if (document.body.classList.contains("native-cursor") === false) {
          event.preventDefault();
          event.stopImmediatePropagation();
        }
      },
      { passive: false }
    );
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
    window.addEventListener("pointermove", (e) => {
      if (!e.isPrimary) return;
      pen.pointerType = e.pointerType;
      assign$1(pen, point(e.x, e.y));
      this.untransformedPosition = { x: e.x, y: e.y };
      pen.pressure = reportPressure(e);
      if (pen.#dragging) {
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
      if (forceTouchEnabled) {
        pressure = forceTouchPressure;
      } else {
        pressure = e.pressure || 1;
        if (pen.pointerType === "pen" && pressure === 1) {
          pressure = 0;
        }
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
  #event(name) {
    this.event = name;
    const delta = {
      x: this.x - this.lastPenX || 0,
      y: this.y - this.lastPenY || 0,
    };
    this.delta = delta;
    this.changedInPiece = delta.x !== 0 || delta.y !== 0;
    this.events.push({
      name: this.event,
      device: this.pointerType,
      x: this.x,
      y: this.y,
      delta: delta,
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
    if (!this.#lastP) this.#lastP = { x: p.x, y: p.y };
    else
      ctx.clearRect(
        this.#lastP.x - r.x - s,
        this.#lastP.y - r.y - s,
        s * 2,
        s * 2
      );
    assign$1(this.#lastP, p);
    if (this.cursorCode != "native") {
      if (document.body.classList.contains("native-cursor")) {
        document.body.classList.remove("native-cursor");
      }
    }
    if (!this.cursorCode || this.cursorCode === "precise") {
      ctx.lineCap = "round";
      ctx.save();
      ctx.translate(round$1(p.x - r.x), round$1(p.y - r.y));
      const radius = 2;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, 2 * Math.PI);
      ctx.fillStyle = "white";
      ctx.fill();
      const gap = 7.5,
        to = 10;
      ctx.beginPath();
      ctx.moveTo(0, -gap);
      ctx.lineTo(0, -to);
      ctx.moveTo(0, gap);
      ctx.lineTo(0, to);
      ctx.moveTo(-gap, 0);
      ctx.lineTo(-to, 0);
      ctx.moveTo(gap, 0);
      ctx.lineTo(to, 0);
      ctx.strokeStyle = "rgb(0, 255, 255)";
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.restore();
    } else if (this.cursorCode === "tiny") {
      const l = 4;
      ctx.save();
      ctx.translate(round$1(p.x - r.x), round$1(p.y - r.y));
      ctx.beginPath();
      ctx.moveTo(0, -l);
      ctx.lineTo(0, -l);
      ctx.moveTo(0, l);
      ctx.lineTo(0, l);
      ctx.moveTo(-l, 0);
      ctx.lineTo(-l, 0);
      ctx.moveTo(l, 0);
      ctx.lineTo(l, 0);
      ctx.strokeStyle = "rgba(255, 255, 0, 0.75)";
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.restore();
    } else if (this.cursorCode === "dot") {
      ctx.save();
      ctx.translate(round$1(p.x - r.x), round$1(p.y - r.y));
      ctx.beginPath();
      ctx.lineTo(0, 0);
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
const { round } = Math;
function spinner(ctx, timePassed) {
  const gap = 12,
    s = 6;
  ctx.save();
  ctx.translate(s + gap, s + gap);
  ctx.rotate(radians(timePassed % 360) * 1);
  ctx.beginPath();
  ctx.moveTo(-s, -s);
  ctx.lineTo(s, s);
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
  ctx.translate(round(gap / 2) + 6, round(gap / 2) + 4);
  ctx.beginPath();
  ctx.moveTo(gap, gap);
  ctx.lineTo(gap, s);
  ctx.moveTo(gap * 3.5, gap);
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
      this.box = Box.copy(arguments[0]);
    } else this.box = new Box(...arguments);
  }
  act(e, pushCb) {
    if (e.is("touch") && this.box.contains(e)) this.down = true;
    if (e.is("draw") && !this.box.contains(e)) this.down = false;
    if (e.is("lift") && this.down) {
      if (this.box.contains(e)) pushCb();
      this.down = false;
    }
  }
}
const uniforms = {};
uniforms.digitpain0 = {};
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
  "3f:lightColor": [1, 1, 1],
  "3f:lightDirection": [-1, -1, -0.05],
  "3f:bgColor": [0.084, 0.0533, 0.078],
};
function apiObject() {
  const obj = {};
  for (const key of arguments) obj[key] = undefined;
  return Object.seal(obj);
}
function extension(filename) {
  return /(?:\.([^.]+))?$/.exec(filename)[1];
}
function notArray(obj) {
  return !Array.isArray(obj);
}
function wrapNotArray(any) {
  if (any !== undefined && any !== null && notArray(any)) return [any];
  else if (Array.isArray(any)) return any;
  else return [];
}
function pathEnd(path) {
  return path.substring(path.lastIndexOf("/") + 1);
}
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
  setCustomUniforms(locations, gl) {
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
let passthrough;
function init(wrapper) {
  canvas = document.createElement("canvas");
  canvas.dataset.type = "glaze";
  gl = canvas.getContext("webgl2", {
    alpha: true,
    depth: false,
    stencil: false,
    desynchronized: true,
    antialias: false,
  });
  gl.enable(gl.BLEND);
  gl.blendEquation(gl.FUNC_ADD);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  wrapper.append(canvas);
}
let customProgram, computeProgram, displayProgram;
let fb;
let texSurf, texFbSurfA, texFbSurfB;
let texSurfWidth, texSurfHeight;
let vao;
const defaultUniformNames = [
  "iTexture",
  "iTexturePost",
  "iTime",
  "iMouse",
  "iResolution",
];
let customUniformLocations = {};
const displayUniformLocations = {};
let offed = false;
function frame(w, h, rect, nativeWidth, nativeHeight, wrapper) {
  if (glaze.shadersLoaded === false) return;
  if (canvas === undefined) {
    init(wrapper);
  }
  canvas.width = nativeWidth * window.devicePixelRatio;
  canvas.height = nativeHeight * window.devicePixelRatio;
  canvas.style.width = rect.width + "px";
  canvas.style.height = rect.height + "px";
  const customVert = createShader(gl.VERTEX_SHADER, passthrough);
  const customFrag = createShader(gl.FRAGMENT_SHADER, glaze.frag);
  customProgram = createProgram(customVert, customFrag);
  const computeVert = createShader(gl.VERTEX_SHADER, passthrough);
  const computeFrag = createShader(gl.FRAGMENT_SHADER, glaze.compute);
  computeProgram = createProgram(computeVert, computeFrag);
  const displayVert = createShader(gl.VERTEX_SHADER, passthrough);
  const displayFrag = createShader(gl.FRAGMENT_SHADER, glaze.display);
  displayProgram = createProgram(displayVert, displayFrag);
  texSurf = gl.createTexture();
  texSurfWidth = w;
  texSurfHeight = h;
  const buffer = new Uint8Array(4 * w * h);
  for (let i = 0; i < buffer.length; i += 4) {
    buffer[i] = (255 * i) / buffer.length;
    buffer[i + 1] = (255 * i) / buffer.length;
    buffer[i + 2] = (255 * i) / buffer.length;
    buffer[i + 3] = 255;
  }
  gl.bindTexture(gl.TEXTURE_2D, texSurf);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    w,
    h,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    buffer
  );
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  texFbSurfA = gl.createTexture();
  const buffer2 = new Uint8Array(4 * w * h);
  buffer2.fill(0);
  texFbSurfB = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texFbSurfB);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    w,
    h,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    buffer2
  );
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.bindTexture(gl.TEXTURE_2D, texFbSurfA);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    w,
    h,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    buffer2
  );
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  fb = gl.createFramebuffer();
  vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  const positionAttributeLocation = gl.getAttribLocation(
    customProgram,
    "a_position"
  );
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  const positions = [-1, 1, -1, -1, 1, -1, 1, 1];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
  gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
  gl.vertexAttribDivisor(positionAttributeLocation, 0);
  gl.enableVertexAttribArray(positionAttributeLocation);
  const texCoordAttributeLocation = gl.getAttribLocation(
    customProgram,
    "a_texc"
  );
  const texCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  const texCoords = [0, 0, 0, 1, 1, 1, 1, 0];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);
  gl.vertexAttribPointer(texCoordAttributeLocation, 2, gl.FLOAT, false, 0, 0);
  gl.vertexAttribDivisor(texCoordAttributeLocation, 0);
  gl.enableVertexAttribArray(texCoordAttributeLocation);
  const indices = [0, 1, 2, 0, 2, 3];
  const indicesBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(indices),
    gl.STATIC_DRAW
  );
  defaultUniformNames.forEach(function (item, index) {
    displayUniformLocations[item] = gl.getUniformLocation(displayProgram, item);
  });
  customUniformLocations = {};
  glaze.uniformNames
    .concat(defaultUniformNames)
    .forEach(function (item, index) {
      customUniformLocations[item] = gl.getUniformLocation(customProgram, item);
    });
  glaze.loaded = true;
}
function off() {
  if (offed && canvas) canvas.style.opacity = 0;
  offed = true;
}
async function on(w, h, rect, nativeWidth, nativeHeight, wrapper, type) {
  glaze = new Glaze(type);
  passthrough = (await preloadShaders(["glazes/passthrough-vert"]))[
    "passthrough-vert"
  ];
  await glaze.load(() => {
    frame(w, h, rect, nativeWidth, nativeHeight, wrapper);
    offed = false;
  });
  return glaze;
}
function update(texture, x = 0, y = 0) {
  if (glaze === undefined || glaze.loaded === false) return;
  gl.bindTexture(gl.TEXTURE_2D, texSurf);
  gl.texSubImage2D(
    gl.TEXTURE_2D,
    0,
    x,
    y,
    texture.width,
    texture.height,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    texture
  );
}
function freeze(fCtx) {
  fCtx.drawImage(canvas, 0, 0, fCtx.canvas.width, fCtx.canvas.height);
  clear$1();
  canvas.style.opacity = 0;
}
function unfreeze() {
  if (canvas) canvas.style.removeProperty("opacity");
}
function render(canvasTexture, time, mouse) {
  if (glaze === undefined || glaze.loaded === false) return;
  gl.useProgram(customProgram);
  gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
  gl.framebufferTexture2D(
    gl.FRAMEBUFFER,
    gl.COLOR_ATTACHMENT0,
    gl.TEXTURE_2D,
    texFbSurfA,
    0
  );
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
  gl.bindVertexArray(vao);
  gl.drawElementsInstanced(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0, 1);
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
function createShader(type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
    return shader;
  }
  console.error(gl.getShaderInfoLog(shader), source);
  gl.deleteShader(shader);
}
function createProgram(vertShader, fragShader) {
  const program = gl.createProgram();
  gl.attachShader(program, vertShader);
  gl.attachShader(program, fragShader);
  gl.linkProgram(program);
  const success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) return program;
  console.error(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
}
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
function clear$1(r = 0, g = 1, b = 0) {
  gl?.clearColor(r, g, b, 1);
  gl?.clear(gl.COLOR_BUFFER_BIT);
}
const { assign } = Object;
const { floor: floor$1, min } = Math;
async function boot$1(
  path = "index",
  bpm = 60,
  host = window.location.host,
  resolution,
  debug
) {
  console.log(
    "%caesthetic.computer",
    `background: rgb(10, 20, 40);
     color: rgb(120, 120, 170);
     font-size: 120%;
     padding: 0 0.25em;
     border-radius: 0.15em;
     border-bottom: 0.75px solid rgb(120, 120, 170);
     border-right: 0.75px solid rgb(120, 120, 170);`
  );
  console.log(
    `%cFullscreen: C-x, Prompt: ~`,
    `background-color: black;
     color: grey;
     padding: 0 0.25em;
     border-left: 0.75px solid rgb(60, 60, 60);
     border-right: 0.75px solid rgb(60, 60, 60);`
  );
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
  let currentPiece = null;
  const videos = [];
  const wrapper = document.createElement("div");
  wrapper.id = "aesthetic-computer";
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const uiCanvas = document.createElement("canvas");
  const uiCtx = uiCanvas.getContext("2d");
  uiCanvas.dataset.type = "ui";
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
  let density = 1;
  function frame(width, height) {
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
      freezeFrameCan.style.left = canvasRect.x + "px";
      freezeFrameCan.style.top = canvasRect.y + "px";
      if (freezeFrameGlaze) {
        console.log("Freeze glaze!");
        freeze(ffCtx);
        freezeFrameGlaze = false;
      } else {
        ffCtx.putImageData(imageData, 0, 0);
      }
      if (!wrapper.contains(freezeFrameCan)) wrapper.append(freezeFrameCan);
      else freezeFrameCan.style.removeProperty("opacity");
      canvas.style.opacity = 0;
    }
    width = width || fixedWidth;
    height = height || fixedHeight;
    const gapSize = gap * window.devicePixelRatio;
    if (width === undefined && height === undefined) {
      if (window.devicePixelRatio === 1) density = 2;
      const subdivisions = density + window.devicePixelRatio;
      width = floor$1(window.innerWidth / subdivisions);
      height = floor$1(window.innerHeight / subdivisions);
      projectedWidth = width * subdivisions - gapSize;
      projectedHeight = height * subdivisions - gapSize;
    } else {
      fixedWidth = width;
      fixedHeight = height;
      const scale = min(window.innerWidth / width, window.innerHeight / height);
      console.log(window.innerWidth, window.innerHeight);
      projectedWidth = floor$1(width * scale - gapSize);
      projectedHeight = floor$1(height * scale - gapSize);
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
    canvas.width = width;
    canvas.height = height;
    uiCanvas.width = projectedWidth * window.devicePixelRatio;
    uiCanvas.height = projectedHeight * window.devicePixelRatio;
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
    assign(screen, { pixels: imageData.data, width: width, height: height });
    if (!wrapper.contains(canvas)) {
      wrapper.append(canvas);
      wrapper.append(uiCanvas);
      document.body.append(wrapper);
      let timeout;
      window.addEventListener("resize", (e) => {
        if (document.body.classList.contains("native-cursor") === false) {
          wrapper.classList.add("hidden");
        }
        window.clearTimeout(timeout);
        timeout = setTimeout(() => {
          needsReframe = true;
          curReframeDelay = REFRAME_DELAY;
        }, curReframeDelay);
      });
      canvas.addEventListener(
        "touchstart",
        function (event) {
          event.preventDefault();
        },
        false
      );
    }
    canvasRect = canvas.getBoundingClientRect();
    clear$1();
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
    needsReappearance = true;
    send({ type: "needs-paint" });
  }
  const sound = { bpm: new Float32Array(1) };
  let updateMetronome,
    updateSquare,
    updateBubble,
    attachMicrophone,
    audioContext;
  function startSound() {
    audioContext = new AudioContext({
      latencyHint: "interactive",
      sampleRate: 44100,
    });
    if (audioContext.state === "running") {
      audioContext.suspend();
    }
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
        soundProcessor.port.postMessage({ type: "new-bpm", data: newBPM });
      };
      updateSquare = function (square) {
        soundProcessor.port.postMessage({ type: "square", data: square });
      };
      updateBubble = function (bubble) {
        soundProcessor.port.postMessage({ type: "bubble", data: bubble });
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
  const search = new URL(self.location).search;
  const worker = new Worker(new URL("./ugly-disk-out.js", import.meta.url), {
    type: "module",
  });
  const params = path.split(":");
  const program = params[0];
  params.shift();
  const firstMessage = {
    path: program,
    params: params,
    host: host,
    search: search,
    debug: debug,
  };
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
      module.noWorker.postMessage = (e) => onMessage(e);
      send = (e) => module.noWorker.onMessage(e);
      send(firstMessage);
    } else {
      console.error("🛑 Disk error:", err);
    }
  };
  let send = (e) => worker.postMessage(e);
  let onMessage = loaded;
  worker.onmessage = (e) => onMessage(e);
  function loaded(e) {
    if (e.data.loaded === true) {
      onMessage = receivedChange;
      diskSupervisor = { requestBeat: requestBeat, requestFrame: requestFrame };
      pen = new Pen((x, y) => {
        return {
          x: floor$1(((x - canvasRect.x) / projectedWidth) * screen.width),
          y: floor$1(((y - canvasRect.y) / projectedHeight) * screen.height),
        };
      });
      keyboard = new Keyboard();
      {
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
        window.addEventListener("touchstart", () => (touching = true));
        window.addEventListener("focusout", (e) => {
          if (keyboardOpen) {
            keyboard.events.push({ name: "keyboard:close" });
            keyboardOpen = false;
          }
        });
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
      frame(resolution?.width, resolution?.height);
      window.addEventListener(
        "pointerdown",
        function down() {
          startSound();
        },
        { once: true }
      );
      start(
        () => {},
        function (needsRender, updateTimes) {
          diskSupervisor.requestFrame?.(needsRender, updateTimes);
        }
      );
    }
  }
  send(firstMessage);
  sound.bpm.fill(bpm);
  function requestBeat(time) {
    send({ type: "beat", content: { time: time, bpm: sound.bpm } }, [
      sound.bpm,
    ]);
  }
  function receivedBeat(content) {
    if (sound.bpm[0] !== content.bpm[0]) {
      sound.bpm = new Float32Array(content.bpm);
      updateMetronome(sound.bpm[0]);
    }
    for (const square of content.squares) updateSquare(square);
    for (const bubble of content.bubbles) updateBubble(bubble);
  }
  let frameAlreadyRequested = false;
  function requestFrame(needsRender, updateCount) {
    if (needsReframe) {
      frame();
      pen.retransformPosition();
    }
    if (frameAlreadyRequested) return;
    frameAlreadyRequested = true;
    performance.now();
    send({
      type: "frame",
      content: {
        needsRender: needsRender,
        updateCount: updateCount,
        inFocus: document.hasFocus(),
        audioTime: audioContext?.currentTime,
        audioBpm: sound.bpm[0],
        width: canvas.width,
        height: canvas.height,
        pen: pen.events,
        keyboard: keyboard.events,
      },
    });
    pen.events.length = 0;
    keyboard.events.length = 0;
  }
  let frameCached = false;
  let pixelsDidChange = false;
  let contentFrame;
  async function receivedChange({ data: { type, content } }) {
    if (type === "content-create") {
      if (!contentFrame) {
        contentFrame = document.createElement("div");
        contentFrame.id = "content";
        wrapper.appendChild(contentFrame);
        contentFrame.innerHTML += content.content;
        const script = contentFrame.querySelector("script");
        if (script.src) {
          const s = document.createElement("script");
          s.type = "module";
          s.src = script.src + "#" + Date.now();
          contentFrame.appendChild(s);
          script.remove();
        } else {
          window.eval(script.innerText);
        }
      }
      send({
        type: "content-created",
        content: { id: content.id, response: "Content was made!" },
      });
      return;
    }
    if (type === "title") {
      document.title = content;
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
          send({ type: "loaded-bitmap-rejection", content: { url: content } });
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
                img: { width: iD.width, height: iD.height, pixels: iD.data },
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
      return;
    }
    if (type === "disk-loaded") {
      if (content.pieceCount > 0) {
        let url =
          content.path === content.firstPiece
            ? ""
            : "#" + content.path.substring(content.path.lastIndexOf("/") + 1);
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
      contentFrame?.remove();
      contentFrame = undefined;
      videos.forEach(({ video, buffer, getAnimationRequest }) => {
        console.log("🎥 Removing:", video, buffer, getAnimationRequest());
        video.remove();
        buffer.remove();
        cancelAnimationFrame(getAnimationRequest());
      });
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
      glaze.on = false;
      canvas.style.removeProperty("opacity");
      pen.events.length = 0;
      keyboard.events.length = 0;
      document.querySelector("#software-keyboard-input")?.blur();
      return;
    }
    if (type === "update") {
      frameAlreadyRequested = false;
      return;
    }
    if (content.reframe) {
      frame(content.reframe.width, content.reframe.height);
      pen.retransformPosition();
    }
    if (content.cursorCode) pen.setCursorCode(content.cursorCode);
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
      frameAlreadyRequested = false;
      return;
    }
    let dirtyBoxBitmapCan;
    if (content.dirtyBox) {
      const imageData = new ImageData(
        content.pixels,
        content.dirtyBox.w,
        content.dirtyBox.h
      );
      dirtyBoxBitmapCan = document.createElement("canvas");
      dirtyBoxBitmapCan.width = imageData.width;
      dirtyBoxBitmapCan.height = imageData.height;
      const dbCtx = dirtyBoxBitmapCan.getContext("2d");
      dbCtx.putImageData(imageData, 0, 0);
    } else if (content.paintChanged) {
      imageData = new ImageData(content.pixels, canvas.width, canvas.height);
    }
    pixelsDidChange = content.paintChanged || false;
    function draw() {
      const db = content.dirtyBox;
      if (db) {
        ctx.drawImage(dirtyBoxBitmapCan, db.x, db.y);
        if (glaze.on) update(dirtyBoxBitmapCan, db.x, db.y);
      } else if (pixelsDidChange) {
        ctx.putImageData(imageData, 0, 0);
        if (glaze.on) update(imageData);
      }
      if (glaze.on) {
        render(ctx.canvas, timePassed, pen.normalizedPosition(canvasRect));
      } else {
        off();
      }
      const dpi = window.devicePixelRatio;
      uiCtx.scale(dpi, dpi);
      uiCtx.clearRect(0, 0, 64, 64);
      pen.render(uiCtx, canvasRect);
      if (content.loading === true) {
        spinner(uiCtx, timePassed);
      }
      if (debug && frameCached && content.loading !== true) cached(uiCtx);
      uiCtx.resetTransform();
    }
    if (pixelsDidChange || pen.changedInPiece) {
      frameCached = false;
      pen.changedInPiece = false;
      draw();
    } else if (frameCached === false) {
      frameCached = true;
      draw();
    } else if (content.loading === true) {
      draw();
    } else;
    if (freezeFrame) {
      if (glaze.on === false);
      freezeFrameCan.remove();
      freezeFrame = false;
      freezeFrameGlaze = false;
    }
    if (glaze.on) {
      unfreeze();
    } else {
      canvas.style.removeProperty("opacity");
    }
    if (needsReappearance && wrapper.classList.contains("hidden")) {
      wrapper.classList.remove("hidden");
      needsReappearance = false;
    }
    timePassed = performance.now();
    frameAlreadyRequested = false;
  }
  function receivedDownload({ filename, data }) {
    let MIME = "application/octet-stream";
    if (extension(filename) === "json") {
      MIME = "application/json";
    }
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([data], { type: MIME }));
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  }
  function receivedUpload(type) {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = type;
    input.onchange = (e) => {
      const file = e.target.files[0];
      const noMatch = type.split(",").every((t) => {
        return t !== file.type && t !== `.${extension(file.name)}`;
      });
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
      const reader = new FileReader();
      reader.readAsText(file);
      reader.onload = (e) => {
        send({
          type: "upload",
          content: { result: "success", data: e.target.result },
        });
      };
      reader.onerror = () => {
        send({
          type: "upload",
          content: { result: "error", data: reader.error },
        });
      };
    };
    input.click();
  }
  function receivedMicrophone(data) {
    attachMicrophone?.(data);
  }
  function receivedVideo({ type, options }) {
    console.log("🎥", type, options);
    if (type === "camera") {
      const video = document.createElement("video");
      const buffer = document.createElement("canvas");
      let animationRequest;
      function getAnimationRequest() {
        return animationRequest;
      }
      videos.push({
        video: video,
        buffer: buffer,
        getAnimationRequest: getAnimationRequest,
      });
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
  window.signal = function (message) {
    if (debug) console.log("🚨 Signal:", message);
    send({ type: "signal", content: message });
  };
  window.onpopstate = function (e) {
    send({
      type: "history-load",
      content: document.location.hash.substring(1),
    });
  };
  const requestFullscreen =
    document.body.requestFullscreen || wrapper.webkitRequestFullscreen;
  const exitFullscreen =
    document.exitFullscreen || document.webkitExitFullscreen;
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
  debug$1 = window.acDEBUG;
} else {
  debug$1 = true;
  window.acDEBUG = debug$1;
}
if (window.location.hostname === "aesthetic.computer") {
  host = "aesthetic.computer";
  debug$1 = false;
  window.acDEBUG = debug$1;
} else {
  host = window.location.hostname;
  if (window.location.pathname.length > 1) {
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
function receive(event) {
  if (event.data.type === "figma-image-input") {
    console.log("Bytes:", event.data.bytes.length);
  }
}
window.addEventListener("message", receive);
const { abs, sign, ceil, floor, sin, cos } = Math;
let width, height, pixels;
const depthBuffer = [];
const c = [255, 255, 255, 255];
const panTranslation = { x: 0, y: 0 };
const skips = [];
function makeBuffer(width, height, fillProcess, painting) {
  const imageData = new ImageData(width, height);
  const buffer = {
    pixels: imageData.data,
    width: imageData.width,
    height: imageData.height,
  };
  if (typeof fillProcess === "function") {
    const savedBuffer = getBuffer();
    const rc = c;
    setBuffer(buffer);
    const api = { width: width, height: height, pixels: pixels };
    Object.assign(api, painting.api);
    fillProcess(api);
    painting.paint();
    setBuffer(savedBuffer);
    color(...rc);
  }
  return buffer;
}
function getBuffer() {
  return { width: width, height: height, pixels: pixels };
}
function setBuffer(buffer) {
  ({ width, height, pixels } = buffer);
}
function color(r, g, b, a = 255) {
  c[0] = floor(r);
  c[1] = floor(g);
  c[2] = floor(b);
  c[3] = floor(a);
}
function clear() {
  for (let i = 0; i < pixels.length; i += 4) {
    pixels[i] = c[0];
    pixels[i + 1] = c[1];
    pixels[i + 2] = c[2];
    pixels[i + 3] = c[3];
  }
}
function plot() {
  let x, y;
  arguments.length === 1 ? ([x, y] = arguments[0]) : ([x, y] = arguments);
  x = floor(x);
  y = floor(y);
  if (x < 0 || x >= width || y < 0 || y >= height) return;
  for (const s of skips) if (x === s.x && y === s.y) return;
  const i = (x + y * width) * 4;
  const alpha = c[3];
  if (alpha === 255) {
    pixels[i] = c[0];
    pixels[i + 1] = c[1];
    pixels[i + 2] = c[2];
    pixels[i + 3] = c[3];
  } else if (alpha !== 0) {
    pixels[i] = lerp(pixels[i], c[0], alpha / 255);
    pixels[i + 1] = lerp(pixels[i + 1], c[1], alpha / 255);
    pixels[i + 2] = lerp(pixels[i + 2], c[2], alpha / 255);
    pixels[i + 3] = Math.min(255, pixels[i + 3] + c[3]);
  }
}
function skip(...args) {
  if (args[0] === null) skips.length = 0;
  else
    args.forEach((p) => {
      skips.push({
        x: floor(p.x) + panTranslation.x,
        y: floor(p.y) + panTranslation.y,
      });
    });
}
function point(...args) {
  let x, y;
  if (args.length === 1) {
    x = args[0].x;
    y = args[0].y;
  } else if (args.length === 2) {
    x = args[0];
    y = args[1];
  }
  x += panTranslation.x;
  y += panTranslation.y;
  plot(x, y);
}
function pan(x, y) {
  if (y === undefined) y = x;
  panTranslation.x += floor(x);
  panTranslation.y += floor(y);
}
function unpan() {
  panTranslation.x = 0;
  panTranslation.y = 0;
}
function copy(destX, destY, srcX, srcY, src, alpha = 1) {
  destX = Math.round(destX);
  destY = Math.round(destY);
  srcX = Math.round(srcX);
  srcY = Math.round(srcY);
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
  pixels[destIndex] =
    lerp(pixels[destIndex], src.pixels[srcIndex], srcAlpha) * alpha;
  pixels[destIndex + 1] =
    lerp(pixels[destIndex + 1], src.pixels[srcIndex + 1], srcAlpha) * alpha;
  pixels[destIndex + 2] =
    lerp(pixels[destIndex + 2], src.pixels[srcIndex + 2], srcAlpha) * alpha;
  pixels[destIndex + 3] = 255;
}
function paste(from, destX = 0, destY = 0) {
  if (from.crop) {
    for (let x = 0; x < from.crop.w; x += 1) {
      for (let y = 0; y < from.crop.h; y += 1) {
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
    {
      for (let x = 0; x < from.width; x += 1) {
        for (let y = 0; y < from.height; y += 1) {
          copy(destX + x, destY + y, x, y, from);
        }
      }
    }
  }
}
function line() {
  let x0, y0, x1, y1;
  if (arguments.length === 4) {
    x0 = arguments[0];
    y0 = arguments[1];
    x1 = arguments[2];
    y1 = arguments[3];
  } else if (arguments.length === 2) {
    if (Array.isArray(arguments[0])) {
      x0 = arguments[0][0];
      x1 = arguments[0][1];
      y0 = arguments[1][0];
      y1 = arguments[1][1];
    } else {
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
  x0 += panTranslation.x;
  y0 += panTranslation.y;
  x1 += panTranslation.x;
  y1 += panTranslation.y;
  bresenham(x0, y0, x1, y1).forEach((p) => plot(p.x, p.y));
}
function circle(x0, y0, radius) {
  x0 = floor(x0);
  y0 = floor(y0);
  radius = floor(radius);
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
function poly(coords) {
  let last = coords[0];
  coords.forEach((current, i) => {
    if (i < coords.length - 1) skip(current);
    line(last, current);
    skip(null);
    last = current;
  });
}
function bresenham(x0, y0, x1, y1) {
  const points = [];
  x0 = floor(x0);
  y0 = floor(y0);
  x1 = floor(x1);
  y1 = floor(y1);
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
const BOX_CENTER = "*center";
function box() {
  let x,
    y,
    w,
    h,
    mode = "fill";
  if (arguments.length === 1) {
    if (Array.isArray(arguments[0])) {
      x = arguments[0][0];
      y = arguments[0][1];
      w = arguments[0][2];
      h = arguments[0][3];
    } else {
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
    x = arguments[0].x;
    y = arguments[0].y;
    w = arguments[0].w;
    h = arguments[0].h;
    mode = arguments[1];
  } else if (arguments.length === 3) {
    x = arguments[0];
    y = arguments[1];
    w = arguments[2];
    h = arguments[2];
  } else if (arguments.length === 4) {
    if (typeof arguments[3] === "number") {
      x = arguments[0];
      y = arguments[1];
      w = arguments[2];
      h = arguments[3];
    } else {
      x = arguments[0];
      y = arguments[1];
      w = arguments[2];
      h = arguments[2];
      mode = arguments[3];
    }
  } else if (arguments.length === 5) {
    x = arguments[0];
    y = arguments[1];
    w = arguments[2];
    h = arguments[3];
    mode = arguments[4];
  } else {
    return console.error("Invalid box call.");
  }
  if (mode.endsWith(BOX_CENTER)) {
    x = x - w / 2;
    y = y - h / 2;
    mode = mode.slice(0, -BOX_CENTER.length);
  }
  if (mode === "outline") {
    line(x - 1, y - 1, x + w, y - 1);
    line(x - 1, y + h, x + w, y + h);
    line(x - 1, y, x - 1, y + h - 1);
    line(x + w, y, x + w, y + h - 1);
  } else if (mode === "inline") {
    line(x, y, x + w - 1, y);
    line(x, y + h - 1, x + w - 1, y + h - 1);
    line(x, y + 1, x, y + h - 2);
    line(x + w - 1, y + 1, x + w - 1, y + h - 2);
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
function shape() {
  if (arguments % 2 !== 0) {
    let points = [];
    for (let p = 0; p < arguments.length; p += 2) {
      points.push([arguments[p], arguments[p + 1]]);
    }
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
function grid({ box: { x, y, w: cols, h: rows }, scale, centers }, buffer) {
  const oc = c.slice();
  const w = cols * scale;
  const h = rows * scale;
  const colPix = floor(w / cols),
    rowPix = floor(h / rows);
  if (buffer) {
    for (let j = 0; j < rows; j += 1) {
      const plotY = y + rowPix * j;
      for (let i = 0; i < cols; i += 1) {
        const plotX = x + colPix * i;
        const repeatX = i % buffer.width;
        const repeatY = j % buffer.height;
        const repeatCols = buffer.width;
        const pixIndex = (repeatX + repeatCols * repeatY) * 4;
        if (pixIndex < buffer.pixels.length) {
          color(...buffer.pixels.subarray(pixIndex, pixIndex + 4));
          box(plotX, plotY, scale);
        }
      }
    }
  } else {
    const right = x + w - 1,
      bottom = y + h - 1;
    color(64, 64, 64);
    plot(x, y);
    plot(right, y);
    plot(x, bottom);
    plot(right, bottom);
    color(...oc);
    for (let i = 0; i < cols; i += 1) {
      const plotX = x + colPix * i;
      for (let j = 0; j < rows; j += 1) {
        const plotY = y + rowPix * j;
        const alphaMod = oc[3] / 255;
        color(oc[0], oc[1], oc[2], even(i + j) ? 50 * alphaMod : 75 * alphaMod);
        box(plotX, plotY, scale);
        centers.forEach((p) => {
          color(oc[0], oc[1], oc[2], 100);
          plot(plotX + p.x, plotY + p.y);
        });
      }
    }
    color(...oc);
  }
}
function draw(drawing, x, y, scale = 1, angle = 0) {
  if (drawing === undefined) return;
  angle = radians(angle);
  const s = sin(angle);
  const c = cos(angle);
  pan(x, y);
  drawing.commands.forEach(({ name, args }) => {
    args = args.map((a) => a * scale);
    if (name === "line") {
      let x1 = args[0];
      let y1 = args[1];
      let x2 = args[2];
      let y2 = args[3];
      let nx1 = x1 * c - y1 * s;
      let ny1 = x1 * s + y1 * c;
      let nx2 = x2 * c - y2 * s;
      let ny2 = x2 * s + y2 * c;
      line(nx1, ny1, nx2, ny2);
    } else if (name === "point") point(...args);
  });
  unpan();
}
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
    pixels[i] = byteInterval17(randInt(16));
    pixels[i + 1] = byteInterval17(randInt(16));
    pixels[i + 2] = byteInterval17(randInt(16));
    pixels[i + 3] = 255;
  }
}
function noise16DIGITPAIN() {
  for (let i = 0; i < pixels.length; i += 4) {
    pixels[i] = byteInterval17(randInt(16)) * 0.6;
    pixels[i + 1] = byteInterval17(randInt(16)) * 0.15;
    pixels[i + 2] = byteInterval17(randInt(16)) * 0.55;
    pixels[i + 3] = 255;
  }
}
function noiseTinted(tint, amount, saturation) {
  for (let i = 0; i < pixels.length; i += 4) {
    const grayscale = randInt(255);
    pixels[i] = lerp(
      lerp(grayscale, randInt(255), saturation),
      tint[0],
      amount
    );
    pixels[i + 1] = lerp(
      lerp(grayscale, randInt(255), saturation),
      tint[1],
      amount
    );
    pixels[i + 2] = lerp(
      lerp(grayscale, randInt(255), saturation),
      tint[2],
      amount
    );
    pixels[i + 3] = 255;
  }
}
const X = 0;
const Y = 1;
const Z = 2;
const W = 3;
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
    const zFar = 1e3;
    this.#perspectiveMatrix = perspective(
      create$2(),
      radians(fov),
      width / height,
      0.1,
      1e3
    );
    const zRange = zNear - zFar;
    const ten = (-zNear - zFar) / zRange;
    const eleven = (2 * zFar * zNear) / zRange;
    this.#perspectiveMatrix[10] = ten;
    this.#perspectiveMatrix[14] = eleven;
    this.#perspectiveMatrix[11] = 1;
  }
  #transform() {
    this.#transformMatrix = translate(create$2(), this.#perspectiveMatrix, [
      this.x,
      this.y,
      this.#z,
    ]);
  }
}
class Form {
  vertices = [];
  indices;
  texture;
  #gradientColors = [
    [1, 0, 0, 1],
    [0, 1, 0, 1],
    [0, 0, 1, 1],
  ];
  position = [0, 0, 0];
  rotation = [0, 0, 0];
  scale = [1, 1, 1];
  alpha = 1;
  constructor(
    { positions, indices },
    fill,
    position = [0, 0, 0],
    rotation = [0, 0, 0],
    scale = [1, 1, 1]
  ) {
    for (let i = 0; i < positions.length; i++) {
      const texCoord = [
        positions[i][X] / 2 + 0.5,
        positions[i][Y] / 2 + 0.5,
        0,
        0,
      ];
      this.vertices.push(
        new Vertex(positions[i], this.#gradientColors[i % 3], texCoord)
      );
    }
    this.indices = indices;
    if (fill.texture) {
      this.texture = fill.texture;
    }
    this.position = position;
    this.rotation = rotation;
    this.scale = scale;
  }
  graph({ matrix: cameraMatrix }) {
    const translate = fromTranslation(create$2(), this.position);
    const rotateY = fromYRotation(create$2(), radians(this.rotation[Y]));
    const rotateX = fromXRotation(create$2(), radians(this.rotation[X]));
    const rotateZ = fromZRotation(create$2(), radians(this.rotation[Z]));
    const rotate = mul$2(create$2(), rotateY, rotateX);
    mul$2(rotate, rotate, rotateZ);
    const matrix = mul$2(create$2(), translate, rotate);
    scale$2(matrix, matrix, this.scale);
    mul$2(matrix, cameraMatrix, matrix);
    const transformedVertices = [];
    this.vertices.forEach((vertex) => {
      transformedVertices.push(vertex.transform(matrix));
    });
    for (let i = 0; i < this.indices.length; i += 3) {
      drawTriangle(
        transformedVertices[i],
        transformedVertices[i + 1],
        transformedVertices[i + 2],
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
class Vertex {
  pos;
  color;
  texCoords;
  get x() {
    return this.pos[X];
  }
  get y() {
    return this.pos[Y];
  }
  get color24bit() {
    return this.color.map((c) => floor(c * 255));
  }
  constructor(pos = [0, 0, 0, 1], color = [...c, 1], texCoords = [0, 0, 0, 0]) {
    this.pos = fromValues(...pos);
    this.color = fromValues(...color);
    this.texCoords = fromValues(...texCoords);
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
    this.#x += this.#xStep;
    add(this.color, this.color, this.#colorStep);
    this.texCoordX += this.#texCoordXStep;
    this.texCoordY += this.#texCoordYStep;
    this.oneOverZ += this.#oneOverZStep;
    this.depth += this.#depthStep;
  }
}
class Gradients {
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
function drawTriangle(v1, v2, v3, texture, alpha) {
  if (
    isInsideViewFrustum(v1.pos) &&
    isInsideViewFrustum(v2.pos) &&
    isInsideViewFrustum(v3.pos)
  ) {
    fillTriangle(v1, v2, v3, texture, alpha);
    return;
  }
}
function fillTriangle(minYVert, midYVert, maxYVert, texture, alpha) {
  const screenMatrix = initScreenSpaceTransformMatrix(width / 2, height / 2);
  minYVert = minYVert.transform(screenMatrix).perspectiveDivide();
  midYVert = midYVert.transform(screenMatrix).perspectiveDivide();
  maxYVert = maxYVert.transform(screenMatrix).perspectiveDivide();
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
  const xDist = right.x - left.x;
  const texCoordXXStep = (right.texCoordX - left.texCoordX) / xDist;
  const texCoordYXStep = (right.texCoordY - left.texCoordY) / xDist;
  const oneOverZXStep = (right.oneOverZ - left.oneOverZ) / xDist;
  const depthXStep = (right.depth - left.depth) / xDist;
  let texCoordX = left.texCoordX + texCoordXXStep * xPrestep;
  let texCoordY = left.texCoordY + texCoordYXStep * xPrestep;
  let oneOverZ = left.oneOverZ + oneOverZXStep * xPrestep;
  let depth = left.depth + depthXStep * xPrestep;
  const gradientColor = add(
    create(),
    left.color,
    scale(create(), gradients.colorXStep, xPrestep)
  );
  for (let i = xMin; i < xMax; i += 1) {
    const index = i + j * width;
    if (depth < depthBuffer[index]) {
      depthBuffer[index] = depth;
      const z = 1 / oneOverZ;
      const srcX = texCoordX * z * (texture.width - 1) + 0.5;
      const srcY = texCoordY * z * (texture.height - 1) + 0.5;
      copy(i, j, srcX, srcY, texture, alpha);
    }
    add(gradientColor, gradientColor, gradients.colorXStep);
    texCoordX += texCoordXXStep;
    texCoordY += texCoordYXStep;
    oneOverZ += oneOverZXStep;
    depth += depthXStep;
  }
}
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
function choose() {
  return arguments[randInt(arguments.length - 1)];
}
function every(obj, value) {
  Object.keys(obj).forEach((k) => (obj[k] = value));
}
function any(obj) {
  const keys = Object.keys(obj);
  return obj[keys[(keys.length * Math.random()) << 0]];
}
function each(obj, fn) {
  Object.entries(obj).forEach(([key, obj]) => fn(obj, key));
}
function repeat(n, fn) {
  for (let i = 0; i < n; i += 1) fn(i);
}
class Socket {
  #killSocket = false;
  #ws;
  #reconnectTime = 1e3;
  constructor(host, receive, reload) {
    this.#connect(host, receive, reload);
  }
  #connect(host, receive, reload) {
    this.#ws = new WebSocket(`wss://${host}`);
    const ws = this.#ws;
    ws.onopen = (e) => {
      console.log("📡 Connected");
      this.#reconnectTime = 1e3;
    };
    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      this.#preReceive(msg, receive, reload);
    };
    ws.onclose = (e) => {
      console.log("📡 Disconnected...", e.reason);
      if (this.#killSocket === false) {
        console.log("📡 Reconnecting in:", this.#reconnectTime, "ms");
        setTimeout(() => {
          this.#connect(host, receive, reload);
        }, this.#reconnectTime);
        this.#reconnectTime = Math.min(this.#reconnectTime * 2, 32e3);
      }
    };
    ws.onerror = (err) => {
      console.error("📡 Error:", err);
      ws.close();
    };
  }
  send(type, content) {
    if (this.#ws.readyState === WebSocket.OPEN)
      this.#ws.send(JSON.stringify({ type: type, content: content }));
  }
  kill() {
    this.#killSocket = true;
    this.#ws.close();
  }
  #preReceive({ id, type, content }, receive, reload) {
    if (type === "message") {
      console.log(`📡 ${content}`);
    } else if (type === "reload" && reload) {
      if (content === "disk") {
        console.log("💾️ Reloading disk...");
        this.kill();
        reload();
      } else if (content === "system" && reload) {
        console.log("💥️ Restarting system...");
        reload("refresh");
      }
    } else {
      receive?.(id, type, content);
    }
  }
}
const servers = {
  main: "server.aesthetic.computer",
  local: "localhost:8082",
  julias: "192.168.1.120:8082",
  lucias: "192.168.1.245:8082",
  ashland_mbp: "192.168.1.18",
};
let debug = false;
const defaults = {
  boot: ($) => {
    $.cursor("native");
    $.gap(0);
  },
  sim: () => false,
  paint: ($) => {
    $.wipe(0, 0, 0);
  },
  beat: () => false,
  act: () => false,
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
let pieceHistoryIndex = -1;
let paintCount = 0n;
let simCount = 0n;
let initialSim = true;
let noPaint = false;
let socket;
let penX, penY;
const store = {};
let upload;
let activeVideo;
let bitmapPromises = {};
let inFocus;
let loadFailure;
const $commonApi = {
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
  geo: { Box: Box, DirtyBox: DirtyBox, Grid: Grid, Circle: Circle },
  ui: { Button: Button },
  help: { choose: choose, repeat: repeat, every: every, any: any, each: each },
  gizmo: { Hourglass: Hourglass },
  net: {},
  needsPaint: () => (noPaint = false),
  store: store,
  pieceCount: -1,
  debug: debug,
};
const $updateApi = {};
const SQUARE = {
  positions: [
    [-1, -1, 0, 1],
    [-1, 1, 0, 1],
    [1, 1, 0, 1],
    [-1, -1, 0, 1],
    [1, -1, 0, 1],
    [1, 1, 0, 1],
  ],
  indices: [0, 1, 2, 3, 4, 5],
};
const TRIANGLE = {
  positions: [
    [-1, -1, 0, 1],
    [0, 1, 0, 1],
    [1, -1, 0, 1],
  ],
  indices: [0, 1, 2],
};
function ink() {
  let args = arguments;
  if (args.length === 1) {
    const isNumber = () => typeof args[0] === "number";
    const isArray = () => Array.isArray(args[0]);
    if (!isNumber() && !isArray()) return ink(any(args[0]));
    if (isNumber()) {
      args = Array.from(args);
      args.push(args[0], args[0]);
    } else if (isArray()) {
      return ink(...args[0]);
    }
  } else if (args.length === 2) {
    args = [arguments[0], arguments[0], arguments[0], arguments[1]];
  }
  color(...args);
}
const $paintApi = {
  Camera: Camera,
  Form: Form,
  TRIANGLE: TRIANGLE,
  SQUARE: SQUARE,
};
const $paintApiUnwrapped = {
  page: setBuffer,
  ink: ink,
  wipe: function () {
    if (arguments.length > 0) ink(...arguments);
    clear();
  },
  copy: copy,
  paste: paste,
  plot: function () {
    if (arguments.length === 1) {
      plot(arguments[0].x, arguments[0].y);
    } else {
      plot(...arguments);
    }
  },
  point: point,
  line: line,
  circle: circle,
  poly: poly,
  box: box,
  shape: shape,
  grid: grid,
  draw: draw,
  printLine: printLine,
  form: function (f, cam) {
    f.graph(cam);
  },
  pan: pan,
  unpan: unpan,
  skip: skip,
  noise16: noise16,
  noise16DIGITPAIN: noise16DIGITPAIN,
  noiseTinted: noiseTinted,
};
class Painting {
  #layers = [];
  #layer = 0;
  api = {};
  constructor() {
    Object.assign(this.api, $paintApi);
    const p = this;
    for (const k in $paintApiUnwrapped) {
      if (typeof $paintApiUnwrapped[k] === "function") {
        p.api[k] = function () {
          if (notArray(p.#layers[p.#layer])) p.#layers[p.#layer] = [];
          p.#layers[p.#layer].push(() => $paintApiUnwrapped[k](...arguments));
          return p.api;
        };
      }
    }
    this.api.painting = function () {
      return makeBuffer(...arguments, new Painting());
    };
    this.api.layer = function (n) {
      p.#layer = n;
      return p.api;
    };
    this.api.abstract = { bresenham: bresenham };
  }
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
const { send, noWorker } = (() => {
  let loadHost;
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
    host = host.replace(/\/$/, "");
    loadHost = host;
    pieceHistoryIndex += fromHistory === true ? -1 : 1;
    socket?.kill();
    if (path === "") path = firstPiece || "prompt";
    if (path === firstPiece && params.length === 0) params = firstParams;
    if (debug) console.log("💾", path, "🌐", host);
    if (path.indexOf("/") === -1) path = "aesthetic.computer/disks/" + path;
    if (path)
      if (debug) {
        console.log("🟡 Development");
      }
    if (loading === false) {
      loading = true;
    } else {
      console.warn("Already loading another disk:", path);
      return;
    }
    let fullUrl = "https://" + host + "/" + path + ".js";
    fullUrl += "#" + Date.now();
    const module = await import(fullUrl).catch((err) => {
      loading = false;
      console.error(`😡 "${path}" load failure:`, err);
      loadFailure = err;
    });
    if (module === undefined) {
      loading = false;
      return;
    }
    $commonApi.reload = (type) => {
      if (type === "refresh") {
        send({ type: "refresh" });
      } else {
        load(currentPath, currentHost, currentSearch, currentParams);
      }
    };
    $commonApi.title = (title) => {
      send({ type: "title", content: title });
    };
    $commonApi.net.host = host;
    $commonApi.net.web = (url) => {
      send({ type: "web", content: url });
    };
    if (debug) {
      let receiver;
      socket = new Socket(
        servers.local,
        (id, type, content) => receiver?.(id, type, content),
        $commonApi.reload
      );
      $commonApi.net.socket = function (receive) {
        receiver = receive;
        return socket;
      };
    } else {
      $commonApi.net.socket = function (
        receive,
        host = debug ? servers.local : servers.main
      ) {
        socket = new Socket(host, receive);
        return socket;
      };
    }
    setTimeout(() => {
      paintCount = 0n;
      simCount = 0n;
      initialSim = true;
      activeVideo = null;
      bitmapPromises = {};
      noPaint = false;
      currentPath = path;
      currentHost = host;
      currentSearch = search;
      currentParams = params;
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
          path: path,
          params: params,
          pieceCount: $commonApi.pieceCount,
          firstPiece: firstPiece,
          fromHistory: fromHistory,
        },
      });
      if (firstLoad === false) {
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
  if (isWorker) {
    onmessage = async function (e) {
      debug = e.data.debug;
      await load(e.data.path, e.data.host, e.data.search, e.data.params);
      onmessage = makeFrame;
      send({ loaded: true });
    };
  } else {
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
      noWorker.postMessage({ data: data });
    }
  }
  return { load: load, send: send, noWorker: noWorker };
})();
class Content {
  nodes = [];
  #id = 0;
  constructor() {}
  add(content) {
    this.nodes.push({ id: this.#id });
    this.#id = this.nodes.length - 1;
    send({
      type: "content-create",
      content: { id: this.#id, content: content },
    });
    return this.nodes[this.nodes.length - 1];
  }
  receive({ id, response }) {
    this.nodes[id].response = response;
  }
  update({ id, msg }) {
    send({ type: "content-update", content: { id: id, msg: msg } });
  }
}
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
  if (type === "beat") {
    const $api = {};
    Object.assign($api, $commonApi);
    $api.graph = painting.api;
    $api.sound = {
      time: content.time,
      bpm: function (newBPM) {
        if (newBPM) content.bpm[0] = newBPM;
        return content.bpm[0];
      },
    };
    $api.sound.microphone = function (options) {
      send({ type: "microphone", content: options });
    };
    const squares = [];
    const bubbles = [];
    $api.sound.square = function ({
      tone = 440,
      beats = Math.random(),
      attack = 0,
      decay = 0,
      volume = 1,
      pan = 0,
    } = {}) {
      squares.push({
        tone: tone,
        beats: beats,
        attack: attack,
        decay: decay,
        volume: volume,
        pan: pan,
      });
      const seconds = (60 / content.bpm) * beats;
      const end = content.time + seconds;
      return {
        progress: function (time) {
          return 1 - Math.max(0, end - time) / seconds;
        },
      };
    };
    $api.sound.bubble = function ({ radius, rise, volume = 1, pan = 0 } = {}) {
      bubbles.push({ radius: radius, rise: rise, volume: volume, pan: pan });
    };
    beat($api);
    send(
      {
        type: "beat",
        content: { bpm: content.bpm, squares: squares, bubbles: bubbles },
      },
      [content.bpm]
    );
    squares.length = 0;
    bubbles.length = 0;
    return;
  }
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
  if (type === "video-frame") {
    activeVideo = content;
    return;
  }
  if (type === "history-load") {
    if (debug)
      console.log("Load from history:", content, currentSearch, currentParams);
    const params = content.split(":");
    const program = params[0];
    params.shift();
    $commonApi.load(program, undefined, undefined, params, true);
    return;
  }
  if (type === "loaded-bitmap-success") {
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
  if (type === "needs-paint") {
    noPaint = false;
    return;
  }
  if (type === "frame") {
    if (paintCount > 0n) {
      const $api = {};
      Object.assign($api, $commonApi);
      Object.assign($api, $updateApi);
      Object.assign($api, painting.api);
      $api.inFocus = content.inFocus;
      $api.sound = { time: content.audioTime, bpm: content.audioBpm };
      $api.screen = { width: content.width, height: content.height };
      $api.cursor = (code) => (cursorCode = code);
      $api.seconds = function (s) {
        return s * 120;
      };
      if (initialSim) {
        simCount += 1n;
        $api.simCount = simCount;
        sim($api);
        initialSim = false;
      } else if (content.updateCount > 0 && paintCount > 0n) {
        for (let i = content.updateCount; i--; ) {
          simCount += 1n;
          $api.simCount = simCount;
          sim($api);
        }
      }
      $api.download = (dl) => send({ type: "download", content: dl });
      $api.upload = (type) => {
        send({ type: "upload", content: type });
        return new Promise((resolve, reject) => {
          upload = { resolve: resolve, reject: reject };
        });
      };
      if (loadFailure) {
        $api.event = { error: loadFailure, is: (e) => e === "load-error" };
        act($api);
        loadFailure = undefined;
      }
      if (signal) {
        const data = { signal: signal };
        Object.assign(data, { device: "none", is: (e) => e === "signal" });
        $api.event = data;
        act($api);
        signal = undefined;
      }
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
      content.keyboard.forEach((data) => {
        Object.assign(data, { device: "keyboard", is: (e) => e === data.name });
        $api.event = data;
        act($api);
        if (data.name === "keyboard:down") {
          if (
            data.key === "Escape" &&
            currentPath !== "computer/disks/prompt"
          ) {
            if (pieceHistoryIndex > 0) {
              send({ type: "back-to-piece" });
            }
          }
          if (data.key === "~") {
            $api.load("prompt");
          }
          if (data.key === "x" && data.ctrl) {
            send({ type: "fullscreen-toggle" });
          }
        }
      });
    }
    if (content.needsRender) {
      const $api = {};
      Object.assign($api, $commonApi);
      Object.assign($api, painting.api);
      $api.paintCount = Number(paintCount);
      $api.inFocus = content.inFocus;
      $api.glaze = function (content) {
        glazeAfterReframe = { type: "glaze", content: content };
      };
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
      }
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
        setBuffer(screen);
        reframe = { width: width, height: height };
      };
      $api.cursor = (code) => (cursorCode = code);
      $api.pen = { x: penX, y: penY };
      $api.video = function (type, options) {
        send({ type: "video", content: { type: type, options: options } });
        return function videoFrame() {
          return activeVideo;
        };
      };
      setBuffer(screen);
      $api.net.preload = function (path) {
        const extension = path.split(".").pop();
        if (extension === "json") {
          path = encodeURIComponent(path);
        }
        try {
          const url = new URL(path);
          if (url.protocol === "demo:") {
            path = `/demo/${url.pathname}`;
          } else if (url.protocol === "https:") {
          }
        } catch {
          path = `https://${$api.net.host}/${path}`;
        }
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
          return new Promise((resolve, reject) => {
            send({ type: "load-bitmap", content: path });
            bitmapPromises[path] = { resolve: resolve, reject: reject };
          });
        }
      };
      if (paintCount === 0n) {
        inFocus = content.inFocus;
        boot($api);
      }
      delete $api.net.preload;
      let painted = false;
      let dirtyBox;
      if (noPaint === false) {
        const paintOut = paint($api);
        noPaint =
          paintOut === false || (paintOut !== undefined && paintOut !== true);
        painting.paint();
        painted = true;
        paintCount = paintCount + 1n;
        if (paintOut) dirtyBox = paintOut;
      }
      let sendData = {};
      let transferredPixels;
      const croppedBox = dirtyBox?.croppedBox?.(screen);
      if (croppedBox?.w > 0 && croppedBox?.h > 0) {
        transferredPixels = dirtyBox.crop(screen);
        sendData = { pixels: transferredPixels, dirtyBox: croppedBox };
      } else if (painted === true) {
        transferredPixels = screen.pixels;
        sendData = { pixels: transferredPixels };
      }
      if (painted === true) sendData.paintChanged = true;
      if (loading === true) sendData.loading = true;
      if (reframe || glazeAfterReframe) {
        sendData.reframe = reframe || glazeAfterReframe !== undefined;
        if (glazeAfterReframe) {
          send(glazeAfterReframe);
          glazeAfterReframe = undefined;
        }
      }
      if (cursorCode) sendData.cursorCode = cursorCode;
      send({ type: "render", content: sendData }, [transferredPixels]);
      if (reframe) reframe = undefined;
      if (cursorCode) cursorCode = undefined;
    } else {
      send({
        type: "update",
        content: { didntRender: true, loading: loading },
      });
    }
  }
}
var disk = Object.freeze({ __proto__: null, noWorker: noWorker });
