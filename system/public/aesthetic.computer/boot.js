import { boot } from "./bios.js";

let host, debug;

if (window.acDEBUG === true || window.acDEBUG === false) {
  debug = window.acDEBUG; // Check for the DEBUG constant in the index.
} else {
  debug = true;
  window.acDEBUG = debug;
}

if (window.location.hostname === "aesthetic.computer") {
  host = "aesthetic.computer"; // Production
  debug = false;
  window.acDEBUG = debug;
} else {
  // Build a hostname (with a path if one exists) from the current location.
  // Hosts can also be remote domains. (HTTPS is assumed)
  host = window.location.hostname;
  if (window.location.pathname.length > 1) {
    const pathSegments = window.location.pathname.split("/");
    if (pathSegments[pathSegments.length - 1].endsWith(".html")) {
      pathSegments.pop();
    }
    host += pathSegments.join("/");
  }
}

const bpm = 120; // Sets the starting bpm.

// If the root starting piece was not defined in the host html file, then it defaults to "prompt" here.
if (window.acSTARTING_PIECE === undefined) window.acSTARTING_PIECE = "prompt";

// Boot the machine with the specified root piece, or a #piece route if one
// is in the url.
boot(
  window.location.hash.length > 0
    ? window.location.hash.slice(1)
    : window.acSTARTING_PIECE,
  bpm,
  host,
  undefined,
  debug
);

// Incoming Message Responder
// - At the moment it is just for a work-in-progress figma widget but any
//   window messages to be received here.
// TODO: Finish FigJam Widget with iframe message based input & output.
//         See also: https://www.figma.com/plugin-docs/working-with-images/
function receive(event) {
  // console.log("🌟 Event:", event);
  if (event.data.type === "figma-image-input") {
    // TODO: Build image with width and height.
    console.log("Bytes:", event.data.bytes.length);
  }
}
window.addEventListener("message", receive);

// TODO: Rewrite this snippet.
// Decoding an image can be done by sticking it in an HTML
// canvas, as we can read individual pixels off the canvas.
/*
async function decode(canvas, ctx, bytes) {
  const url = URL.createObjectURL(new Blob([bytes]));
  const image = await new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject();
    img.src = url;
  });
  canvas.width = image.width;
  canvas.height = image.height;
  ctx.drawImage(image, 0, 0);
  const imageData = ctx.getImageData(0, 0, image.width, image.height);
  return imageData;
}
*/
