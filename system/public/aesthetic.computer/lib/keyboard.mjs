// ⌨ Keyboard

// TODO: Add more of these properties as needed:
//       https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent

export class Keyboard {
  events = [];
  #lastKeyDown;
  input;

  constructor(getCurrentPiece) {

    window.addEventListener("keydown", (e) => {

      // Firefox "repeat" seems to be broken on linux, so here is
      // some redundancy. 22.07.29.17.43
      const repeat = e.key === this.#lastKeyDown;
      this.#lastKeyDown = e.key;

      // Only activate input field driven text input if we are in the prompt.
      if (getCurrentPiece() === "aesthetic.computer/disks/prompt" &&
        this.input &&
        document.activeElement !== this.input
      ) {
        this.input.focus();
      }

      // Skip sending keyboard events from here if we are using text input
      // which generates a synthetic keyboard event back
      //  in `bios` under `Keyboard`
      if (document.activeElement === this.input &&
        // Remaps "Unidentified" to "Backspace" below, avoiding `Enter` code.
        e.which !== 13 &&
        e.key !== "Unidentified" &&
        e.key !== "Escape" &&
        e.key !== "ArrowUp" &&
        e.key !== "ArrowDown"
      ) return;

      // Remap `Unidentified` to `Backspace` for the Meta Quest Browser. 22.10.24.16.18
      let key = e.key;
      if (e.key === "Unidentified" && e.which === 8) key = "Backspace";
      // if (e.key === "Unidentified" && e.which === 13) key = "Enter";

      // Send a normal keyboard message if we are anywhere else.
      this.events.push({
        name: "keyboard:down:" + key.toLowerCase(),
        key,
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
