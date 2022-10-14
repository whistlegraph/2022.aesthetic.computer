// 3D (GPU)
// Render geometry and scenes on the GPU via Three.js.

// TODO: Keep the renderer / scene alive when returning to the prompt, but
//       destroy it if the user doesn't return?

// TODO: Make use of indexed geometry at some point...

import * as THREE from "../dep/three/three.module.js";
import { radians, rgbToHex } from "./num.mjs";

let scene, renderer, camera, disposal = [], target;
// let pixels;

export const status = { alive: false };

export function initialize(wrapper) {
  renderer = new THREE.WebGLRenderer({
    alpha: false,
    preserveDrawingBuffer: true,
  });

  renderer.domElement.dataset.type = "3d";

  scene = new THREE.Scene();

  // scene.fog = new THREE.Fog(0x111111, 0.5, 2); // More basic fog.
  scene.fog = new THREE.FogExp2(0x030303, 0.5);

  wrapper.append(renderer.domElement);
  status.alive = true;
}

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

  // *** 📐 Geometry ***
  // Check f.type for adding new forms, or f.update for modifying added forms.
  forms.forEach((f) => {
    // *** 🔺 Triangle ***
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
      tri.aestheticID = f.uid;

      disposal.push(tex, material, geometry);
    }

    // *** 🟥 Quad ***
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

      // Could these inverted transforms be fixed on the matrix level?
      plane.translateX(f.position[0]);
      plane.translateY(f.position[1]);
      plane.translateZ(f.position[2]);
      plane.rotateX(radians(f.rotation[0]));
      plane.rotateY(radians(f.rotation[1]));
      plane.rotateZ(radians(f.rotation[2]));
      plane.scale.set(...f.scale);

      scene.add(plane);
      plane.aestheticID = f.uid;

      disposal.push({
        keep: f.gpuKeep,
        form: plane,
        resources: [tex, material, geometry],
      });
    }

    // *** ✏️ Line ***
    if (f.type === "line") {
      const material = new THREE.LineBasicMaterial({
        color: rgbToHex(...(f.color || color)),
      });
      material.transparent = true;
      material.opacity = f.alpha;
      material.depthWrite = true;
      material.depthTest = true;
      material.linewidth = 1;

      const points = f.vertices.map((v) => new THREE.Vector3(...v.pos));
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geometry, material);

      line.translateX(f.position[0]);
      line.translateY(f.position[1]);
      line.translateZ(f.position[2]);
      line.rotateX(radians(f.rotation[0]));
      line.rotateY(radians(f.rotation[1]));
      line.rotateZ(radians(f.rotation[2]));
      line.scale.set(...f.scale);

      scene.add(line);
      line.aestheticID = f.uid;

      disposal.push({
        keep: f.gpuKeep,
        form: line,
        resources: [material, geometry],
      });
    }

    if (f.type === "line:buffered") {
      const material = new THREE.LineBasicMaterial({
        color: rgbToHex(...(f.color || color)),
      });
      material.transparent = true;
      material.opacity = f.alpha;
      material.depthWrite = true;
      material.depthTest = true;
      material.linewidth = 1;

      let points = [];

      // Generate a curve for points if there are any at the start.
      if (f.vertices.length > 0) {
        points = f.vertices.map((v) => new THREE.Vector3(...v.pos));
      }

      const geometry = new THREE.BufferGeometry();

      // attributes
      const positions = new Float32Array(f.MAX_POINTS * 3);

      for (let i = 0; i < points.length; i += 3) {
        positions[i] = points[i].x;
        positions[i + 1] = points[i].y;
        positions[i + 2] = points[i].z;
      }

      geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3)
      );

      geometry.setDrawRange(0, points.length);

      const lineb = new THREE.LineSegments(geometry, material);

      lineb.ac_length = points.length;
      lineb.ac_vertsToAdd = [];

      lineb.translateX(f.position[0]);
      lineb.translateY(f.position[1]);
      lineb.translateZ(f.position[2]);
      lineb.rotateX(radians(f.rotation[0]));
      lineb.rotateY(radians(f.rotation[1]));
      lineb.rotateZ(radians(f.rotation[2]));
      lineb.scale.set(...f.scale);

      scene.add(lineb);
      lineb.aestheticID = f.uid;

      disposal.push({
        keep: f.gpuKeep,
        form: lineb,
        resources: [material, geometry],
      });
    }

    if (f.update === "form:transform") {
      const fu = f; // formUpdate
      const form = scene.getObjectByProperty("aestheticID", fu.uid);
      if (!form) return;

      form.position.set(...fu.position);

      form.rotation.set(
        radians(fu.rotation[0]),
        radians(fu.rotation[1]),
        radians(fu.rotation[2])
      );

      form.scale.set(...fu.scale);
    }

    // Add vertices to geometry:buffered objects.
    if (f.update === "form:buffered:add-vertices") {
      const formUpdate = f;

      // TODO: Make this generic / hold onto
      //       IDs for each form.
      //       Should I maintain my own IDs or
      //       actually send the ones
      //       back from Three JS?
      //
      //       Actually I can just use a
      //       dictionary here... 22.10.12.15.30

      const form = scene.getObjectByProperty("aestheticID", formUpdate.uid);
      if (!form) return;

      // See: https://threejs.org/docs/#manual/en/introduction/How-to-update-things,
      //      https://jsfiddle.net/t4m85pLr/1
      if (form) {
        // 0. Flush the vertsToAdd cache if necessary.
        if (formUpdate.flush) form.ac_vertsToAdd.length = 0;

        const points = [];

        for (let i = 0; i < formUpdate.vertices.length; i += 1) {
          points.push(new THREE.Vector3(...formUpdate.vertices[i].pos));
        }

        form.ac_vertsToAdd.length = 0; // Ingest added points.

        // Set custom properties on the form to keep track of where we are
        // in the previously allocated vertex buffer.
        form.ac_lastLength = form.ac_length;
        form.ac_length += points.length;

        const positions = form.geometry.attributes.position.array;

        for (let i = 0; i < points.length; i += 1) {
          const posStart = (form.ac_lastLength + i) * 3;
          positions[posStart] = points[i].x;
          positions[posStart + 1] = points[i].y;
          positions[posStart + 2] = points[i].z;
        }

        form.geometry.setDrawRange(0, form.ac_length);
        form.geometry.attributes.position.needsUpdate = true;

        //form.geometry.computeBoundingBox();
        form.geometry.computeBoundingSphere();
      }
    }
  });

  // In case we need to render off screen.
  //renderer.render(scene, camera);
  //renderer.readRenderTargetPixels(target, 0, 0, width, height, pixels);
  //return pixels;
}

export function render() {
  // TODO: If keeping the renderer alive between pieces, then make sure to
  //       top rendering! 22.10.14.13.05
  if (scene != undefined) {
    renderer.render(scene, camera);

    // ♻️ De-allocation.
    // TODO: This should do the trick, but I should still check for leaks. 22.10.14.02.21
    disposal.forEach((d, i) => {
      if (d.keep === false) {
        d.resources.forEach((r) => {
          r.dispose();
        });
        d.form.removeFromParent();
      }
      disposal[i] = undefined;
    }); // Free memory from forms if it's been marked as `keep === false`.
    disposal = disposal.filter(Boolean);

    // scene = undefined; // TODO: Dispose of scene when necessary?
  }
}

export function pasteTo(ctx) {
  ctx.drawImage(renderer.domElement, 0, 0);
}

export function clear() {
  renderer.clear();
}

export function kill() {
  renderer.domElement.remove();
  renderer.dispose();
  scene = undefined;
  target = undefined;
  status.alive = false;
}