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
      style="cursor: none !important; border: none;"
      width="100%" height="100%" src="aframe.html"></iframe>
      
    <script>
     const vr = document.querySelector('#vr');
   
     // TODO: Remove this listener.
     
     function message(e) {
       if (e.data?.pointer) {
          ['down', 'move', 'up'].forEach((event) => {
            if (e.data.pointer === event) {
              window.dispatchEvent(
                new PointerEvent(
                  'pointer' + event,
                  {
                    isPrimary: true,
                    screenX: e.data.pos.x,
                    screenY: e.data.pos.y,
                    clientX: e.data.pos.x,
                    clientY: e.data.pos.y,
                    x: e.data.pos.x,
                    y: e.data.pos.y,
                  },
                ),
              );
            }
          });
       } else if (e.data?.key) {
         console.log(e.data.key);
         window.dispatchEvent(new KeyboardEvent("keydown", {key: e.data.key}));
       }
     }
     // Add the window event along with a function that gets run when this piece unloads.
     window.addEventListener('message', message);
     window.acCONTENT_EVENTS.push(() => window.removeEventListener('message', message));
    </script>
<!--    <div id="vr-overlay"></div>-->
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
function paint({ wipe, noiseTinted }) {
  noiseTinted([0, 0, 0], 0.9, 0.1);
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
