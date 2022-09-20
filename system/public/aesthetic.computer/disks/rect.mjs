// Rect, 22.09.19.21.07
// Inherits from the "nopaint" system, which predefines boot, act, and leave.

// 🎨
export function paint({
  params,
  pen,
  paste,
  ink,
  system,
  screen,
  page,
  geo: { Box },
}) {
  let color = parseInt(params[0]);

  if (needsBake) {
    page(system.painting);
    ink(color).box(rect);
    page(screen);
    needsBake = false;
  }

  if (pen.dragBox) {
    paste(system.painting);
    rect = Box.copy(pen.dragBox).abs.crop(0, 0, screen.width, screen.height);
    ink(color).box(rect);
  } else {
    paste(system.painting);
  }

}

let needsBake = false;
let rect;

export function act({ event: e }) {
  if (e.is("lift")) {
    needsBake = true;
    console.log('bake!');
  }
}

export const system = "nopaint";
