// Follow along with: https://www.fastify.io/docs/latest/Guides/Getting-Started/

// TODO: Consider writing the files to Digital Ocean Spaces using a netlify
//       serverless function... possibly with the "-background" mode enabled.
// https://www.netlify.com/blog/2021/07/29/how-to-process-multipart-form-data-with-a-netlify-function/

import Fastify from 'fastify'

const fastify = Fastify({
  logger: true
})

//import { chromium } from 'playwright-chromium';
import puppeteer from 'puppeteer';
// import chrome from 'chrome-aws-lambda';
// import * as playwright from 'playwright-core'; // Option 2

const acceptedResolutions = ["1200x630", "800x800"]; // og:image, twitter:image

fastify.get('/thumbnail/:resolution/:command', async (request, reply) => {

  const { resolution, command } = request.params;

  // Parse "IntxInt" to get the correct resolution to take a screenshot by.
  const [width, height] = resolution.split("x").map((n) => parseInt(n));

  // Ditch if we don't hit the accepted resolution whitelist.
  if (acceptedResolutions.indexOf(resolution) === -1) {
    reply.code(500);
    reply.send("error");
  }

  // Option 1: Puppeteer
  const browser = await puppeteer.launch({
    defaultViewport: {
      width: Math.ceil(width / 2),
      height: Math.ceil(height / 2),
      deviceScaleFactor: 2,
    }
  });

  const page = await browser.newPage();

  // TODO: Rewrite the URL below so that I can test locally without hitting
  //       aesthetic.computer's production deployment. 22.07.17.22.30
  //       - `https://${event.headers['x-forwarded-host']}/${command || ""}`
  await page.goto(`http://localhost:8000/${command || ""}`, {
    waitUntil: "networkidle2"
  });

  //await page.waitForFunction("window.preloadReady === true", {
  //  timeout: 6000,
  //});

  // Option 2: Playwright
  /*
  const browser = await playwright.chromium.launch({
    args: chrome.args,
    executablePath: await chrome.executablePath,
    headless: chrome.headless,
  });

  const context = await browser.newContext({
    viewport: {
      width: Math.ceil(width / 2),
      height: Math.ceil(height / 2),
    },
    deviceScaleFactor: 2,
  });

  const page = await context.newPage();

  page.on("console", (message) => {
    console.log(message.text());
  });

  page.on("pageerror", (err) => {
    console.log(err.message);
  });

  // TODO: Rewrite the URL below so that I can test locally without hitting
  //       aesthetic.computer's production deployment. 22.07.17.22.30
  //       - `https://${event.headers['x-forwarded-host']}/${command || ""}`
  await page.goto(`http://localhost:8000/${command || ""}`, {
    waitUntil: "networkidle"
  });

  // Add a potential extra 2 seconds until preloading is ready.
  await page.waitForFunction(() => preloadReady === true);

  //await page.waitForTimeout(12000); // A bit of extra time.

  */

  const buffer = await page.screenshot();

  await browser.close();

  reply.headers({
      "Content-Type": "image/png",
      "Content-Length": buffer.length.toString(),
  });

  reply.code(200);
  reply.send(buffer);
})

const start = async () => {
  try {
    await fastify.listen({ port: 8081 })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start();