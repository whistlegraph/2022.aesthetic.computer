// Whistlegraph Player, 2022.4.19
// Made on occasion of Whistlegraph's Feral File exhibition.
// This player orchestrates the data for displaying 10 different whistlegraphs.

import { anyKey } from "../computer/lib/help.js";

// ***Code***
// TODO: Add updated spinners.
// TODO: Fix compilation display ratio, and rotation... for all screen sizes.
// TODO: Always alternate back cards to be tilted in BOTH directions.
// TODO: Add shortcuts for each wg; rename wg-player to wg.
// TODO: Make wg re-entrant so that it doesn't break the page on multiple loads.
// TODO: Test on poor connections.
// TODO: Test in all browsers... (esp. Firefox)

// ***Design***
// TODO: Scores – the svgs with shadows (like mommy wow or ppl pleaser) have rendering bugs on iOS where they rasterize poorly,
//                [this might be fixable if we increase the resolution of the svgs we export from figma]
// TODO: Spinner – time to grow [the circle should be centered in each subsequent frame]
//                              [and a duplicate frame should be added so it grows up and down]
//               - lately       [the plane should start a bit behind the ground, and continue a bit past it]
//               - mommy        [2 frames up, then 2 frames down so it wiggles then flips, wiggles then flips]

// Dev URLS:
// https://127.0.0.1/?name=butterfly-cosplayer#wg-player
// https://127.0.0.1/?name=time-to-grow#wg-player
// https://127.0.0.1/?name=i-dont-need-an-iphone#wg-player
// https://127.0.0.1/?name=lately-when-i-fly#wg-player
// https://127.0.0.1/?name=loner#wg-player
// https://127.0.0.1/?name=mommy-wow#wg-player
// https://127.0.0.1/?name=people-pleaser#wg-player
// https://127.0.0.1/?name=slinky-dog#wg-player
// https://127.0.0.1/?name=puzzle#wg-player
// https://127.0.0.1/?name=whats-inside-your-heart#wg-player

const butterflyCosplayer = {
  glow: "rgba(255, 150, 0, 0.4)",
  fuzz: 20n,
  bg: {
    tint: [30, 70, 25], // rgb
    tintAmount: 0.9,
    pixelSaturation: 0.5,
  },
  video: {
    border: 0.25,
    outerRadius: 0.25,
    innerRadius: 0.15,
    color: "rgb(210, 128, 0)",
    boxShadow: "0.5vmin 0.5vmin 2.5vmin rgba(0, 40, 200, 0.83)",
    highlight: "rgba(0, 0, 0, 1)",
  },
  score: {
    border: 0.15,
    outerRadius: 0.15,
    innerRadius: 0.1,
    color: "rgb(170, 170, 150)",
    boxShadow: "1vmin 1vmin 1.5vmin rgba(80, 137, 4, 0.70)",
    highlight: "rgba(0, 0, 0, 1)",
  },
  compilation: {
    border: 0.2,
    outerRadius: 0.25,
    innerRadius: 0.15,
    color: "rgb(20, 20, 20)",
    boxShadow: "1vmin 1vmin 2.5vmin rgba(120, 76, 11, 0.85)",
    highlight: "rgba(120, 120, 120, 1)",
  },
};

const timeToGrow = {
  glow: "rgba(255, 150, 210, 0.35)",
  fuzz: 18n,
  bg: {
    tint: [20, 10, 3], // rgb
    tintAmount: 0.92,
    pixelSaturation: 0.1,
  },
  video: {
    border: 0.25,
    outerRadius: 0.25,
    innerRadius: 0.15,
    color: "rgb(255, 166, 202)",
    boxShadow: "0.5vmin 0.5vmin 2.5vmin rgba(250, 240, 5, 0.6)",
    highlight: "rgba(127, 127, 127, 1)",
  },
  score: {
    border: 0.15,
    outerRadius: 0.15,
    innerRadius: 0.1,
    color: "rgb(95, 152, 132)",
    boxShadow: "0.5vmin 0.5vmin 2.5vmin rgba(113, 45, 159, 0.85)",
    highlight: "rgba(200, 200, 200, 1)",
  },
  compilation: {
    border: 0.2,
    outerRadius: 0.25,
    innerRadius: 0.15,
    color: "rgb(20, 20, 20)",
    boxShadow: "0.9vmin 0.9vmin 2.5vmin rgba(125, 115, 115, 0.85)",
    highlight: "rgba(120, 120, 120, 1)",
  },
};

