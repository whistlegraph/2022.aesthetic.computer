import {
  randInt,
  byteInterval17,
  mat4,
  vec4,
  even,
  radians,
  lerp,
} from "./num.js";
const { floor, round, sin, cos } = Math;

let width, height, pixels;
const depthBuffer = [];
const c = [255, 255, 255, 255];
const panTranslation = { x: 0, y: 0 }; // For 2d shifting using `pan` and `unpan`.

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
    fillProcess(api); // Every fill process gets a destructurable painting API.
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
  c[0] = floor(r);
  c[1] = floor(g);
  c[2] = floor(b);
  c[3] = floor(a);
}

export { makeBuffer, setBuffer, depthBuffer, color };

// 2. 2D Drawing

function clear() {
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

function plot(x, y) {
  x = round(x);
  y = round(y);

  // Skip pixels that are offscreen.
  if (x < 0 || x >= width || y < 0 || y >= height) {
    return;
  }

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
    // pixels[i + 3] = Math.min(255, pixels[i + 3] + c[3]);
    pixels[i + 3] = floor(255, (pixels[i + 3] + c[3]) / 2);
  }
}

// Plots a single pixel within the panned coordinate space.
// Basically a wrapper over plot, which should ultimately be renamed to set?
function point(x, y) {
  x += panTranslation.x;
  y += panTranslation.y;
  plot(x, y);
}

// TODO: Implement panTranslation for primitives other than line?
function pan(x, y) {
  if (y === undefined) y = x;
  panTranslation.x += x;
  panTranslation.y += y;
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

  // if (alpha === 1) {
  pixels[destIndex] = src.pixels[srcIndex] * alpha;
  pixels[destIndex + 1] = src.pixels[srcIndex + 1] * alpha;
  pixels[destIndex + 2] = src.pixels[srcIndex + 2] * alpha;
  pixels[destIndex + 3] = src.pixels[srcIndex + 3];
  //} else {
  //  console.warn("Copy alpha not available.");
  //}
}

function paste(from, destX = 0, destY = 0) {
  for (let x = 0; x < from.width; x += 1) {
    for (let y = 0; y < from.height; y += 1) {
      copy(destX + x, destY + y, x, y, from);
    }
  }
}

