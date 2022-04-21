// ✨ Glaze 2022.02.06.15.09
// This creates a nice webgl2 rendering layer
// over the scaled software rasterizer.

const { keys } = Object;

import glazes from "./glazes/uniforms.js";

class Glaze {
  loaded = false;
  shaderLoaded = false;
  uniformNames;
  frag;

  #uniforms;
  #type;

  constructor(type = "original") {
    this.#type = type;
    this.#uniforms = glazes[type];
    this.uniformNames = keys(this.#uniforms).map((id) => id.split(":")[1]);
  }

  async load(callback) {
    const name = `${this.#type}-frag`;
    this.frag = (await preloadShaders([`./glazes/${name}`]))[name];
    this.shaderLoaded = true;
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

// TODO: Replace this with custom code.

import { pathEnd, wrapNotArray } from "./helpers.js";

const shaders = await preloadShaders([
  "shaders/display-frag",
  "shaders/passthrough-vert",
  "glazes/compute-frag",
]);

const display = {
  vert: shaders["passthrough-vert"],
  frag: shaders["display-frag"],
};

export function init(wrapper) {
  canvas = document.createElement("canvas");
  canvas.dataset.type = "glaze";

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

  // Make sure that this gets added before the uiCanvas.
  wrapper.append(canvas);
}

let customProgram, computeProgram, displayProgram;
let texSurf, A, post, fb;
let texSurfWidth, texSurfHeight;
let vao;

const defaultUniformNames = ["iTexture", "iTime", "iMouse", "iResolution"];

let customUniformLocations = {};

const displayUniformNames = defaultUniformNames;
const displayUniformLocations = {};

let offed = false;

// TODO: This is run on every resize... but some of this can move into init() above.
// Resizes the textures & re-initializes the necessary components for a resolution change.
// See also: `frame` via window.resize in `bios.js`.
export function frame(w, h, rect, nativeWidth, nativeHeight, wrapper) {
  if (glaze.shaderLoaded === false) return;

  // Run `init` if the canvas does not exist.
  // Note: Should `init` just be here?
  if (canvas === undefined) {
    this.init(wrapper);
  }

  // Set the native canvas width and height.
  canvas.width = nativeWidth * window.devicePixelRatio;
  canvas.height = nativeHeight * window.devicePixelRatio;

  canvas.style.width = rect.width + "px";
  canvas.style.height = rect.height + "px";

  // Create custom shader program.
  const customVert = createShader(gl.VERTEX_SHADER, display.vert);
  const customFrag = createShader(gl.FRAGMENT_SHADER, glaze.frag);
  customProgram = createProgram(customVert, customFrag);

  // Create compute shader program.
  const computeVert = createShader(gl.VERTEX_SHADER, display.vert);
  const computeFrag = createShader(gl.FRAGMENT_SHADER, shaders["compute-frag"]);
  computeProgram = createProgram(computeVert, computeFrag);

  // Create display shader program.
  const displayVert = createShader(gl.VERTEX_SHADER, display.vert);
  const displayFrag = createShader(gl.FRAGMENT_SHADER, display.frag);
  displayProgram = createProgram(displayVert, displayFrag);

  // Make surface texture.
  texSurf = gl.createTexture();

  texSurfWidth = w;
  texSurfHeight = h;

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
  A = gl.createTexture();

  // Temporarily fill texture with random pixels.
  const buffer2 = new Uint8Array(4 * w * h);
  buffer2.fill(0);

  // Make post texture.
  post = gl.createTexture();

  gl.bindTexture(gl.TEXTURE_2D, post);
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

  gl.bindTexture(gl.TEXTURE_2D, A);
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

  // Texture Coordinate Attribute
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

  // Display Uniforms (Just the defaults.)
  defaultUniformNames.forEach(function (item, index) {
    displayUniformLocations[item] = gl.getUniformLocation(displayProgram, item);
  });

  // Custom Effect Uniforms (All the defaults, plus custom ones!)
  customUniformLocations = {};

  glaze.uniformNames
    .concat(defaultUniformNames)
    .forEach(function (item, index) {
      customUniformLocations[item] = gl.getUniformLocation(customProgram, item);
    });

  glaze.loaded = true;
}

// Turn glaze off if it has already been turned on.
export function off() {
  if (offed && canvas) canvas.style.opacity = 0;
  offed = true;
}

// Turn glaze on if it has already been turned off.
export async function on(w, h, rect, nativeWidth, nativeHeight, wrapper, type) {
  glaze = new Glaze(type);
  await glaze.load(() => {
    this.frame(w, h, rect, nativeWidth, nativeHeight, wrapper);
    offed = false;
  });
}

// Update the texture either in whole or in part based on a dirtyRect from `bios`.
export function update(texture, x = 0, y = 0) {
  if (glaze.loaded === false) return;

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
export function freeze(fCtx) {
  fCtx.drawImage(canvas, 0, 0, fCtx.canvas.width, fCtx.canvas.height);
  canvas.style.opacity = 0;
}

export function unfreeze() {
  if (canvas) canvas.style.removeProperty("opacity");
}

export function render(canvasTexture, time, mouse) {
  if (glaze.loaded === false) return;

  // 🅰️ Render Surface
  gl.useProgram(customProgram);

  gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

  gl.framebufferTexture2D(
    gl.FRAMEBUFFER,
    gl.COLOR_ATTACHMENT0,
    gl.TEXTURE_2D,
    A,
    0
  );

  // Resolution of custom filter.
  // TODO: Add the option to switch to full "native" resolution mode. 2022.04.11.03.48
  gl.viewport(0, 0, texSurfWidth, texSurfHeight);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texSurf);
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, post);
  gl.uniform1i(customUniformLocations.iTexture, 0);
  gl.uniform1i(gl.getUniformLocation(customProgram, "iPost"), 1);
  gl.uniform1f(customUniformLocations.iTime, time);
  gl.uniform2f(customUniformLocations.iMouse, mouse.x, mouse.y);
  gl.uniform2f(customUniformLocations.iResolution, texSurfWidth, texSurfHeight);

  glaze.setCustomUniforms(customUniformLocations, gl);

  gl.bindVertexArray(vao);
  gl.drawElementsInstanced(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0, 1);

  // 🆘 Compute step (repeats)
  gl.useProgram(computeProgram);

  gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

  gl.framebufferTexture2D(
    gl.FRAMEBUFFER,
    gl.COLOR_ATTACHMENT0,
    gl.TEXTURE_2D,
    post,
    0
  );

  gl.viewport(0, 0, texSurfWidth, texSurfHeight);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texSurf);
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, A);
  gl.uniform1i(gl.getUniformLocation(computeProgram, "A"), 1);
  gl.uniform1f(gl.getUniformLocation(computeProgram, "iTime"), time);
  gl.uniform2f(gl.getUniformLocation(computeProgram, "iMouse"), mouse.x, mouse.y);
  gl.uniform2f(gl.getUniformLocation(computeProgram, "iResolution"), texSurfWidth, texSurfHeight);

  //glaze.setCustomUniforms(customUniformLocations, gl);

  gl.bindVertexArray(vao);
  gl.drawElementsInstanced(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0, 1);

  // 🅱️ Display Surface
  gl.useProgram(displayProgram);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texSurf);
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, post);

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  gl.uniform1i(displayUniformLocations.iTexture, 0);
  gl.uniform1i(gl.getUniformLocation(displayProgram, "iPost"), 1);
  gl.uniform2f(displayUniformLocations.iMouse, mouse.x, mouse.y);
  gl.uniform2f(
    displayUniformLocations.iResolution,
    gl.canvas.width,
    gl.canvas.height
  );
  gl.uniform1f(displayUniformLocations.iTime, time);
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

// Loads shader sources from a list of filenames: [url1, url2...]
// Then adds them to lib[].
export async function preloadShaders(pathArray) {
  const sources = await Promise.all(
    pathArray.map((path) =>
      fetch("computer/lib/" + path + ".glsl").then((file) => {
        return file.text();
      })
    )
  );

  const lib = {};
  pathArray.forEach((path, i) => (lib[pathEnd(path)] = sources[i]));
  return lib;
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
