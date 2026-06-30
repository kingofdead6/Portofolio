import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

// Single-file .glb (geometry + textures all embedded). Self-contained, so it can
// be imported straight from src/assets — Vite bundles & fingerprints it, and the
// ?url suffix gives us the final hashed path to hand to GLTFLoader.
import MODEL_URL from "../assets/dev.glb?url";

function disposeObject(obj) {
  obj.traverse((o) => {
    if (!o.isMesh) return;
    o.geometry?.dispose();
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    mats.forEach((m) => {
      if (!m) return;
      for (const k in m) {
        const v = m[k];
        if (v && v.isTexture) v.dispose();
      }
      m.dispose();
    });
  });
}

export function initThree(canvas) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;

  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  cam.position.set(0, 0, 6);

  // Neutral image-based lighting so the model's PBR materials actually show up.
  // Without an environment, metallic/rough glTF materials render near-black.
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTex;
  pmrem.dispose();

  // `blob` stays a wrapper Group so App.jsx can keep animating .position/.scale.
  const blob = new THREE.Group();
  scene.add(blob);

  let model = null;
  let disposed = false;
  const loader = new GLTFLoader();
  loader.load(
    MODEL_URL,
    (gltf) => {
      if (disposed) {
        disposeObject(gltf.scene);
        return;
      }
      model = gltf.scene;

      // Normalize. ORDER MATTERS: scale first, then recenter in the scaled
      // space. Recentering before scaling leaves the pivot off-centre, so the
      // model orbits the wrapper instead of spinning in place.
      let box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const maxAxis = Math.max(size.x, size.y, size.z) || 1;
      model.scale.setScalar(2.7 / maxAxis); // match the old blob footprint

      box = new THREE.Box3().setFromObject(model); // recompute after scaling
      const center = box.getCenter(new THREE.Vector3());
      model.position.sub(center); // now correctly centred at the wrapper origin

      // If the character faces away from the camera, uncomment:
      // model.rotation.y = Math.PI;

      blob.add(model);
    },
    undefined,
    (err) => console.warn("GLB load failed:", err)
  );

  const shell = new THREE.LineSegments(
    new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(2.0, 2)),
    new THREE.LineBasicMaterial({
      color: 0x5be9b9,
      transparent: true,
      opacity: 0.22,
    })
  );
  scene.add(shell);

  // Env supplies the base light; these add the violet/mint brand tint.
  // Tune intensities to taste.
  scene.add(new THREE.AmbientLight(0x404060, 0.4));
  const key = new THREE.PointLight(0x7866ff, 40, 60);
  key.position.set(5, 5, 6);
  scene.add(key);
  const rim = new THREE.PointLight(0x5be9b9, 30, 60);
  rim.position.set(-6, -3, 3);
  scene.add(rim);
  const dir = new THREE.DirectionalLight(0xffffff, 1.1);
  dir.position.set(0, 4, 6);
  scene.add(dir);

  const mobile = window.innerWidth < 768;
  const offX = mobile ? 0.0 : 1.75;
  blob.position.set(offX, 0.25, 0);
  if (mobile) blob.scale.setScalar(0.8);

  // World-space x that parks the model fully against the left viewport edge,
  // at the model's depth (z=0). Half visible width = tan(fov/2)*dist*aspect.
  // We pull in by ~1 model-radius so it hugs the edge without clipping off.
  const edgeX = (margin = 1.15) => {
    const dist = cam.position.z; // model sits at z = 0
    const halfH = Math.tan((cam.fov * Math.PI) / 360) * dist;
    const halfW = halfH * cam.aspect;
    return -(halfW - margin);
  };

  let raf;
  function tick() {
    blob.rotation.y += 0.003; // gentle spin (no X tumble — it'd flip a humanoid)
    shell.rotation.y -= 0.0016;
    shell.rotation.x += 0.001;
    shell.position.copy(blob.position);
    shell.scale.copy(blob.scale);
    renderer.render(scene, cam);
    raf = requestAnimationFrame(tick);
  }
  raf = requestAnimationFrame(tick);

  const onResize = () => {
    cam.aspect = window.innerWidth / window.innerHeight;
    cam.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  };
  window.addEventListener("resize", onResize);

  return {
    blob,
    shell,
    offX,
    mobile,
    edgeX,
    dispose() {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      if (model) disposeObject(model);
      shell.geometry.dispose();
      shell.material.dispose();
      envTex.dispose();
      renderer.dispose();
    },
  };
}