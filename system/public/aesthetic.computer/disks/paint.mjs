// Paint, 22.09.19.12.44 
// Boilerplate for a distributed raster editor.

// TODO: Turn this into a 'template' using...
//       then boot, act, and leave can be removed...
//       because they would be filled in!

export const template = "paint";

// 🥾 Boot (Runs once before first paint and sim)
function boot({ screen, wipe, fps }) {
  if (!screen.load("painting")) wipe(64); // Load painting or wipe to gray. 
}

// 🎨 Paint (Executes every display frame)
function paint({ pen, ink }) {
  if (pen.drawing) ink().line(pen.px, pen.py, pen.x, pen.y);
}

// ✒ Act (Runs once per user interaction)
function act({ event: e }) {
  if (e.is("keyboard:down:enter")) {
    console.log("Save image!");
    // TODO: Should be able to save a `.png` here...
  }
}

function leave({ store, screen }) {
  screen.save("painting");
}

export { boot, paint, act, leave };