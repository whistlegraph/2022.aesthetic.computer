// Serves HTML from a template for every landing route on aesthetic.computer.

// TODO: Replace the description with something from the actual
//       piece files... or a database?
// Ideally they should just be specified at the top of the piece file.
// export const description = ""; // Maybe just use this? 22.07.18.08.25

const { builder } = require("@netlify/functions");
const fs = require("fs").promises;
const path = require("path");

async function handler(event, context) {
  let html = await fs.readFile(path.resolve("netlify/functions/templates/index.html"), "utf8");

  let piece = event.path.slice(1);
    
  html = html.replace("1200x630", "1200x630/" + piece);
  html = html.replace("800x800", "800x800/" + piece);

  if (piece.length) {
    let title = piece + " - aesthetic.computer";
    html = html.replace(
      "<title>aesthetic.computer</title>",
      "<title>" + title + "</title>"
    );
    html = html.replace(
      'og:title" content="aesthetic.computer"',
      'og:title" content=' + title + '"'
    );
    html = html.replace(
      'twitter:title" content="aesthetic.computer"',
      'twitter:title" content=' + title + '"'
    );
    /*
    html = html.replace(
      'og:description" content="..."',
      'twitter:title" content=' + title + '"'
    );
    */
  }

  return {
    headers: {
      "Content-Type": "text/html",
    },
    statusCode: 200,
    body: html,
  };
}

exports.handler = builder(handler);