// :) Parser
// Parses everything that can be typed into the `prompt` piece and anything
// that appears after `aesthetic.computer/`

// Anything that is typed into `prompt`
function loadFromPrompt(text) {
  let path, host, params;

  const tokens = text.split(" ");

  // Get the params (everything after the first unbroken series of characters.)
  params = tokens.slice(1);

  // Load from user path / external server if it begins with ~.
  if (tokens[0].indexOf("~") === 0) {
    const split = tokens[0].split("/");

    path = split[1]; // Grab the piece name.
    host = split[0].slice(1) + ".aesthetic.computer";

  } else {
    path = "aesthetic.computer/disks/" + tokens[0];
    host = ""
  }

  return {path, host, params};
}

// Anything that appears after `aesthetic.computer/`
function loadFromPath(text) {}

export { loadFromPrompt }