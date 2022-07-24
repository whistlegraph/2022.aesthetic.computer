// Parser, 2022.7.14.17.53
// Parses everything that can be typed into the `prompt` piece and anything
// that appears after `aesthetic.computer/` in the address bar of the browser.

// TODO:
// [] This should eventually have tests that run?

// Notes:
// Allowed URL fragments include: https://stackoverflow.com/a/2849800/8146077
// ! $ & ' ( ) * + , ; = - . _ ~ : @ / ?

// Returns a hostname, piece path, and parameters to load a piece by.
// - Used in both the URL bar of the browser, and the `prompt` piece.
// Accepts: bpm 180
//          bpm~180
//          ~niki/bpm 180
//          ~niki/bpm~180
//          ~game.jas.life/bpm~180?mute=true
//          ~niki

function parse(text, location = self?.location) {
  let path, host, params, search, hash;

  // 1. Pull off any "search" from `text`.
  [text, search] = text.split("?");
  [search, hash] = (search || "").split("#"); // And any "hash" from `search`.

  // TODO: When to parse the search query string into a URLSearchParams object?
  //       https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams

  // 2. Tokenize on " " or "~".
  const tokens = text.trim().split(/~| /);

  // 3. Determine the host and path.
  let customHost = false;
  // Remove first token if it was originally "~", setting the customHost flag.
  if (tokens[0] === "") {
    customHost = true;
    tokens.shift();
  }

  if (customHost) {
    [host, ...path] = tokens[0].split("/");
    path = path.join("/");

    // Default to `index` if no piece path is specified for the custom host.
    if (path.length === 0) path = "index";

    // Default to *.aesthetic.computer if no `.` is present in the custom host.
    if (host.indexOf(".") === -1) {
      host += ".aesthetic.computer";
    }
  } else {
    host = location.hostname
    if (location.port) host += ":" + location.port;
    // TODO: Will this allow jumping from one disk to
    //       another on a different host just by
    //       typing the name? 22.07.15.00.12

    path = "aesthetic.computer/disks/" + tokens[0];
  }

  // 4. Get params. (Everything that comes after the path and host)
  params = tokens.slice(1);

  return { host, path, params, search, hash, text };
}

// Cleans a url for feeding into `parse` as the text parameter.
function slug(url) {
// Remove http protocol and host from current url before feeding it to parser.
  return url
    .replace(/^http(s?):\/\//i, "")
    .replace(window.location.hostname + ":" + window.location.port + "/", "")
    .replace(window.location.hostname + "/", "");
}

export { parse, slug };
