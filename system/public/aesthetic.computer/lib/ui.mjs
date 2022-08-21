import { Box } from "./geo.mjs";
import { radians } from "./num.mjs";
const { round } = Math;

function spinner(ctx, timePassed) {
  const gap = 12,
    s = 6;

  ctx.save();
  ctx.translate(s + gap, s + gap);
  ctx.rotate(radians(timePassed % 360) * 1);

  ctx.beginPath();
  // \ of the X
  ctx.moveTo(-s, -s); // top left
  ctx.lineTo(s, s); // bottom right
  // / of the X
  //ctx.moveTo(-s, s); // bottom left
  //ctx.lineTo(s, -s); // top right

  ctx.strokeStyle = "rgb(255, 255, 0)";
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.stroke();

  ctx.restore();
}

function cached(ctx) {
  const gap = 4,
    s = 20;

  ctx.save();
  ctx.translate(round(gap / 2) + 6, round(gap / 2) + 4); // TODO: Translate before clearing to save some lines? 2022.02.02.03.30

  ctx.beginPath();

  ctx.moveTo(gap, gap); // left
  ctx.lineTo(gap, s);
  ctx.moveTo(gap * 3.5, gap); // right
  ctx.lineTo(gap * 3.5, s);

  ctx.strokeStyle = "rgb(0, 255, 255)";
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.stroke();

  ctx.restore();
}

class Button {
  box;
  down = false;
  disabled = false;
  icon;

  constructor() {
    if (arguments.length === 1) {
      // Assume we are passing in a box {x,y,w,h} object.
      this.box = Box.copy(arguments[0]);
    } else this.box = new Box(...arguments); // Otherwise: x, y, w, h for a box.
  }

  // For using in a piece's `act` function. Contains callbacks for
  // events that take place inside the button.
  // Usage:  act(e, () => {}); // For 'push' callback only.
  //         act(e, {push: () => {}, down: () => {}, cancel: () => {}, draw() => {}});
  act(e, callbacks) {
    if (this.disabled) return;

    // If only a single function is sent, then assume it's a button push callback.
    if (typeof callbacks === "function") callbacks = { push: callbacks };

    // 1. Down: Enable the button if we touched over it.
    if (e.is("touch") && this.box.contains(e)) {
      callbacks.down?.();
      this.down = true;
    }

    // 2. Cancel: Disable the button if it has been pressed and was dragged off.
    if (e.is("draw") && !this.box.contains(e)) {
      this.down = false;
      callbacks.draw?.();
    }

    // 3. Push: Trigger the button if we push it.
    if (e.is("lift")) {
      callbacks[this.box.contains(e) && this.down ? "push" : "cancel"]?.();
      this.down = false;
    }
  }

  // Draws a callback if the button is not disabled.
  paint(fn) {
    if (!this.disabled) fn(this);
  }

  enableIf(flag) {
    this.disabled = !flag;
  }
}

export { spinner, cached, Button };
