// ✍️ Pen

// Multi-Touch Story
// Use a concept of 'primary' through nth-pointers.
// The 'primary' behavior is already defined below.
// And now `nth-pointers` can be tacked on.

// TODO:
// - [🙋‍♂️] Add multi-touch support.
//   - [] Convert specific pointer data to a collection that support
//        the same properties for multiple pointers.
//   - [] Update the API in `multipen` to reflect this.

const { assign } = Object;
const { round } = Math;
const debug = window.acDEBUG;

import { Point } from "./geo.mjs";

class Pointer {
  x;
  y;
  delta;
  pressure;
  pointerType;
  pointerId;
  isPrimary;
  untransformedPosition;
  lastPenX;
  lastPenY;
  down = false;

  dragging = false;
  penDragStartPos;
  dragBox; // -
}

export class Pen {
  // Global data for the overall pen system.
  point; // + Used globally (transform to screen space fn)
  changedInPiece = false; // + Used globally.
  events = []; // + Used globally to hold all events.

  #lastP; // + Used globally, in the renderer.
  cursorCode; // + Used globally, in the renderer.
  penCursor = false; // + Used globally, in the renderer.

  pointers = {}; // Stores an object of `Pointers` to keep track of each gesture.

  get pointerCount() {
    return Object.keys(this.pointers).length;
  }

  // `point` is a transform function for projecting coordinates from screen
  // space to virtual screen space.
  constructor(point) {
    this.point = point;

    // Add pointer events.
    const pen = this;

    // Prevent double-tap delay: https://stackoverflow.com/a/71025095
    window.addEventListener(
      "touchend" || "dblclick",
      (event) => {
        // Only prevent double tap to Zoom if native-cursor is enabled.
        if (document.body.classList.contains("native-cursor") === false) {
          event.preventDefault();
          event.stopImmediatePropagation();
        }
      },
      {
        passive: false,
      }
    );

    // ***Touch***
    window.addEventListener("pointerdown", (e) => {
      // Make sure the pointer we are using is already being tracked.
      let pointer = pen.pointers[e.pointerId];

      // If it doesn't exist, then make a new pointer and push to pointers.
      if (!pointer) {
        // Create a new `Pointer` to track an individual gesture.
        pointer = new Pointer();

        // Assign data to individual pointer.
        assign(pointer, point(e.x, e.y));
        pointer.untransformedPosition = { x: e.x, y: e.y };
        pointer.pressure = reportPressure(e);
        pointer.down = true;
        pointer.dragging = true;

        console.log("dragging true", e.pointerId);
        pointer.penDragStartPos = { x: pen.x, y: pen.y };

        pointer.pointerType = e.pointerType;
        pointer.pointerId = e.pointerId;
        pointer.isPrimary = e.isPrimary;
        pointer.pointerIndex = this.pointerCount;

        pen.pointers[e.pointerId] = pointer;
      } else {
        pointer.dragging = true;
        pointer.penDragStartPos = { x: pen.x, y: pen.y };
      }

      // Set `pen` globals.
      pen.penCursor = true;
      if (e.pointerType !== "mouse") pen.penCursor = false;
      pen.#event("touch", pointer);
    });

    // ***Move (Hover) and Draw (Drag)***
    window.addEventListener("pointermove", (e) => {
      // Make sure the pointer we are using is already being tracked.
      let pointer = pen.pointers[e.pointerId];

      // If it doesn't exist, then make a new pointer and push to pointers.
      if (!pointer) {
        pointer = new Pointer();
        assign(pointer, point(e.x, e.y));
        pointer.untransformedPosition = { x: e.x, y: e.y };
        pointer.pressure = reportPressure(e);

        pointer.pointerType = e.pointerType;
        pointer.pointerId = e.pointerId;
        pointer.isPrimary = e.isPrimary;
        pointer.pointerIndex = this.pointerCount;
        pen.pointers[e.pointerId] = pointer;
      }

      // Assign data to individual pointer.
      assign(pointer, point(e.x, e.y));
      pointer.untransformedPosition = { x: e.x, y: e.y };
      pointer.pressure = reportPressure(e);

      if (pointer.dragging) {
        const penDragAmount = {
          x: pointer.x - pointer.penDragStartPos.x,
          y: pointer.y - pointer.penDragStartPos.y,
        };

        pointer.dragBox = {
          x: pointer.penDragStartPos.x,
          y: pointer.penDragStartPos.y,
          w: penDragAmount.x,
          h: penDragAmount.y,
        };
        // Only send an event if the new point differs from the last.
        pointerMoveEvent("draw", pointer);
      } else {
        pointerMoveEvent("move", pointer);
      }

      // Set `pen` globals.
      pen.penCursor = true;
      if (e.pointerType !== "mouse") pen.penCursor = false;
    });

    function pointerMoveEvent(type, pointer) {
      if (
        !Point.equals(pointer, { x: pointer.lastPenX, y: pointer.lastPenY })
      ) {
        pen.#event(type, pointer);
      }
    }

    // ***Lift***
    window.addEventListener("pointerup", (e) => {
      const pointer = pen.pointers[e.pointerId];
      if (!pointer) return;

      pointer.down = false;
      if (pointer.dragging) pen.#event("lift", pointer);

      pointer.dragging = false;

      pen.penCursor = true;
      if (e.pointerType !== "mouse") pen.penCursor = false;

      delete pen.pointers[e.pointerId];

      if (debug)
        console.log("Removed pointer by ID:", e.pointerId, this.pointers);
    });

    // Pressure Detection
    let forceTouchPressure = 0;
    let forceTouchEnabled = false;

    // MacBook Trackpad Pressure (in Safari)
    // TODO: When shipping natively for macOS:
    //       - Report or re-report actual pen events for:
    //         https://developer.mozilla.org/en-US/docs/Web/API/Force_Touch_events
    // When webkitForce > 2 the button is held down quickly,
    // so we don't report anything. (It's a separate gesture)
    // Otherwise, normalize the pressure from 0-1.
    // Note: e.webkitForce reports from 1-3 by default.
    window.addEventListener("webkitmouseforcechanged", (e) => {
      forceTouchEnabled = true;
      if (e.webkitForce >= 2) {
        forceTouchPressure = 0;
      } else {
        forceTouchPressure = Math.max(0, e.webkitForce - 1);
      }
    });

    function reportPressure(e) {
      let pressure;
      // If the device is a trackpad (probably on a MacBook and in Safari)
      if (forceTouchEnabled) {
        pressure = forceTouchPressure;
      } else {
        // If pressure sensitivity doesn't exist then force it to be 1.
        pressure = e.pressure || 1;
        // Unless the device type is a pen, then make it 0. This assumes all pens
        // have pressure sensitivity.
        if (pen.pointerType === "pen" && pressure === 1) {
          pressure = 0;
        }
        // If the device is a mouse, then set it to 1.
        if (pen.pointerType === "mouse") pressure = 1;
      }
      return pressure;
    }

    return pen;
  }

