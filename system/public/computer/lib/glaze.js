// ✨ Glaze 2022.02.06.15.09
// This creates a nice webgl2 rendering layer
// over the scaled software rasterizer.

let gl, canvas;

const shaders = await preloadShaders([
  "lighting-and-display-vert",
  "lighting-frag",
  "display-frag",
]);

const lighting = {
  vert: shaders["lighting-and-display-vert"],
  frag: shaders["lighting-frag"],
};
const display = {
  vert: shaders["lighting-and-display-vert"],
  frag: shaders["display-frag"],
};

export function init() {
  canvas = document.createElement("canvas");
  canvas.dataset.type = "ui";
  gl = canvas.getContext("webgl2", {
    alpha: false,
    depth: false,
    stencil: false,
    desynchronized: true,
    antialias: false,
  });

  // Blending & Culling
  gl.enable(gl.BLEND);
  gl.blendEquation(gl.FUNC_ADD);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  document.body.append(canvas);
}

let lightingProgram, displayProgram;
let texSurf, fbSurf, fb;
let vao;
let uniformTexLocation;
let uniformTimeLocation;
let uniformMouseLocation;
let uniformResolutionLocation;

let displayTexUniformLocation;
let displayTexUniformTimeLocation;
let displayTexUniformMouseLocation;
let displayTexUniformResolutionLocation;

// TODO: This is run on every resize... but some of this can move into init() above.
// Resizes the textures & re-initializes the necessary components for a resolution change.
// See also: `frame` via window.resize in `bios.js`.
export function frame(w, h, rect, nativeWidth, nativeHeight) {
  // Run `init` if the canvas does not exist.
  // Note: Should `init` just be here?
  if (canvas === undefined) {
    this.init();
  }

  canvas.style.left = rect.x + "px";
  canvas.style.top = rect.y + "px";

  // Set the native canvas width and height.
  canvas.width = nativeWidth;
  canvas.height = nativeHeight;

  // Create shader program.
  const lightingVert = createShader(gl.VERTEX_SHADER, lighting.vert);
  const lightingFrag = createShader(gl.FRAGMENT_SHADER, lighting.frag);
  lightingProgram = createProgram(lightingVert, lightingFrag);

  const displayVert = createShader(gl.VERTEX_SHADER, lighting.vert);
  const displayFrag = createShader(gl.FRAGMENT_SHADER, display.frag);
  displayProgram = createProgram(displayVert, displayFrag);

  // Make surface texture.
  texSurf = gl.createTexture();

  // Temporarily fill texture with random pixels.
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

  // Make fb texture.
  fbSurf = gl.createTexture();

  // Temporarily fill texture with random pixels.
  const buffer2 = new Uint8Array(4 * w * h);
  buffer2.fill(0);

  gl.bindTexture(gl.TEXTURE_2D, fbSurf);
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

  // Make frame buffer.
  fb = gl.createFramebuffer();

  // Make vertex array object.
  vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  // Position Attribute
  const positionAttributeLocation = gl.getAttribLocation(
    lightingProgram,
    "a_position"
  );
  const positionBuffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  const positions = [-1, 1, -1, -1, 1, -1, 1, 1];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
  gl.vertexAttribDivisor(positionAttributeLocation, 0);
  gl.enableVertexAttribArray(positionAttributeLocation);

  // Texture Coordinate Attribute
  const texCoordAttributeLocation = gl.getAttribLocation(
    lightingProgram,
    "a_texc"
  );
  const texCoordBuffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);

  //const texCoords = [0, 0, 0, 1, 1, 1, 1, 0];
  const texCoords = [0, 0, 0, 1, 1, 1, 1, 0];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);

  gl.vertexAttribPointer(texCoordAttributeLocation, 2, gl.FLOAT, false, 0, 0);
  gl.vertexAttribDivisor(texCoordAttributeLocation, 0);
  gl.enableVertexAttribArray(texCoordAttributeLocation);

  // Vertex Attribute Index
  const indices = [
    0,
    1,
    2, // first triangle, bottom left - top left - top right
    0,
    2,
    3, // second triangle, bottom left - top right, bottom right
  ];

  const indicesBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(indices),
    gl.STATIC_DRAW
  );

  // Uniforms
  displayTexUniformLocation = gl.getUniformLocation(displayProgram, "u_tex");

  displayTexUniformMouseLocation = gl.getUniformLocation(
    displayProgram,
    "mouse"
  );
  displayTexUniformResolutionLocation = gl.getUniformLocation(
    displayProgram,
    "resolution"
  );

  displayTexUniformTimeLocation = gl.getUniformLocation(displayProgram, "time");

  uniformTexLocation = gl.getUniformLocation(lightingProgram, "u_tex");
  uniformTimeLocation = gl.getUniformLocation(lightingProgram, "time");

  uniformMouseLocation = gl.getUniformLocation(lightingProgram, "mouse");
  uniformResolutionLocation = gl.getUniformLocation(
    lightingProgram,
    "resolution"
  );
  // uniformAngleLocation = gl.getUniformLocation(program, "u_angle");
  // uniformScreenRatioLocation = gl.getUniformLocation(
  //  program,
  //  "u_screen_ratio"
  //);
}

