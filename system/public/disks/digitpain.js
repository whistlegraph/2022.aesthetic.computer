// DIGITPAIN, 2022.04.06.15.40
//

// TODO
// - Load and display the two painted images.
// - Should these projects be merged?

let img1OriginalPixels, img2OriginalPixels;
let img1, img2;

// 🥾 Boot (Runs once before first paint and sim)
async function boot({ net: { preload }, cursor, fps, resize }) {
  cursor("native");
  resize(1000, 1250); // 3x5
  preload("disks/digitpain/0/0.png").then((img) => {
    // TODO: Make a copy of img1 and img2 so they can be reverted...
    img1 = img;
    img1OriginalPixels = img.pixels.slice();
  });

  preload("disks/digitpain/0/1.png").then((img) => {
    img2 = img;
    img2OriginalPixels = img.pixels.slice();
  });
}

let thaumaTime = 0;
let thaumaMax = 6;

let needsFlip = false;
let flip = true;

// 🧮 Sim(ulate) (Runs once per logic frame (120fps locked)).
function sim({ help: { choose } }) {
  if (img1 && img2) {
    thaumaTime += 1;
    if (thaumaTime > thaumaMax) {
      thaumaTime = 0;
      //thaumaMax = choose(6, 6, 6, 5, 5, 6);
      needsFlip = true;
    }
  }
}

// 🎨 Paint (Executes ever display frame)

function paint({
  wipe,
  paste,
  page,
  ink,
  grid,
  geo: { Grid },
  num: { randIntRange: r },
  help: { choose },
  screen,
  paintCount,
}) {
  // Swap a pixel from both layers, every frame.
  if (img1 && img2) {
    for (let n = 0; n < choose(r(4, 32), r(128, 256)); n += 1) {
      const x = r(0, screen.width);
      const y = r(0, screen.height);
      const i = (x + y * screen.width) * 4;

      const img2p = [
        img2.pixels[i] * (1 + Math.random()),
        img2.pixels[i + 1],
        img2.pixels[i + 2],
        img2.pixels[i + 3],
      ];
      const img1p = [
        img1.pixels[i] * (1 + Math.random()),
        img1.pixels[i + 1],
        img1.pixels[i + 2],
        img1.pixels[i + 3],
      ];

      //console.log(img2p);

      page(img1);
      ink(img2p).plot(x, y);

      page(img2);
      ink(img1p).plot(x, y);

      page(screen);
    }

    if (paintCount % 600 === 0) {
      if (choose(0, 1) === 0) {
        img1.pixels = img1OriginalPixels.slice();
      } else {
        img2.pixels = img2OriginalPixels.slice();
      }
    }
  }

  if (needsFlip) {
    if (img1 && img2) {
      if (flip) {
        wipe(r(0, choose(12, 12, 12, 48)), r(0, 12), r(0, 12)).paste(
          img1,
          choose(0, r(-2, 2)),
          choose(0, r(-2, 2))
        );
      } else {
        wipe(r(0, 12), r(0, 12), r(0, 12)).paste(
          img2,
          choose(0, r(-4, 4)),
          choose(0, r(-2, 2))
        );
      }
    } else {
      wipe(r(10, 20));
    }

    // wipe(0, r(0, 16));

    flip = !flip;
    needsFlip = false;
  }
}

// ✒ Act (Runs once per user interaction)
function act({ event }) {}

// 💗 Beat (Runs once per bpm)
function beat($api) {
  // TODO: Play a sound here!
}

// 📚 Library (Useful classes & functions used throughout the piece)
// ...

export { boot, sim, paint, act, beat };
