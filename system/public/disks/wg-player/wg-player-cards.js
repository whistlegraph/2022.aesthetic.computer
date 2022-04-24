const deck = document.querySelector(".card-deck");
const layerOrder = ["video", "score", "compilation"];

function resize() {
  deck.querySelectorAll(".card-deck .card-view").forEach((cardView) => {
    const card = cardView.querySelector(".card");
    const cardContent = card.querySelector(".card-content");

    // TODO: Make these customizable.
    const margin = 64; // Of the page.
    //const border = margin / 2;
    const borderSetting = 0.35;

    const border = margin * borderSetting;

    const width = deck.clientWidth - margin;
    const height = deck.clientHeight - margin;

    const displayRatio = deck.clientWidth / deck.clientHeight;
    const contentRatioValues = card.dataset.ratio
      .split("x")
      .map((n) => parseFloat(n));
    const contentRatio = contentRatioValues[0] / contentRatioValues[1];

    if (contentRatio < displayRatio) {
      cardContent.style.width = Math.floor(height * contentRatio) + "px";
      cardContent.style.height = height + "px";
    } else {
      cardContent.style.height = Math.floor(width / contentRatio) + "px";
      cardContent.style.width = width + "px";
    }

    card.style.width = parseFloat(cardContent.style.width) + border + "px";
    card.style.height = parseFloat(cardContent.style.height) + border + "px";

    cardContent.style.left = border / 2 + "px";
    cardContent.style.top = border / 2 + "px";

    card.style.top = (deck.clientHeight - card.clientHeight) / 2 + "px";
    card.style.left = (deck.clientWidth - card.clientWidth) / 2 + "px";
  });
}

let volumeOutInterval, volumeInInterval;

let down = false;

deck.addEventListener("pointerdown", (e) => {
  // TODO: Detect a proper event for touching down here.
  // console.log(e.target);
  // down = true;
});

deck.addEventListener("pointerup", (e) => {
  if (!e.isPrimary) return;

  const activeView = deck.querySelector(".card-view.active");
  if (!activeView) return; // Cancel if there are no 'active' cards.

  // Cancel if we didn't click on the actual card.
  const activeCard = activeView.querySelector(".card");
  if (e.target !== activeCard) return;

  // 0. Unmute the first video if it hasn't woken up yet...
  const video = activeCard.querySelector("video");
  if (video && video.muted && activeCard.dataset.type === "video") {
    // First click.
    video.muted = false;
    video.play();
    video.volume = 1;
    return;
  } else if (video) {
    // This is either the compilation, or the video, on second time around.
    clearInterval(volumeOutInterval);
    volumeOutInterval = setInterval(() => {
      video.volume *= 0.96;
      if (video.volume < 0.001) {
        video.volume = 0;
        clearInterval(volumeOutInterval);
      }
    }, 8);
  }

  // 1. Collect all card elements via layerOrder.
  const layers = {};
  layerOrder.forEach((layer) => {
    layers[layer] = document.querySelector(`.card-view[data-type=${layer}]`);
  });

  // 2. Animate the top one off the screen.
  const top = layers[layerOrder[0]];
  const card = top.querySelector(".card");

  // By calculating the proper distance it can move to based on what else
  // is left in the deck and its own size.
  let rX = 0,
    rY = 0;
  let maxTranslateHeight = 0,
    maxTranslateWidth = 0;
  const cardRect = card.getBoundingClientRect();

  [...deck.querySelectorAll(".card-view:not(.active) .card")]
    .map((card) => {
      return card.getBoundingClientRect();
    })
    .forEach((rect) => {
      if (rect.width > maxTranslateWidth) maxTranslateWidth = rect.width;
      if (rect.height > maxTranslateHeight) maxTranslateHeight = rect.height;
    });

  maxTranslateWidth -= (maxTranslateWidth - cardRect.width) / 2;
  maxTranslateHeight -= (maxTranslateHeight - cardRect.height) / 2;

  // Pad each by a bit.
  maxTranslateWidth *= 1.025;
  maxTranslateHeight *= 1.025;

  if (Math.random() > 0.5) {
    rX += maxTranslateWidth;
    rY += Math.random() * maxTranslateHeight;
  } else {
    rY += maxTranslateHeight;
    rX += Math.random() * maxTranslateWidth;
  }

  if (Math.random() > 0.5) {
    rX *= -1;
  }
  if (Math.random() > 0.5) {
    rY *= -1;
  }

  // 3. Trigger the first transition.
  card.style.transition = "0.25s ease-out transform";
  card.style.transform = `translate(${rX}px, ${rY}px)`;
  top.classList.remove("active");

  // 4. Move the 1st element from layering to the end...
  layerOrder.push(layerOrder.shift());

  // 6. Fade in audio if it's necessary for the next layer.
  {
    const nextLayer = layers[layerOrder[0]];
    const video = nextLayer.querySelector(".card video");
    if (video) {
      if (video.paused) {
        video.play();
        video.muted = false;
      } else {
        // Bring volume back.
        video.volume = 0.0;

        clearInterval(volumeInInterval);
        volumeInInterval = setInterval(() => {
          video.volume = Math.min(1, video.volume + 0.01);
          if (video.volume >= 1) {
            video.volume = 1;
            clearInterval(volumeInInterval);
          }
        }, 8);
      }
    }
  }

  card.addEventListener("transitionend", function end(e) {
    card.removeEventListener("transitionend", end);

    // and re-sort them on the z-axis.
    layerOrder.forEach((layer, index) => {
      const zIndex = layerOrder.length - 1 - index;
      const el = layers[layer];
      el.style.zIndex = zIndex;
      if (zIndex === 2) el.classList.add("active");
    });

    // 5. Animate the top (now bottom) one back.
    card.style.transition = "0.5s ease-in transform";
    card.style.transform = "none";
  });
});

resize();

//for zoom detection
let px_ratio =
  window.devicePixelRatio ||
  window.screen.availWidth / document.documentElement.clientWidth;

// TODO: Test this with a cable.
function isZooming() {
  const newPx_ratio =
    window.devicePixelRatio ||
    window.screen.availWidth / document.documentElement.clientWidth;
  if (newPx_ratio != px_ratio) {
    px_ratio = newPx_ratio;
    console.log("zooming");
    return true;
  } else {
    console.log("just resizing");
    return false;
  }
}

const resizer = new ResizeObserver((entries) => {
  for (let entry of entries) {
    if (entry.target === deck && isZooming() === false) resize();
  }
});

resizer.observe(deck);
