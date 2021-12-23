// 🧮 Geometry

const { floor } = Math;

// A dynamic box defined by x, y, w, h with methods that mutate the state.
export class Box {
  x = 0;
  y = 0;
  w = 1;
  h = 1;

  constructor(x, y, w, h) {
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
  get bottom() {
    return this.y + this.h;
  }

  // Crops a box to another box.
  crop(toX, toY, toW, toH) {
    let { x, y, w, h } = this;

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

  contains({ x, y }) {
    return (
      this.x <= x && x < this.x + this.w && this.y <= y && y < this.y + this.h
    );
  }

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

  // Yields an array of offset points that can be plotted to mark the center of
  // each grid square. (Useful for editors, development and debugging.)
  // Tries to find the exact center point, but if that doesn't exist then
  // this function produces 4 points in the center.
  get center() {
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
