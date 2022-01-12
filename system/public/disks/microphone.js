// Microphone, 2022.1.11.0.26
// A simple microphone feedback monitor test.

// TODO: Also add video input here...

const { floor } = Math;

let vid;

// 🥾 Boot (Runs once before first paint and sim)
function boot({ video, screen }) {
  vid = video("camera", {
    width: screen.width,
    height: floor(screen.width / (16 / 9)),
  });
  // const vid = video("youtube-link");
  // const vid = video("tiktok:@whistlegraph");
  // https://codepen.io/oceangermanique/pen/LqaPgO
}

// 🎨 Paint (Runs once per display refresh rate)
function paint({ wipe, paste }) {
  wipe(15, 20, 0);

  const frame = vid();
  if (frame) {
    paste(frame, 0, 0);
  }
  // Try to draw the video here.

  //return false;
}

// ✒ Act (Runs once per user interaction)
function act({ event }) {}

// 💗 Beat (Runs once per bpm)
function beat({ sound: { time, microphone } }) {
  // Connect the microphone on the first beat.
  if (time === 0) microphone("test-options");
}

// 📚 Library (Useful functions used throughout the program)
// ...

export { boot, paint, act, beat };
