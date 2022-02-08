#version 300 es

precision highp float;

in vec2 v_texc;
out vec4 outColor;
uniform sampler2D u_tex;
uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;

float focal_length = 1.;

float shadowRange = 1.;
float camera_distance = 2.236;
float thiccness = 0.04;
float lightDir = 3.5 * 3.1415 / 8.;
float innerDensity = 20.;
float outerDensity = 0.3;
float anisotropy = 0.123;
int fogIterations = 20;
int shadowIterations = 7;
//vec3 bgColor = vec3(0.,0.,0.);
vec3 bgColor = vec3(0.684, 0.533, 0.878);
float sketchThickness = .01;

bool trackMouse = false;
bool debugCursor = false;
bool colorMode = true;

#define Pi 3.14159265359

vec3 Normal = vec3(0., 0., -1.);
vec3 LightCol = vec3(4.);
vec3 LightRot = vec3(.02 + 3.14 / 2., 0.32, .2);

float random(vec2 p)
{
  vec3 p3 = fract(vec3(p.xyx) * .1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

mat3 rotationMatrix(vec3 rotEuler){
  float c = cos(rotEuler.x), s = sin(rotEuler.x);
  mat3 rx = mat3(1, 0, 0, 0, c, -s, 0, s, c);
  c = cos(rotEuler.y), s = sin(rotEuler.y);
  mat3 ry = mat3(c, 0, -s, 0, 1, 0, s, 0, c);
  c = cos(rotEuler.z), s = sin(rotEuler.z);
  mat3 rz = mat3(c, -s, 0, s, c, 0, 0, 0, 1);
  return rz * rx * ry;
}

float henneseyGreen(vec3 dirI, vec3 dirO){
  return Pi/4.*(1.-anisotropy*anisotropy) / pow(1.+anisotropy*(anisotropy-2.*dot(dirI, dirO)), 1.5);
}

vec2 worldToDensityMap(vec2 coords)
{
  //return ((focal_length/-camera_distance)*coords*iResolution.y + iResolution.xy/2.)/iResolution.xy;
  return .5 *(focal_length/-camera_distance)*coords - vec2(.5);
}

vec3 getColor(vec3 pos)
{
  if (!colorMode)
  {
    return bgColor;
  }
  vec3 col;
  if (abs(pos.z) < sketchThickness)
  {
    vec4 tex = texture(u_tex, worldToDensityMap(pos.xy)+vec2(1.));
    col = tex.xyz;
  }

  /*
  vec3 teal = vec3(0., 1., 1.);
  // crosshair mouse
  vec2 newMouse = mouse/resolution  - vec2(1.);
  vec2 nonDistortedMouse = vec2((worldToDensityMap(pos.xy) - newMouse)) * vec2(resolution.x/resolution.y, 1.);
  float mouseSize = 2./resolution.x;
  float mouseDensity = 50.;
  if (abs(pos.z) < 2.*mouseSize &&
     ((abs(nonDistortedMouse.x) < mouseSize && abs(nonDistortedMouse.y) < mouseSize * 8.) ||
      (abs(nonDistortedMouse.y) < mouseSize && abs(nonDistortedMouse.x) < mouseSize * 8.)))
  {
      if (abs(nonDistortedMouse.x) > 4.*mouseSize || abs(nonDistortedMouse.y) > 4.*mouseSize)
        col = teal;
  }

  if (abs(nonDistortedMouse.x) < mouseSize && abs(nonDistortedMouse.y) < mouseSize && abs(pos.z) < mouseSize)
  {
      col = vec3(1.);
  }
  */

  return col;

}

float density(vec3 pos)
{
  float d = 0.;
  if (abs(pos.z) < sketchThickness)
  {
    vec2 imgLocation = worldToDensityMap(pos.xy)+vec2(1.);
    if (imgLocation.x < 0. || imgLocation.x > 1. || imgLocation.y < 0. || imgLocation.y > 1.)
    {
      return 0.;
    }
    vec4 tex = texture(u_tex, imgLocation);
    d += max(max(tex.x, tex.y), tex.z);
    d *= innerDensity;
  }


  /* sphere
  vec2 newMouse = mouse/resolution  - vec2(1.);
  float dist = distance(vec3((worldToDensityMap(pos.xy) - newMouse) *
                  vec2(resolution.x/resolution.y, 1.), pos.z), vec3(0.));
  float mouseSize = resolution.x/resolution.y*thiccness/3.;
  if (dist < mouseSize)
  {
      d += 50.;
  }
  */

  // crosshair mouse
  vec2 newMouse = mouse/resolution  - vec2(1.);
  vec2 nonDistortedMouse = vec2((worldToDensityMap(pos.xy) - newMouse)) * vec2(resolution.x/resolution.y, 1.);
  float mouseSize = 1./resolution.x;
  float mouseDensity = 50.;
  if (abs(pos.z) < 1.*mouseSize &&
  ((abs(nonDistortedMouse.x) < mouseSize && abs(nonDistortedMouse.y) < mouseSize) ||
  (abs(nonDistortedMouse.y) < mouseSize && abs(nonDistortedMouse.x) < mouseSize)))
  {
    if (abs(nonDistortedMouse.x) > mouseSize || abs(nonDistortedMouse.y) > mouseSize)
    d += mouseDensity;
  }

  if (abs(nonDistortedMouse.x) < mouseSize && abs(nonDistortedMouse.y) < mouseSize && abs(pos.z) < mouseSize)
  {
    d += mouseDensity;
  }

  /*
  vec2 gridSize = vec2(32./5., 33.);
  float gridDensity = 10.;
  float gridThickness = .11;
  float gridLineThickness = .03;
  if (abs(pos.z - thiccness) < gridThickness)
  {
      if (abs(pos.x*gridSize.x - floor(pos.x * gridSize.x)) < gridLineThickness) d += gridDensity;
      if (abs(pos.y*gridSize.y - floor(pos.y * gridSize.y)) < gridLineThickness) d += gridDensity;
  }
  if (abs(pos.z + thiccness) < gridThickness)
  {
      if (abs(pos.x*gridSize.x- floor(pos.x * gridSize.x)) < gridLineThickness) d += gridDensity;
      if (abs(pos.y*gridSize.y - floor(pos.y * gridSize.y)) < gridLineThickness) d += gridDensity;
  }

  if (abs(pos.z) < gridThickness && abs(gridSize.x * pos.x - floor(gridSize.x * pos.x)) < gridLineThickness)
  {
      d += gridDensity;
  }
  */


  return max(d, outerDensity);
}

vec3 post(vec3 col)
{
  col = pow(col, vec3(1.5));
  //col = col / (1.0 + col);
  //col = pow(col, vec3(1.0 / 1.5));

  //col = mix(col, col * col * (3.0 - 2.0 * col), vec3(1.0));
  col = pow(col, vec3(0.7 / 1.8));

  return col;
}

float zPlaneIntersect(vec3 ro, vec3 rd, float z)
{
  return -(dot(ro, Normal) + z) / dot(rd, Normal);
}

vec3 directLight(vec3 pos, vec3 rd, float headStart, vec3 lightVector)
{
  vec3 ro = pos;
  vec3 oldPos;
  vec3 volAbs = vec3(1.);
  float stepDist;

  float nearIntersectionDist = zPlaneIntersect(ro, lightVector, -thiccness);
  float farIntersectionDist = zPlaneIntersect(ro, lightVector, thiccness);

  float traceDist = max(nearIntersectionDist, farIntersectionDist);
  traceDist = min(traceDist, shadowRange);
  //traceDist = shadowRange;
  for (int i = 0; i < shadowIterations; i++){
    oldPos = pos;
    pos = ro - lightVector * (float(i)+headStart) / float(shadowIterations) * traceDist;
    volAbs *= vec3(exp(-density(pos)*length(pos-oldPos)*getColor(pos)));
  }
  return LightCol * volAbs * henneseyGreen(-lightVector, rd);
}

/*
  vec2 worldToScreen(vec3 pos)
  {
      return iResolution.y * focal_length * pos.xy / (pos.z - camera_distance)
          + iResolution.xy * .5;
  }
  */

/*
  vec2 normalizeTexCoords(vec2 xy)
  {
      return (xy - iResolution.xy/2.0) / iResolution.y;
  }
  */

float sdSegmentSq(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a, ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  vec2 d = pa - ba * h;
  return dot(d, d);
}

void main()
{
  vec2 uv = v_texc * 2. - vec2(1.);

  vec2 tm = -camera_distance*(mouse/resolution*2.-vec2(1.));

  if (!trackMouse)
  {
    tm = vec2(0.);
  }
  vec3 ro = vec3(tm, camera_distance);
  vec3 rd = normalize(vec3(uv+tm/camera_distance, focal_length));

  //uv *= 1.5;
  //ro = vec3(1.-uv.x, 1.-uv.y, camera_distance);
  //rd = vec3(0., 0., 1.);

  vec3 lightVector = normalize(vec3(-1., -1., -.1));


  float nearIntersectionDist = zPlaneIntersect(ro, rd, -thiccness);
  float farIntersectionDist = zPlaneIntersect(ro, rd, thiccness);
  float traceDist = abs(nearIntersectionDist - farIntersectionDist);

  vec3 volCol = vec3(0.);
  vec3 volAbs = vec3(1.);
  vec3 pos = ro + rd * nearIntersectionDist;
  vec3 oldPos, stepAbs, stepCol;
  float headStartCam = random(1024.*v_texc+time);
  float headStartShadow = random(1024.*v_texc-time);
  for (int i = 1; i < fogIterations; i++){
    oldPos = pos;
    pos = ro + rd * (float(i)+headStartCam) / float(fogIterations) * traceDist + rd * nearIntersectionDist;
    stepAbs = exp(-density(pos)*length(pos-oldPos)*getColor(pos));
    stepCol = vec3(1.)-stepAbs;
    volCol += stepCol * volAbs * directLight(pos, rd, headStartShadow, lightVector);
    volAbs *= stepAbs;
  }

  vec3 color = post(volCol);
  outColor = vec4(color, 1.);

  float pixelSize = 30./resolution.x;
  vec2 newMouse = 2.*mouse/resolution - vec2(1.)- uv;
  newMouse *= vec2(resolution.x / resolution.y, 1.);
  if (debugCursor && length(newMouse) < pixelSize)
  {
    //outColor.w = 0.;//pow(length(newMouse)/pixelSize, 2.);
  }


  //outColor = vec4(0.0, 1.0, 0.0, 1.0);
  //outColor = vec4(v_texc*2. - vec2(1.), 0., 1.);

  vec3 green = vec3(0., 1., 0.);

  //outColor = vec4(mix(texture(u_tex, v_texc).xyz, green, 0.5), 1.);

  // outColor = vec4(texture(u_tex, v_texc).xyz, 1.);

  // outColor = vec4(0.0, 1.0, 0.0, 1.0);
}