const loner = {
  glow: "rgba(255, 130, 130, 0)",
  fuzz: 16n,
  bg: {
    tint: [255, 170, 190], // rgb
    tintAmount: 0.9,
    pixelSaturation: 0.8,
  },
  video: {
    border: 0.25,
    outerRadius: 0.25,
    innerRadius: 0.15,
    color: "rgb(10, 38, 88)",
    boxShadow: "0.5vmin 0.5vmin 2vmin rgba(250, 0, 0, 0.9)",
    highlight: "rgba(100, 100, 100, 1)",
  },
  score: {
    border: 0.15,
    outerRadius: 0.15,
    innerRadius: 0.1,
    color: "rgb(233, 195, 2)",
    boxShadow: "0.5vmin 0.5vmin 2.5vmin rgba(132, 64, 12, 0.95)",
    highlight: "rgba(0, 0, 0, 1)",
  },
  compilation: {
    border: 0.2,
    outerRadius: 0.25,
    innerRadius: 0.15,
    color: "rgb(20, 20, 20)",
    boxShadow: "0.7vmin 0.7vmin 2.5vmin rgba(59, 80, 134, 0.75)",
    highlight: "rgba(120, 120, 120, 1)",
  },
};

const iDontNeedAniPhone = {
  glow: "rgba(240, 0, 0, 0.45)",
  fuzz: 16n,
  bg: {
    tint: [110, 10, 10], // rgb
    tintAmount: 0.9,
    pixelSaturation: 0.5,
  },
  video: {
    border: 0.25,
    outerRadius: 0.25,
    innerRadius: 0.15,
    color: "rgb(225, 14, 14)",
    boxShadow: "0.35vmin 0.35vmin 2.5vmin rgba(20, 20, 120, 1)",
    highlight: "rgba(0, 0, 0, 1)",
  },
  score: {
    border: 0.15,
    outerRadius: 0.15,
    innerRadius: 0.1,
    color: "rgb(255, 150, 130)",
    boxShadow: "0.5vmin 0.5vmin 2.5vmin rgba(245, 50, 0, 0.88)",
    highlight: "rgba(0, 0, 0, 1)",
  },
  compilation: {
    border: 0.2,
    outerRadius: 0.25,
    innerRadius: 0.15,
    color: "rgb(20, 20, 20)",
    boxShadow: "0.5vmin 0.5vmin 2vmin rgba(255, 0, 80, 0.95)",
    highlight: "rgba(120, 120, 120, 1)",
  },
};

const latelyWhenIFly = {
  glow: "rgba(90, 5, 230, 0.95)",
  fuzz: 12n,
  bg: {
    tint: [20, 5, 40], // rgb
    tintAmount: 0.93,
    pixelSaturation: 0.2,
  },
  video: {
    border: 0.25,
    outerRadius: 0.25,
    innerRadius: 0.15,
    color: "rgb(90, 5, 165)",
    boxShadow: "0vmin 0vmin 2.5vmin rgba(0, 15, 115, 0.95)",
    highlight: "rgba(80, 80, 80, 1)",
  },
  score: {
    border: 0.15,
    outerRadius: 0.15,
    innerRadius: 0.1,
    color: "rgb(160, 140, 240)",
    boxShadow: "0.25vmin 0.25vmin 2vmin rgba(161, 68, 153, 0.84)",
    highlight: "rgba(80, 80, 80, 1)",
  },
  compilation: {
    border: 0.2,
    outerRadius: 0.25,
    innerRadius: 0.15,
    color: "rgb(20, 20, 20)",
    boxShadow: "0.5vmin 0.5vmin 4vmin rgba(101, 14, 14, 0.75)",
    highlight: "rgba(120, 120, 120, 1)",
  },
};

