#version 300 es
precision highp float;

in vec2 v_texc;
out vec4 outColor;

uniform sampler2D iTexture;
uniform float iTime;
uniform vec2 iMouse;
uniform vec2 iResolution;

uniform int fogIterations;
uniform int shadowIterations;

const bool colorMode = true;

uniform float focalLength;
uniform float screenScale;
uniform float shadowRange;
uniform float cameraDistance;
uniform float volumeRadius;
uniform float inputRadius;
uniform float innerDensity;
uniform float outerDensity;
uniform float anisotropy;
uniform float lightPower;
uniform vec3 lightDirection;
uniform vec3 bgColor;
uniform vec3 lightColor;

vec3 normLightDirection;

// Constants
const float PI = 3.14159265359;
const float PI_4 = PI/4.;
const float EPSILON = 1e-10;
const vec3 PLANE_NORMAL = vec3(0., 0., -1.);

// Utils
float random(vec2 p)
{
    vec3 p3 = fract(vec3(p.xyx) * .1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}

float sRGB(float x)
{
    if (x <= 0.00031308)
        return 12.92 * x;
    else
        return 1.055*pow(x, (1.0 / 2.4)) - 0.055;
}

float maxv(vec3 v)
{
    return max(max(v.x, v.y), v.z);
}

bool inBounds(vec2 coords)
{
    return coords.x >= 0. && coords.x <= 1. && coords.y >= 0. && coords.y <= 1.;
}

mat4 rotationMatrix(vec3 axis, float angle)
{
    axis = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;
    return mat4(oc * axis.x * axis.x + c,
            oc * axis.x * axis.y - axis.z * s,
            oc * axis.z * axis.x + axis.y * s,
            0.0,
            oc * axis.x * axis.y + axis.z * s,
            oc * axis.y * axis.y + c,
            oc * axis.y * axis.z - axis.x * s,
            0.0,
            oc * axis.z * axis.x - axis.y * s,
            oc * axis.y * axis.z + axis.x * s,
            oc * axis.z * axis.z + c,
            0.0,
            0.0,
            0.0,
            0.0,
            1.0);
}

// Guts
float hgPhase(vec3 dirIn, vec3 dirOut)
{
    return PI_4 * (1. - anisotropy * anisotropy) / pow(1. + anisotropy * (anisotropy - 2. * dot(dirIn, dirOut)), 1.5);
}

vec2 worldToDensityMap(vec2 coords)
{
    return .5 * (screenScale/-cameraDistance) * coords - vec2(.5);
}

vec4 getColor(vec3 pos)
{
    if (abs(pos.z) > volumeRadius)
    {
      return vec4(0.);
    }
    vec4 outColor = vec4(bgColor, outerDensity);
    vec2 imgCoords = worldToDensityMap(pos.xy) + vec2(1.);
    if (abs(pos.z) < inputRadius && inBounds(imgCoords))
    {
        outColor.xyz = texture(iTexture, imgCoords).xyz;
        outColor.w = maxv(outColor.xyz) * innerDensity;
    }
    return outColor;
}

float zPlaneIntersect(vec3 ro, vec3 rd, float z)
{
    float denom = dot(rd, PLANE_NORMAL);
    if (abs(denom) < EPSILON)
    {
        denom = EPSILON;
    }
    return -(dot(ro, PLANE_NORMAL) + z) / dot(rd, PLANE_NORMAL);
}

vec3 directLight(vec3 pos, vec3 rd, float headStart)
{
    vec3 ro = pos;
    vec3 volAbs = vec3(1.);
    float stepDist;

    float nearIntersectionDist = zPlaneIntersect(ro, normLightDirection, -volumeRadius);
    float farIntersectionDist = zPlaneIntersect(ro, normLightDirection, volumeRadius);

    float traceDist = max(nearIntersectionDist, farIntersectionDist);
    traceDist = min(traceDist, shadowRange);

    vec3 previousPos;
    for (int i = 1; i < shadowIterations + 1; i += 1)
    {
        previousPos = pos;
        pos = ro - normLightDirection * (float(i) + headStart) / float(shadowIterations) * traceDist;
        vec4 colorValue = getColor(pos);
        volAbs *= vec3(exp(-colorValue.w * length(pos - previousPos) * colorValue.xyz));
    }
    return lightPower * lightColor * volAbs * hgPhase(-normLightDirection, rd);
}

vec3 post(vec3 col)
{
    col.x = sRGB(col.x);
    col.y = sRGB(col.y);
    col.z = sRGB(col.z);
    return col;
}

void main()
{
    normLightDirection = normalize(lightDirection);
    vec2 uv = v_texc * 2. - vec2(1.);

    vec3 ro = vec3(0., 0., cameraDistance);
    vec3 rd = normalize(vec3(uv, focalLength));

    float nearIntersectionDist = zPlaneIntersect(ro, rd, -volumeRadius);
    float farIntersectionDist = zPlaneIntersect(ro, rd, volumeRadius);
    float traceDist = abs(nearIntersectionDist - farIntersectionDist);

    vec3 volCol = vec3(0.);
    vec3 volAbs = vec3(1.);
    vec3 pos = ro + rd * nearIntersectionDist;
    vec3 previousPos, stepAbs, stepCol;
    float headStartCam = random(iResolution.x * v_texc + iTime);
    float headStartShadow = random(iResolution.x * v_texc - iTime);

    for (int i = 1; i < fogIterations + 1; i++)
    {
        previousPos = pos;
        pos = ro + rd * (float(i)+headStartCam) / float(fogIterations) * traceDist + rd * nearIntersectionDist;
        vec4 colorValue = getColor(pos);
        stepAbs = exp(-colorValue.w * length(pos - previousPos) * colorValue.xyz);
        stepCol = vec3(1.) - stepAbs;
        volCol += stepCol * volAbs * directLight(pos, rd, headStartShadow);
        volAbs *= stepAbs;
    }

    vec3 color = post(volCol);
    outColor = vec4(color, 1.);
}