// Paint, 22.09.19.12.44 
// Inherits from the "nopaint" system, which predefines boot, act, and leave.

// 🎨
export function paint({ pen, ink, params }) {
  let color; // If color is undefined, ink will be random. 
  if (params.includes("red")) color = [255, 0, 0, 60]; // RGBA
  if (pen.drawing) ink(color).line(pen.px, pen.py, pen.x, pen.y);
}

export const system = "nopaint";