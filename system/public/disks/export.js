// Export, 2022.1.5
// A test disk for exporting to IPFS.

// System TODO: Get "system" restart working.

// Export TODO: Generate a statically runnable zip package of this disk that
//       successfully runs on IPFS (with boot and paint).
//       See also: https://www.fxhash.xyz/articles/guide-mint-generative-token
//       Then test sound and other functionality!

import { servers } from "./common/servers.js";

// 🥾 Boot (Runs once before first paint and sim)
function boot({ cursor, wipe, net: { socket } }) {
  cursor("none");
  wipe(0, 30, 10);

  // Connect to the server for live updates.
  // TODO: Somehow make this connection automatic in development mode?
  //       (So that the system can reload also.)
  socket(servers.me, (type, content) => {
    console.log("🤖", type, content);
  });
}

// 🎨 Paint (Runs once per display refresh rate)
function paint({ ink, num: { randInt: r, randIntArr: rA }, screen }) {
  ink(...rA(255, 4)).plot(r(screen.width), r(screen.height));
}

// ✒ Act (Runs once per user interaction)
// function act({ event }) { }

// 💗 Beat (Runs once per bpm)
// function beat($api) { }

// 🧮 Simulate (Runs once per logic frame (120fps)).
// function sim($api) { }

// 📚 Library (Useful functions used throughout the program)
// ...

export { boot, paint };