const puzzle = {
  glow: "rgba(48, 200, 252, 0.45)",
  fuzz: 12n,
  bg: {
    tint: [100, 150, 255], // rgb
    tintAmount: 0.7,
    pixelSaturation: 1,
  },
  video: {
    border: 0.25,
    outerRadius: 0.25,
    innerRadius: 0.15,
    color: "rgb(48, 200, 212)",
    boxShadow: "0.5vmin 0.5vmin 3vmin rgba(50, 0, 200, 1)",
    highlight: "rgba(0, 0, 0, 1)",
  },
  score: {
    border: 0.15,
    outerRadius: 0.15,
    innerRadius: 0.1,
    color: "rgb(150, 208, 150)",
    boxShadow: "0.1vmin 0.1vmin 2vmin rgba(255, 100, 100, 1)",
    highlight: "rgba(0, 0, 0, 1)",
  },
  compilation: {
    border: 0.2,
    outerRadius: 0.25,
    innerRadius: 0.15,
    color: "rgb(20, 20, 20)",
    boxShadow: "0.5vmin 0.5vmin 3vmin rgba(100, 80, 228, 0.99)",
    highlight: "rgba(200, 200, 200, 1)",
  },
};

const slinkyDog = {
  glow: "rgba(0, 0, 0, 0.75)",
  fuzz: 16n,
  bg: {
    tint: [247 - 40, 247 - 40, 255 - 40], // rgb
    tintAmount: 0.9,
    pixelSaturation: 0.1,
  },
  video: {
    border: 0.25,
    outerRadius: 0.25,
    innerRadius: 0.15,
    color: "rgb(0, 0, 5)",
    boxShadow: "0.75vmin 0.75vmin 2.5v8min rgba(200, 70, 0, 1)",
    highlight: "rgba(180, 180, 180, 1)",
  },
  score: {
    border: 0.15,
    outerRadius: 0.15,
    innerRadius: 0.1,
    color: "rgb(90, 90, 110)",
    boxShadow: "0.1vmin 0.1vmin 2.5vmin rgba(255, 255, 255, 1)",
    highlight: "rgba(0, 0, 0, 1)",
  },
  compilation: {
    border: 0.2,
    outerRadius: 0.25,
    innerRadius: 0.15,
    color: "rgb(20, 20, 20)",
    boxShadow: "0.5vmin 0.5vmin 3vmin rgba(226, 252, 220, 0.7)",
    highlight: "rgba(190, 190, 190, 1)",
  },
};

const mommyWow = {
  glow: "rgba(255, 200, 0, 0.9)",
  fuzz: 6n,
  bg: {
    tint: [10, 10, 30], // rgb
    tintAmount: 0.85,
    pixelSaturation: 0.9,
  },
  video: {
    border: 0.25,
    outerRadius: 0.25,
    innerRadius: 0.15,
    color: "rgb(80, 82, 110)",
    boxShadow: "0.5vmin 0.5vmin 3vmin rgba(120, 45, 100, 1)",
    highlight: "rgba(0, 0, 0, 1)",
  },
  score: {
    border: 0.15,
    outerRadius: 0.15,
    innerRadius: 0.1,
    color: "rgb(250, 246, 65)",
    boxShadow: "0vmin 0vmin 3vmin rgba(255, 160, 0, 1)",
    highlight: "rgba(180, 180, 180, 1)",
  },
  compilation: {
    border: 0.2,
    outerRadius: 0.25,
    innerRadius: 0.15,
    color: "rgb(20, 20, 20)",
    boxShadow: "0vmin 0vmin 3vmin rgba(255, 160, 0, 0.5)",
    highlight: "rgba(120, 120, 120, 1)",
  },
};

