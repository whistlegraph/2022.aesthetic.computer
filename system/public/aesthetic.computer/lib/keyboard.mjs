// ⌨ Keyboard

// TODO: Add more of these properties as needed:
//       https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent

export class Keyboard {
  events = [];
  #lastKeyDown;

  constructor() {
    window.addEventListener("keydown", (e) => {
      // Firefox "repeat" seems to be broken on linux, so here is
      // some redundancy. 22.07.29.17.43
      const repeat = e.key === this.#lastKeyDown;
      this.#lastKeyDown = e.key;

      this.events.push({
        name: "keyboard:down:" + e.key.toLowerCase(),
        key: e.key,
        repeat: e.repeat || repeat,
        shift: e.shiftKey,
        alt: e.altKey,
        ctrl: e.ctrlKey,
      });
    });

    window.addEventListener("keyup", (e) => {
      this.events.push({
        name: "keyboard:up:" + e.key.toLowerCase(),
        key: e.key,
      });
      this.#lastKeyDown = null;
    });
  }
}
