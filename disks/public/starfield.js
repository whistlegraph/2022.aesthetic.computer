let width, height;

// 💗 Beat
export function beat($api) {
  const { num, help, sound } = $api;
}

// 🧮 Update
export function update($api) {
  const { screen, load } = $api;
  ({ width, height } = screen);

  starfield.update();
}

// 🎨 Render
export function render($api) {
  const { color, clear } = $api;

  color(0, 0, 0);
  clear();

  starfield.render($api);
}

// 📚 Library

// Triangle and Scanline Stuff

// TODO: Put all of "num" in a more global API since it's stateless?
function radians(deg) {
  return deg * (Math.PI / 180);
}

const num = { radians };

// Starfield Renderer
class Starfield {
  numStars = 512;
  spread = 8;
  speed = 1;

  stars = {
    x: Array(this.numStars),
    y: Array(this.numStars),
    z: Array(this.numStars),
  };

  constructor() {
    for (let i = 0; i < this.numStars; i += 1) {
      this.reset(i);
    }
  }

  update() {
    for (let i = 0; i < this.numStars; i += 1) {
      this.stars.z[i] -= 0.01 * this.speed;

      if (this.stars.z[i] <= 0) {
        this.reset(i);
      }

      const p = this.projection(i);
      const x = p[0];
      const y = p[1];

      if (x < 0 || x >= width || y < 0 || y >= height) {
        this.reset(i);
      }
    }
  }

  render($api) {
    const { color, num, plot } = $api;
    for (let i = 0; i < this.numStars; i += 1) {
      color(num.randInt(255), num.randInt(255), num.randInt(255));
      plot(...this.projection(i));
    }
  }

  reset(i) {
    this.stars.x[i] = 2 * (Math.random() - 0.5) * this.spread;
    this.stars.y[i] = 2 * (Math.random() - 0.5) * this.spread;
    this.stars.z[i] = (Math.random() + 0.00001) * this.spread;
  }

  projection(i) {
    const fov = 175;
    const tanHalfFov = Math.tan(radians(fov / 2));

    const halfWidth = width / 2;
    const halfHeight = height / 2;
    return [
      Math.floor(
        (this.stars.x[i] / (this.stars.z[i] * tanHalfFov)) * halfWidth +
          halfWidth
      ),
      Math.floor(
        (this.stars.y[i] / (this.stars.z[i] * tanHalfFov)) * halfHeight +
          halfHeight
      ),
    ];
  }
}

const starfield = new Starfield();