const peoplePleaser = {
  glow: "rgba(190, 80, 220, 0.75)",
  fuzz: 17n,
  bg: {
    tint: [130 - 20, 80 - 20, 80 - 20], // rgb
    tintAmount: 0.94,
    pixelSaturation: 0.2,
  },
  video: {
    border: 0.25,
    outerRadius: 0.25,
    innerRadius: 0.15,
    color: "rgb(190, 176, 205)",
    boxShadow: "0.75vmin 0.75vmin 3vmin rgba(180, 126, 200, 1)",
    highlight: "rgba(0, 0, 0, 1)",
  },
  score: {
    border: 0.15,
    outerRadius: 0.15,
    innerRadius: 0.1,
    color: "rgb(255, 187, 187)",
    boxShadow: "0.25vmin 0.25vmin 2.5vmin rgba(230, 0, 30, 1)",
    highlight: "rgba(0, 0, 0, 1)",
  },
  compilation: {
    border: 0.2,
    outerRadius: 0.25,
    innerRadius: 0.15,
    color: "rgb(20, 20, 20)",
    boxShadow: "0vmin 0vmin 3vmin rgba(200, 150, 206, 0.8)",
    highlight: "rgba(180, 180, 180, 1)",
  },
};

const whatsInsideYourHeart = {
  glow: "rgba(0, 0, 245, 1)",
  fuzz: 5n,
  bg: {
    tint: [0, 10, 70], // rgb
    tintAmount: 0.65,
    pixelSaturation: 1,
  },
  video: {
    border: 0.25,
    outerRadius: 0.25,
    innerRadius: 0.15,
    color: "rgb(20, 20, 40)",
    boxShadow: "0.25vmin 0.25vmin 4vmin rgba(255, 10, 10, 0.7)",
    highlight: "rgba(80, 80, 80, 1)",
  },
  score: {
    border: 0.15,
    outerRadius: 0.15,
    innerRadius: 0.1,
    color: "rgb(40, 20, 20)",
    boxShadow: "0.25vmin 0.25vmin 2.5vmin rgba(0, 40, 255, 1)",
    highlight: "rgba(80, 80, 80, 1)",
  },
  compilation: {
    border: 0.2,
    outerRadius: 0.25,
    innerRadius: 0.15,
    color: "rgb(20, 20, 20)",
    boxShadow: "0.2vmin 0.2vmin 2vmin rgba(250, 250, 250, 0.8)",
    highlight: "rgba(120, 120, 120, 1)",
  },
};

const whistlegraphs = {
  "butterfly-cosplayer": butterflyCosplayer,
  "time-to-grow": timeToGrow,
  loner,
  "i-dont-need-an-iphone": iDontNeedAniPhone,
  "lately-when-i-fly": latelyWhenIFly,
  puzzle: puzzle,
  "slinky-dog": slinkyDog,
  "mommy-wow": mommyWow,
  "people-pleaser": peoplePleaser,
  "whats-inside-your-heart": whatsInsideYourHeart,
};

// If no whistlegraph is specified when the player loads.
const defaultWhistlegraph = anyKey(whistlegraphs);

let whistlegraph;
let fuzzy = false;

