// Blank, 22.10.03.15.13 

// Dear Piecemaker,

// 🤸 Welcome to aesthetic.computer!

// There aren't really any docs right now,
// but you can `console.log($api);` or throw in
// a `debugger` statement anywhere in a function
// to explore what's available.

// But what's even faster than that is to just ask 
// me directly how to access and control the features
// you're interested in using for a piece.

// Run this piece by typing `@piecemaker/blank`
// on aesthetic.computer or 4esthetic.com for short!

// And debug in the dev console!

// Jeffrey (me@jas.life / digitpain#2262 / @digitpain)

// 🥾 Boot (Runs once before first paint and sim)
function boot({ resize }) {

  // Perform basic setup here.
  //resize(50, 20); // Add a custom resolution. 
}

let rotY = 0;

// 🎨 Paint (Executes every display frame)
function paint({Camera, Form, TRI, form, painting: p}) {

  /*
  rotY += 1;
  rotY %= 360;

  const cam = new Camera(80, { z: 2, y: 0.8, scale: [1, 1, 1] }); // camera with fov

  const tri = new Form(
    TRI,
    { tex: p(1, 8, (g) => g.noise16DIGITPAIN()), alpha: 0.75 },
    { pos: [0, 0, 0], scale: [0.5, 0.5, 0.5], rot:  [0, rotY, 0] }
  );

  //form(tri, cam, { cpu: true });
  form(tri, cam, { cpu: true });
  */

  //$api.wipe(undefined, 100, 120); // Draw a background. (You can also use hex.)

  //$api.ink(0).line(0, 0, $api.screen.width, $api.screen.height);

  // Loop through / edit a pixel array. 
  //$api.edit((pix, w, h) => {
  //  pix[0] = 255;
  //});

  //const onePixel = $api.pixel(0, 0); // Get a pixel.
  //$api.ink(0, 0, 255); // Change colors.
  //$api.point(40, 40); // Set a pixel.

  //return false; // You can return false to draw only once!
}

// PS... I enjoy using `destructuring` to access the APIs!
// This is the same as the above:
// function paint({ wipe }) {
//  wipe(255, 200, 200); // Draw a pink background
//  return false; // You can return false to draw only once!
// }

// ✒ Act (Runs once per user interaction)
function act({ event }) {
  // Respond to user input here.
}

// 🧮 Sim(ulate) (Runs once per logic frame (120fps locked)).
function sim($api) {
  // Crunch numbers outside of rendering here.
}

// 💗 Beat (Runs once per bpm, starting when the audio engine is activated.)
function beat($api) {
  // Make sound here.
}

// 👋 Leave (Runs once before the piece is unloaded)
function leave($api) {
  // Pass data to the next piece here.
}

// 📚 Library (Useful functions used throughout the piece)
// ...

export { boot, sim, paint, act, beat, leave };