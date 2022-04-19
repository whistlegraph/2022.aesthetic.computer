// Whistlegraph Player, 2022.4.19
// Made on occasion of Whistlegraph's Feral File exhibition.

// Perhaps every disk can have a supplements feature, and so these are just a
// proof-of-concept that supports supplements?

// Each supplement is a DOM node / template or iframe that will be automatically
// sorted into a card-like interface. This interface can have buttons to go to
// the next or previous slide / supplement.

// 🥾 Boot (Runs once before first paint and sim)
function boot({ resize }) {
  // TODO: Runs only once!
  // resize(50, 20);

  // TODO: Preload multiple files all at once and do something with them here.

  // preload("disks/wg-player/test.mp4").then((mp4) => {
    // console.log(mp4);
    // TODO: Should mp4 be a dom node now?
    //       How could I add text here... or load an HTML template?
  // });

  // TODO: Add the video file to the DOM on top of everything.
  // overlay.add(mp4);

  // files.add(mp4);
  // files.add(score);
  // files.show();
  // docs.add();
  // docs.show();
  // cards.add(mp4);
  // cards.add(score);

  // TODO: Add a button to the DOM on top of everything.
  // const button = ...;
  // overlay.add(button);
}

/*
// 🧮 Sim(ulate) (Runs once per logic frame (120fps locked)).
function sim($api) {
  // TODO: Move a ball here!
  //console.log($api);
}

// 🎨 Paint (Executes every display frame)
function paint({ wipe, num: { randInt: r }, screen }) {
  wipe(0);
}

// ✒ Act (Runs once per user interaction)
function act({ event }) {
  // console.log(event);
}

// 💗 Beat (Runs once per bpm)
function beat($api) {
  // TODO: Play a sound here!
}

*/

// 📚 Library (Useful classes & functions used throughout the piece)
// ...

// export { boot, sim, paint, act, beat };
export { boot };
