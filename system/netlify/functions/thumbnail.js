const { builder } = require("@netlify/functions");

// const chromium = require("chrome-aws-lambda");
// const puppeteer = require("puppeteer-core");

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
  console.log(chrome);
  const browser = await chrome.newContext();
  const page = await browser.newPage();

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

  /*
  const browser = await chromium.puppeteer.launch({
    args: chromium.args,
    defaultViewport: {
      width: Math.ceil(width / 2),
      height: Math.ceil(height / 2),
      deviceScaleFactor: 2,
    },
    executablePath: await chromium.executablePath,
    headless: chromium.headless,
  });
  */

  // const page = await browser.newPage();

  // TODO: Divide the screen density using a query parameter or zoom in using puppeteer?
  // TODO: Rewrite the URL below so that I can test locally if custom thumbnails are needed.
  // await page.goto(`https://${event.headers['x-forwarded-host']}/${command || ""}`); // Local? Codespaces?

  //await page.goto(`https://aesthetic.computer/${command.join("/") || ""}`, {
  //  waitUntil: "networkidle2",
  //});

  // Generally happens after first call to boot from a piece.
  // So there is a built-in delay (to wait for a few frames to render).
  //await page.waitForFunction("window.preloadReady === true", { timeout: 5000 });
  //await page.waitForTimeout(1000); // TODO: Try to make this an explicit signal for
  //                                        after something gets painted.

  //const buffer = await page.screenshot({
  //  type: "jpeg",
  //  quality: 80,
  //});

  //await browser.close();

  /*
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "image/jpeg",
      "Content-Length": buffer.length.toString()
    },
    body: buffer.toString("base64"),
    ttl: 60,
    isBase64Encoded: true,
  };
  */
}

exports.handler = builder(handler);
