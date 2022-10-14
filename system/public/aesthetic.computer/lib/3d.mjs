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

let drawingForm;

//scene.fog = new THREE.Fog(0x111111, 0.5, 2);
scene.fog = new THREE.FogExp2(0x030303, 0.5);

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

    // *** ✏️ Line ***
    if (f.type === "line") {
      const material = new THREE.LineBasicMaterial({
        color: rgbToHex(...(f.color || color)),
      });
      //material.transparent = true;
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

      const line = new THREE.Line(geometry, material);

      line.ac_length = points.length;
      line.ac_vertsToAdd = [];

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
      drawingForm = form;

      // See: https://threejs.org/docs/#manual/en/introduction/How-to-update-things,
      //      https://jsfiddle.net/t4m85pLr/1
      if (form) {
        // 0. Flush the vertsToAdd cache if necessary.
        if (formUpdate.flush) form.ac_vertsToAdd.length = 0;

        const points = [];

        for (let i = 0; i < formUpdate.vertices.length; i += 1) {
          points.push(new THREE.Vector3(...formUpdate.vertices[i].pos));
        }

        // 1. Filter out every duplicated vertex (so the spline has no duplicate data).
        // take.
        // (These arrive in pairs of two line segment points.)
        // [xy1 xy2] [xy2 xy3] [xy3 xy4] (xy4 will always be missed?)
        //  ^         ^         ^
        //console.log("Update vertices:", formUpdate.vertices);

        // const end = formUpdate.vertices.length;
        // const start = form.ac_vertsToAdd.length > 0 ? 1 : 0;
        // for (let i = start; i < end; i += 2) {
        //   form.ac_vertsToAdd.push(
        //     new THREE.Vector3(...formUpdate.vertices[i].pos)
        //   );
        // }

        // form.ac_vertsToAdd.push(
        //   new THREE.Vector3(...formUpdate.vertices[end - 1].pos)
        // );

        // console.log("Stripped vertices", form.ac_vertsToAdd);

        // 2. Run the spline.
        //if (form.ac_vertsToAdd.length < 4) return;
        // const curve = new THREE.CatmullRomCurve3(
        //   form.ac_vertsToAdd,
        //   false,
        //   "chordal",
        //   0
        // );
        // curve.arcLengthDivisions = 100;
        // const curvePoints = curve.getSpacedPoints(24);

        // console.log("curve points:", curvePoints)

        // 2.5 Skip the spline.
        //let curvePoints = form.ac_vertsToAdd;

        // 3. Add extra vertex back / unpack into line segment compatible data.
        // [xy1, xy2, xy3, xy4]
        //  ^----^*
        //const points = [];
        //for (let i = 1; i < curvePoints.length; i += 1) {
        //  if (i > 0) points.push(curvePoints[i - 1]);
        //  points.push(curvePoints[i]);
        //}

        //form.ac_lastPoints = verts.slice(-1);
        form.ac_vertsToAdd.length = 0; // Ingest added points.

        // Set custom properties on the form to keep track of where we are
        // in the previously allocated vertex buffer.
        form.ac_lastLength = form.ac_length;
        form.ac_length += points.length;

        console.log(form.ac_length);

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

  // Add cursor preview line.

  {
    if (drawingForm) {
      const line = drawingForm;

      const positions = line.geometry.attributes.position.array;

      console.log(line.ac_length);

      const lastStart = (line.ac_length - 1) * 3;
      const previewStart = line.ac_length * 3;
      const previewEnd = (line.ac_length + 1) * 3;

      positions[previewStart] = positions[lastStart];
      positions[previewStart + 1] = positions[lastStart + 1];
      positions[previewStart + 2] = positions[lastStart + 2];

      positions[previewEnd] = cam.centerCached[0];
      positions[previewEnd + 1] = cam.centerCached[1];
      positions[previewEnd + 2] = cam.centerCached[2];

      line.geometry.setDrawRange(0, line.ac_length + 2);
      line.geometry.computeBoundingSphere();
      line.geometry.attributes.position.needsUpdate = true;
    }
  }

  // In case we need to render off screen.
  //renderer.render(scene, camera);
  //renderer.readRenderTargetPixels(target, 0, 0, width, height, pixels);
  //return pixels;
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
