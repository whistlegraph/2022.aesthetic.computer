// Serves HTML from a template for every landing route on aesthetic.computer.

// TODO: Replace the description with something from the actual
//       piece files... or a database?
// Ideally they should just be specified at the top of the piece file.
// export const description = ""; // Maybe just use this? 22.07.18.08.25

// Note: this metadata is also set clientside via `disk.js`.

import { builder } from "@netlify/functions";
// import { readFile } from "fs/promises";

async function fun(event, context) {
  // TODO: Return a 500 or 404 for something that does not exist...

  if (event.path === "/favicon.ico") return { statusCode: 500 }

  console.log("Version:", process.version);

  console.log("Path:", event.path);

  let path = event.path.slice(1) || "prompt";
  let title = "aesthetic.computer";
  if (path.length && path !== "prompt") title = path + " · aesthetic.computer";

  // TODO: Check to see if the path is on this server.
  const { desc } = await import("../../public/aesthetic.computer/disks/" + path + ".mjs");

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${title}</title>
        <script src="/aesthetic.computer/boot.mjs" type="module" defer></script>
        <link rel="icon" href="data:;base64,iVBORw0KGgo=">
        <link rel="stylesheet" href="/aesthetic.computer/style.css" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="og:title" content="${path}" />
        <meta name="og:description" content="${desc || "An aesthetic.computer piece."}" />
        <meta name="og:image" content="https://aesthetic.computer/thumbnail/1200x630/${path}.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="${path}" />
        <meta name="twitter:site" content="aesthetic.computer" />
        <meta name="twitter:image" content="https://aesthetic.computer/thumbnail/1800x900/${path}.jpg"/>
      </head>
      <body class="native-cursor">
      <script>
        if (window.self !== window.top) document.body.classList.add("embed");
      </script>
      </body>
    </html>
  `;
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "text/html",
    },
    body: html,
    ttl: 60,
  };
}

export const handler = builder(fun)

//exports.handler = builder(handler);
