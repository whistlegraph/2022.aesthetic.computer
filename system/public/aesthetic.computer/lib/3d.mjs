// 3D (GPU)
// Render geometry and scenes on the GPU via Three.js.
// Also handles VR scenes.

import * as THREE from "../dep/three/three.module.js";
import { VRButton } from "../dep/three/VRButton.js";
import { radians, rgbToHex } from "./num.mjs";

let scene,
  renderer,
  camera,
  disposal = [],
  //pixels,
  target;

let jiggleForm, needsSphere = false;

let button, vrSession, controller1, controller2; // VR Specific.

export const penEvents = []; // VR pointer events. 
export const bakeQueue = [];
export const status = { alive: false };

export function checkForRemovedForms(formsBaked) {
  const currentFormIDs = scene.children.map(c => c.aestheticID).filter(Boolean);

  const currentForms = {};
  scene.children.forEach(c => {
    if (c.aestheticID !== undefined) currentForms[c.aestheticID] = c;
  });

  // console.log(formsBaked, currentFormIDs, scene.children);
  const formIDsToRemove = currentFormIDs.filter(f => !formsBaked.includes(f));

  // Remove objects.
  formIDsToRemove.forEach(id => removeObjectsWithChildren(currentForms[id]));

}

export function initialize(wrapper, loop) {
  renderer = new THREE.WebGLRenderer({
    alpha: false,
    preserveDrawingBuffer: true,
  });

  renderer.sortObjects = false;
  renderer.xr.enabled = true;
  renderer.xr.setFramebufferScaleFactor(1);
  renderer.xr.setFoveation(0);
  renderer.preserveDrawingBuffer = true;

  renderer.domElement.dataset.type = "3d";

  scene = new THREE.Scene();
  // scene.fog = new THREE.Fog(0x111111, 0.5, 2); // More basic fog.
  scene.fog = new THREE.FogExp2(0x030303, 0.5);
  //scene.fog = new THREE.FogExp2(0x030303, 0.5);

  // Set up VR.
  button = VRButton.createButton(renderer, function start(session) {
    console.log("🕶️️ VR Session started.");

    // Setup VR controllers.
    function onSelectStart() {
      this.userData.isSelecting = true;
      penEvent("touch", this);
    }

    function onSelectEnd() {
      this.userData.isSelecting = false;
      penEvent("lift", this);
    }

    function onSqueezeStart() {
      this.userData.isSqueezing = true;
      this.userData.positionAtSqueezeStart = this.position.y;
      this.userData.scaleAtSqueezeStart = this.scale.x;
    }

    function onSqueezeEnd() { this.userData.isSqueezing = false; }

    controller1 = renderer.xr.getController(0);
    controller1.name = "controller-1";
    controller1.addEventListener('selectstart', onSelectStart);
    controller1.addEventListener('selectend', onSelectEnd);
    controller1.addEventListener('squeezestart', onSqueezeStart);
    controller1.addEventListener('squeezeend', onSqueezeEnd);
    scene.add(controller1);

    controller2 = renderer.xr.getController(1);
    controller2.name = "controller-2";
    controller2.addEventListener('selectstart', onSelectStart);
    controller2.addEventListener('selectend', onSelectEnd);
    controller2.addEventListener('squeezestart', onSqueezeStart);
    controller2.addEventListener('squeezeend', onSqueezeEnd);
    scene.add(controller2);


    // Create some geometry for each controller.
    // const wandLen = 0.2;
    // const wandOffset = 0.075;
    // const geometry = new THREE.CylinderGeometry(0.0015, 0.0015, 0.2, 32);
    // geometry.rotateX(- Math.PI / 2);
    //geometry.translate(0, 0, - (wandLen / 2) + wandOffset);
    // const material = new THREE.MeshBasicMaterial({
    //   flatShading: true,
    //   color: new THREE.Color(1, 0.5, 1)
    // });

    // material.opacity = 0.5;
    // material.transparent = true;

    // const mesh = new THREE.Mesh(geometry, material);

    // const pivot = new THREE.Mesh(new THREE.IcosahedronGeometry(0.0015, 2), material);


    //  pivot.name = 'pivot';
    //  pivot.position.z = - wandLen + wandOffset;
    //  mesh.add(pivot);

    //  controller1.add(mesh.clone());
    //  controller2.add(mesh.clone());

    vrSession = session;

    renderer.setAnimationLoop((now) => loop(now, true));
  }, function end() {
    renderer.setAnimationLoop(null);
    console.log("🕶️ VR Session ended.");
    vrSession = null;
  }); // Will return `undefined` if VR is not supported.

  if (button) document.body.append(button);

  wrapper.append(renderer.domElement); // Add renderer to dom.
  status.alive = true;
}

