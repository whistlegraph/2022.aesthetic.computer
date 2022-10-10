import * as THREE from "../dep/three/three.module.js";
import { radians } from "./num.mjs";

const renderer = new THREE.WebGLRenderer({ alpha: true });

export function bake({ cam, forms }, { width, height }) {
  renderer.setSize(width, height);

  // TODO: Only make target if necessary.
  const target = new THREE.WebGLRenderTarget(width, height);
  renderer.setRenderTarget(target);

  // TODO: Instantiate camera from `cam`.
  // 🎥 Camera
  const fov = 80;
  const aspect = width / height;
  const near = 0.1;
  const far = 1000;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

  camera.rotation.order = "YXZ";
  camera.rotation.set(radians(cam.rotation[0]), radians(cam.rotation[1]), 0);
  camera.position.set(...cam.position);

  const scene = new THREE.Scene();

  forms.forEach((f) => {
    if (f.type === "triangle") {
      const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
      // TODO: I could be sending alot less data over the wire.
      const points = f.vertices.map((v) => new THREE.Vector3(...v.pos));
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const tri = new THREE.Mesh(geometry, material);
      scene.add(tri);
    }

    if (f.type === "quad") {
      const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
      const geometry = new THREE.PlaneGeometry(2, 2);
      const plane = new THREE.Mesh(geometry, material);
      scene.add(plane);

      // Could these inverted transforms be fixed on the matrix level?
      plane.translateX(f.position[0]);
      plane.translateY(f.position[1]);
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
      scene.add(line);
    }
  });

  renderer.render(scene, camera);

  const pixels = new Uint8Array(width * height * 4);
  renderer.readRenderTargetPixels(target, 0, 0, width, height, pixels);

  return pixels;
}