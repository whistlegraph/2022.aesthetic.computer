import { boot } from "./computer/bios.js";

let host;

if (window.location.hostname === "aesthetic.computer") {
  host = "disks.aesthetic.computer"; // Production
} else {
  //host = `${window.location.hostname}:8081`; // Development (externally hosted)
  host = window.location.hostname + window.location.pathname; // Export (internally hosted)
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
  boot("spray", bpm, host, undefined, debug);
} else if (window.location.hash === "#spray") {
  boot("plot", bpm, host, undefined, debug);
} else if (window.location.hash === "#tracker") {
  boot("tracker", bpm, host, { width: 320, height: 180 }, debug);
} else {
  boot("disks/export", bpm, host, undefined, debug);
  //boot("spray", bpm, host, undefined, debug);
}
