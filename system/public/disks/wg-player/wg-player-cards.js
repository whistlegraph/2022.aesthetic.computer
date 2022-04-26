const deck = document.querySelector(".card-deck");
const layerOrder = ["video", "score", "compilation"];

let volumeOutInterval, volumeInInterval;

let audioContext;
const audioSources = {};
const videoGains = {};

// Load audio files as buffers in an audioContext.
audioContext = new AudioContext({
  latencyHint: "playback",
});

const audios = document.querySelectorAll("#content .card-deck .card audio");

audios.forEach((audio, i) => {
  const type = audio.closest(".card").dataset.type;
  fetch(audio.src)
    .then(function (response) {
      return response.arrayBuffer();
    })
    .then(function (buffer) {
      audioSources[type] = { buffer };
      if (i === audios.length - 1) {
        console.log("🎼 All whistlegraph audio has loaded!");
        decodeAudioData();
      }
    });
});

function decodeAudioData() {
  const audioSourceEntries = Object.entries(audioSources);
  audioSourceEntries.forEach(([type, content], i) => {
    // TODO: Why isn't content just content.decodedBuffer here?
    audioContext.decodeAudioData(content.buffer, function (decodedData) {
      function source() {
        const gainNode = audioContext.createGain();
        const s = audioContext.createBufferSource();
        s.buffer = decodedData;
        s.connect(gainNode);
        content.gainNode = gainNode;
        gainNode.connect(audioContext.destination);
        gainNode.gain.setValueAtTime(1, audioContext.currentTime);
        s.start();
      }
      if (i === audioSourceEntries.length - 1) {
        console.log("🎼 All whistlegraph audio data decoded!");
        //audiosAlreadyDecoded = true;

        // TODO: Actually allow a user to interact with the page now, and hide
        //       the loading spinner.
      }
      content.source = source;
    });
  });
}

//let audiosAlreadyDecoded = false;

// Create an audioContext for crossfading between videos.

deck.addEventListener(
  "pointerdown",
  (e) => {
    //startAudio();
  },
  { once: true }
);

// 1️⃣ Hover states for cards when using only a mouse, and active states
//    for mouse and touch.

deck.addEventListener("click", (event) => {
  event.preventDefault();
  event.stopPropagation();
});

let multipleTouches = false;
let activated = false;
let deactivateTimeout;

deck.addEventListener("pointermove", (e) => {
  if (!e.isPrimary || multipleTouches === true) return;
  if (e.pointerType === "mouse") deck.classList.remove("no-cursor");
  const card = deck.querySelector(".card-view.active .card");
  if (document.elementFromPoint(e.clientX, e.clientY) === card) {
    if (e.pointerType === "mouse") card.classList.add("hover");
  } else if (card) {
    card.classList.remove("touch", "hover");
    activated = false;
  }
});

deck.addEventListener("pointerup", (e) => {
  const card = deck.querySelector(".card-view.active .card");
  card?.classList.remove("touch");
});

deck.addEventListener("touchstart", (e) => {
  if (e.touches.length > 1) {
    multipleTouches = true;
    const card = deck.querySelector(".card-view.active .card");
    clearTimeout(deactivateTimeout);
    deactivateTimeout = setTimeout(() => {
      activated = false;
      card.classList.remove("touch");
    }, 250);
  }
});

deck.addEventListener("touchend", (e) => {
  // if (!e.isPrimary) return;
  if (e.touches.length === 0) {
    multipleTouches = false;
    // number of touches?
    const card = deck.querySelector(".card-view.active .card");
    card.classList.remove("touch");
  }
});

deck.addEventListener("pointerdown", (e) => {
  if (!e.isPrimary) return;
  const card = deck.querySelector(".card-view.active .card");
  if (document.elementFromPoint(e.clientX, e.clientY) === card) {
    card.classList.add("touch");
    card.classList.remove("hover");
    activated = true;
    clearTimeout(deactivateTimeout);
    deactivateTimeout = setTimeout(() => {
      activated = false;
      card.classList.remove("touch");
    }, 500);
  }
});

