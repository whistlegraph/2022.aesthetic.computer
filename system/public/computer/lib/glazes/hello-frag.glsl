#version 300 es
precision highp float;

in vec2 v_texc;
out vec4 outColor;

uniform sampler2D iTexture;
uniform vec2 iMouse;
uniform vec2 iResolution;
uniform float iTime;
uniform float redMix;

void main() {
  vec3 color = mix(
    vec4(redMix, 0.0, 0.0, 1.0),
    texture(iTexture, vec2(v_texc.x, v_texc.y)),
    0.5
  ).xyz;

  outColor = vec4(color, 1.0);
}
