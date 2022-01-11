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

// 🥾 Boot (Runs once before first paint and sim)
function boot({ net: { preload } }) {
  // TODO: $api.type.write("Hello", {x: 0, y: 0, scale: {x: 1, y: 1}});

  // Preload 0-9 symbols.
  // TODO: How to know when every preload finishes? 2021.12.16.18.55
  // TODO: Move these drawings into a system folder?
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
    preload(`disks/drawings/numbers/${number}.json`).then((r) => {
      numbers[i] = r;
      console.log(r);
    });
  });
}

// 🎨 Paint (Runs once per display refresh rate)
function paint({ wipe, screen, ink }) {
  wipe(70, 100, 150);

  // 0. *TEST* Write a test row of numbers.
  // TODO: Extract this into a "write" or "print" method for graph. 2021.12.16.18.55
  {
    // const marginLeft =

    const left = 2;
    const top = 2;
    const width = 6;
    const scale = 1;
    let gap = 1;

    numbers.forEach((number, i) => {
      const x = left + width * scale * i + gap * i;
      const y = top;
      ink(255, 255, 0, 40).box(x, y, ...number.resolution);
      ink(255).draw(number, x, y, scale);
    });
  }

  // return false; // TODO: Why does this leave a red `X` when auto-refreshing?
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
