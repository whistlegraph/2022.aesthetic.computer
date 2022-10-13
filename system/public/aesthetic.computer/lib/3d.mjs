// 3D (GPU)
// Render geometry on the GPU via Three.js.

// TODO: Keep track of what forms get added, so they don't have to be
//       re-instantiated every frame? 22.10.10.21.27
// TODO: I could be sending alot less data over the wire.
// TODO: Add indices to geometry.

import * as THREE from "../dep/three/three.module.js";
import { radians, rgbToHex } from "./num.mjs";

const renderer = new THREE.WebGLRenderer({
  alpha: false,
  preserveDrawingBuffer: true,
});
renderer.domElement.dataset.type = "3d";

const disposal = [];

let camera;
let scene = new THREE.Scene();

let target;
// let pixels;

export function bake({ cam, forms, color }, { width, height }, size) {
  // Only make instantiate new buffers if necessary.
  if (!target || target.width !== width || target.height !== height) {
    target = new THREE.WebGLRenderTarget(width, height);
    renderer.setSize(size.width, size.height);
    renderer.setPixelRatio(1 / 2.2);
    // renderer.setRenderTarget(target); // For rendering offsceen.
    // pixels = new Uint8Array(width * height * 4);
    const fov = 80;
    const aspect = width / height;
    const near = 0.1;
    const far = 1000;
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  }

  // 🎥 Camera
  camera.rotation.order = "YXZ"; // Set to match the software renderer.
  camera.rotation.set(radians(cam.rotation[0]), radians(cam.rotation[1]), 0);
  camera.position.set(...cam.position);

  if (!Array.isArray(forms)) forms = [forms];

  // Check f.type for adding new forms, or f.update for modifying added forms.
  forms.forEach((f) => {
    if (f.type === "triangle") {
      // Add texture.
      const tex = new THREE.DataTexture(
        f.texture.pixels,
        f.texture.width,
        f.texture.height,
        THREE.RGBAFormat
      );

      tex.needsUpdate = true;

      const material = new THREE.MeshBasicMaterial({ map: tex });
      material.side = THREE.DoubleSide;
      material.transparent = true;
      material.opacity = f.alpha;
      material.depthWrite = true;
      material.depthTest = true;

      const points = f.vertices.map((v) => new THREE.Vector3(...v.pos));
      const geometry = new THREE.BufferGeometry().setFromPoints(points);

      geometry.setAttribute(
        "uv",
        new THREE.BufferAttribute(new Float32Array(f.uvs), 2)
      );

      const tri = new THREE.Mesh(geometry, material);

      tri.translateX(f.position[0]);
      tri.translateY(f.position[1]);
      tri.translateZ(f.position[2]);
      tri.rotateX(radians(f.rotation[0]));
      tri.rotateY(radians(f.rotation[1]));
      tri.rotateZ(radians(f.rotation[2]));
      tri.scale.set(...f.scale);

      scene.add(tri);

      disposal.push(tex, material, geometry);
    }

    if (f.type === "quad") {
      // Add texture.
      const tex = new THREE.DataTexture(
        f.texture.pixels,
        f.texture.width,
        f.texture.height,
        THREE.RGBAFormat
      );
      tex.needsUpdate = true;

      const material = new THREE.MeshBasicMaterial({ map: tex });
      material.side = THREE.DoubleSide;
      //material.transparent = true;
      material.opacity = f.alpha;
      material.alphaTest = 0.5;
      material.depthWrite = false;
      material.depthTest = true;

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

      disposal.push(tex, material, geometry);
    }

    if (f.type === "line") {
      const material = new THREE.LineBasicMaterial({
        color: rgbToHex(...(f.color || color)),
      });
      material.transparent = true;
      material.opacity = f.alpha;
      material.depthWrite = true;
      //material.depthTest = false;

      const points = f.vertices.map((v) => new THREE.Vector3(...v.pos));
      const geometry = new THREE.BufferGeometry().setFromPoints(points);

      // attributes
      const positions = new Float32Array(f.MAX_POINTS * 3); // 3 vertices per point

      geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3)
      );

      // drawcalls
      geometry.setDrawRange(0, points.length);

      const line = new THREE.Line(geometry, material);

      line.translateX(f.position[0]);
      line.translateY(f.position[1]);
      line.translateZ(f.position[2]);
      line.rotateX(radians(f.rotation[0]));
      line.rotateY(radians(f.rotation[1]));
      line.rotateZ(radians(f.rotation[2]));
      line.scale.set(...f.scale);

      scene.add(line);
      disposal.push(material, geometry);

      line.aestheticID = f.uid;
    }

    // If we are updating an existing form.
    if (f.update === "add-vertices") {

      // TODO: Make this generic / hold onto
      //       IDs for each form.
      //       Should I maintain my own IDs or
      //       actually send the ones
      //       back from Three JS?
      // 
      //       Actually I can just use a
      //       dictionary here... 22.10.12.15.30

      const line = scene.getObjectByProperty( 'aestheticID' , f.uid);

      console.log(line?.geometry)


    }

    //sconsole.log(forms, scene);
  });

  // In case we need to render off screen.
  //renderer.render(scene, camera);
  //renderer.readRenderTargetPixels(target, 0, 0, width, height, pixels);
  //return pixels;
}

// See: https://threejs.org/docs/#manual/en/introduction/How-to-update-things,
//      https://jsfiddle.net/t4m85pLr/1
function updatePositions(form) {
  const positions = form.geometry.attributes.position.array;

  let x, y, z, index;
  x = y = z = index = 0;

  for (let i = 0, l = form.MAX_POINTS; i < l; i++) {
    positions[index++] = x;
    positions[index++] = y;
    positions[index++] = z;

    x += (Math.random() - 0.5) * 30;
    y += (Math.random() - 0.5) * 30;
    z += (Math.random() - 0.5) * 30;
  }
}

export function render() {
  if (scene != undefined) {
    renderer.render(scene, camera);
    // disposal.forEach((d) => d.dispose()); // Free memory from forms.
    // disposal.length = 0;
    // scene = undefined; // Dispose of scene.
  }
}

export function clear() {
  renderer.clear();
}

export const domElement = renderer.domElement;