// Prompt, 2021.11.28.03.13
// This is for working on font rendering and making a global disk chooser.

// TODO: Load a drawing made in plot and render it.

// 🥾 Boot (Runs once before first paint and sim)
function boot($api) {
  // TODO: Implement type.write
  // $api.type.write("Hello", {x: 0, y: 0, scale: {x: 1, y: 1}});
}

// 🎨 Paint (Runs once per display refresh rate)
function paint({ wipe }) {
  wipe(10, 30, 25);
  return false;
}

// ✒ Act (Runs once per user interaction)
function act({ event }) {
  // console.log(event);
}

// 📚 Library (Useful functions used throughout the program)
// ...

export { boot, paint, act };
