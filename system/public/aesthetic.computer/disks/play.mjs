// Play, 22.12.10.15.18
// A dramaturgical messaging game for N players.

/* #region 🏁 todo
 - [-] Make sure text input is working nicely! 
#endregion */

import { TextInput } from "../lib/type.mjs";

let input;

async function boot($) {
  const { net, store } = $;
  const sesh = await net.session(); // Make a session backend.
  console.log("Session:", sesh);

  const id = await store.retrieve("identity"); // Pull the user's identity.
  console.log("Identity:", id);

  input = new TextInput($, "HELLO"); // Instantiate a text prompt.
}

// 🧮 Sim(ulate) (Runs once per logic frame (120fps locked)).
function sim($) {
  input?.sim($);
  // Crunch numbers outside of rendering here.
}

// 🎨 Paint (Executes every display frame)
function paint($) {
  const { wipe } = $;
  wipe(0);
  return input?.paint($);
}

// ✒ Act (Runs once per user interaction)
function act($) {
  input?.act($);
}

export { boot, sim, paint, act };

// 📚 Library (Useful functions used throughout the piece)
// ...
