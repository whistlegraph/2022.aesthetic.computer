// Generates an image thumbnail of the starting screen of a piece.
// See also: `/thumbnail-server` for an alternate implementation.

// Usage:
// https://aesthetic.computer/thumbnail/widthxheight/command~any~params.jpg

const { builder } = require("@netlify/functions");
const chromium = require("chrome-aws-lambda");

// Only allow a few given resolutions to prevent spam.
const acceptedResolutions = ["1200x630", "1800x900"]; // og:image, twitter:image

async function fun(event, context) {
  const [resolution, ...filepath] = event.path
    .replace("/thumbnail/", "")
    .split("/"); // yields nxn and the command, if it exists

  // Ditch if we don't hit the accepted resolution whitelist.
  if (acceptedResolutions.indexOf(resolution) === -1 || !filepath[filepath.length - 1].endsWith(".jpg")) {
    return { statusCode: 500 };
  }

  // Parse "IntxInt" to get the correct resolution to take a screenshot by.
  const [width, height] = resolution.split("x").map((n) => parseInt(n));

  // Puppeteer Version
  const browser = await chromium.puppeteer.launch({
    args: chromium.args,
    defaultViewport: {
      width: Math.ceil(width / 2),
      height: Math.ceil(height / 2),
      deviceScaleFactor: 2,
    },
    executablePath: await chromium.executablePath,
    ignoreHTTPSErrors: true,
    headless: chromium.headless,
  });

  const page = await browser.newPage();

  let url;

  if (process.env.CONTEXT === "dev") {
    console.log("🟡 Development");
    url = "http://localhost:8000"; // This is used for testing pages locally.
  } else {
    url = "https://aesthetic.computer";
  }

  try {
    await page.goto(`${url}/${filepath.join("/").replace(".jpg", "") || ""}`, {
      waitUntil: "networkidle2",
      timeout: 3000
    });
  } catch {
    console.log("🔴 Failed to stop networking.");
  }

  try {
    await page.waitForFunction("window.preloaded === true", {
      timeout: 6000,
    });
  } catch {
    console.log("🔴 Failed window.preloaded timer.");
  }

  await page.waitForTimeout(500); // A bit of extra time.

  const buffer = await page.screenshot({
    type: "jpeg",
    quality: 80
  });

  await browser.close();

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "image/jpeg",
      "Content-Length": buffer.length.toString(),
    },
    body: buffer.toString("base64"),
    ttl: 60,
    isBase64Encoded: true,
  };
}

export const handler = builder(fun)
