// Whistlegraph Player, 2022.4.19
// Made on occasion of Whistlegraph's Feral File exhibition.
// This player orchestrates the data for displaying 10 different whistlegraphs.

import { anyKey } from "../computer/lib/help.js";

// ***Code***
// TODO: Give loading screen borders one standard color.
// TODO: Tap / highlight outlines should be full opacity and either be white,
//       black, or... grey?
// TODO: Fix compilation display ratio, and rotation... for all screen sizes.
// TODO: Experiment with low fps animated noise on playback.
// TODO: Always alternate back cards to be tilted in BOTH directions.
// TODO: Add card cover to score so it starts as black, along with a load event.
// TODO: Add shortcuts for each wg; rename wg-player to wg.
// TODO: Make wg re-entrant so that it doesn't break the page on multiple loads.
// TODO: Test on poor connections.
// TODO: Test in all browsers... (esp. Firefox)

// ***Design***
// TODO: Try out an alt-color scheme for Slinky dog w/ Alex.

// Final URLS:
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
  bg: {
    tint: [30, 70, 25], // rgb
    tintAmount: 0.93,
    pixelSaturation: 0.5,
  },
  video: {
    border: 0.25,
    outerRadius: 0.25,
    innerRadius: 0.15,
    color: "rgb(210, 128, 0)",
    boxShadow: "1vmin 1vmin 1.5vmin rgba(0, 80, 225, 0.83)",
  },
  score: {
    border: 0.15,
    outerRadius: 0.15,
    innerRadius: 0.1,
    color: "rgb(170, 170, 150)",
    boxShadow: "1vmin 1vmin 1.5vmin rgba(80, 137, 4, 0.70)",
  },
  compilation: {
    border: 0.2,
    outerRadius: 0.25,
    innerRadius: 0.15,
    color: "rgb(20, 20, 20)",
    boxShadow: "1vmin 1vmin 2.5vmin rgba(120, 76, 11, 0.85)",
  },
};

const timeToGrow = {
  bg: {
    tint: [20, 10, 3], // rgb
    tintAmount: 0.96,
    pixelSaturation: 0.1,
  },
  video: {
    border: 0.25,
    outerRadius: 0.25,
    innerRadius: 0.15,
    color: "rgb(255, 166, 202)",
    boxShadow: "0.5vmin 0.5vmin 2.5vmin rgba(250, 240, 5, 0.6)",
  },
  score: {
    border: 0.15,
    outerRadius: 0.15,
    innerRadius: 0.1,
    color: "rgb(95, 152, 132)",
    boxShadow: "0.5vmin 0.5vmin 2.5vmin rgba(113, 45, 159, 0.85)",
  },
  compilation: {
    border: 0.2,
    outerRadius: 0.25,
    innerRadius: 0.15,
    color: "rgb(20, 20, 20)",
    boxShadow: "0.9vmin 0.9vmin 2.5vmin rgba(125, 115, 115, 0.85)",
  },
};

const loner = {
  bg: {
    tint: [255, 170, 190], // rgb
    tintAmount: 0.85,
    pixelSaturation: 0.8,
  },
  video: {
    border: 0.25,
    outerRadius: 0.25,
    innerRadius: 0.15,
    color: "rgb(10, 38, 88)",
    boxShadow: "0.5vmin 0.5vmin 2vmin rgba(250, 0, 0, 0.9)",
  },
  score: {
    border: 0.15,
    outerRadius: 0.15,
    innerRadius: 0.1,
    color: "rgb(233, 195, 2)",
    boxShadow: "0.5vmin 0.5vmin 2.5vmin rgba(132, 64, 12, 0.95)",
  },
  compilation: {
    border: 0.2,
    outerRadius: 0.25,
    innerRadius: 0.15,
    color: "rgb(20, 20, 20)",
    boxShadow: "0.7vmin 0.7vmin 2.5vmin rgba(59, 80, 134, 0.75)",
  },
};

const iDontNeedAniPhone = {
  bg: {
    tint: [110, 10, 10], // rgb
    tintAmount: 0.85,
    pixelSaturation: 0.5,
  },
  video: {
    border: 0.25,
    outerRadius: 0.25,
    innerRadius: 0.15,
    color: "rgb(215, 14, 14)",
    boxShadow: "0.35vmin 0.35vmin 2.5vmin rgba(20, 20, 120, 1)",
  },
  score: {
    border: 0.15,
    outerRadius: 0.15,
    innerRadius: 0.1,
    color: "rgb(255, 150, 130)",
    boxShadow: "0.5vmin 0.5vmin 2.5vmin rgba(245, 50, 0, 0.88)",
  },
  compilation: {
    border: 0.2,
    outerRadius: 0.25,
    innerRadius: 0.15,
    color: "rgb(20, 20, 20)",
    boxShadow: "0.5vmin 0.5vmin 2vmin rgba(255, 0, 80, 0.95)",
  },
};

