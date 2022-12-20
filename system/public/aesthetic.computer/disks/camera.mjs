// Camera, 2022.6.19.11.16
// A simple video feedback test.
// TODO: Get this working on iOS (Mobile Safari).

const { floor } = Math;
let vid;

// 🥾 Boot (Runs once before first paint and sim)
function boot({ screen, video }) {
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
  wipe(15, 20, 0); // Clear the background.
  // Draw the video.
  const frame = vid();
  if (frame) paste(frame, 0, 0);
}

// 📚 Library (Useful functions used throughout the program)
// ...

export { boot, paint };