// 🥾 Boot (Runs once before first paint and sim)
function boot({ cursor, content, query, gap, density }) {
  cursor("native");
  gap(0);
  density(1);

  // Decide what whistlegraph to use.
  let wg;
  if (Array.isArray(query)) {
    // Params from the `prompt`.
    wg = query[0];
  } else if (query.length > 0) {
    // Params from URL eg: (?name=butterfly-cosplayer#wg-player)
    const params = new URLSearchParams(query);
    wg = params.get("name") || defaultWhistlegraph;
  } else {
    wg = defaultWhistlegraph;
  }

  whistlegraph = whistlegraphs[wg];

  content.add(`
    <div class="card-deck loading">
      <div class="card-view" data-type="compilation" data-outer-radius="${whistlegraph.compilation.outerRadius}" data-inner-radius="${whistlegraph.compilation.innerRadius}" data-border-setting="${whistlegraph.compilation.border}" style="z-index: 0">
        <div class="card" data-type="compilation" data-ratio="720x1280">
          <video class="card-content" width="100%" height="100%" preload="auto"
           playsinline src="/disks/wg-player/${wg}/${wg}-tt-compilation.mp4"></video>
           <div class="card-cover"></div>
           <div class="card-outline" style="border-color: ${whistlegraph.compilation.highlight}"></div>
        </div>
      </div>
    
      <div class="card-view" data-type="score" data-outer-radius="${whistlegraph.score.outerRadius}" data-inner-radius="${whistlegraph.score.innerRadius}" data-border-setting="${whistlegraph.score.border}" style="z-index: 1">
        <div class="card" data-type="score" data-ratio="8.5x11">
          <img class="card-content" width="100%" height="100%"
           src="/disks/wg-player/${wg}/${wg}-score.svg">
           <div class="card-outline" style="border-color: ${whistlegraph.score.highlight}"></div>
        </div>
      </div>
      
      <div class="card-view active" data-type="video" data-outer-radius="${whistlegraph.video.outerRadius}" data-inner-radius="${whistlegraph.video.innerRadius}" data-border-setting="${whistlegraph.video.border}" style="z-index: 2">
        <div class="card" data-type="video" data-ratio="4x5">
          <video class="card-content" width="100%" height="100%" preload="auto"
           playsinline src="/disks/wg-player/${wg}/${wg}-web.mp4"></video>
           <div class="card-cover"></div>
           <div class="card-outline" style="border-color: ${whistlegraph.video.highlight}"></div>
           <div id="card-play">
             <img src="/disks/wg-player/play-circle.svg"> 
             <img src="/disks/wg-player/play-triangle.svg"> 
           </div>
        </div>
      </div>
    <div id="card-deck-loading">
      <div id="spinner" style="filter: brightness(0.9) drop-shadow(0 0 1vmin ${whistlegraph.glow})">
        <img width="1000" height="1000" src="/disks/wg-player/${wg}/${wg}.webp">
        <canvas width="1000" height="1000" id="spinner-canvas"></canvas>
      </div>
    </div>
    </div>
    <script src="/disks/wg-player/wg-player-cards.js" type="module" defer></script>
    <style>  
    #content .card-deck {
      width: 100%;
      height: 100%;
      box-sizing: border-box;
      user-select: none;
      -webkit-user-select: none;
      font-size: 32px;
      display: flex;
      /* This fixes a rendering bug specific to Google Chrome on Windows.
         It doesn't affect the look, but forces a different rendering stack in
         which everything seems to work fine. 2022.05.02.20.49 */ 
      transform: rotate(0.00001deg);
    }
    
    #content .card-view {
      width: 100%;
      height: 100%:
      box-sizing: border-box;
      position: absolute;
      pointer-events: none;
    }
    
    #content .card-view:not(.active):not(.running) {
      transition: 1s ease-out transform;
    }
    
    #card-deck-loading {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(20, 20, 20, 1);
      z-index: 100;
      display: flex;
    }
    
    #card-deck-loading #spinner {
      display: block;
      margin: auto;
      width: 40vmin;
      height: 40vmin;
      position: relative;
    }
    
    #spinner img {
      width: 100%;
      height: 100%;
      position: absolute;
    }
    
    #spinner canvas {
      width: 100%;
      height: 100%;
      position: absolute;
      display: none;
    }
    
    .card-deck:not(.loading) #spinner img { display: none; }
    .card-deck:not(.loading) #spinner canvas { display: block; }
    
    .card-deck:not(.loading) #card-deck-loading {
      transform: scale(2);
      opacity: 0;
      transition: 0.25s transform ease-out, 0.25s opacity ease-in;
    }
    
    .card-deck.loading #card-play { display: none; }
    
    #card-play.played {
     opacity: 0;
     transform: scale(2);
     transition: 0.25s opacity, 0.25s transform;
    }
    
    #card-play {
      position: absolute;
      top: 50%;
      left: 50%;
      pointer-events: none;
    }
    
    #card-play img {
      position: absolute;
      width: 25vmin;
      margin-left: -12.5vmin;
      margin-top: -12.5vmin;
    }
    
    #card-play img:nth-child(1) { filter: brightness(0); }
    #card-play img:nth-child(2) { filter: brightness(1); }
    
    .card.touch #card-play {
      transform: scale(0.95);
    }
    
    .card-view.active .card { cursor: pointer; }
    .card-view.active .card.running { cursor: alias; }
    .card-view.active .card[data-type=score] { cursor: alias; }
    
    .card {
      box-sizing: border-box;
      position: relative;
      box-shadow: 4px 4px 12px rgba(0, 0, 0, 0.75);
      pointer-events: all;
    }
    
    .card-view.active.pressed {
      transform: scale(0.99);
      animation: bounce 0.15s ease-out;
      animation-fill-mode: forwards;
    }
    
    .card-view.active.pressed .card {
      box-shadow: 0px 0px 48px rgba(0, 0, 0, 0.35),
                  0px 0px 24px rgba(0, 0, 0, 0.35),
                  0px 0px 12px rgba(0, 0, 0, 0.35) !important;
    } 
    
    .card.touch {
      box-shadow: 0px 0px 48px rgba(0, 0, 0, 0.5),
                  0px 0px 48px rgba(0, 0, 0, 0.5) !important;
    }
    
    .card.hover { box-shadow: 0px 0px 24px rgba(0, 0, 0, 0.75) !important; }
   
    .card.touch .card-outline {
      display: block;
      box-sizing: border-box;
      position: absolute;
      border-style: solid;
      border-color: rgba(0, 0, 0, 1);
      border-width: 1vmin;
      top: -0.5vmin;
      left: -0.5vmin;
      width: calc(100% + 1vmin);
      height: calc(100% + 1vmin);
    }
    
    .card[data-type=score].touch .card-outline {
      border-width: 0.75vmin;
      top: -0.375vmin;
      left: -0.375vmin;
      width: calc(100% + 0.75vmin);
      height: calc(100% + 0.75vmin);
    }
    
    .card[data-type=compilation].touch .card-outline {
      border-width: 0.75vmin;
      top: -0.375vmin;
      left: -0.375vmin;
      width: calc(100% + 0.75vmin);
      height: calc(100% + 0.75vmin);
    }
    
    .card.animating .card-outline {
      display: none !important;
    }
    
    .card-outline {
      display: none;
      pointer-events: none;
    }
    
    @keyframes bounce {
      0% { transform: scale(0.99); }
      50% { transform: scale(0.96); }
      100% { transform: scale(0.99); }
    } 
    
    .card-view .card-content { position: absolute; }
    
    .card-cover { /* A black screen that gets removed once videos are loaded. */
      background: black;
      position: absolute;
    }
    
    .card-deck:not(.loading) .card-cover { display: none; }
    
    /* Card types */ 
    .card-view[data-type=video] .card video,
    .card-view[data-type=compilation] .card video {
      object-fit: cover;
      pointer-events: none;
    }
    
    .card-view[data-type=video] .card {
      background: ${whistlegraph.video.color};
      box-shadow: ${whistlegraph.video.boxShadow}; 
    }
   
    .card-view[data-type=score] .card {
      background: ${whistlegraph.score.color};
      box-shadow: ${whistlegraph.score.boxShadow}; 
    }
    
    .card-view[data-type=compilation] .card {
      background: ${whistlegraph.compilation.color};
      box-shadow: ${whistlegraph.compilation.boxShadow}; 
    }
    
    /* Contents inside each card */
    .card-view[data-type=score] .card img {
      box-sizing: border-box;
      object-fit: cover;
      margin: auto;
      pointer-events: none;
    } 
    </style>
  `);
}

function sim({ simCount, needsPaint }) {
  if (fuzzy && whistlegraph.fuzz && simCount % whistlegraph.fuzz === 0n)
    needsPaint();
}

// 🎨 Paint (Executes every display frame)
function paint({ noiseTinted }) {
  noiseTinted(
    whistlegraph.bg.tint,
    whistlegraph.bg.tintAmount,
    whistlegraph.bg.pixelSaturation
  );
  return false;
}

function act({ event: e }) {
  if (e.is("signal") && e.signal === "wg-player:started") fuzzy = true;
}

export { boot, sim, paint, act };

// 📚 Library (Useful classes & functions used throughout the piece)
// ...

/*
// 🧮 Sim(ulate) (Runs once per logic frame (120fps locked)).
function sim($api) {}

// 💗 Beat (Runs once per bpm)
function beat($api) {}

// ✒ Act (Runs once per user interaction)
// function act({ event }) { }
*/
