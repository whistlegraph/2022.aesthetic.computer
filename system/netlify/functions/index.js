// Serves HTML from a template for every landing route on aesthetic.computer.

// TODO: Replace the description with something from the actual
//       piece files... or a database?
// Ideally they should just be specified at the top of the piece file.
// export const description = ""; // Maybe just use this? 22.07.18.08.25

// Note: this metadata is also set clientside via `disk.js`.

import { builder } from "@netlify/functions";
// import { readFile } from "fs/promises";
import https from "https";
import { URLSearchParams } from "url";

import { parse } from "../../public/aesthetic.computer/lib/parse.mjs";

async function fun(event, context) {
  if (process.env.CONTEXT === "dev")
    console.log("Node version:", process.version);

  // TODO: Return a 500 or 404 for everything that does not exist...
  //       - [] Like for example if the below import fails...
  if (event.path === "/favicon.ico") return { statusCode: 500 };

  let slug = event.path.slice(1) || "prompt";

  const parsed = parse(slug, { hostname: event.headers["host"] });

  if (process.env.CONTEXT === "dev") console.log(slug, parsed);

  let title = "aesthetic.computer";
  if (slug !== "prompt") title = slug + " · aesthetic.computer";

  // Remote host.
  // TODO: Node currently doesn't support dynamic imports from http/s - 22.07.19.05.25
  //       - Implementation below.
  /*
  let importPath;
  if (slug.startsWith('~')) {
    importPath = `https://${parsed.host}/${parsed.path}.mjs`;
  } else {
    importPath = `../../public/${parsed.path}.mjs`;
  }
  // TODO: Check to see if the path is on this server.
  const { desc } = await import(importPath);
  */

  let desc;

  const redirect = {
    statusCode: 302,
    headers: {
      "Content-Type": "text/html",
      Location: "/" + new URLSearchParams(event.queryStringParameters),
    },
    body: '<a href="https://aesthetic.computer">https://aesthetic.computer</a>',
  };

  // Externally hosted piece.
  try {
    if (slug.startsWith("~")) {
      const externalPiece = await getPage(
        `https://${parsed.host}/${parsed.path}.mjs`
      );
      if (externalPiece?.code === 200) {
        desc =
          externalPiece.data.split(/\r?\n/)[0].replace("//", "").trim() ||
          `A piece by ${slug.split("/")[0].replace("~", "")}.`;
      } else {
        return redirect;
      }
    } else {
      // Locally hosted piece.
      desc = (await import(`../../public/${parsed.path}.mjs`)).desc;
    }
  } catch {
    // If either module doesn't load, then we KNOW we won't be able to load
    // the piece, so we can fallback to the main route.
    return redirect;
  }

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
        <meta name="og:title" content="${slug}" />
        <meta name="og:description" content="${
          desc || "An aesthetic.computer piece."
        }" />
        <meta name="og:image" content="https://${
          event.headers['host']
        }/thumbnail/1200x630/${slug}.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="${slug}" />
        <meta name="twitter:site" content="aesthetic.computer" />
        <meta name="twitter:image" content="https://${
         event.headers['host'] 
        }/thumbnail/1800x900/${slug}.jpg"/>
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
      // These headers are required in order for SharedArrayBuffer to be enabled.
      // Currently used by ffmpeg.wasm. 22.08.06.11.01
      // "Cross-Origin-Embedder-Policy": "require-corp",
      // "Cross-Origin-Opener-Policy": "same-origin",
    },
    body: html,
    ttl: 60,
  };
}

async function getPage(url) {
  return new Promise((resolve) => {
    let data = "";
    https
      .get(url, (res) => {
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          resolve({ data, code: res.statusCode });
        });
      })
      .on("error", (e) => {
        console.log("Error:", e);
        resolve(); // TODO: Should I error here, rather than resolve?
      });
  });
}

export const handler = builder(fun);
