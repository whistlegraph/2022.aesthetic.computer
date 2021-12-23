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

  constructor() {
    if (arguments.length === 1) {
      // Assume we are passing in a box object.
      this.box = Box.copy(...arguments);
    } else this.box = new Box(...arguments); // Otherwise: x, y, w, h for a box.
  }

  act(event, pushCb) {
    // 1. Down
    // Enable the button if we touched over it.
    if (event.is("touch")) {
      if (this.box.contains(event)) this.down = true;
    }

    // 2. Cancel
    // Disable the button if it has been pressed and was dragged off.
    if (event.is("draw")) {
      if (!this.box.contains(event)) this.down = false;
    }

    // 3. Push
    // Trigger the button if we lift up over it while it's down.
    if (event.is("lift") && this.down) {
      if (this.box.contains(event)) pushCb(); // TODO: Params for the cb? 2021.12.11.16.56
      this.down = false;
    }
  }
}

export { spinner, Button };
