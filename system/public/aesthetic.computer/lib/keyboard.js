// ⌨ Keyboard

// TODO: Add more of these properties as needed:
//       https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent

export class Keyboard {
  events = [];

  constructor() {
    window.addEventListener("keydown", (e) => {
      this.events.push({
        name: "keyboard:down",
        key: e.key,
        shift: e.shiftKey,
        alt: e.altKey,
        ctrl: e.ctrlKey,
      });
    });

    window.addEventListener("keyup", (e) => {
      this.events.push({ name: "keyboard:up", key: e.key });
    });
  }
}