export function bake({ cam, forms, color }, { width, height }, size) {

  // Only instantiate some things once.
  if (!target || target.width !== width || target.height !== height) {
    target = new THREE.WebGLRenderTarget(width, height);
    renderer.setSize(size.width, size.height);
    renderer.setPixelRatio(1 / 2.2);
    // renderer.setRenderTarget(target); // For rendering offsceen.
    // pixels = new Uint8Array(width * height * 4);
    const fov = 80;
    const aspect = width / height;
    const near = 0.01;
    const far = 1000;
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  }

  // 🎥 Camera
  if (!vrSession) {
    camera.rotation.order = "YXZ"; // Set to match the software renderer.
    camera.rotation.set(radians(cam.rotation[0]), radians(cam.rotation[1]), 0);
    camera.scale.set(...cam.scale)
    camera.position.set(...cam.position);
  }

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

      disposal.push({
        keep: f.gpuKeep,
        form: tri,
        resources: [tex, material, geometry],
      });
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
      material.side = THREE.DoubleSide;
      material.transparent = true;
      material.opacity = f.alpha;
      material.depthWrite = true;
      material.depthTest = true;
      material.linewidth = 1;
      material.vertexColors = true;
      material.vertexAlphas = true;

      let points = [];
      let pointColors = [];

      // Generate points from vertices if there are any to load at the start.
      if (f.vertices.length > 0) {
        points = f.vertices.map((v) => new THREE.Vector3(...v.pos));
        pointColors = f.vertices.map((v) => new THREE.Vector4(...v.color));
      }

      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(f.MAX_POINTS * 3);
      const colors = new Float32Array(f.MAX_POINTS * 4);

      // CTO Rapter Notes:

      /*
      *** Optimized Vertex Model for Dynamic Data ***

      - Future line renderer...

      - Each position is a Float32 right now.
      - These need to be carved up to store more data.
      - So `positions` should just become `vertices`.

      - Of the 32 bits.
        - 24 bits per x, y or z 
        - 1 byte left over
          - 0-8 would be indexed color that pulls from a shader const
          - 0-8 for alpha
          - (1bit) flag properties
            blinking
          - oscillating / lerping
          - left for everything else
      */

      for (let i = 0; i < points.length; i += 1) {
        const posStart = i * 3;
        positions[posStart] = points[i].x;
        positions[posStart + 1] = points[i].y;
        positions[posStart + 2] = points[i].z;
      }

      for (let i = 0; i < pointColors.length; i += 1) {
        const colStart = i * 4;
        colors[colStart] = pointColors[i].x / 255;
        colors[colStart + 1] = pointColors[i].y / 255;
        colors[colStart + 2] = pointColors[i].z / 255;
        colors[colStart + 3] = pointColors[i].w / 255;
      }

      geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3)
      );

      geometry.setAttribute(
        "color",
        new THREE.BufferAttribute(colors, 4, true)
      );

      const lineb = new THREE.LineSegments(geometry, material);

      // Custom properties added from the aesthetic.computer runtime.
      // TODO: Bunch all these together on both sides of the worker. 22.10.30.16.32
      lineb.ac_length = points.length;
      lineb.ac_lastLength = lineb.ac_length;
      lineb.ac_MAX_POINTS = f.MAX_POINTS;
      lineb.aestheticID = f.uid;

      lineb.translateX(f.position[0]);
      lineb.translateY(f.position[1]);
      lineb.translateZ(f.position[2]);
      lineb.rotateX(radians(f.rotation[0]));
      lineb.rotateY(radians(f.rotation[1]));
      lineb.rotateZ(radians(f.rotation[2]));
      lineb.scale.set(...f.scale);

      scene.add(lineb);

      geometry.setDrawRange(0, points.length);
      geometry.attributes.position.needsUpdate = true;
      geometry.attributes.color.needsUpdate = true;
      geometry.computeBoundingBox();
      geometry.computeBoundingSphere();

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

      /*
      line.translateX(f.position[0]);
      line.translateY(f.position[1]);
      line.translateZ(f.position[2]);
      line.rotateX(radians(f.rotation[0]));
      line.rotateY(radians(f.rotation[1]));
      line.rotateZ(radians(f.rotation[2]));
      */

      //console.log("form transform to:", fu.position, performance.now());
    }

    // Add vertices to geometry:buffered objects.
    if (f.update === "form:buffered:add-vertices") {
      const formUpdate = f;

      const form = scene.getObjectByProperty("aestheticID", formUpdate.uid);
      if (!form) return;

      jiggleForm = form; // for jiggleForm

      // See: https://threejs.org/docs/#manual/en/introduction/How-to-update-things,
      //      https://jsfiddle.net/t4m85pLr/1

      if (form) {
        // Flush if necessary.
        if (formUpdate.reset) {
          form.ac_length = 0;
          form.ac_lastLength = 0;
        }

        // Add points.
        const points = [];
        const pointColors = [];

        for (let i = 0; i < formUpdate.vertices.length; i += 1) {
          points.push(new THREE.Vector3(...formUpdate.vertices[i].pos));
          pointColors.push(new THREE.Vector4(...formUpdate.vertices[i].color));
        }

        // Set custom properties on the form to keep track of where we are
        // in the previously allocated vertex buffer.
        form.ac_lastLength = form.ac_length;
        form.ac_length += points.length;

        // ⚠️ Reset the buffer if we were go over the max, by default.
        if (form.ac_length > form.ac_MAX_POINTS) {
          form.ac_lastLength = 0;
          form.ac_length = points.length;
        }

        // TODO: How to make the buffer circular?
        //       (When would I want this?) 22.10.30.17.14

        const positions = form.geometry.attributes.position.array;
        const colors = form.geometry.attributes.color.array;

        for (let i = 0; i < points.length; i += 1) {
          const posStart = (form.ac_lastLength + i) * 3;
          positions[posStart] = points[i].x;
          positions[posStart + 1] = points[i].y;
          positions[posStart + 2] = points[i].z;
        }

        for (let i = 0; i < pointColors.length; i += 1) {
          const colStart = (form.ac_lastLength + i) * 4;
          colors[colStart] = pointColors[i].x / 255;
          colors[colStart + 1] = pointColors[i].y / 255;
          colors[colStart + 2] = pointColors[i].z / 255;
          colors[colStart + 3] = pointColors[i].w / 255;
        }

        form.geometry.setDrawRange(0, form.ac_length);
        form.geometry.attributes.position.needsUpdate = true;
        form.geometry.attributes.color.needsUpdate = true;

        form.geometry.computeBoundingBox();
        form.geometry.computeBoundingSphere();

        needsSphere = true; // for jiggleForm
      }
    }


  });

  // In case we ever need to render off screen...
  //renderer.render(scene, camera);
  //renderer.readRenderTargetPixels(target, 0, 0, width, height, pixels);
  //return pixels;

  return forms.map(f => f.uid); // Return UIDs of every added or adjusted form.
}