function line(x0, y0, x1, y1) {
  // Add any panTranslations.
  x0 += panTranslation.x;
  y0 += panTranslation.y;
  x1 += panTranslation.x;
  y1 += panTranslation.y;

  // TODO: Check if line is perfectly horizontal and then skip bresenham and
  // optimize by filling the whole buffer with the current color.

  // Make sure everything is ceil'd.
  x0 = Math.ceil(x0);
  y0 = Math.ceil(y0);
  x1 = Math.ceil(x1);
  y1 = Math.ceil(y1);

  // Bresenham's Algorithm
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;

  while (true) {
    plot(x0, y0);

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
}

// Takes in x, y, width and height and draws an
// outline, inline (1px) or filled rectangle, optionally
// from the center by inputting eg: "inline*center" in mode.
const BOX_CENTER = "*center";
// box [...or any object with x, y, w, h properties] (1)
// box, mode (2)
// x, y, size (3)
// x, y, w, h (4)
// x, y, size, mode (4)
// x, y, w, h, mode (5)
function box() {
  let x,
    y,
    w,
    h,
    mode = "fill";

  if (arguments.length === 1) {
    // box
    x = arguments[0].x;
    y = arguments[0].y;
    w = arguments[0].w;
    h = arguments[0].h;
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
    if (Math.sign(height) === 1) {
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

// Renders a square grid at x, y given cols, rows, and scale.
// Buffer is optional, and if present will render the pixels at scale starting
// from the top left corner of the buffer, repeating if needed to fill the grid.
function grid({ box: { x, y, w: cols, h: rows }, scale, center }, buffer) {
  const rc = c.slice(); // Remember color.

  const w = cols * scale;
  const h = rows * scale;

  // TODO: Where to add currying back into this API so I can do color().plot().plot() 2021.12.06.21.32
  // - Make the API object here in this file and wrap the functions as curries?

  const colPix = floor(w / cols),
    rowPix = floor(h / rows);

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
    color(...rc);

    // Draw each grid square, with optional center points.
    for (let i = 0; i < cols; i += 1) {
      const plotX = x + colPix * i;
      for (let j = 0; j < rows; j += 1) {
        const plotY = y + rowPix * j;

        // Lightly shade this grid square, alternating tint on evens and odds.
        color(c[0], c[1], c[2], even(i + j) ? 50 : 75);
        box(plotX, plotY, scale);

        // Color in the centers of each grid square.
        center.forEach((p) => {
          color(c[0], c[1], c[2], 100);
          plot(plotX + p.x, plotY + p.y);
        });
      }
    }

    color(...rc); // Restore color.
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

function noise16() {
  for (let i = 0; i < pixels.length; i += 4) {
    pixels[i] = byteInterval17(randInt(16)); // r
    pixels[i + 1] = byteInterval17(randInt(16)); // g
    pixels[i + 2] = byteInterval17(randInt(16)); // b
    pixels[i + 3] = 255; // a
  }
}

export {
  clear,
  point,
  plot,
  pan,
  unpan,
  copy,
  paste,
  line,
  box,
  grid,
  draw,
  noise16,
};

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

    this.#perspectiveMatrix = mat4.perspective(
      mat4.create(),
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
    this.#transformMatrix = mat4.translate(
      mat4.create(),
      this.#perspectiveMatrix,
      [this.x, this.y, this.#z]
    );

    // Camera rotate:
    // mat4.rotate(perspective, perspective, radians(cr), [0, 0, 1]);
  }
}

// Mesh
class Form {
  #primitive = "triangle";

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

  #texCoords = [
    [0.0, 0.0, 0.0, 0.0],
    [0.0, 1.0, 0.0, 0.0],
    [1.0, 1.0, 0.0, 0.0],
  ];

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

    const translate = mat4.fromTranslation(mat4.create(), this.position);
    const rotateY = mat4.fromYRotation(
      mat4.create(),
      radians(this.rotation[Y])
    );

    const rotateX = mat4.fromXRotation(
      mat4.create(),
      radians(this.rotation[X])
    );

    const rotateZ = mat4.fromZRotation(
      mat4.create(),
      radians(this.rotation[Z])
    );

    const rotate = mat4.mul(mat4.create(), rotateY, rotateX);
    mat4.mul(rotate, rotate, rotateZ);

    // Apply translation and rotation.
    const matrix = mat4.mul(mat4.create(), translate, rotate);

    // Apply scale.
    mat4.scale(matrix, matrix, this.scale);

    // Apply the camera matrix.
    mat4.mul(matrix, cameraMatrix, matrix);

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
    return this.color.map((c) => Math.floor(c * 255));
  }

  constructor(
    pos = [0, 0, 0, 1],
    color = [...c, 1.0],
    texCoords = [0, 0, 0, 0]
  ) {
    this.pos = vec4.fromValues(...pos);
    this.color = vec4.fromValues(...color);
    // if (Array.isArray(texCoords)) {
    this.texCoords = vec4.fromValues(...texCoords);
    // }
  }

  transform(matrix) {
    return new Vertex(
      vec4.transformMat4(vec4.create(), this.pos, matrix),
      this.color,
      this.texCoords
    );
  }

  perspectiveDivide() {
    return new Vertex(
      vec4.fromValues(
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
  const m = mat4.create();
  mat4.translate(m, m, [halfWidth - 0.5, halfHeight - 0.5, 0]);
  mat4.scale(m, m, [halfWidth, -halfHeight, 1]);
  return m;
}

function isInsideViewFrustum(v4) {
  return (
    Math.abs(v4[X]) <= Math.abs(v4[W]) &&
    Math.abs(v4[Y]) <= Math.abs(v4[W]) &&
    Math.abs(v4[Z]) <= Math.abs(v4[W])
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
    this.#yStart = Math.ceil(minYVert.y);
    this.#yEnd = Math.ceil(maxYVert.y);

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
      vec4.add(
        vec,
        vec,
        vec4.scale(vec4.create(), gradients.colorYStep, yPrestep)
      );
      vec4.add(
        vec,
        vec,
        vec4.scale(vec4.create(), gradients.colorXStep, xPrestep)
      );
      this.color = vec;
    }

    {
      const vec = gradients.colorYStep.slice();
      const scaled = vec4.scale(
        vec4.create(),
        gradients.colorXStep,
        this.#xStep
      );
      vec4.add(vec, vec, scaled);
      this.#colorStep = vec;
    }
  }

  step() {
    this.#x += this.#xStep; // add xStep

    vec4.add(this.color, this.color, this.#colorStep); // add colorStep

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
    this.texCoordXXStep = this.#calcXStep(
      this.texCoordX,
      minYVert,
      midYVert,
      maxYVert,
      oneOverdX
    );

    this.texCoordXYStep = this.#calcYStep(
      this.texCoordX,
      minYVert,
      midYVert,
      maxYVert,
      oneOverdY
    );

    this.texCoordYXStep = this.#calcXStep(
      this.texCoordY,
      minYVert,
      midYVert,
      maxYVert,
      oneOverdX
    );

    this.texCoordYYStep = this.#calcYStep(
      this.texCoordY,
      minYVert,
      midYVert,
      maxYVert,
      oneOverdY
    );

    this.oneOverZXStep = this.#calcXStep(
      this.oneOverZ,
      minYVert,
      midYVert,
      maxYVert,
      oneOverdX
    );

    this.oneOverZYStep = this.#calcYStep(
      this.oneOverZ,
      minYVert,
      midYVert,
      maxYVert,
      oneOverdY
    );

    this.depthXStep = this.#calcXStep(
      this.depth,
      minYVert,
      midYVert,
      maxYVert,
      oneOverdX
    );

    this.depthYStep = this.#calcYStep(
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
      const a = vec4.sub(vec4.create(), this.color[1], this.color[2]);
      const b = minYVert.y - maxYVert.y;

      const c = vec4.sub(vec4.create(), this.color[0], this.color[2]);
      const d = midYVert.y - maxYVert.y;

      const left = vec4.scale(vec4.create(), a, b);
      const right = vec4.scale(vec4.create(), c, d);

      const sub = vec4.sub(vec4.create(), left, right);

      this.colorXStep = vec4.scale(vec4.create(), sub, oneOverdX);
    }

    // (c1 - c2) * (x0 - x2) - (c0 - c2) * (x1 - x2)
    // a           b           c           d
    {
      const a = vec4.sub(vec4.create(), this.color[1], this.color[2]);
      const b = minYVert.x - maxYVert.x;

      const c = vec4.sub(vec4.create(), this.color[0], this.color[2]);
      const d = midYVert.x - maxYVert.x;

      const left = vec4.scale(vec4.create(), a, b);
      const right = vec4.scale(vec4.create(), c, d);

      const sub = vec4.sub(vec4.create(), left, right);

      this.colorYStep = vec4.scale(vec4.create(), sub, oneOverdY);
    }
  }

  #calcXStep(values, minYVert, midYVert, maxYVert, oneOverdX) {
    return (
      ((values[1] - values[2]) * (minYVert.y - maxYVert.y) -
        (values[0] - values[2]) * (midYVert.y - maxYVert.y)) *
      oneOverdX
    );
  }

  #calcYStep(values, minYVert, midYVert, maxYVert, oneOverdY) {
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
  return;

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
}

