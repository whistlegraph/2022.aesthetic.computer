// 🔁 Loop

// These numbers define the budgeted frame-time (max) for CPU and Rendering.
// The updates will repeat multiple times per frame, but rendering will only
// ever happen once per display refresh.

const updateFps = 120;
const renderFps = 120; // This is a maximum.
const updateRate = 1000 / updateFps;
const renderRate = 1000 / renderFps;
let updateTime = 0;
let renderTime = 0;
let lastNow;
let input;
let updateAndRender;

// input runs once per loop, update runs
// multiple times and render only ever runs once
// if enough time has passed.
function loop(now) {
  input();

  const delta = now - lastNow;

  updateTime += delta;
  renderTime += delta;
  lastNow = now;
  
  let updateTimes = 0;

  while (updateTime >= updateRate) {
    updateTimes += 1;
    updateTime -= updateRate;
  }

  let needsRender = false;
  
  if (renderTime >= renderRate) {
    needsRender = true;
    renderTime -= renderRate;
  }
  
  updateAndRender(needsRender, updateTimes);
  
  window.requestAnimationFrame(loop);
}

function start(inputFun, updateAndRenderFun) {
  input = inputFun;
  updateAndRender = updateAndRenderFun;
  lastNow = performance.now();
  window.requestAnimationFrame(loop);
}

export { start };
