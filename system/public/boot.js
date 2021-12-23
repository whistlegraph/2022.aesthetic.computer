// Jeffrey's in-Project Notes
// See also: https://www.notion.so/whistlegraph/9abf76a4437a46199087176bd06657ea?v=98b5d3a8965e47d9a4c177dd5147960d

// - Finish Oliver + Mija's tracker / player interface.

// - Add system font / main terminal? (Working in "plot").

// Refactor all of "Stage" with future tasks in mind.
// * Eliminate dead code.
// * Simplify existing code.

// After Oliver + Mija:

// TODO: * Reload disk when the file changes.
//         (This should work in production via a secondary disk server.)
//       * Reload system (browser) when any other files change.

// TODO: Add versioning of some kind for disk files, using a comment at the top.
//       * This would eventually allow me to completely change from JavaScript.
//       * More importantly, I could reload a different commit of the system,
//         that matches the query.

// TODO: Add stochastic syntax / DSL for basic drawing?
//wipe.ink.line.line.line.ink("red").box;

// TODO: What crypto-currency / web3.js lib do I hook this thing up to for minting, etc?

// TODO: Allow disk servers to exist for live-reloading:
// - Implement a small server in the disks repository.
// - Use server sent events: https://stackoverflow.com/a/60117990
// - Eventually this repository can be cloned to give someone a server.
// - It's possible that a file system could exist on that server...

// TODO: Make a filesystem?

// Make a "mint" command.

// TODO: Make a video-recording app that generates 3 letter codes? - to augment
// my hand-written notes and pages.

// TODO: Make a whistlegraph notes app where I can record and stop recording and
//  play lines back with audio or just make static lines and marks -- maybe it's
//  a special brush?

// TODO: What is the best way to publish or generate the API documentation tree
// as a cheatsheet... and simultaneously have it available in my editor.

// TODO: Consider moving my task board over to YouTrack? https://whistlegraph.youtrack.cloud/projects/create
// -- Or moving my whole environment over to Vim and doubling down on that.

// TODO: Reframe without having to redraw, or redraw if reframe occurs?
// -- Maybe this is done? 2021.11.27.18.44

// TODO: What to do if paint is not defined... how to export or maintain a still
// image drawing after boot?

// TODO: Add ability to define the logical / simulation framerate.

// TODO: I should be able to write a little drawing program with only
//  "export function act" that draws lines and triggers sounds.

// TODO: Prevent having to change const host before pushing a deployment.
//  -- Develop the code remotely so that it's always running or have a task for
//  temporary deployment?

// TODO: How elegantly can the "Pull" program be expressed? What URL does
// it live on?

// TODO: Make a global menu disk?

// TODO: Give myself the ability to automate testing of system using "robot".

// TODO: Write a simple note taking program with saving and loading of drawings
//  and also recording and playback?

// TODO: Make a quick fullscreen button (make a new keyboard input module).
// TODO: Make a text typing program / module that can be overlayed in any program
// that needs text input.

// TODO: Ink types? ... can they be procedural using a buffer?
// TODO: Fix Firefox: https://bugzilla.mozilla.org/show_bug.cgi?id=1247687

// TODO: Make my first generative disk / piece and mint it.

// DONE

import { boot } from "./computer/bios.js";

let host;

if (window.location.hostname === "aesthetic.computer") {
  host = "disks.aesthetic.computer"; // Production
} else {
  host = `${window.location.hostname}:8081`; // Development
}

const bpm = 120;
const debug = true;

if (window.location.hash === "#pull") {
  // boot("pull", bpm, host, undefined, debug);
  boot("pull", bpm, host, { width: 64, height: 65 }, debug);
} else if (window.location.hash === "#whistlegraph") {
  boot("whistlegraph", bpm, host, undefined, debug);
} else if (window.location.hash === "#blank") {
  boot("blank", bpm, host, undefined, debug);
} else if (window.location.hash === "#alex-row") {
  boot("alex-row", bpm, host, undefined, debug);
} else if (window.location.hash === "#prompt") {
  boot("prompt", bpm, host, undefined, debug);
} else if (window.location.hash === "#plot") {
  boot("plot", bpm, host, undefined, debug);
} else if (window.location.hash === "#tracker") {
  boot("tracker", bpm, host, { width: 320, height: 180 }, debug);
} else {
  boot("stage", bpm, host);
}

// boot("metronome-test", bpm, host);
// boot("doodle", bpm, host);
// boot("starfield", host);
// load("blank", host);
// load("worker-disk", host);
