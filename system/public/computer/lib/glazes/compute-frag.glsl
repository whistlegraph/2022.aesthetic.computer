#version 300 es
precision highp float;

in vec2 v_texc;
out vec4 outColor;

uniform sampler2D A;
uniform vec2 iMouse;
uniform vec2 iResolution;
uniform float iTime;

void main() {
  vec3 color = vec3(0.);

  for (int i = -1; i <= 1; ++i)
  {
    for (int j = -1; j <= 1; ++j)
    {
      color += texture(A, v_texc.xy + vec2(i, j)/iResolution.xy).xyz;
    }
  }
  color /= 9.;

  outColor = vec4(color, 1.0);
}
