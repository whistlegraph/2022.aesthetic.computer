const { builder } = require("@netlify/functions");

const chromium = require("chrome-aws-lambda");
//const puppeteer = require("puppeteer-core");

// Generates an image thumbnail of the starting screen of a piece.
// (After 4 seconds)

// Usage:
// https://aesthetic.computer/thumbnail/widthxheight/command

// TODO: Only allow a few given resolutions to prevent spam.
const acceptedResolutions = ["1200x630", "800x800"]; // og:image, twitter:image

async function handler(event, context) {
  const [resolution, ...command] = event.path
    .replace("/thumbnail/", "")
    .split("/"); // yields nxn and the command, if it exists

  // Ditch if we don't hit the accepted resolution whitelist.
  if (acceptedResolutions.indexOf(resolution) === -1) {
    return { statusCode: 500 };
  }

  // Parse "IntxInt" to get the correct resolution to take a screenshot by.
  const [width, height] = resolution.split("x").map((n) => parseInt(n));

  const browser = await chromium.puppeteer.launch({
    args: chromium.args,
    defaultViewport: { width: Math.ceil(width / 2), height: Math.ceil(height / 2), deviceScaleFactor: 1 },
    executablePath: await chromium.executablePath,
    headless: chromium.headless,
  });

  const page = await browser.newPage();

  // TODO: Divide the screen density using a query parameter or zoom in using puppeteer?
  // TODO: Rewrite the URL below so that I can test locally if custom thumbnails are needed.
  // await page.goto(`https://${event.headers['x-forwarded-host']}/${command || ""}`); // Local? Codespaces?

  await page.goto(`https://aesthetic.computer/${command.join("/") || ""}`);

  // TODO: Depending on the route here I could adjust for pages that need to load
  //       more data like `wg` 22.07.16.22.41

  console.log("COMMAND", command);

  // Happens after first call to boot from a piece. 
  await page.waitForFunction("window.preloadReady === true");
  //await page.waitForTimeout(4000);

  // TODO: Generalize the preloading hooks so they work with digitpain0-n
  // Add something like net.needsPreload along with a hook, so that any
  // piece can make use of this.

  // An exception for the whistlegraphs, which have spinners and should wait
  // until the videos are loaded to have screenshots taken.
  //if (command[0] === "wg") {
  //  await page.waitForFunction("window.preloadReady === true");
  //}
  //console.log("6 seconds passed")

  const buffer = await page.screenshot();

  //console.log("took screenshot")

  //await browser.close();

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "image/png",
    },
    body: buffer.toString("base64"),
    ttl: 60,
    isBase64Encoded: true,
  };
}

exports.handler = builder(handler);
