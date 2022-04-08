// ✨ Glaze 2022.02.06.15.09
// This creates a nice webgl2 rendering layer
// over the scaled software rasterizer.

let gl, canvas;

const shaders = await preloadShaders([
  "passthrough-vert",
  "lighting-frag",
  "display-frag",
]);

const lighting = {
  vert: shaders["passthrough-vert"],
  frag: shaders["lighting-frag"],
};
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

let lightingProgram, displayProgram;
let texSurf, fbSurf, fb;
let texSurfWidth, texSurfHeight;
let vao;

const glazeParameters = {
  fogIterations: 20,
  shadowIterations: 5,
  focalLength: 1,
  screenScale: 1,
  shadowRange: 1,
  cameraDistance: 2.236,
  volumeRadius: 0.005,
  inputRadius: 0.005,
  innerDensity: 20,
  outerDensity: 10.1,
  anisotropy: -0.123,
  lightPower: 4,
  lightDirection: { x: -1, y: -1, z: -0.05 },
  lightColor: { x: 1, y: 1, z: 1 },
  bgColor: { x: 0.084, y: 0.533, z: 0.878 },
};

const lightingUniformNames = [
  "iTexture",
  "iTime",
  "iMouse",
  "iResolution",
  "fogIterations",
  "shadowIterations",
  "focalLength",
  "screenScale",
  "shadowRange",
  "cameraDistance",
  "volumeRadius",
  "inputRadius",
  "innerDensity",
  "outerDensity",
  "anisotropy",
  "lightPower",
  "lightColor",
  "lightDirection",
];

const displayUniformNames = ["iTexture", "iTime", "iMouse", "iResolution"];
const lightingUniformLocations = {};
const displayUniformLocations = {};

let offed = false;

// TODO: This is run on every resize... but some of this can move into init() above.
// Resizes the textures & re-initializes the necessary components for a resolution change.
// See also: `frame` via window.resize in `bios.js`.
export function frame(w, h, rect, nativeWidth, nativeHeight, wrapper) {
  // Run `init` if the canvas does not exist.
  // Note: Should `init` just be here?
  if (canvas === undefined) {
    this.init(wrapper);
  }

  console.log(nativeWidth, rect.width);

  // canvas.style.left = rect.x + "px";
  // canvas.style.top = rect.y + "px";

  // Set the native canvas width and height.
  canvas.width = nativeWidth * window.devicePixelRatio;
  canvas.height = nativeHeight * window.devicePixelRatio;

  canvas.style.width = rect.width + "px";
  canvas.style.height = rect.height + "px";

  // Create shader program.
  const lightingVert = createShader(gl.VERTEX_SHADER, lighting.vert);
  const lightingFrag = createShader(gl.FRAGMENT_SHADER, lighting.frag);
  lightingProgram = createProgram(lightingVert, lightingFrag);

  const displayVert = createShader(gl.VERTEX_SHADER, lighting.vert);
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
  displayUniformLocations.iTexture = gl.getUniformLocation(
    displayProgram,
    "iTexture"
  );

  displayUniformLocations.iMouse = gl.getUniformLocation(
    displayProgram,
    "iMouse"
  );

  displayUniformLocations.iResolution = gl.getUniformLocation(
    displayProgram,
    "iResolution"
  );

  displayUniformLocations.iTime = gl.getUniformLocation(
    displayProgram,
    "iTime"
  );

  displayUniformNames.forEach(function (item, index) {
    displayUniformLocations[item] = gl.getUniformLocation(displayProgram, item);
  });

  lightingUniformNames.forEach(function (item, index) {
    lightingUniformLocations[item] = gl.getUniformLocation(
      lightingProgram,
      item
    );
  });
}

// Turn glaze off if it has already been turned on.
export function off() {
  if (offed && canvas) canvas.style.opacity = 0;
  offed = true;
}

// Turn glaze on if it has already been turned off.
export function on(w, h, rect, nativeWidth, nativeHeight, wrapper) {
  this.frame(w, h, rect, nativeWidth, nativeHeight, wrapper);
  offed = false;
}

// Update the texture either in whole or in part based on a dirtyRect from `bios`.
export function update(texture, x = 0, y = 0) {
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

  // Resolution of lighting. TODO: Switch to full resolution mode.
  gl.viewport(0, 0, texSurfWidth, texSurfHeight);

  gl.bindTexture(gl.TEXTURE_2D, texSurf);

  gl.uniform1i(lightingUniformLocations.iTexture, 0);
  gl.uniform1f(lightingUniformLocations.iTime, time);
  gl.uniform2f(lightingUniformLocations.iMouse, mouse.x, mouse.y);
  gl.uniform2f(
    lightingUniformLocations.iResolution,
    texSurfWidth,
    texSurfHeight
  );

  gl.uniform1i(
    lightingUniformLocations.fogIterations,
    glazeParameters.fogIterations
  );
  gl.uniform1i(
    lightingUniformLocations.shadowIterations,
    glazeParameters.shadowIterations
  );
  gl.uniform1f(
    lightingUniformLocations.focalLength,
    glazeParameters.focalLength
  );
  gl.uniform1f(
    lightingUniformLocations.screenScale,
    glazeParameters.screenScale
  );
  gl.uniform1f(
    lightingUniformLocations.shadowRange,
    glazeParameters.shadowRange
  );
  gl.uniform1f(
    lightingUniformLocations.cameraDistance,
    glazeParameters.cameraDistance
  );
  gl.uniform1f(
    lightingUniformLocations.volumeRadius,
    glazeParameters.volumeRadius
  );
  gl.uniform1f(
    lightingUniformLocations.inputRadius,
    glazeParameters.inputRadius
  );
  gl.uniform1f(
    lightingUniformLocations.innerDensity,
    glazeParameters.innerDensity
  );
  gl.uniform1f(
    lightingUniformLocations.outerDensity,
    glazeParameters.outerDensity
  );
  gl.uniform1f(lightingUniformLocations.anisotropy, glazeParameters.anisotropy);
  gl.uniform1f(lightingUniformLocations.lightPower, glazeParameters.lightPower);
  gl.uniform3f(
    lightingUniformLocations.lightDirection,
    glazeParameters.lightDirection.x,
    glazeParameters.lightDirection.y,
    glazeParameters.lightDirection.z
  );
  gl.uniform3f(
    lightingUniformLocations.bgColor,
    glazeParameters.bgColor.x,
    glazeParameters.bgColor.y,
    glazeParameters.bgColor.z
  );
  gl.uniform3f(
    lightingUniformLocations.lightColor,
    glazeParameters.lightColor.x,
    glazeParameters.lightColor.y,
    glazeParameters.lightColor.z
  );

  gl.bindVertexArray(vao);
  gl.drawElementsInstanced(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0, 1);

  // 🅱️ Display Surface
  gl.useProgram(displayProgram);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, fbSurf);

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  gl.uniform1i(displayUniformLocations.iTexture, 0);
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
