const { builder } = require("@netlify/functions");

const chromium = require("chrome-aws-lambda");
const puppeteer = require("puppeteer-core");

// Generates an image thumbnail of the starting screen of a piece.
// (After 4 seconds)

// Usage:
// https://aesthetic.computer/thumbnail/widthxheight/command

// TODO: Only allow a few given resolutions to prevent spam.
const acceptedResolutions = ["1200x630", "800x800"]; // og:image, twitter:image

async function handler(event, context) {
  const [resolution, command] = event.path
    .replace("/thumbnail/", "")
    .split("/"); // yields nxn and the command, if it exists

  // Ditch if we don't hit the accepted resolution whitelist.
  if (acceptedResolutions.indexOf(resolution) === -1) {
    return { statusCode: 500 };
  }

  // Parse "IntxInt" to get the correct resolution to take a screenshot by.
  const [width, height] = resolution.split("x").map((n) => parseInt(n));

  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: { width, height },
    executablePath: await chromium.executablePath,
    headless: chromium.headless,
  });

  const page = await browser.newPage();

  // TODO: Divide the screen density using a query parameter or zoom in using puppeteer?
  // TODO: Rewrite the URL below so that I can test locally if custom thumbnails are needed.
  // await page.goto(`https://${event.headers['x-forwarded-host']}/${command || ""}`); // Local? Codespaces?

  await page.goto(`https://aesthetic.computer/${command || ""}`);

  // TODO: Depending on the route here I could adjust for pages that need to load
  //       more data like `wg` 22.07.16.22.41
  await page.waitForTimeout(4000);

  const buffer = await page.screenshot();
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "image/png",
    },
    body: buffer.toString("base64"),
    isBase64Encoded: true,
  };
}

exports.handler = builder(handler);
