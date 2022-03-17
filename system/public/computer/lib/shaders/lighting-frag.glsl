#version 300 es
precision highp float;

in vec2 v_texc;
out vec4 outColor;

uniform sampler2D u_tex;
uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;


const int fogIterations = 20;
const int shadowIterations = 5;

const vec3 bgColor = vec3(0.084, 0.533, 0.878);

const bool colorMode = true;

const float focal_length = 1.;
const float shadowRange = 1.;
const float camera_distance = 2.236;
const float volumeRadius = 0.008;
const float inputRadius =  0.008;
const float innerDensity = 20.;
const float outerDensity = 0.0;
const float anisotropy = -0.123;
const float worldRotation = .1;

const float LightPower = 4.;
const vec3 LightCol = vec3(1.);
const vec3 LightDirection = normalize(vec3(-1., -1., -0.05));


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
    return .5 * (focal_length/-camera_distance) * coords - vec2(.5);
}

vec4 getColor(vec3 pos)
{
    vec4 outColor = vec4(bgColor, outerDensity);
    vec2 imgCoords = worldToDensityMap(pos.xy) + vec2(1.);
    if (abs(pos.z) < inputRadius && inBounds(imgCoords))
    {
        outColor.xyz = texture(u_tex, imgCoords).xyz;
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

    float nearIntersectionDist = zPlaneIntersect(ro, LightDirection, -volumeRadius);
    float farIntersectionDist = zPlaneIntersect(ro, LightDirection, volumeRadius);

    float traceDist = max(nearIntersectionDist, farIntersectionDist);
    traceDist = min(traceDist, shadowRange);

    vec3 previousPos;
    for (int i = 1; i < shadowIterations + 1; i += 1)
    {
        previousPos = pos;
        pos = ro - LightDirection * (float(i) + headStart) / float(shadowIterations) * traceDist;
        vec4 colorValue = getColor(pos);
        volAbs *= vec3(exp(-colorValue.w * length(pos - previousPos) * colorValue.xyz));
    }
    return LightPower * LightCol * volAbs * hgPhase(-LightDirection, rd);
}

vec3 post(vec3 col)
{
    col = pow(col, vec3(1.5));
    col = pow(col, vec3(0.7 / 1.8));

    return col;
}

void main()
{
    vec2 uv = v_texc * 2. - vec2(1.);

    vec3 ro = vec3(0., 0., camera_distance);
    vec3 rd = normalize(vec3(uv, focal_length));

    float nearIntersectionDist = zPlaneIntersect(ro, rd, -volumeRadius);
    float farIntersectionDist = zPlaneIntersect(ro, rd, volumeRadius);
    float traceDist = abs(nearIntersectionDist - farIntersectionDist);

    vec3 volCol = vec3(0.);
    vec3 volAbs = vec3(1.);
    vec3 pos = ro + rd * nearIntersectionDist;
    vec3 previousPos, stepAbs, stepCol;
    float headStartCam = random(resolution.x * v_texc + time);
    float headStartShadow = random(resolution.x * v_texc - time);

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
