import * as THREE from "../dep/three/three.module.js";

const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(0.25);

const size = new THREE.Vector2();
renderer.getDrawingBufferSize(size);

const target = new THREE.WebGLRenderTarget(size.width, size.height);
renderer.setRenderTarget(target);

// 🎥 Camera
const fov = 75;
const aspect = window.innerWidth / window.innerHeight;
const near = 0.1;
const far = 500;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

camera.position.set(0, 0, 2);
//camera.position.z = 2;

camera.lookAt(0, 0, 0);

const scene = new THREE.Scene();

// Cube
{
  const width = 1; // ui: width
  const height = 1; // ui: height
  const depth = 1; // ui: depth
  const material = new THREE.MeshPhongMaterial({ color: 0x00ffff });
  const geometry = new THREE.BoxGeometry(width, height, depth);
  const cube = new THREE.Mesh(geometry, material);

  cube.rotation.x = 3;
  cube.rotation.y = 2;

  scene.add(cube);
}

// Line
{
  const material = new THREE.LineBasicMaterial({ color: 0x0000ff });

  const points = [];
  points.push(new THREE.Vector3(-1, 0, 0));
  points.push(new THREE.Vector3(0, 1, 0));
  points.push(new THREE.Vector3(1, 0, 0));

  const geometry = new THREE.BufferGeometry().setFromPoints(points);

  const line = new THREE.Line(geometry, material);
  scene.add(line);
}

// Light
{
  const color = 0xffffff;
  const intensity = 1;
  const light = new THREE.DirectionalLight(color, intensity);
  light.position.set(-1, 2, 4);
  scene.add(light);
}

renderer.render(scene, camera);

const pixels = new Uint8Array(size.width * size.height * 4);

// Read all pixels
renderer.readRenderTargetPixels(
  target,
  0,
  0,
  size.width,
  size.height,
  pixels
);

console.log("Baked pixels: ", pixels);

const domElement = renderer.domElement;
domElement.dataset.type = "3d";

export { domElement };