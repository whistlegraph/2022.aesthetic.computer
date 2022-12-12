// Play, 22.12.10.15.18
// A dramaturgical messaging game for N players.

/* #region 🏁 todo
 - [] Send / echo message to server using sockets
      and leave it printed on the screen near the user's identity. 
 - [] Add a cooler palette and increase the font size.
 - [] Record all messages in a thread so they can be played downloaded as...
  (Pick one for now...)
  - [] A gif / webp? A movie file wiht music?
  - [] A formatted multi-swipe post?
 - [] Rename to something more appropriate before moving on?
 - [] Add tiny typing sounds to keyboard?
 + Done
 - [x] Make sure text input is working nicely! 
#endregion */

import { TextInput } from "../lib/type.mjs";
let input;

async function boot($) {
  const { net, store, debug } = $;
  const sesh = await net.session(); // Make a session backend.
  if (debug) console.log("Session:", sesh);

  const id = (await store.retrieve("identity")) || "anon";
  if (debug) console.log("Identity:", id);

  input = new TextInput($, "What are you up to?"); // Instantiate a text prompt.
}

// 🧮 Sim(ulate) (Runs once per logic frame (120fps locked)).
function sim($) {
  input?.sim($);
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
