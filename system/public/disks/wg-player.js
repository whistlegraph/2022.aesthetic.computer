// Whistlegraph Player, 2022.4.19
// Made on occasion of Whistlegraph's Feral File exhibition.
// This player orchestrates the data for displaying 10 different whistlegraphs.

import { randIntRange } from "../computer/lib/num.js";
import { anyKey } from "../computer/lib/help.js";

// ***Current***
// TODO: Rotation and scaling. Subtle, random.
// TODO: Zooming in.

// TODO: Noise in the tinted backdrops.
// TODO: Regenerate all webp spinners.

// Final URLS:
// https://aesthetic.computer/?name=butterfly-cosplayer#wg-player
// https://aesthetic.computer/?name=iphone#wg-player
// https://aesthetic.computer/?name=time-to-grow#wg-player
// https://aesthetic.computer/?name=lately-when-i-fly#wg-player
// https://aesthetic.computer/?name=loner#wg-player
// https://aesthetic.computer/?name=mommy-wow#wg-player
// https://aesthetic.computer/?name=people-pleaser#wg-player
// https://aesthetic.computer/?name=slinky-dog#wg-player
// https://aesthetic.computer/?name=puzzle#wg-player
// https://aesthetic.computer/?name=whats-inside-your-heart#wg-player

const defaultDisplay = {
  backgroundTint: [120, 120, 120],
  video: {
    border: 0.25,
    outerRadius: 0.25,
    innerRadius: 0.15,
    color: "rgb(200, 200, 50)",
    boxShadow: "4px 4px 12px rgba(0, 0, 255, 0.75)",
  },
  score: {
    border: 0.15,
    outerRadius: 0.15,
    innerRadius: 0.1,
    color: "pink",
    boxShadow: "4px 4px 12px rgba(255, 0, 0, 0.75)",
  },
  compilation: {
    border: 0.2,
    outerRadius: 0.25,
    innerRadius: 0.15,
    color: "grey",
    boxShadow: "4px 4px 12px rgba(0, 255, 0, 0.75)",
  },
};

const whistlegraphs = {
  "butterfly-cosplayer": defaultDisplay,
  "i-dont-need-an-iphone": defaultDisplay,
  "time-to-grow": defaultDisplay,
  "lately-when-i-fly": defaultDisplay,
  loner: {
    backgroundTint: [250, 160, 180],
    video: {
      border: 0.35,
      outerRadius: 0.2,
      innerRadius: 0.05,
      color: "rgb(200, 130, 140)",
      boxShadow: "4px 4px 12px rgba(0, 0, 255, 0.75)",
    },
    score: {
      border: 0.2,
      outerRadius: 0.25,
      innerRadius: 0.15,
      color: "pink",
      boxShadow: "4px 4px 12px rgba(255, 0, 0, 0.75)",
    },
    compilation: {
      border: 0.25,
      outerRadius: 0.25,
      innerRadius: 0.15,
      color: "grey",
      boxShadow: "4px 4px 12px rgba(0, 255, 0, 0.75)",
    },
  },
  "mommy-wow": defaultDisplay,
  "people-pleaser": defaultDisplay,
  puzzle: defaultDisplay,
  "slinky-dog": defaultDisplay,
  "whats-inside-your-heart": defaultDisplay,
};

// If no whistlegraph is specified when the player loads.
const defaultWhistlegraph = anyKey(whistlegraphs);

console.log(defaultWhistlegraph);

let whistlegraph;

// 🥾 Boot (Runs once before first paint and sim)
function boot({ cursor, wipe, content, query }) {
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

  const deck = content.add(`
    <div class="card-deck loading">
      <div class="card-view" data-type="compilation" data-outer-radius="${whistlegraph.compilation.outerRadius}" data-inner-radius="${whistlegraph.compilation.innerRadius}" data-border-setting="${whistlegraph.compilation.border}" style="z-index: 0">
        <div class="card" data-type="compilation" data-ratio="720x1280">
          <video class="card-content" width="100%" height="100%" preload="auto"
           playsinline src="/disks/wg-player/${wg}/${wg}-tt.mp4"></video>
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
    }
    
    .card-deck:not(.loading) #card-deck-loading { display: none; }
    
    #content .card-view {
      width: 100%;
      height: 100%:
      box-sizing: border-box;
      position: absolute;
      pointer-events: none;
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
      width: 50vmin;
      filter: brightness(0.75);
    }
    
    .card-deck.no-cursor { cursor: none; }
    .card-deck.no-cursor .card-view.active .card { cursor: none; }
    
    .card-view.active .card { cursor: pointer; }
    
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
    
    .card.running {
     box-shadow: 0px 0px 24px rgba(0, 0, 0, 0.75) !important;
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

  wipe(whistlegraph.backgroundTint);
}

// 🎨 Paint (Executes every display frame)
function paint({ wipe }) {
  wipe(whistlegraph.backgroundTint);
  return false;
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
