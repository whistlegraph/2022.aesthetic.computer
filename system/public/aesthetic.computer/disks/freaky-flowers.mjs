// Freaky Flowers, 22.11.23.14.01
// This piece is a router that loads a specific Freaky Flower token in `wand` by
// sending it a sequence starting with the current piece.

/* #region 🏁 todo
#endregion */

// #region 🧮 data
// 0-128
const tokens = [
  "2022.11.22.13.12.16",
  "2022.11.20.11.42.50",
  "2022.11.20.11.45.22",
  "2022.11.20.11.52.27",
  "2022.11.20.12.02.09",
  "2022.11.20.12.09.14",
  "2022.11.20.12.33.20",
  "2022.11.20.12.43.56",
  "2022.11.20.12.50.55",
  "2022.11.20.12.59.23",
  "2022.11.20.13.04.28",
  "2022.11.20.13.21.21",
  "2022.11.20.13.41.27",
  "2022.11.20.13.49.40",
  "2022.11.20.14.16.40",
  "2022.11.20.14.27.09",
  "2022.11.20.14.53.20",
  "2022.11.20.15.17.42",
  "2022.11.20.15.32.51",
  "2022.11.20.15.42.14",
  "2022.11.20.15.47.59",
  "2022.11.20.16.34.34",
  "2022.11.20.16.42.02",
  "2022.11.20.16.50.58",
  "2022.11.20.17.09.10",
  "2022.11.20.17.16.14",
  "2022.11.21.01.29.33",
  "2022.11.21.01.39.04",
  "2022.11.21.01.52.50",
  "2022.11.21.02.06.24",
  "2022.11.21.02.15.40",
  "2022.11.21.02.26.35",
  "2022.11.21.09.25.44",
  "2022.11.21.02.49.15",
  "2022.11.21.02.59.15",
  "2022.11.21.03.10.36",
  "2022.11.21.03.32.46",
  "2022.11.21.03.39.51",
  "2022.11.21.03.51.34",
  "2022.11.21.04.01.36",
  "2022.11.21.04.10.08",
  "2022.11.21.04.55.19",
  "2022.11.21.05.10.15",
  "2022.11.21.05.19.00",
  "2022.11.21.05.34.14",
  "2022.11.21.05.40.56",
  "2022.11.21.05.48.45",
  "2022.11.21.05.54.00",
  "2022.11.21.06.00.23",
  "2022.11.21.06.08.31",
  "2022.11.21.06.14.44",
  "2022.11.21.06.48.51",
  "2022.11.21.07.04.19",
  "2022.11.21.07.10.17",
  "2022.11.21.07.16.21",
  "2022.11.21.07.24.09",
  "2022.11.21.07.40.05",
  "2022.11.21.07.48.06",
  "2022.11.21.07.53.56",
  "2022.11.21.08.00.30",
  "2022.11.21.08.05.45",
  "2022.11.21.09.37.38",
  "2022.11.21.09.48.14",
  "2022.11.21.10.04.06",
  "2022.11.21.10.05.39",
  "2022.11.21.10.14.05",
  "2022.11.21.10.42.13",
  "2022.11.21.10.49.52",
  "2022.11.21.10.58.25",
  "2022.11.21.11.09.41",
  "2022.11.21.11.16.36",
  "2022.11.21.11.35.40",
  "2022.11.21.11.44.11",
  "2022.11.21.12.16.51",
  "2022.11.21.12.22.16",
  "2022.11.21.12.27.03",
  "2022.11.21.12.37.54",
  "2022.11.21.12.44.38",
  "2022.11.21.12.50.22",
  "2022.11.21.12.59.38",
  "2022.11.21.13.11.20",
  "2022.11.21.16.20.47",
  "2022.11.21.16.25.24",
  "2022.11.21.16.32.25",
  "2022.11.21.16.41.08",
  "2022.11.21.16.52.06",
  "2022.11.21.17.02.01",
  "2022.11.21.17.09.15",
  "2022.11.21.17.17.40",
  "2022.11.21.17.42.51",
  "2022.11.21.17.50.54",
  "2022.11.21.18.10.15",
  "2022.11.22.11.21.20",
  "2022.11.21.18.21.23",
  "2022.11.22.03.11.31",
  "2022.11.22.03.21.43",
  "2022.11.23.04.51.09",
  "2022.11.22.03.31.20",
  "2022.11.22.03.42.00",
  "2022.11.22.03.51.47",
  "2022.11.22.04.14.05",
  "2022.11.22.04.39.52",
  "2022.11.22.04.47.34",
  "2022.11.22.04.55.40",
  "2022.11.22.05.06.56",
  "2022.11.22.05.22.39",
  "2022.11.22.05.30.31",
  "2022.11.22.05.37.07",
  "2022.11.22.05.42.35",
  "2022.11.22.05.54.23",
  "2022.11.22.06.01.44",
  "2022.11.22.06.23.02",
  "2022.11.22.06.47.21",
  "2022.11.22.06.58.34",
  "2022.11.22.07.07.23",
  "2022.11.22.07.35.54",
  "2022.11.22.07.18.05",
  "2022.11.22.07.39.12",
  "2022.11.22.07.52.45",
  "2022.11.22.08.03.50",
  "2022.11.22.08.10.58",
  "2022.11.22.08.25.12",
  "2022.11.22.08.31.13",
  "2022.11.22.08.42.29",
  "2022.11.22.08.51.38",
  "2022.11.22.09.06.47",
  "2022.11.22.09.16.45",
  "2022.11.22.09.24.32",
  "2022.11.22.09.33.26",
];