const latelyWhenIFly = {
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
  },
  score: {
    border: 0.15,
    outerRadius: 0.15,
    innerRadius: 0.1,
    color: "rgb(160, 140, 240)",
    boxShadow: "0.25vmin 0.25vmin 2vmin rgba(161, 68, 153, 0.84)",
  },
  compilation: {
    border: 0.2,
    outerRadius: 0.25,
    innerRadius: 0.15,
    color: "rgb(20, 20, 20)",
    boxShadow: "0.5vmin 0.5vmin 4vmin rgba(101, 14, 14, 0.75)",
  },
};

const puzzle = {
  bg: {
    tint: [100, 150, 255], // rgb
    tintAmount: 0.6,
    pixelSaturation: 1,
  },
  video: {
    border: 0.25,
    outerRadius: 0.25,
    innerRadius: 0.15,
    color: "rgb(48, 200, 212)",
    boxShadow: "0.5vmin 0.5vmin 3vmin rgba(50, 0, 200, 1)",
  },
  score: {
    border: 0.15,
    outerRadius: 0.15,
    innerRadius: 0.1,
    color: "rgb(150, 208, 150)",
    boxShadow: "0.1vmin 0.1vmin 2vmin rgba(255, 100, 100, 1)",
  },
  compilation: {
    border: 0.2,
    outerRadius: 0.25,
    innerRadius: 0.15,
    color: "rgb(20, 20, 20)",
    boxShadow: "0.5vmin 0.5vmin 3vmin rgba(100, 80, 228, 0.99)",
  },
};

const slinkyDog = {
  bg: {
    tint: [90, 90, 70], // rgb
    tintAmount: 0.9,
    pixelSaturation: 0.7,
  },
  video: {
    border: 0.25,
    outerRadius: 0.25,
    innerRadius: 0.15,
    color: "rgb(100, 140, 90)",
    boxShadow: "0.75vmin 0.75vmin 2vmin rgba(120, 185, 45, 1)",
  },
  score: {
    border: 0.15,
    outerRadius: 0.15,
    innerRadius: 0.1,
    color: "rgb(170, 175, 130)",
    boxShadow: "0.1vmin 0.1vmin 2.5vmin rgba(200, 130, 25, 1)",
  },
  compilation: {
    border: 0.2,
    outerRadius: 0.25,
    innerRadius: 0.15,
    color: "rgb(20, 20, 20)",
    boxShadow: "0.5vmin 0.5vmin 3vmin rgba(226, 252, 161, 0.5)",
  },
};

const mommyWow = {
  bg: {
    tint: [10, 10, 30], // rgb
    tintAmount: 0.8,
    pixelSaturation: 0.5,
  },
  video: {
    border: 0.25,
    outerRadius: 0.25,
    innerRadius: 0.15,
    color: "rgb(80, 82, 110)",
    boxShadow: "0.5vmin 0.5vmin 3vmin rgba(120, 45, 100, 1)",
  },
  score: {
    border: 0.15,
    outerRadius: 0.15,
    innerRadius: 0.1,
    color: "rgb(250, 246, 65)",
    boxShadow: "0vmin 0vmin 3vmin rgba(255, 160, 0, 1)",
  },
  compilation: {
    border: 0.2,
    outerRadius: 0.25,
    innerRadius: 0.15,
    color: "rgb(20, 20, 20)",
    boxShadow: "0vmin 0vmin 3vmin rgba(255, 160, 0, 0.5)",
  },
};

const peoplePleaser = {
  bg: {
    tint: [130, 80, 80], // rgb
    tintAmount: 0.92,
    pixelSaturation: 0.2,
  },
  video: {
    border: 0.25,
    outerRadius: 0.25,
    innerRadius: 0.15,
    color: "rgb(190, 176, 205)",
    boxShadow: "0.75vmin 0.75vmin 3vmin rgba(180, 126, 200, 1)",
  },
  score: {
    border: 0.15,
    outerRadius: 0.15,
    innerRadius: 0.1,
    color: "rgb(255, 187, 187)",
    boxShadow: "0.25vmin 0.25vmin 2.5vmin rgba(230, 0, 30, 1)",
  },
  compilation: {
    border: 0.2,
    outerRadius: 0.25,
    innerRadius: 0.15,
    color: "rgb(20, 20, 20)",
    boxShadow: "0vmin 0vmin 3vmin rgba(200, 150, 206, 0.8)",
  },
};

