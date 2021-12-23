// TODO: Move on to graphics.
// -- Add basic 3d features.
// -- Add drawing editor.

// TODO: Add other wavetypes to square and rename it to tone.
// *NOW* Rename square to tone and give it a "square" parameter.

// TODO: Make tone's default parameters random.

// TODO: Add and load documentation into this file for 'tone'.

// TODO: Add a sampler so that arbitrary sounds can be loaded and played back with sound.play("name", pitch).for(3, sound.beats)

// TODO: Remove potential delay from sound starting up?
// TODO: Make sound start-up optional?
// TODO: Clean up audio code & api.

// See also: https://www.notion.so/whistlegraph/Get-a-basic-sound-working-and-playing-notes-in-a-sequence-fb0020def4b84c69805b497b31981b9c

// TODO: Make an "index" disk that gets booted before any remote disks. (Can just be a timed intro for now.)
// TODO: Global ESC menu.
// TODO: Video underlay

// TODO: Color readable spots in Camera that forces you to move.

let flash = false;
const flashColor = [255, 0, 0];

const melody = ["c4", "c4", "c4", "d4", "e4", "c4", "d4", "e4", "f4", "g4"];
let melodyIndex = 0;
let square;
let firstBeat = true;

// 💗 Beat
export function beat($api) {
  const { num, help, sound } = $api;

  console.log("🎼 BPM:", sound.bpm(), "Time:", sound.time.toFixed(2));

  sound.bpm(200);

  square = sound.square({
    tone: melody[melodyIndex],
    beats: 1 / 2,
    attack: 0.01,
    decay: 0.9,
    volume: 1,
    pan: 1,
  });

  sound.square({
    tone: 200,
    beats: 1 / 8,
    attack: 0.01,
    decay: 0.9,
    volume: 1,
    pan: -1,
  });

  flash = true;
  flashColor[0] = 255;
  flashColor[1] = 255;
  flashColor[2] = 255;

  firstBeat = false;

  melodyIndex = (melodyIndex + 1) % melody.length;
}

// 🧮 Crunch
export function update($api) {
  //console.log($api)
  const { sound } = $api;

  if (square) {
    // Calculate progress of square.
    const p = square.progress(sound.time);

    // Get sample of square's amplitude:
    // const a = square.amplitude;
    // TODO: Graph it somehow.

    flashColor.fill(Math.floor((1 - p) * 255), 0, 2);

    if (p === 1) {
      flash = false; // TODO: This might be skipping 1 frame.
    }
  }
}

// 🎨 Paint
export function render($api) {
  const { color, clear, num } = $api;

  if (flash) {
    color(...flashColor);
  } else {
    color(0, 0, 100);
  }

  clear();
}

// 📚 Library
// ...
