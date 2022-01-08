import { boot } from "./computer/bios.js";

let host;

if (window.location.hostname === "aesthetic.computer") {
  host = "disks.aesthetic.computer"; // Production
} else {
  // Build a hostname (with a path if one exists) from the current location.
  // Hosts can also be remote domains. (HTTPS is assumed)
  host = window.location.hostname;
  if (window.location.pathname.length > 1) host += window.location.pathname;
}

const bpm = 120;
const debug = true;

boot("disks/prompt", bpm, host, undefined, debug);