function handleController(controller) {
  // console.log(renderer.xr.getFrame()) // In case I need more info.
  const userData = controller.userData;

  // TODO: Implement controller squeeze?
  //if (userData.isSqueezing === true) {
  //const delta = (controller.position.y - userData.positionAtSqueezeStart) * 5;
  //const scale = Math.max(0.1, userData.scaleAtSqueezeStart + delta);
  //pivot.scale.setScalar(scale);
  //painter.setSize(scale);
  //}

  // Record pen events to send through to the piece.
  if (controller.userData.lastPosition) {
    const delta = controller.position.distanceTo(controller.userData.lastPosition);
    // Add a small deadzone to controller movements.
    if (delta > 0.0001) { penEvent(userData.isSelecting ? "draw" : "move", controller); }
  }

  controller.userData.lastPosition = { ...controller.position };

  // TODO: Also return controller angle here.
  return { pos: controller.position, rot: controller.rotation };
}

// Get controller data to send to a piece.
export function pollControllers() {
  if (vrSession) {
    handleController(controller1);
    const pen = handleController(controller2);
    return { events: penEvents.slice(), pen };
  }
}

// Create a pen event.
function penEvent(name, controller) {
  penEvents.push({
    name,
    pointer: parseInt(controller.name.split("-")[1]),
    pos: { ...controller.position },
    rot: { ...controller.rotation },
    lastPosition: { ...controller.userData.lastPosition }
  });
}

