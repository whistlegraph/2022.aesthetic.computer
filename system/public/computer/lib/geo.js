// 🧮 Geometry

const { floor } = Math;
import { dist, randIntRange } from "./num.js";

// A generic circle model for algorithmic use.
export class Circle {
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
export class Box {
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

// A 2 dimensional uniform grid, using a box as the frame (with scaling).
export class Grid {
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
    this.centerOffset = floor(this.#halfScale);
  }

  // Returns unscaled point `{x, y}` in `grid` for given display coordinate
  // `pos`, or `false` if `pos` is outside of `grid`.
  under({ x, y }, cb) {
    const { scale, box } = this;

    // Get original (unscaled) grid position.
    const gx = floor((x - box.x) / scale);
    const gy = floor((y - box.y) / scale);

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
export class DirtyBox {
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