// Turn glaze off if it has already been turned on.
export function off() {
  if (canvas) canvas.style.opacity = 0;
}

// Turn glaze on if it has already been turned off.
export function on(w, h, rect, nativeWidth, nativeHeight) {
  if (canvas) {
    canvas.style.opacity = 1;
  } else {
    this.frame(w, h, rect, nativeWidth, nativeHeight);
  }
}

export function render(canvasTexture, time, mouse) {
  // 🅰️ Render Surface
  gl.useProgram(lightingProgram);

  gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

  gl.framebufferTexture2D(
    gl.FRAMEBUFFER,
    gl.COLOR_ATTACHMENT0,
    gl.TEXTURE_2D,
    fbSurf,
    0
  );

  const texSurfWidth = canvasTexture.width;
  const texSurfHeight = canvasTexture.height;
  // Resolution of lighting. TODO: Switch to full resolution mode.
  gl.viewport(0, 0, texSurfWidth, texSurfHeight);
  //gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texSurf);

  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    canvasTexture.width,
    canvasTexture.height,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    canvasTexture
  );

  gl.uniform1i(uniformTexLocation, 0);
  gl.uniform1f(uniformTimeLocation, time);
  gl.uniform2f(uniformMouseLocation, mouse.x, mouse.y);
  gl.uniform2f(uniformResolutionLocation, texSurfWidth, texSurfHeight);
  gl.bindVertexArray(vao);
  gl.drawElementsInstanced(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0, 1);

  // 🅱️ Display Surface
  gl.useProgram(displayProgram);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, fbSurf);

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  gl.uniform1i(displayTexUniformLocation, 0);
  gl.uniform2f(displayTexUniformMouseLocation, mouse.x, mouse.y);
  gl.uniform2f(
    displayTexUniformResolutionLocation,
    gl.canvas.width,
    gl.canvas.height
  );
  gl.uniform1f(displayTexUniformTimeLocation, time);
  gl.drawElementsInstanced(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0, 1);
}

// 📚 Utilities
function createShader(type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
    return shader;
  }

  console.error(gl.getShaderInfoLog(shader));
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

/*
function clear(r, g, b) {
  gl.clearColor(r, g, b, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
}
*/

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

// Loads shader sources from a list of filenames: [url1, url2...]
async function preloadShaders(pathArray) {
  const sources = await Promise.all(
    pathArray.map((path) =>
      fetch("computer/lib/shaders/" + path + ".glsl").then((file) => {
        return file.text();
      })
    )
  );

  const lib = {};
  pathArray.forEach((path, i) => (lib[path] = sources[i]));
  return lib;
}
