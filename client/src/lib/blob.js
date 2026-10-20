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

// soft radial sprite used for the satellites' glow
function makeGlowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d");
  const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, "rgba(255,255,255,1)");
  grd.addColorStop(0.18, "rgba(255,255,255,0.85)");
  grd.addColorStop(0.45, "rgba(255,255,255,0.2)");
  grd.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grd;
  g.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
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
  // inner group bobs in zero-g without fighting the GSAP-driven blob.position
  const floater = new THREE.Group();
  blob.add(floater);

  const mobile = window.innerWidth < 768;

  let model = null;
  let disposed = false;
  // On mobile we drop the 3D character model entirely and keep only the
  // wireframe globe (shell) below — lighter to render and less cramped on
  // small screens.
  if (!mobile) {
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

        floater.add(model);
      },
      undefined,
      (err) => console.warn("GLB load failed:", err)
    );
  }

  const shell = new THREE.LineSegments(
    new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(2.0, 2)),
    new THREE.LineBasicMaterial({
      color: 0x5be9b9,
      transparent: true,
      opacity: 0.22,
    })
  );
  scene.add(shell);

  // ---- orbit system: tilted rings, each carrying a glowing satellite whose
  // ring fades behind it like a comet trail ----
  const glowTex = makeGlowTexture();
  const orbits = new THREE.Group();
  scene.add(orbits);
  // tilt = [x, z] in radians; small x keeps them reading as inclined ellipses
  const orbitDefs = [
    { r: 2.2, color: 0x7866ff, tilt: [0.32, 0.38], speed: 0.55, size: 0.3 },
    { r: 2.45, color: 0x5be9b9, tilt: [-0.26, -0.42], speed: -0.38, size: 0.24 },
    { r: 2.75, color: 0x38d6ff, tilt: [0.48, -0.1], speed: 0.24, size: 0.2 },
  ].slice(0, mobile ? 2 : 3);
  const rings = orbitDefs.map((d) => {
    const pivot = new THREE.Group();
    pivot.rotation.set(d.tilt[0], 0, d.tilt[1]);
    const spin = new THREE.Group();
    spin.rotation.y = Math.random() * Math.PI * 2;
    pivot.add(spin);

    const N = 200;
    const pos = new Float32Array((N + 1) * 3);
    const col = new Float32Array((N + 1) * 3);
    const c = new THREE.Color(d.color);
    for (let i = 0; i <= N; i++) {
      const a = (i / N) * Math.PI * 2;
      pos.set([Math.cos(a) * d.r, 0, Math.sin(a) * d.r], i * 3);
      const trail = 0.05 + Math.pow(1 - i / N, 2.4) * 0.65;
      col.set([c.r * trail, c.g * trail, c.b * trail], i * 3);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
    const line = new THREE.Line(
      geo,
      new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    spin.add(line);

    const sat = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: glowTex,
        color: d.color,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    sat.scale.setScalar(d.size);
    sat.position.set(d.r, 0, 0);
    spin.add(sat);

    orbits.add(pivot);
    return { spin, line, sat, speed: d.speed };
  });

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
  const clock = new THREE.Clock();
  let mx = 0;
  let my = 0;
  const onMouse = (e) => {
    mx = (e.clientX / window.innerWidth) * 2 - 1;
    my = (e.clientY / window.innerHeight) * 2 - 1;
  };
  window.addEventListener("mousemove", onMouse, { passive: true });

  function tick() {
    const t = clock.getElapsedTime();
    blob.rotation.y += 0.003; // gentle spin (no X tumble — it'd flip a humanoid)
    floater.position.y = Math.sin(t * 0.9) * 0.08;
    floater.rotation.z = Math.sin(t * 0.6) * 0.03;
    rings.forEach((r, i) => {
      r.spin.rotation.y += r.speed * 0.016;
      r.sat.material.opacity = 0.75 + Math.sin(t * 3 + i * 2) * 0.25;
    });
    // the whole orbit system leans toward the pointer
    orbits.rotation.x += (my * 0.25 - orbits.rotation.x) * 0.04;
    orbits.rotation.y += (mx * 0.35 - orbits.rotation.y) * 0.04;
    orbits.position.copy(blob.position);
    orbits.scale.copy(blob.scale);
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
      window.removeEventListener("mousemove", onMouse);
      rings.forEach((r) => {
        r.line.geometry.dispose();
        r.line.material.dispose();
        r.sat.material.dispose();
      });
      glowTex.dispose();
      envTex.dispose();
      renderer.dispose();
    },
  };
}