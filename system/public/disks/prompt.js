// Prompt, 2021.11.28.03.13
// This is for working on font rendering and making a global disk chooser.

// TODO: Make a basic prompt.
//       1. Wire up the keyboard and get it to type the number keys, with return
//          for new lines!
//       2. Load a full glyph set made in plot and render it when all the
//          proper keys are pressed here.
//       3. Add the ability to load any disk by name.
//       4. Add a global ability to quit any disk with the ESC key...?
//          or maybe add a prompt overlay or ":ex" commands a la vim?

// 🥾 Boot (Runs once before first paint and sim)
function boot() {
  // TODO: Implement type.write
  // $api.type.write("Hello", {x: 0, y: 0, scale: {x: 1, y: 1}});
}

// 🎨 Paint (Runs once per display refresh rate)
function paint({ wipe }) {
  wipe(70, 10, 80);
  // return false;
}

// ✒ Act (Runs once per user interaction)
function act({ event }) {
  console.log(event);
}

// 📚 Library (Useful functions used throughout the program)
// ...

export { boot, paint, act };