const whatsInsideYourHeart = {
  bg: {
    tint: [0, 10, 70], // rgb
    tintAmount: 0.65,
    pixelSaturation: 1,
  },
  video: {
    border: 0.25,
    outerRadius: 0.25,
    innerRadius: 0.15,
    color: "rgb(20, 20, 30)",
    boxShadow: "0.25vmin 0.25vmin 4vmin rgba(255, 10, 10, 0.7)",
  },
  score: {
    border: 0.15,
    outerRadius: 0.15,
    innerRadius: 0.1,
    color: "rgb(30, 20, 20)",
    boxShadow: "0.25vmin 0.25vmin 2.5vmin rgba(0, 40, 255, 1)",
  },
  compilation: {
    border: 0.2,
    outerRadius: 0.25,
    innerRadius: 0.15,
    color: "rgb(20, 30, 20)",
    boxShadow: "0.2vmin 0.2vmin 2vmin rgba(10, 250, 30, 0.8)",
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

console.log(defaultWhistlegraph);

let whistlegraph;

// 🥾 Boot (Runs once before first paint and sim)
function boot({ cursor, content, query }) {
  cursor("native");

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
           <div class="card-outline"></div>
        </div>
      </div>
    
      <div class="card-view" data-type="score" data-outer-radius="${whistlegraph.score.outerRadius}" data-inner-radius="${whistlegraph.score.innerRadius}" data-border-setting="${whistlegraph.score.border}" style="z-index: 1">
        <div class="card" data-type="score" data-ratio="8.5x11">
          <img class="card-content" width="100%" height="100%"
           src="/disks/wg-player/${wg}/${wg}.svg">
           <div class="card-outline"></div>
        </div>
      </div>
      
      <div class="card-view active" data-type="video" data-outer-radius="${whistlegraph.video.outerRadius}" data-inner-radius="${whistlegraph.video.innerRadius}" data-border-setting="${whistlegraph.video.border}" style="z-index: 2">
        <div class="card" data-type="video" data-ratio="4x5">
          <video class="card-content" width="100%" height="100%" preload="auto"
           playsinline src="/disks/wg-player/${wg}/${wg}-web.mp4"></video>
           <div class="card-cover"></div>
           <div class="card-outline"></div>
           <div id="card-play">
             <img src="/disks/wg-player/play-circle.svg"> 
             <img src="/disks/wg-player/play-triangle.svg"> 
           </div>
        </div>
      </div>
    <div id="card-deck-loading">
      <img src="/disks/wg-player/${wg}/${wg}.webp">
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
    
    .card-deck:not(.loading) #card-deck-loading { display: none; }
    
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
      width: calc(100% + 1px);
      height: calc(100% + 1px);
      background: rgba(0, 0, 0, 0.5);
      z-index: 100;
      backdrop-filter: brightness(0.5) saturate(0);
      -webkit-backdrop-filter: brightness(0.5) saturate(0);
      display: flex;
    }
    
    #card-deck-loading img { /* Spinner */
      display: block;
      margin: auto;
      width: 40vmin;
      filter: brightness(0.75);
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
    
    /*.card-deck.no-cursor { cursor: none; }*/
    /*.card-deck.no-cursor .card-view.active .card { cursor: none; }*/
    
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
      top: -1.5px;
      left: -1.5px;
      width: calc(100% + 3px);
      height: calc(100% + 3px);
      border: 3px solid rgba(0, 0, 0, 0.5);
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
    
    .card-view .card-content {
      position: absolute;
    }
    
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
    
    .card-view[data-type=compilation] .card video {
      /*border-radius: ${whistlegraph.compilation.innerRadius}em;*/
      box-sizing: border-box;
    }
    </style>
  `);
}

// 🎨 Paint (Executes every display frame)
function paint({ noiseTinted }t pu) {
  noiseTinted(
    whistlegraph.bg.tint,
    whistlegraph.bg.tintAmount,
    whistlegraph.bg.pixelSaturation
  );

  //if (whistlegraph !== mommyWow && paintCount % 32 !== 0n) {
  return false;
  //}
}

function act({ event }) {
  //console.log(event);
}

export { boot, paint, act };

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
