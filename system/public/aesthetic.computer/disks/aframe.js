// A-Frame (Draw) (based on https://fukuno.jig.jp/2574)

// 🥾 Boot (Runs once before first paint and sim)
function boot({ resize, content }) {
  // TODO: Runs only once!
  // resize(50, 20);
  /*
  content.add(`
    <a-scene loading-screen="enabled: true; backgroundColor: grey; dotsColor: white;" stats>
      <a-box position="-1 0.5 -3" rotation="0 45 0" color="#4CC3D9"></a-box>
      <a-sphere position="0 1.25 -5" radius="1.25" color="#EF2D5E"></a-sphere>
      <a-cylinder position="1 0.75 -3" radius="0.5" height="1.5" color="#FFC65D"></a-cylinder>
      <a-plane position="0 0 -4" rotation="-90 0 0" width="4" height="4" color="#7BC8A4"></a-plane>
      <a-sky color="#ECECEC"></a-sky>
      <a-camera look-controls></a-camera>
    </a-scene>
 `);
 */

  content.add(`
    <iframe id="vr" allowfullscreen allowvr allowtransparency="true"
      style="border: none;"
      width="100%" height="100%" src="aframe.html"></iframe>
      
    <script>
     const vr = document.querySelector('#vr');
     window.addEventListener('pointerdown', (e) => {
         vr.contentWindow.postMessage({pointer: "down", pos: {x: e.x, y: e.y}}); 
     });
     
     window.addEventListener('pointerup', (e) => {
         vr.contentWindow.postMessage({pointer: "up", pos: {x: e.x, y: e.y}}); 
     });
     
     window.addEventListener('pointermove', (e) => {
         vr.contentWindow.postMessage({pointer: "move", pos: {x: e.x, y: e.y}}); 
     });
    </script>
    <div id="vr-overlay"></div>
    <style>
      #vr-overlay {
        pointer-events: none;
        background: black;
        opacity: 0;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
      }
    </style>
`);
}

// 🧮 Sim(ulate) (Runs once per logic frame (120fps locked)).
function sim($api) {
  // TODO: Move a ball here!
  //console.log($api);
}

// 🎨 Paint (Executes every display frame)
function paint({ wipe }) {
  wipe(0);
  return false;
}

// ✒ Act (Runs once per user interaction)
function act({ event }) {
  // console.log(event);
}

// 💗 Beat (Runs once per bpm)
function beat($api) {
  // TODO: Play a sound here!
}

// 📚 Library (Useful classes & functions used throughout the piece)
// ...

export { boot, sim, paint, act, beat };
