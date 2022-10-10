import * as THREE from "../dep/three/three.module.js";
import { radians } from "./num.mjs";

const renderer = new THREE.WebGLRenderer({
  alpha: false,
  preserveDrawingBuffer: true,
});
renderer.domElement.dataset.type = "3d";

let target;
let pixels;
let camera;
let scene;
let needsRender = false;

// TODO: Keep track of what forms get added, so they don't have to be
//       re-instantiated every frame.

export function bake({ cam, forms }, { width, height }, size, cb) {
  // Only make instantiate new buffers if necessary.
  if (!target || target.width !== width || target.height !== height) {
    target = new THREE.WebGLRenderTarget(width, height);
    console.log(target);
    renderer.setSize(size.width, size.height);
    //renderer.setSize(width, height);
    renderer.setPixelRatio(1 / 2.2);
    //renderer.setRenderTarget(target);
    pixels = new Uint8Array(width * height * 4);
    const fov = 80;
    const aspect = width / height;
    const near = 0.1;
    const far = 1000;
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  }

  // 🎥 Camera
  camera.rotation.order = "YXZ"; // Set to match the software renderer.
  camera.rotation.set(
    radians(cam.rotation[0] * -1),
    radians(cam.rotation[1]),
    0
  );
  camera.position.set(...cam.position);

  scene = new THREE.Scene();

  forms.forEach((f) => {
    if (f.type === "triangle") {
      const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
      material.side = THREE.DoubleSide;
      // TODO: I could be sending alot less data over the wire.
      const points = f.vertices.map((v) => new THREE.Vector3(...v.pos));
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const tri = new THREE.Mesh(geometry, material);
      scene.add(tri);
    }

    if (f.type === "quad") {
      // Add texture.
      const dummyDataTex = new THREE.DataTexture(
        f.texture.pixels,
        f.texture.width,
        f.texture.height,
        THREE.RGBAFormat
      );
      dummyDataTex.needsUpdate = true;

      const material = new THREE.MeshBasicMaterial({ map: dummyDataTex });
      material.side = THREE.DoubleSide;
      material.transparent = true;
      material.depthWrite = false;

      const geometry = new THREE.PlaneGeometry(2, 2);
      const plane = new THREE.Mesh(geometry, material);

      scene.add(plane);

      // Could these inverted transforms be fixed on the matrix level?
      plane.translateX(f.position[0]);
      plane.translateY(f.position[1] * -1);
      plane.translateZ(f.position[2]);
      plane.rotateX(radians(f.rotation[0]));
      plane.rotateY(radians(f.rotation[1]));
      plane.rotateZ(radians(f.rotation[2]));

      plane.scale.set(...f.scale);
    }

    if (f.type === "line") {
      const material = new THREE.LineBasicMaterial({ color: 0xff00ff });
      // TODO: I could be sending alot less data over the wire.
      const points = f.vertices.map((v) => new THREE.Vector3(...v.pos));
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geometry, material);

      line.translateX(f.position[0]);
      line.translateY(f.position[1] * -1);
      line.translateZ(f.position[2]);
      line.rotateX(radians(f.rotation[0]));
      line.rotateY(radians(f.rotation[1] * -1));
      line.rotateZ(radians(f.rotation[2]));

      scene.add(line);
    }
  });

  needsRender = true;
  //renderer.render(scene, camera);
  //renderer.readRenderTargetPixels(target, 0, 0, width, height, pixels);
  //return pixels;
}

export function render () {
  if (needsRender) renderer.render(scene, camera);
}

export const domElement = renderer.domElement;