// Hooks into the requestAnimationFrame in the main system, and 
// setAnimationLoop for VR.
export function render(now) {
  //console.log(test);
  //console.log(scene, now)
  // TODO: If keeping the renderer alive between pieces, then make sure to
  //       top rendering! 22.10.14.13.05
  if (scene && camera) {
    // CTO Rapter's line jiggling request:

    /*
    if (jiggleForm) {
      const positions = jiggleForm.geometry.attributes.position.array;

      const jiggleLevel = 0.001;

      for (let i = 0; i < positions.length; i += 6) {
      const randomJiggle1 = jiggleLevel / 2 - Math.random() * jiggleLevel;
      const randomJiggle2 = jiggleLevel / 2 - Math.random() * jiggleLevel;
      const randomJiggle3 = jiggleLevel / 2 - Math.random() * jiggleLevel;
        positions[i] += randomJiggle1;
        positions[i + 1] += randomJiggle2;
        positions[i + 2] += randomJiggle3;
        positions[i + 3] += randomJiggle1;
        positions[i + 4] += randomJiggle2;
        positions[i + 5] += randomJiggle3;
      }

      jiggleForm.geometry.setDrawRange(0, jiggleForm.ac_length);
      jiggleForm.geometry.attributes.position.needsUpdate = true;
    }

    if (jiggleForm && needsSphere) jiggleForm.geometry.computeBoundingSphere();
    needsSphere = false;
    */

    // console.log("position at render:", controller2?.position, performance.now());

    // Garbage is collected in `bios` under `BIOS:RENDER`
    renderer.render(scene, camera);
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
  button?.remove();
  renderer.dispose();
  scene = undefined;
  target = undefined;
  status.alive = false;
}

export function collectGarbage() {
  // ♻️ De-allocation.
  // Note: This should do the trick, but I should still
  //       check for leaks. 22.10.14.02.21
  disposal.forEach((d, i) => {
    if (d.keep === false) {
      d.resources.forEach((r) => r.dispose());
      d.form.removeFromParent();
    }
    disposal[i] = undefined;
  });
  // Free memory from forms if they have been marked as `keep === false`.
  // (Or only drawn one time.)
  disposal = disposal.filter(Boolean);
}

// Completely dispose of an object and all its children.
// TODO: Eventually replace disposal's "resources" with this. 22.10.31.17.44
// Via: https://stackoverflow.com/a/73827012/8146077
function removeObjectsWithChildren(obj) {

  if (obj.children.length > 0) {
    for (var x = obj.children.length - 1; x >= 0; x--) {
      removeObjectsWithChildren(obj.children[x]);
    }
  }

  if (obj.geometry) { obj.geometry.dispose(); }

  if (obj.material) {
    if (obj.material.length) {
      for (let i = 0; i < obj.material.length; ++i) {

        if (obj.material[i].map) obj.material[i].map.dispose();
        if (obj.material[i].lightMap) obj.material[i].lightMap.dispose();
        if (obj.material[i].bumpMap) obj.material[i].bumpMap.dispose();
        if (obj.material[i].normalMap) obj.material[i].normalMap.dispose();
        if (obj.material[i].specularMap) obj.material[i].specularMap.dispose();
        if (obj.material[i].envMap) obj.material[i].envMap.dispose();

        obj.material[i].dispose()
      }
    }
    else {
      if (obj.material.map) obj.material.map.dispose();
      if (obj.material.lightMap) obj.material.lightMap.dispose();
      if (obj.material.bumpMap) obj.material.bumpMap.dispose();
      if (obj.material.normalMap) obj.material.normalMap.dispose();
      if (obj.material.specularMap) obj.material.specularMap.dispose();
      if (obj.material.envMap) obj.material.envMap.dispose();

      obj.material.dispose();
    }
  }

  obj.removeFromParent();

  return true;
}