function fillTriangle(minYVert, midYVert, maxYVert, texture, alpha) {
  const screenMatrix = initScreenSpaceTransformMatrix(
    width / 2,
    height / 2,
    mat4
  );

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
  const xMin = Math.ceil(left.x);
  const xMax = Math.ceil(right.x);

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
  const gradientColor = vec4.add(
    vec4.create(),
    left.color,
    vec4.scale(vec4.create(), gradients.colorXStep, xPrestep)
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

    vec4.add(gradientColor, gradientColor, gradients.colorXStep);
    texCoordX += texCoordXXStep;
    texCoordY += texCoordYXStep;
    oneOverZ += oneOverZXStep;
    depth += depthXStep;
  }
}

function clipPolygonAxis(vertices, auxillaryList, componentIndex) {
  clipPolygonComponent(vertices, componentIndex, 1.0, auxillaryList);
  vertices.length = 0;

  if (auxillaryList.length === 0) {
    return false;
  }

  clipPolygonComponent(auxillaryList, componentIndex, -1.0, vertices);
  auxillaryList.length = 0;

  return !(vertices.length === 0);
}

function clipPolygonComponent(
  vertices,
  componentIndex,
  componentFactor,
  result
) {
  let prevVertex = vertices[vertices.length - 1];
  let prevComponent = prevVertex[componentIndex] * componentFactor;
  let prevInside = prevComponent <= prevVertex[W];

  for (let i = 0; i < vertices.length; i += 1) {
    const curVertex = vertices[i];
    const curComponent = curVertex[componentIndex] * componentFactor;

    const curInside = curComponent <= curVertex[W];

    if (curInside ? !prevInside : prevInside) {
      const lerpAmount =
        (prevVertex[W] - prevComponent) /
        (prevVertex[W] - prevComponent - (curVertex[W] - curComponent));
      result.push(vec4.lerp(vec4.create(), prevVertex, curVertex, lerpAmount));
    }

    if (curInside) {
      result.push(curVertex);
    }

    prevVertex = curVertex;
    prevComponent = curComponent;
    prevInside = curInside;
  }
}

export { Camera, Form };

// e. Utilities

let graphicLogCount = 0;
const graphicLogMax = 5;

function graphicLog(log) {
  graphicLogCount = Math.min(graphicLogCount + 1, graphicLogMax);
  if (graphicLogCount < graphicLogMax) {
    console.log(log);
  }
}
