#version 300 es
precision highp float;

in vec2 v_texc;
out vec4 outColor;

uniform sampler2D iTexture;
uniform sampler2D iPost;
uniform vec2 iMouse;
uniform vec2 iResolution;
uniform float iTime;

void main() {
  vec3 color = texture(iTexture, v_texc.xy).xyz;
  /*
  if (max(max(color.x, color.y), color.z) < .8)
  {
    color = vec3(0.);
  }
  else
  {
    color = vec3(1.);
  }
  */
  color.xyz = vec3(max(max(color.x, color.y), color.z));

  vec3 prevColor = texture(iPost, v_texc.xy).xyz;
  outColor = vec4(color*.01+prevColor*.99, 1.0);
}
