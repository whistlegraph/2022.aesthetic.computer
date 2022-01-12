// Prompt, 2021.11.28.03.13
// This is for working on font rendering and making a global disk chooser.

// TODO: Make a basic prompt.
//       *CURRENT*
//       1. Wire up the keyboard and get it to type the number keys, with return
//          for new lines!
//       2. Load a full glyph set made in plot and render it when all the
//          proper keys are pressed here.
//          - Use: https://raw.githubusercontent.com/bluescan/proggyfonts/master/ProggyOriginal/images/example_proggy_tiny.gif
//       3. Add the ability to load any disk by name.
//       4. Add a global ability to quit any disk with the ESC key...?
//          or maybe add a prompt overlay or ":ex" commands a la vim?

let numbers = [];
let lowercase = [];
let uppercase = [];
let symbols = [];

// 🥾 Boot (Runs once before first paint and sim)
function boot({ net: { preload } }) {
  // TODO: $api.type.write("Hello", {x: 0, y: 0, scale: {x: 1, y: 1}});

  // TODO: How to know when every preload finishes? 2021.12.16.18.55
  // TODO: Move these drawings into a system folder?
  // Preload numbers.
  [
    "0 - 2021.12.16.18.28.06",
    "1 - 2021.12.16.17.56.44",
    "2 - 2021.12.16.17.59.01",
    "3 - 2021.12.16.17.59.52",
    "4 - 2021.12.16.18.00.56",
    "5 - 2021.12.16.18.01.27",
    "6 - 2021.12.16.18.02.26",
    "7 - 2021.12.16.18.02.50",
    "8 - 2021.12.16.18.03.31",
    "9 - 2021.12.16.18.04.15",
  ].forEach((number, i) => {
    preload(`disks/drawings/font-1/numbers/${number}.json`).then((r) => {
      numbers[i] = r;
    });
  });

  // Preload lowercase letters.
  [
    "a - 2022.1.11.16.12.07",
    "b - 2022.1.11.16.12.57",
    "c - 2022.1.11.16.14.15",
    "d - 2022.1.11.16.14.53",
    "e - 2022.1.11.16.15.35",
    "f - 2022.1.11.16.18.40",
    "g - 2022.1.11.16.20.34",
    "h - 2022.1.11.16.22.10",
    "i - 2022.1.11.16.23.36",
    "j - 2022.1.11.16.25.14",
    "k - 2022.1.11.16.29.25",
    "l - 2022.1.11.16.30.34",
    "m - 2022.1.11.16.31.12",
    "n - 2022.1.11.16.31.51",
    "o - 2022.1.11.16.32.30",
    "p - 2022.1.11.16.35.17",
    "q - 2022.1.11.16.36.26",
    "r - 2022.1.11.16.39.47",
    "s - 2022.1.11.16.41.22",
    "t - 2022.1.11.16.42.16",
    "u - 2022.1.11.16.43.31",
    "v - 2022.1.11.16.44.21",
    "w - 2022.1.11.16.45.21",
    "x - 2022.1.11.16.45.58",
    "y - 2022.1.11.16.47.21",
    "z - 2022.1.11.16.48.15",
  ].forEach((letter, i) => {
    preload(`disks/drawings/font-1/lowercase/${letter}.json`).then((r) => {
      lowercase[i] = r;
    });
  });

  // Preload uppercase letters.
  [
    "A - 2022.1.11.18.30.32",
    "B - 2022.1.11.18.13.14",
    "C - 2022.1.11.18.14.00",
    "D - 2022.1.11.18.14.38",
    "E - 2022.1.11.18.15.14",
    "F - 2022.1.11.18.15.47",
    "G - 2022.1.11.18.16.34",
    "H - 2022.1.11.18.17.13",
    "I - 2022.1.11.18.18.01",
    "J - 2022.1.11.18.18.41",
    "K - 2022.1.11.18.19.20",
    "L - 2022.1.11.18.19.53",
    "M - 2022.1.11.18.24.51",
    "N - 2022.1.11.18.31.55",
    "O - 2022.1.11.18.32.33",
    "P - 2022.1.11.18.33.17",
    "Q - 2022.1.11.18.34.00",
    "R - 2022.1.11.18.35.27",
    "S - 2022.1.11.18.36.12",
    "T - 2022.1.11.18.36.42",
    "U - 2022.1.11.18.37.17",
    "V - 2022.1.11.18.37.54",
    "W - 2022.1.11.18.39.11",
    "X - 2022.1.11.18.50.18",
    "Y - 2022.1.11.18.52.28",
    "Z - 2022.1.11.18.53.22",
  ].forEach((letter, i) => {
    preload(`disks/drawings/font-1/uppercase/${letter}.json`).then((r) => {
      uppercase[i] = r;
    });
  });

  // Preload symbols.
  [
    "@ - 2022.1.11.17.09.12",
    "& - 2022.1.11.18.06.40",
    "# - 2022.1.11.17.04.12",
    "$ - 2022.1.11.16.59.42",
    "apostrophe - 2022.1.11.18.09.59",
    "asterisk - 2022.1.11.17.00.45",
    "backslash - 2022.1.11.17.11.17",
    "caret - 2022.1.11.17.07.56",
    "colon - 2022.1.11.18.15.47",
    "comma - 2022.1.11.18.12.57",
    "equal - 2022.1.11.17.02.12",
    "exclamation - 2022.1.11.18.10.47",
    "greater than - 2022.1.11.16.58.41",
    "L brace - 2022.1.11.16.53.15",
    "L bracket - 2022.1.11.16.54.53",
    "L paren - 2022.1.11.16.56.12",
    "less than - 2022.1.11.16.58.05",
    "minus - 2022.1.11.17.01.14",
    "percent - 2022.1.11.17.06.43",
    "period - 2022.1.11.18.13.56",
    "plus - 2022.1.11.17.01.43",
    "question mark - 2022.1.11.18.09.24",
    "quotes - 2022.1.11.18.10.19",
    "R brace - 2022.1.11.16.54.15",
    "R bracket - 2022.1.11.16.55.19",
    "R paren - 2022.1.11.16.57.09",
    "semi colon - 2022.1.11.18.14.51",
    "slash - 2022.1.11.17.03.28",
    "tilde - 2022.1.11.18.08.35",
    "underscore - 2022.1.11.17.04.46",
    "vertical line - 2022.1.11.18.07.22",
  ].forEach((symbol, i) => {
    preload(`disks/drawings/font-1/symbols/${symbol}.json`).then((r) => {
      symbols[i] = r;
    });
  });
}

