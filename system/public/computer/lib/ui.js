import { Box } from "./geo.js";

function spinner({ color, line }) {
  // TODO: Send the tickCount or time in here?
  color(255, 0, 0);
  line(0, 0, 10, 10);
  line(0, 10, 10, 0);
}

class Button {
  box;
  down = false;
  icon;

  constructor() {
    if (arguments.length === 1) {
      // Assume we are passing in a box {x,y,w,h} object.
      this.box = Box.copy(arguments[0]);
    } else this.box = new Box(...arguments); // Otherwise: x, y, w, h for a box.
  }

  act(e, pushCb) {
    // 1. Down: Enable the button if we touched over it.
    if (e.is("touch") && this.box.contains(e)) this.down = true;

    // 2. Cancel: Disable the button if it has been pressed and was dragged off.
    if (e.is("draw") && !this.box.contains(e)) this.down = false;

    // 3. Push: Trigger the button if we push it.
    if (e.is("lift") && this.down) {
      if (this.box.contains(e)) pushCb(); // TODO: Params for the cb? 2021.12.11.16.56
      this.down = false;
    }
  }
}

export { spinner, Button };
