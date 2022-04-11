// 🌚 Glaze (Shader Uniforms) 2022.04.11.04.52
// Already available: iTexture, iFrame, iMouse, iResolution

// ***How to add new glazes?***

//   1. Place a fragment shader named `myglaze-frag.glsl` in this directory.
//   2. Make a new `const` below and follow the pattern to notate your types.

// Fill this out for `digitpain_a`.
const digitpain_a = {
  "1i:...": 0,
};

// Template called `hello`. You can play with this in the `nail` disk.
const hello = {
  "1f:redMix": 0.1,
};

// Used for `prompt`.
const original = {
  "1i:fogIterations": 20,
  "1i:shadowIterations": 5,
  "1f:focalLength": 1,
  "1f:screenScale": 1,
  "1f:shadowRange": 1,
  "1f:cameraDistance": 2.236,
  "1f:volumeRadius": 0.005,
  "1f:inputRadius": 0.005,
  "1f:innerDensity": 20,
  "1f:outerDensity": 10.1,
  "1f:anisotropy": -0.123,
  "1f:lightPower": 4,
  "3f:lightColor": [1, 1, 1], // r, g, b
  "3f:lightDirection": [-1, -1, -0.05], // x, y, z
  "3f:bgColor": [0.084, 0.0533, 0.078], // r, g, b,
};

// 3. Add any additional uniforms here!
export default { digitpain_0, hello, original };