// 🎨 Paint (Runs once per display refresh rate)
function paint({ wipe, screen, ink }) {
  wipe(70, 100, 150);

  const cursor = { x: 0, y: 0 };
  const colWidth = 16;

  function writeLetter(letter) {
    const top = 6;
    const left = 6;
    const scale = 1;
    const letterWidth = 6 * scale;
    const letterHeight = 10 * scale;
    const x = top + cursor.x * letterWidth;
    const y = left + cursor.y * letterHeight;

    ink(255, 255, 0, 20).box(x, y, ...letter.resolution.map((n) => n * scale));
    ink(255).draw(letter, x, y, scale);

    cursor.x = (cursor.x + 1) % colWidth;
    if (cursor.x === 0) cursor.y += 1;
  }

  numbers.forEach(writeLetter);
  lowercase.forEach(writeLetter);
  uppercase.forEach(writeLetter);
  symbols.forEach(writeLetter);

  return false; // TODO: Why does this leave a red `X` when auto-refreshing?
}

// ✒ Act (Runs once per user interaction)
function act({ event: e }) {
  // Key Down
  if (e.is("keyboard:down")) {
    // Check if string is between 0 and 9.

    if (e.key === "0") {
      // print the number 0
      console.log("0");
    }
  }

  // Key Up
  // if (event.is("up")) { ... }
}

// 📚 Library (Useful functions used throughout the program)
// ...

export { boot, paint, act };
