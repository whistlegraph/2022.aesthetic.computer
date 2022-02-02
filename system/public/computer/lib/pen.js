// ✍️ Pen
// TODO: Clean up this whole class and its connections to the system.
const { assign } = Object;
const { floor, round } = Math;

export class Pen {
  x;
  y;
  delta;
  pressure;
  pointerType;
  untransformedPosition;
  point;
  changedInPiece = false;
  #lastP;

  down = false;
  changed = false;

  event = "";
  events = [];

  cursorCode;
  penCursor = false;

  lastPenX;
  lastPenY;

  lastPenCursor;

  dragBox;

  #dragging = false;
  #lastPenDown;
  #penDragStartPos;

  // `point` is a transform function for projecting coordinates from screen
  // space to virtual screen space.
  constructor(point) {
    this.point = point;

    // Add pointer events.
    const pen = this;

    let forceTouchPressure = 0;
    let forceTouchEnabled = false;

    // Touch
    window.addEventListener("pointerdown", (e) => {
      if (!e.isPrimary) return;
      pen.pointerType = e.pointerType;

      assign(pen, point(e.x, e.y));
      this.untransformedPosition = { x: e.x, y: e.y };

      pen.pressure = reportPressure(e);

      pen.down = true;
      pen.#dragging = true;
      pen.#penDragStartPos = { x: pen.x, y: pen.y };
      pen.#event("touch");

      pen.changed = true;
      pen.penCursor = true;
      if (e.pointerType !== "mouse") pen.penCursor = false;
    });

    // Hover and Draw
    window.addEventListener("pointermove", (e) => {
      if (!e.isPrimary) return;
      pen.pointerType = e.pointerType;

      assign(pen, point(e.x, e.y));
      this.untransformedPosition = { x: e.x, y: e.y };

      pen.pressure = reportPressure(e);

      if (pen.#dragging) {
        // draw
        const penDragAmount = {
          x: pen.x - pen.#penDragStartPos.x,
          y: pen.y - pen.#penDragStartPos.y,
        };

        pen.dragBox = {
          x: pen.#penDragStartPos.x,
          y: pen.#penDragStartPos.y,
          w: penDragAmount.x,
          h: penDragAmount.y,
        };

        // TODO: Only set to draw if
        pen.#event("draw");
      } else {
        // move
        pen.#event("move");
      }

      pen.changed = true;
      pen.penCursor = true;
      if (e.pointerType !== "mouse") pen.penCursor = false;
    });

    // Lift
    window.addEventListener("pointerup", (e) => {
      if (!e.isPrimary) return;
      pen.pointerType = e.pointerType;

      pen.down = false;
      if (pen.#dragging) pen.#event("lift");

      pen.#dragging = false;

      pen.changed = true;
      pen.penCursor = true;
      if (e.pointerType !== "mouse") pen.penCursor = false;
    });

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
      console.log(forceTouchPressure);
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

  // TODO: Merge this logic into the above events & consolidate class properties.
  // Check the hardware for any changes.
  #event(name) {
    this.event = name;

    const delta = {
      x: this.x - this.lastPenX,
      y: this.y - this.lastPenY,
    };

    this.delta = delta;

    // This field detects whether the pen projection to the current resolution has changed or not.
    // Note: Original data is not sent at the moment. It could be calculated and sent
    //       similar to `Pen`s `untransformedPosition`
    this.changedInPiece = delta.x !== 0 || delta.y !== 0;

    this.events.push({
      name: this.event,
      device: this.pointerType,
      x: this.x,
      y: this.y,
      delta,
      penChanged: this.changedInPiece,
      pressure: this.pressure,
      drag: this.dragBox,
    });

    this.lastPenCursor = this.penCursor;
    this.#lastPenDown = this.down;
    this.lastPenX = this.x;
    this.lastPenY = this.y;
  }

  render(ctx, bouRect) {
    const p = this.untransformedPosition;
    if (!p) return;

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
    if (!this.cursorCode || this.cursorCode === "precise") {
      // 🎯 Precise
      ctx.lineCap = "round";

      ctx.translate(round(p.x - r.x), round(p.y - r.y));

      // A. Make circle in center.
      ctx.beginPath();
      ctx.lineTo(0, 0); // bottom right

      ctx.strokeStyle = "white";
      ctx.lineWidth = 4;
      ctx.stroke();

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
      ctx.resetTransform();
    } else if (this.cursorCode === "tiny") {
      // 🦐 Tiny
      const l = 4;

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
      ctx.resetTransform();
    } else if (this.cursorCode === "dot") {
      ctx.translate(round(p.x - r.x), round(p.y - r.y));
      ctx.beginPath();
      ctx.lineTo(0, 0); // bottom right

      ctx.strokeStyle = "rgba(255, 0, 0, 0.9)";
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.resetTransform();
    } else if (this.cursorCode === "none") {
      // ...
    }
    this.changed = false;
  }

  setCursorCode(code) {
    this.cursorCode = code;
  }
}
