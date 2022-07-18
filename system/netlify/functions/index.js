// Serves HTML from a template for every landing route on aesthetic.computer.

// TODO: Replace the description with something from the actual
//       piece files... or a database?
// Ideally they should just be specified at the top of the piece file.
// export const description = ""; // Maybe just use this? 22.07.18.08.25

const { builder } = require("@netlify/functions");
const fs = require("fs").promises;

async function handler(event, context) {
  //let html = require("./templates/index.html"); //await fs.readFile("./templates/index.html", "utf8");

  let html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>aesthetic.computer</title>
        <script src="/aesthetic.computer/boot.js" type="module" defer></script>
        <link rel="icon" href="data:;base64,iVBORw0KGgo=">
        <link rel="stylesheet" href="/aesthetic.computer/style.css" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="og:title" content="aesthetic.computer" />
        <meta name="og:description" content="Run any piece by typing its name..." />
        <meta name="og:image" content="https://aesthetic.computer/thumbnail/1200x630/prompt.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="aesthetic.computer" />
        <meta name="twitter:site" content="aesthetic.computer" />
        <meta name="twitter:image" content="https://aesthetic.computer/thumbnail/800x800/prompt.png"/>
      </head>
      <body class="native-cursor"> <!-- Hides the 2D UI on first boot. -->
      <script>
        if (window.self !== window.top) document.body.classList.add("embed");
      </script>
      </body>
    </html>
  `;

  let path = event.path.slice(1) || "prompt";

  html = html.replace("1200x630/prompt.png", "1200x630/" + path + ".png");
  html = html.replace("800x800/prompt.png", "800x800/" + path + ".png");

  if (path.length) {
    let title = path + " - aesthetic.computer";
    html = html.replace(
      "<title>aesthetic.computer</title>",
      "<title>" + title + "</title>"
    );
    html = html.replace(
      'og:title" content="aesthetic.computer"',
      'og:title" content="' + path + ' - aesthetic.computer"'
    );
    html = html.replace(
      'twitter:title" content="aesthetic.computer"',
      'twitter:title" content="' + path + ' - aesthetic.computer"'
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