  retransformPosition() {
    assign(
      this,
      this.point(this.untransformedPosition?.x, this.untransformedPosition?.y)
    );
  }

  normalizedPosition(rect) {
    if (this.untransformedPosition) {
      return {
        x: (this.untransformedPosition.x - rect.x) / rect.width,
        y: (this.untransformedPosition.y - rect.y) / rect.height,
      };
    } else {
      return { x: undefined, y: undefined };
    }
  }

  // TODO: Merge this logic into the above events & consolidate class properties.
  // Check the hardware for any changes.
  #event(name, pointer) {
    // console.log(name, pointer);

    const pen = this;

    const delta = {
      x: pointer.x - pointer.lastPenX || 0,
      y: pointer.y - pointer.lastPenY || 0,
    };

    pointer.delta = delta;

    // This field detects whether the pen projection to the current resolution has changed or not.
    // Note: Original data is not sent at the moment. It could be calculated and sent
    //       similar to `Pen`s `untransformedPosition`
    pen.changedInPiece = delta.x !== 0 || delta.y !== 0;

    pen.events.push({
      name,
      device: pointer.pointerType,
      id: pointer.pointerId,
      isPrimary: pointer.isPrimary,
      index: pointer.pointerIndex,
      x: pointer.x,
      y: pointer.y,
      delta: pointer.delta,
      pressure: pointer.pressure,
      drag: pointer.dragBox,
      penChanged: this.changedInPiece,
    });

    pointer.lastPenX = pointer.x;
    pointer.lastPenY = pointer.y;
  }

  render(ctx, bouRect) {
    // TODO: How to get the primary pointer from pointers?
    const pointer = this.pointers[1];

    if (!pointer) return;

    const p = pointer.untransformedPosition;

    const s = 10 + 4,
      r = bouRect;

    // Erase the last cursor that was drawn.
    if (!this.#lastP) this.#lastP = { x: p.x, y: p.y };
    else
      ctx.clearRect(
        this.#lastP.x - r.x - s,
        this.#lastP.y - r.y - s,
        s * 2,
        s * 2
      );

    assign(this.#lastP, p);

    // Remove native cursor if it was turned off.
    if (this.cursorCode != "native") {
      if (document.body.classList.contains("native-cursor")) {
        document.body.classList.remove("native-cursor");
      }
    }

    if (!this.cursorCode || this.cursorCode === "precise") {
      // 🎯 Precise
      ctx.lineCap = "round";

      ctx.save();
      ctx.translate(round(p.x - r.x), round(p.y - r.y));

      // A. Make circle in center.
      const radius = 2;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, 2 * Math.PI);

      ctx.fillStyle = "white";
      ctx.fill();

      const gap = 7.5,
        to = 10;

      ctx.beginPath();
      ctx.moveTo(0, -gap); // Over
      ctx.lineTo(0, -to);
      ctx.moveTo(0, gap); // Under
      ctx.lineTo(0, to);
      ctx.moveTo(-gap, 0); // Left
      ctx.lineTo(-to, 0);
      ctx.moveTo(gap, 0); // Right
      ctx.lineTo(to, 0);

      ctx.strokeStyle = "rgb(0, 255, 255)";
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.restore();
    } else if (this.cursorCode === "tiny") {
      // 🦐 Tiny
      const l = 4;
      ctx.save();
      ctx.translate(round(p.x - r.x), round(p.y - r.y));

      ctx.beginPath();
      ctx.moveTo(0, -l); // Over
      ctx.lineTo(0, -l);
      ctx.moveTo(0, l); // Under
      ctx.lineTo(0, l);
      ctx.moveTo(-l, 0); // Left
      ctx.lineTo(-l, 0);
      ctx.moveTo(l, 0); // Right
      ctx.lineTo(l, 0);

      ctx.strokeStyle = "rgba(255, 255, 0, 0.75)";
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.restore();
    } else if (this.cursorCode === "dot") {
      ctx.save();
      ctx.translate(round(p.x - r.x), round(p.y - r.y));
      ctx.beginPath();
      ctx.lineTo(0, 0); // bottom right

      ctx.strokeStyle = "rgba(255, 0, 0, 0.9)";
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.restore();
    } else if (this.cursorCode === "none") {
      // ...
    } else if (this.cursorCode === "native") {
      if (document.body.classList.contains("native-cursor") === false) {
        document.body.classList.add("native-cursor");
      }
    }
  }

  setCursorCode(code) {
    this.cursorCode = code;
  }
}
