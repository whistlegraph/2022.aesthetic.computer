#version 300 es

precision highp float;

in vec2 v_texc;
out vec4 outColor;
uniform sampler2D u_tex;

uniform vec2 mouse;
uniform vec2 resolution;
uniform float time;

float sdSegment(in vec2 p, in vec2 a, in vec2 b)
{
  vec2 pa = p-a, ba = b-a;
  float h = clamp(dot(pa, ba)/dot(ba, ba), 0.0, 1.0);
  return length(pa - ba*h);
}

void main() {
  vec3 color = texture(u_tex, vec2(v_texc.x, 1. - v_texc.y)).xyz;

  float w = 10. / resolution.x;
  float h = 10. / resolution.y;

  float xlength = 30. / resolution.x;
  float ylength = 30. / resolution.y;

  /*
if (!(v_texc.x < mouse.x - w || v_texc.x > mouse.x + w)) {
color = vec3(1., 0., 0.);
}
*/

  /*
// TODO: Make a basic cursor thingy.

if (abs(v_texc.x - mouse.x) < w/2. ||
    abs(v_texc.y - mouse.y) < h/2.) {

  if (
      v_texc.y < mouse.y + ylength &&
      v_texc.y > mouse.y - ylength
      &&
      v_texc.x < mouse.x + xlength &&
      v_texc.x > mouse.x - xlength
  ) {


  color = vec3(1., 0., 0.);
 }

}
*/

  float dist = sdSegment(v_texc, mouse, mouse + vec2(10. / resolution.x, 10. / resolution.y));

  if (dist < .02) { color = vec3(1., 0., 0.)*(.02 - dist)/.02; }

  outColor = vec4(color, 1.0);

  //outColor = vec4(v_texc, 0.0, 1.0);
}