const tokenColors = [
  "2C2920",
  "BAF9EE",
  "8C5065",
  "ED85B3",
  "9ABC3A",
  "733EF4",
  "8C4C94",
  "DFD9FF",
  "AEC147",
  "E272A3",
  "B67DC1",
  "D2C591",
  "D60060",
  "EB77FB",
  "F9FB4C",
  "9C8AB9",
  "DCD56A",
  "FCFEFA",
  "1C1C2C",
  "CD96B9",
  "D4C3B1",
  "B09BE0",
  "E3D726",
  "F1B5E0",
  "6347C5",
  "8AD5FE",
  "FDED56",
  "91C100",
  "B243EF",
  "CEAA89",
  "71730A",
  "F9E2DA",
  "C5CCCC",
  "FABFF9",
  "E8C1FD",
  "8452BD",
  "2F0A29",
  "93B686",
  "8CB0DE",
  "7087E4",
  "4F94A1",
  "C569B8",
  "4A60FB",
  "F754BF",
  "A4BDD4",
  "ED5A17",
  "A5A572",
  "6D8DBA",
  "47C4D0",
  "9ED89E",
  "B80000",
  "7D98B3",
  "969AB8",
  "86FDE8",
  "407B77",
  "FEFAFE",
  "7DCE0A",
  "7F6929",
  "4C2626",
  "AEB9EF",
  "EB8031",
  "B1D0D5",
  "ED48CD",
  "FACAD9",
  "FF7271",
  "23231C",
  "171720",
  "F0CD40",
  "FEC492",
  "D0CAA8",
  "6F3683",
  "EDF6D9",
  "7D4731",
  "2C1C1C",
  "292617",
  "23261C",
  "290A17",
  "A68A8E",
  "922053",
  "8896A9",
  "E7E5A4",
  "2CAA2F",
  "5212C9",
  "BEDD00",
  "916AF6",
  "16001C",
  "A54C5A",
  "23E500",
  "577085",
  "FFBA9F",
  "EFD9CE",
  "D30000",
  "202C2C",
  "D4AE60",
  "F4B3AB",
  "5AE0F0",
  "D4ABF9",
  "84ABB0",
  "B5AAAC",
  "F9A5F3",
  "122917",
  "2F170A",
  "B6DCEB",
  "FAC53C",
  "96ADD2",
  "2C81F9",
  "693185",
  "85405C",
  "26171C",
  "0A2320",
  "83BDBC",
  "906BC8",
  "669583",
  "60432F",
  "E8E5F2",
  "F3CAF2",
  "EADCCB",
  "2C1C2F",
  "6384FB",
  "478E50",
  "17D312",
  "C848A0",
  "C2CBF4",
  "1C2C2C",
  "FFC100",
  "6578F9",
  "232626",
  "7DB76B",
  "12122F",
];

// #endregion

// 🥾 Boot (Runs once before first paint and sim)
export function boot({ wipe, params, jump, store }) {
  const i = tokenID(params);

  const headers = (id) => {
    console.log(
      `%cFreaky Flowers`,
      `background: rgba(50, 10, 10);
     color: rgb(255, 255, 25);
     font-size: 140%;
     padding: 0 0.25em;
     border-radius: 0.15em;
     border-bottom: 0.75px solid rgb(120, 0, 0);
     border-right: 0.75px solid rgb(120, 0, 0);`
    );

    console.log(
      `%cSculpture No. ${id}/${tokens.length - 1}`,
      `background: rgba(0, 10, 10);
     color: rgb(150, 150, 150);
     font-size: 120%;
     padding: 0 0.25em;
     border-radius: 0.15em;
     border-bottom: 0.75px solid rgb(120, 120, 120);
     border-right: 0.75px solid rgb(120, 120, 120);`
    );
  };

  store["freaky-flowers"] = { tokenID: i, tokens, headers }; // Note: Storage could automatically
  //                                                know the disk. 22.11.25.11.14

  if (store["ff"]) store["freaky-flowers"].hook = "ff";
  else store["freaky-flowers"].hook = "freaky-flowers";

  jump(
    `wand~ff${i}-${tokens[i]}` +
      params
        .slice(1)
        .map((p) => `~` + p)
        .join(""),
    true, // ahistorical (skip the web history stack)
    true // alias (don't change the address bar url)
  );
  wipe(); // Note: Could I possibly nab the background color here for loading and
  //       carry it through to wand?
}

const baseURL = "https://wand.aesthetic.computer";
const handle = "digitpain";

// Retrieve or generate a token index, given this piece's parameter list.
export function tokenID(params) {
  const param1 = parseInt(params[0]);
  return param1 >= 0 && param1 < tokens.length
    ? param1
    : randInt(tokens.length - 1);
}

// Generates metadata fields for this piece.
// (Run by the server.)
export function meta({ params }) {
  const i = tokenID(params);
  return {
    // Note: high res png's are also stored, but webps are for Open Graph. 22.11.28.13.13
    image_url: `${baseURL}/ff${i}-${tokens[i]}-still-${handle}.webp`,
    // https://wand.aesthetic.computer/ff1-2022.11.20.11.42.50-still-digitpain.png
  };
}