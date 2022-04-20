// Whistlegraph Player, 2022.4.19
// Made on occasion of Whistlegraph's Feral File exhibition.

// TODO: Get a score card working with a different aspect ratio, which will generalize the video card.

// 🥾 Boot (Runs once before first paint and sim)
function boot({ wipe, content }) {
  wipe(200, 150, 150);

  // TODO: Add a button or gesture so that cards can be switched or scrolled through.

  // Note: This is a little like a react component... maybe I can eventually use
  //       ShadowDOM or scope the css here.
  const deck = content.add(`
    <div class="card-deck">
      <div class="card">
        <div class="card-content" data-type="video" data-ratio="4x5">
          <video width="100%" height="100%" loop autoplay muted src="/disks/wg-player/wg-player-test.mp4"></video>
        </div>
      </div>
      <div class="card">
        <div class="card-content" data-type="score" data-ratio="8.5x11">
          <img width="100%" height="100%" src="/disks/wg-player/wg-player-test.svg">
        </div>
      </div>
      <div class="card">
        <div class="card-content" data-type="compilation" data-ratio="9x16">
          <video width="100%" height="100%" loop autoplay muted src="/disks/wg-player/wg-player-test-tt.mp4"></video>
        </div>
        </div>
      </div>
    </div>
    <script>
    const deck = document.querySelector('.card-deck'); 
    
    function resize() {
      deck.querySelectorAll(".card-deck .card").forEach((card) => {
        const cardContent = card.querySelector('.card-content');
        
        const padding = 0; //parseFloat(getComputedStyle(card).padding) * 2;
        const width = card.clientWidth - padding; 
        const height = card.clientHeight - padding; 
        const displayRatio = card.clientWidth / card.clientHeight;
        
        const contentRatioValues = cardContent.dataset.ratio.split('x').map(n => parseFloat(n));
        const contentRatio = contentRatioValues[0] / contentRatioValues[1]; 
        // console.log("Card ratio:", videoRatio, "Display ratio:", displayRatio);
        
        if (contentRatio < displayRatio) {
          cardContent.style.width = Math.floor(height * contentRatio) + "px"; 
          cardContent.style.height = height + "px"; 
        } else {
          cardContent.style.height = Math.floor(width / contentRatio) + "px"; 
          cardContent.style.width = width + "px"; 
        }
      });
    }

    resize();
      
    const resizer = new ResizeObserver(entries => {
      for (let entry of entries) { if (entry.target === deck) resize(); }
    });

    resizer.observe(deck);
    </script>
    <style>  
    #content .card-deck {
      width: 100%;
      height: 100%;
      box-sizing: border-box;
    }
    
    #content .card {
      height: calc(100% - 3em);
      width: calc(100% - 3em);
      top: 1.5em;
      left: 1.5em;
      display: flex;
      box-sizing: border-box;
      position: absolute;
    }
    
    .card-content {
      box-sizing: border-box;
      margin: auto;
      border-radius: 1em;
      overflow: hidden;
      position: relative;
    }
    
    .card-content[data-type=video] {
      background: rgb(23, 23, 23);
      box-shadow: 4px 4px 12px rgba(0, 0, 0, 0.75);
    }
    
    .card-content[data-type=video] video,
    .card-content[data-type=compilation] video {
      box-sizing: border-box;
      border-radius: 0.25em;
      object-fit: cover;
    }
    
    .card-content[data-type=score] {
      background: rgb(48, 48, 48);
      box-shadow: 4px 4px 12px rgba(0, 0, 0, 0.75);
      transform: rotate(5deg) scale(0.96); 
    }
    
    .card-content[data-type=score] img {
      box-sizing: border-box;
      border-radius: 0.25em;
      object-fit: cover;
      margin: auto;
    } 
    
    .card-content[data-type=compilation] {
      background: green;
      box-shadow: 4px 4px 12px rgba(0, 0, 0, 0.75);
    }
    
    .card-content[data-type=compilation] video {
      position: absolute;
      /*width: calc(100% - 20px);*/
      /*height: calc(100% - 20px);*/
    }
    </style>
  `)
}

// 🎨 Paint (Executes every display frame)
function paint({ ink, pen }) {
  ink(200, 180, 180).plot(pen);
}

export { boot, paint };

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

