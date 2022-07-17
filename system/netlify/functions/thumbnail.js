const { builder } = require("@netlify/functions");

const playwright = require('playwright-aws-lambda');

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

  const chrome = await playwright.launchChromium();
  const browser = await chrome.newContext({
    viewport: {
      width: Math.ceil(width / 2),
      height: Math.ceil(height / 2),
    },
    deviceScaleFactor: 2
  });
  const page = await browser.newPage();

  // TODO: Rewrite the URL below so that I can test locally without hitting
  //       aesthetic.computer's production deployment. 22.07.17.22.30
  //       - `https://${event.headers['x-forwarded-host']}/${command || ""}`

  await page.goto(`https://aesthetic.computer/${command.join("/") || ""}`, {
    waitUntil: "networkidle",
  });

  const buffer = await page.screenshot();

  await browser.close();

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "image/png",
      "Content-Length": buffer.length.toString()
    },
    body: buffer.toString("base64"),
    ttl: 60,
    isBase64Encoded: true,
  };

}

exports.handler = builder(handler);
