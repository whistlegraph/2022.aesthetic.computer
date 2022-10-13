// Smear, 22.10.12.17.18
// A smear brush CTO'd by rapter.

// TODO: Add smear jiggling (on a ring buffer).
//       (Remember the path behind what the user draws.)
// TODO: Add a delay.

const { sin, cos } = Math;

let buffer, radius;
const samples = [];
let samplesCaptured = false;

export function paint({
  painting,
  ink,
  pen,
  pan,
  unpan,
  params,
  paste,
  page,
  pixel,
  screen,
  system,
  paintCount,
  num: { radians, randInt: r, randIntRange: rr, clamp },
  geo: { pointFrom },
  help: { repeat },
}) {
  if (paintCount === 0) {
    params = params.map((str) => parseInt(str));
    radius = params[0] || 16;

    //buffer = painting(screen.width, screen.height, (g) => g.noise16DIGITPAIN());
  }

  paste(system.painting);

  if (pen.drawing) {
    // Crop the back buffer to the radius of the circle.
    if (samplesCaptured === false) {
      if (samples.length > 64) {
        samples.length = 64;
      }

      repeat(128, (i) => {
        const ang = r(360);
        const dst = r(radius);
        const xy = pointFrom(pen.x, pen.y, r(360), dst);
        const sample = new Sample(xy[0] - pen.x, xy[1] - pen.y, pixel(...xy));
        samples.push(sample); // Add sample to the list.
      });
      samplesCaptured = true;
    }

    page(screen);
    pan(pen.x, pen.y);
    samples.forEach((sample) => ink(sample.c).point(sample.x, sample.y));
    unpan();

    ink(255, 0, 0).circle(pen.x, pen.y, radius); // Circle overlay.

    page(system.painting);
    pan(pen.x, pen.y);
    samples.forEach((sample) => {
      //sample.x += clamp(sample.x + rr(-1, 1), 0, radius * 2);
      //sample.y += clamp(sample.y + rr(-1, 1), 0, radius * 2);
      sample.x += rr(-1, 1);
      sample.y += rr(-1, 1);
      //sample.c[0] += rr(-5, 5);
      //sample.c[1] += rr(-5, 5);
      //sample.c[2] += rr(-5, 5);
      ink(sample.c).point(sample.x, sample.y);
    });
    unpan();
  }
}

export function act({ event }) {
  if (event.is("lift")) samplesCaptured = false;
}

class Sample {
  x;
  y;
  c;

  constructor(x, y, c) {
    this.x = x;
    this.y = y;
    this.c = c;
  }
}

export const system = "nopaint";
