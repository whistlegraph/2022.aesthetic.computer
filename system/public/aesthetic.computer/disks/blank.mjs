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
  // resize(50, 20); // Add a custom resolution. 
}

// 🎨 Paint (Executes every display frame)
function paint($api) {
  $api.wipe(10, 150, 10); // Draw a pink background. (You can also use hex.)
  $api.edit((pixels) => {
    pixels[0] = 255;
  });
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