// 2️⃣ Switching from one card to another, animating them, and triggering the media
//    for each.
deck.addEventListener("pointerup", (e) => {
  if (!e.isPrimary) return;

  const activeView = deck.querySelector(".card-view.active");
  if (!activeView) return; // Cancel if there are no 'active' cards.

  // Cancel if we didn't click on the actual card.
  const activeCard = activeView.querySelector(".card");
  const target = document.elementFromPoint(e.clientX, e.clientY);
  if (target !== activeCard) return;

  // Make sure the card is still active based on the pointer events.
  if (activated === false) return;
  activated = false;

  // 1. Collect all card elements via layerOrder.
  const layers = {};
  layerOrder.forEach((layer) => {
    layers[layer] = document.querySelector(`.card-view[data-type=${layer}]`);
  });

  // -1. Play the push down animation...
  activeView.classList.add("pressed");
  activeCard.classList.add("running");

  if (e.pointerType === "mouse") deck.classList.add("no-cursor");

  activeView.addEventListener(
    "animationend",
    () => {
      activeView.classList.remove("pressed");
    },
    { once: true }
  );

  // Potentially resume the AudioContext.
  if (
    audioContext &&
    ["suspended", "interrupted"].includes(audioContext.state)
  ) {
    audioContext.resume();
  }

  // 0. Unmute the first video if it hasn't woken up yet...
  const video = activeCard.querySelector("video");
  if (video && video.paused && activeCard.dataset.type === "video") {
    // First click.

    // TODO: Fix the race condition that source may not exist here.
    video.play();
    audioSources[activeCard.dataset.type].source();

    video.addEventListener("ended", function end() {
      if (activeView.classList.contains("active")) {
        video.play();
        audioSources[activeCard.dataset.type].source();
      } else {
        video.removeEventListener("ended", end);
      }
    });

    return;
  } else if (video) {
    // Fade volume out.
    const activeCardType = activeCard.dataset.type;
    console.log("Fading out volume on:", activeCardType);
    //audioSources[activeCardType].gainNode.gain.cancelScheduledValues(
    //  audioContext.currentTime
    //);
    audioSources[activeCardType].gainNode.gain.setValueAtTime(
      1,
      audioContext.currentTime
    );
    audioSources[activeCardType].gainNode.gain.linearRampToValueAtTime(
      0,
      audioContext.currentTime + 0.5
    );
  }

  // 0.5 Fade in audio if it's necessary for the next layer.
  const nextLayer = layers[layerOrder[1]];
  const nextVideo = nextLayer.querySelector(".card video");
  if (nextVideo) {
    const nextActiveCardType = nextVideo.closest(".card").dataset.type;
    if (nextVideo.paused) {
      nextVideo.play();
      audioSources[nextActiveCardType].source();

      nextVideo.addEventListener("ended", function end() {
        if (nextVideo.closest(".card-view").classList.contains("active")) {
          nextVideo.play();
          audioSources[nextActiveCardType].source();
        } else {
          nextVideo.removeEventListener("ended", end);
        }
      });
    } else {
      // Bring volume back.
      console.log("Bringing back volume on:", nextActiveCardType);
      //audioSources[nextActiveCardType].gainNode.gain.cancelScheduledValues(
      //  audioContext.currentTime
      //);
      audioSources[nextActiveCardType].gainNode.gain.setValueAtTime(
        0,
        audioContext.currentTime
      );
      audioSources[nextActiveCardType].gainNode.gain.linearRampToValueAtTime(
        1,
        audioContext.currentTime + 0.5
      );
    }
  }

  activeView.addEventListener(
    "animationend",
    (e) => {
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
          if (rect.height > maxTranslateHeight)
            maxTranslateHeight = rect.height;
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

      if (Math.random() > 0.5) rX *= -1;
      if (Math.random() > 0.5) rY *= -1;

      // 3. Trigger the first transition.
      card.style.transition = "0.25s ease-out transform";
      card.style.transform = `translate(${rX}px, ${rY}px)`;

      top.classList.remove("active");
      card.classList.remove("running");

      // 4. Move the 1st element from layering to the end...
      layerOrder.push(layerOrder.shift());

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
    },
    { once: true }
  );
});

function frame() {
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

frame();

const resizer = new ResizeObserver((entries) => {
  for (let entry of entries) {
    if (entry.target === deck) frame();
  }
});

resizer.observe(deck);
