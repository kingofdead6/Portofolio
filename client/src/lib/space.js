import * as THREE from "three";

/* ------------------------------------------------------------------------
   Deep-space backdrop — one fixed WebGL canvas behind the whole site.

   Layers (back → front):
     1. nebula     fullscreen fbm-noise shader, drifts slowly, hue follows scroll
     2. stars      three depth layers of twinkling point sprites, mouse parallax
     3. warp       the same stars drawn as streaks whose length tracks scroll
                   velocity (invisible at rest, light-speed when you fling)
     4. comets     occasional shooting stars
     5. planet     ringed gas giant with an atmosphere, rises behind Contact

   App.jsx drives it through the returned handle:
     setScroll(progress 0..1), setVelocity(v), setPlanet(0..1), warp(), pause()
   ------------------------------------------------------------------------ */

const NEBULA_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const NEBULA_FRAG = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform float uScroll;
  uniform float uWarp;
  uniform vec2  uMouse;
  uniform vec2  uRes;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x),
               mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    mat2 r = mat2(0.8, -0.6, 0.6, 0.8);
    for (int i = 0; i < OCTAVES; i++) { v += a * noise(p); p = r * p * 2.02; a *= 0.5; }
    return v;
  }

  void main() {
    vec2 uv = vUv;
    vec2 p = (uv - 0.5) * vec2(uRes.x / uRes.y, 1.0);
    p += uMouse * 0.04;
    p.y += uScroll * 1.6;          // travel through the cloud as you scroll

    float t = uTime * 0.018;
    // domain-warped fbm — gives the wispy, folded gas look
    vec2 q = vec2(fbm(p * 1.4 + t), fbm(p * 1.4 - t + 3.1));
    vec2 r = vec2(fbm(p * 1.8 + q * 2.2 + vec2(1.7, 9.2) + t * 1.4),
                  fbm(p * 1.8 + q * 2.2 + vec2(8.3, 2.8) - t));
    float n = fbm(p * 1.6 + r * 1.8);

    // palette shifts violet → indigo → teal down the page
    vec3 violet = vec3(0.47, 0.40, 1.00);
    vec3 indigo = vec3(0.16, 0.10, 0.48);
    vec3 mint   = vec3(0.36, 0.91, 0.73);
    vec3 rose   = vec3(0.95, 0.32, 0.60);
    vec3 cyan   = vec3(0.22, 0.78, 1.00);

    float s = clamp(uScroll, 0.0, 1.0);
    vec3 a = mix(violet, cyan, smoothstep(0.25, 0.75, s));
    vec3 b = mix(mint, rose, smoothstep(0.35, 0.95, s));

    vec3 col = mix(indigo * 0.35, a, smoothstep(0.35, 0.95, n));
    col = mix(col, b, smoothstep(0.55, 1.0, r.y) * 0.55);
    col += a * pow(max(q.x, 0.0), 6.0) * 0.6;   // bright filaments

    // dust lanes — dark veins cutting through the glow
    float dust = smoothstep(0.45, 0.62, fbm(p * 3.2 - r + t));
    col *= mix(1.0, 0.35, dust);

    // vignette + overall density mask keeps edges deep black
    float mask = smoothstep(0.18, 0.85, n) * (0.55 + 0.45 * smoothstep(0.2, 0.8, q.y));
    float vig = smoothstep(1.3, 0.1, length((uv - 0.5) * vec2(1.2, 1.0)));
    col *= mask * vig * (0.8 + uWarp * 0.6);

    gl_FragColor = vec4(col, 1.0);
  }
`;

const COPY_FRAG = /* glsl */ `
  varying vec2 vUv;
  uniform sampler2D uTex;
  void main() { gl_FragColor = texture2D(uTex, vUv); }
`;

const STAR_VERT = /* glsl */ `
  attribute float aSize;
  attribute float aSeed;
  attribute vec3  aColor;
  uniform float uTime;
  uniform float uPx;
  uniform float uBoost;
  uniform float uZ;      // distance travelled along -z
  uniform float uDepth;  // layer thickness — stars wrap individually inside it
  varying vec3  vColor;
  varying float vAlpha;
  void main() {
    vec3 p = position;
    float dist = mod(-p.z - uZ, uDepth) + 1.0;
    p.z = -dist;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    float tw = 0.65 + 0.35 * sin(uTime * (0.6 + aSeed * 2.4) + aSeed * 40.0);
    // fade in from the far plane, out before passing the lens — no popping
    float fade = smoothstep(1.0, 6.0, dist) * (1.0 - smoothstep(uDepth * 0.75, uDepth + 1.0, dist));
    vAlpha = tw * fade;
    vColor = aColor;
    gl_PointSize = min(aSize * uPx * (1.0 + uBoost * 0.6) * (220.0 / dist), 28.0 * uPx);
  }
`;

const STAR_FRAG = /* glsl */ `
  varying vec3  vColor;
  varying float vAlpha;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    // hot core + soft halo + faint diffraction cross
    float core = smoothstep(0.5, 0.0, d);
    core = pow(core, 3.0);
    float cross = max(0.0, 1.0 - abs(c.x) * 18.0) * max(0.0, 1.0 - abs(c.y) * 2.2)
                + max(0.0, 1.0 - abs(c.y) * 18.0) * max(0.0, 1.0 - abs(c.x) * 2.2);
    float a = (core + cross * 0.18) * vAlpha;
    if (a < 0.01) discard;
    gl_FragColor = vec4(vColor * (0.6 + core), a);
  }
`;

const WARP_VERT = /* glsl */ `
  attribute float aTail;
  uniform float uStretch;
  uniform float uZ;
  uniform float uDepth;
  varying float vA;
  void main() {
    vec3 p = position;
    float dist = mod(-p.z - uZ, uDepth) + 1.0;
    p.z = -dist - aTail * uStretch;     // tail vertex trails back along z
    vA = mix(1.0, 0.0, aTail) * smoothstep(1.0, 8.0, dist);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const WARP_FRAG = /* glsl */ `
  uniform float uOpacity;
  uniform vec3 uColor;
  varying float vA;
  void main() { gl_FragColor = vec4(uColor, vA * uOpacity); }
`;

const PLANET_VERT = /* glsl */ `
  varying vec3 vN;
  varying vec3 vView;
  varying vec3 vPos;
  void main() {
    vPos = position;
    vN = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

const PLANET_FRAG = /* glsl */ `
  uniform float uTime;
  uniform vec3 uLight;
  varying vec3 vN;
  varying vec3 vView;
  varying vec3 vPos;
  float hash(float n) { return fract(sin(n) * 43758.5453); }
  float noise(vec3 x) {
    vec3 p = floor(x), f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    float n = p.x + p.y * 57.0 + 113.0 * p.z;
    return mix(mix(mix(hash(n), hash(n + 1.0), f.x), mix(hash(n + 57.0), hash(n + 58.0), f.x), f.y),
               mix(mix(hash(n + 113.0), hash(n + 114.0), f.x), mix(hash(n + 170.0), hash(n + 171.0), f.x), f.y), f.z);
  }
  void main() {
    vec3 sp = normalize(vPos);
    // gas-giant bands: latitude + turbulence that slowly flows sideways
    float turb = noise(sp * 6.0 + vec3(uTime * 0.03, 0.0, 0.0)) * 0.5
               + noise(sp * 14.0 - vec3(uTime * 0.05, 0.0, 0.0)) * 0.25;
    float band = sin(sp.y * 18.0 + turb * 4.0) * 0.5 + 0.5;
    vec3 deep = vec3(0.07, 0.05, 0.20);
    vec3 mid  = vec3(0.30, 0.25, 0.72);
    vec3 pale = vec3(0.45, 0.80, 0.78);
    vec3 col = mix(deep, mid, band);
    col = mix(col, pale, smoothstep(0.7, 1.0, band) * 0.45);

    float diff = dot(vN, normalize(uLight));
    float term = smoothstep(-0.12, 0.45, diff);        // soft terminator
    float fres = pow(1.0 - max(dot(vN, vView), 0.0), 3.0);
    vec3 lit = col * (0.025 + term * 1.1);
    lit += vec3(0.55, 0.48, 1.0) * fres * term * 1.4;  // lit-limb glow
    gl_FragColor = vec4(lit, 1.0);
  }
`;

const ATMO_FRAG = /* glsl */ `
  uniform vec3 uLight;
  varying vec3 vN;
  varying vec3 vView;
  void main() {
    float rim = pow(1.0 - abs(dot(vN, vView)), 2.6);
    float side = 0.08 + 0.92 * smoothstep(-0.3, 0.6, dot(vN, normalize(uLight)));
    vec3 c = mix(vec3(0.47, 0.40, 1.0), vec3(0.36, 0.91, 0.73), rim * 0.6);
    gl_FragColor = vec4(c, rim * side * 1.1);
  }
`;

const RING_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;
const RING_FRAG = /* glsl */ `
  varying vec2 vUv;
  uniform float uInner;
  void main() {
    float r = vUv.x;                                 // 0 inner → 1 outer (remapped uv)
    float bands = 0.55 + 0.45 * sin(r * 90.0) * sin(r * 23.0 + 1.3);
    float gap = smoothstep(0.42, 0.44, r) * (1.0 - smoothstep(0.47, 0.49, r));
    float edge = smoothstep(0.0, 0.08, r) * (1.0 - smoothstep(0.88, 1.0, r));
    float a = edge * bands * (1.0 - gap * 0.9) * 0.38;
    vec3 c = mix(vec3(0.62, 0.55, 1.0), vec3(0.6, 0.95, 0.85), r);
    gl_FragColor = vec4(c, a);
  }
`;

const rand = (a, b) => a + Math.random() * (b - a);

// star tints: mostly blue-white, a few warm and a few brand-violet
function starColor() {
  const r = Math.random();
  if (r < 0.62) return [0.86, 0.9, 1.0];
  if (r < 0.78) return [0.72, 0.68, 1.0];
  if (r < 0.9) return [1.0, 0.86, 0.7];
  return [0.6, 1.0, 0.86];
}

function makeStarLayer(count, spread, depth, sizeRange) {
  const pos = new Float32Array(count * 3);
  const size = new Float32Array(count);
  const seed = new Float32Array(count);
  const col = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = rand(-spread, spread);
    pos[i * 3 + 1] = rand(-spread, spread);
    pos[i * 3 + 2] = rand(-depth, 0) - 2;
    // most stars tiny, a rare few bright — feels like a real sky
    size[i] = sizeRange[0] + Math.pow(Math.random(), 6) * (sizeRange[1] - sizeRange[0]);
    seed[i] = Math.random();
    col.set(starColor(), i * 3);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
  g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
  g.setAttribute("aColor", new THREE.BufferAttribute(col, 3));
  return g;
}

function makeRingGeometry(inner, outer, segs = 160) {
  const g = new THREE.RingGeometry(inner, outer, segs, 1);
  // remap uv.x to radial 0..1 so the shader can paint concentric bands
  const p = g.attributes.position;
  const uv = g.attributes.uv;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    uv.setXY(i, (v.length() - inner) / (outer - inner), 0);
  }
  return g;
}

export function initSpace(canvas) {
  const mobile = window.innerWidth < 768;
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false,
    alpha: false,
    powerPreference: "high-performance",
  });
  const px = Math.min(window.devicePixelRatio, mobile ? 1.5 : 1.75);
  renderer.setPixelRatio(px);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x05050a, 1);

  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 400);
  cam.position.set(0, 0, 0);

  /* ---- nebula ----
     The fbm shader is the expensive part, but the gas is soft, so it renders
     into a half-resolution target and is upscaled behind the stars for free. */
  const NEB_SCALE = 0.5;
  const nebRT = new THREE.WebGLRenderTarget(
    Math.ceil(window.innerWidth * NEB_SCALE),
    Math.ceil(window.innerHeight * NEB_SCALE),
    { depthBuffer: false }
  );
  const nebScene = new THREE.Scene();
  const nebCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const nebulaMat = new THREE.ShaderMaterial({
    vertexShader: NEBULA_VERT,
    fragmentShader: NEBULA_FRAG,
    defines: { OCTAVES: mobile ? 4 : 5 },
    uniforms: {
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uWarp: { value: 0 },
      uMouse: { value: new THREE.Vector2() },
      uRes: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    },
    depthWrite: false,
    depthTest: false,
  });
  const quad = new THREE.PlaneGeometry(2, 2);
  const nebula = new THREE.Mesh(quad, nebulaMat);
  nebula.frustumCulled = false;
  nebScene.add(nebula);

  const backdrop = new THREE.Mesh(
    quad,
    new THREE.ShaderMaterial({
      vertexShader: NEBULA_VERT,
      fragmentShader: COPY_FRAG,
      uniforms: { uTex: { value: nebRT.texture } },
      depthWrite: false,
      depthTest: false,
    })
  );
  backdrop.frustumCulled = false;
  backdrop.renderOrder = -10;
  scene.add(backdrop);

  /* ---- star layers ---- */
  const k = mobile ? 0.45 : 1;
  const layers = [
    { count: 2600, spread: 120, depth: 160, size: [0.6, 2.2], par: 0.6 },
    { count: 900, spread: 60, depth: 80, size: [0.8, 3.0], par: 1.4 },
    { count: 160, spread: 28, depth: 30, size: [1.2, 4.2], par: 2.6 },
  ].map((l) => {
    const mat = new THREE.ShaderMaterial({
      vertexShader: STAR_VERT,
      fragmentShader: STAR_FRAG,
      uniforms: {
        uTime: { value: 0 },
        uPx: { value: px },
        uBoost: { value: 0 },
        uZ: { value: 0 },
        uDepth: { value: l.depth },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const geo = makeStarLayer(Math.round(l.count * k), l.spread, l.depth, l.size);
    const pts = new THREE.Points(geo, mat);
    pts.frustumCulled = false;
    const grp = new THREE.Group();
    grp.add(pts);
    scene.add(grp);
    return { grp, mat, geo, par: l.par, depth: l.depth, z: 0 };
  });

  /* ---- warp streaks: each star of the mid layer becomes a line ---- */
  const warpSrc = layers[1].geo.attributes.position;
  const wn = warpSrc.count;
  const wPos = new Float32Array(wn * 6);
  const wTail = new Float32Array(wn * 2);
  for (let i = 0; i < wn; i++) {
    for (let j = 0; j < 2; j++) {
      wPos[i * 6 + j * 3] = warpSrc.getX(i);
      wPos[i * 6 + j * 3 + 1] = warpSrc.getY(i);
      wPos[i * 6 + j * 3 + 2] = warpSrc.getZ(i);
      wTail[i * 2 + j] = j;
    }
  }
  const warpGeo = new THREE.BufferGeometry();
  warpGeo.setAttribute("position", new THREE.BufferAttribute(wPos, 3));
  warpGeo.setAttribute("aTail", new THREE.BufferAttribute(wTail, 1));
  const warpMat = new THREE.ShaderMaterial({
    vertexShader: WARP_VERT,
    fragmentShader: WARP_FRAG,
    uniforms: {
      uStretch: { value: 0 },
      uZ: { value: 0 },
      uDepth: { value: layers[1].depth },
      uOpacity: { value: 0 },
      uColor: { value: new THREE.Color(0.75, 0.78, 1.0) },
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const warpLines = new THREE.LineSegments(warpGeo, warpMat);
  warpLines.frustumCulled = false;
  layers[1].grp.add(warpLines);

  /* ---- shooting stars ---- */
  const COMETS = 3;
  const cometGeo = new THREE.BufferGeometry();
  const cPos = new Float32Array(COMETS * 6);
  const cCol = new Float32Array(COMETS * 6);
  cometGeo.setAttribute("position", new THREE.BufferAttribute(cPos, 3));
  cometGeo.setAttribute("color", new THREE.BufferAttribute(cCol, 3));
  const cometMat = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const comets = new THREE.LineSegments(cometGeo, cometMat);
  comets.frustumCulled = false;
  scene.add(comets);
  const cometState = Array.from({ length: COMETS }, () => ({ life: 0, next: rand(2, 8) }));

  /* ---- ringed planet ---- */
  // back-lit from above/behind: we see the top cap, so only the limb catches
  // light — a thin glowing crescent over a dark horizon
  const light = new THREE.Vector3(-0.35, 0.45, -0.82).normalize();
  const planet = new THREE.Group();
  const planetMat = new THREE.ShaderMaterial({
    vertexShader: PLANET_VERT,
    fragmentShader: PLANET_FRAG,
    uniforms: { uTime: { value: 0 }, uLight: { value: light } },
  });
  const planetBody = new THREE.Mesh(new THREE.SphereGeometry(10, 96, 96), planetMat);
  planet.add(planetBody);
  const atmo = new THREE.Mesh(
    new THREE.SphereGeometry(10.9, 64, 64),
    new THREE.ShaderMaterial({
      vertexShader: PLANET_VERT,
      fragmentShader: ATMO_FRAG,
      uniforms: { uLight: { value: light } },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
    })
  );
  planet.add(atmo);
  const ring = new THREE.Mesh(
    makeRingGeometry(13, 22),
    new THREE.ShaderMaterial({
      vertexShader: RING_VERT,
      fragmentShader: RING_FRAG,
      uniforms: { uInner: { value: 13 } },
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    })
  );
  ring.rotation.x = Math.PI * 0.42;
  ring.rotation.y = -0.25;
  planet.add(ring);
  planet.rotation.z = 0.18;
  planet.position.set(mobile ? 0 : 9, -60, -42);
  planet.visible = false;
  scene.add(planet);

  /* ---- state ---- */
  const state = {
    scroll: 0,
    vel: 0,
    velS: 0,
    warpPulse: 0,
    planet: 0,
    planetS: 0,
    mx: 0,
    my: 0,
    mxS: 0,
    myS: 0,
    paused: false,
  };

  const onMouse = (e) => {
    state.mx = (e.clientX / window.innerWidth) * 2 - 1;
    state.my = (e.clientY / window.innerHeight) * 2 - 1;
  };
  window.addEventListener("mousemove", onMouse, { passive: true });

  const clock = new THREE.Clock();
  let raf;

  function spawnComet(i) {
    const c = cometState[i];
    c.life = 1;
    c.dur = rand(0.7, 1.3);
    const z = rand(-60, -30);
    const halfH = Math.tan((cam.fov * Math.PI) / 360) * -z;
    const halfW = halfH * cam.aspect;
    c.x = rand(-halfW, halfW * 0.6);
    c.y = rand(0, halfH);
    c.z = z;
    const ang = rand(-0.9, -0.4);
    const sp = rand(40, 70);
    c.vx = Math.cos(ang) * sp;
    c.vy = Math.sin(ang) * sp;
    c.len = rand(4, 9);
    c.next = rand(4, 11);
  }

  function updateComets(dt) {
    for (let i = 0; i < COMETS; i++) {
      const c = cometState[i];
      if (c.life <= 0) {
        c.next -= dt;
        if (c.next <= 0) spawnComet(i);
        cPos.fill(0, i * 6, i * 6 + 6);
        cCol.fill(0, i * 6, i * 6 + 6);
        continue;
      }
      c.life -= dt / c.dur;
      c.x += c.vx * dt;
      c.y += c.vy * dt;
      const sp = Math.hypot(c.vx, c.vy);
      const fade = Math.sin(Math.max(c.life, 0) * Math.PI);
      cPos.set([c.x, c.y, c.z, c.x - (c.vx / sp) * c.len, c.y - (c.vy / sp) * c.len, c.z], i * 6);
      cCol.set([fade, fade, fade, 0, 0, 0], i * 6);
    }
    cometGeo.attributes.position.needsUpdate = true;
    cometGeo.attributes.color.needsUpdate = true;
  }

  function tick() {
    raf = requestAnimationFrame(tick);
    if (state.paused) return;
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;

    // smoothing — expressed per 60fps frame, scaled by dt so slow GPUs
    // don't leave the warp hanging around
    const f = dt * 60;
    const lerp = (k) => 1 - Math.pow(1 - k, f);
    state.velS += (Math.abs(state.vel) - state.velS) * lerp(0.08);
    state.vel *= Math.pow(0.9, f);
    state.warpPulse *= Math.pow(0.955, f);
    if (state.warpPulse < 0.002) state.warpPulse = 0;
    state.mxS += (state.mx - state.mxS) * lerp(0.04);
    state.myS += (state.my - state.myS) * lerp(0.04);
    state.planetS += (state.planet - state.planetS) * lerp(0.06);

    const v = Math.min(state.velS / 90, 1);
    const speed = v * v * 0.9 + state.warpPulse;

    nebulaMat.uniforms.uTime.value = t;
    nebulaMat.uniforms.uScroll.value = state.scroll;
    nebulaMat.uniforms.uWarp.value = Math.min(speed, 1.2);
    nebulaMat.uniforms.uMouse.value.set(state.mxS, -state.myS);
    // stars drift toward the camera; faster with scroll velocity / warp
    layers.forEach((l, i) => {
      l.z = (l.z + dt * (0.6 + speed * 70) * (i + 1) * 0.5) % l.depth;
      l.mat.uniforms.uZ.value = l.z;
      l.mat.uniforms.uTime.value = t;
      l.mat.uniforms.uBoost.value = Math.min(speed, 1.5);
      l.grp.position.x = -state.mxS * l.par;
      l.grp.position.y = state.myS * l.par + state.scroll * l.par * 6;
    });
    layers[0].grp.rotation.z = t * 0.004;

    warpMat.uniforms.uZ.value = layers[1].z;
    warpMat.uniforms.uStretch.value = speed * 14;
    warpMat.uniforms.uOpacity.value = Math.min(speed * 1.4, 0.9);

    updateComets(dt);

    // planet: hidden until Contact approaches, then rises from below
    const ps = state.planetS;
    planet.visible = ps > 0.001;
    if (planet.visible) {
      // settles low so it reads as a horizon behind the footer
      const yTarget = mobile ? -27 : -25;
      planet.position.y = -60 + (yTarget + 60) * easeOut(ps);
      planet.rotation.y = t * 0.02;
      planetMat.uniforms.uTime.value = t;
    }

    cam.rotation.z = state.mxS * 0.015;
    renderer.setRenderTarget(nebRT);
    renderer.render(nebScene, nebCam);
    renderer.setRenderTarget(null);
    renderer.render(scene, cam);
  }
  raf = requestAnimationFrame(tick);

  const onResize = () => {
    cam.aspect = window.innerWidth / window.innerHeight;
    cam.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    nebulaMat.uniforms.uRes.value.set(window.innerWidth, window.innerHeight);
    nebRT.setSize(Math.ceil(window.innerWidth * NEB_SCALE), Math.ceil(window.innerHeight * NEB_SCALE));
  };
  window.addEventListener("resize", onResize);

  return {
    setScroll(p) {
      state.scroll = p;
    },
    setVelocity(v) {
      state.vel = v;
      state.velS = Math.max(state.velS, Math.abs(v) * 0.5);
    },
    setPlanet(p) {
      state.planet = p;
    },
    // one-shot hyperspace burst (used by the launch sequence)
    warp(amount = 1.6) {
      state.warpPulse = amount;
    },
    pause(on) {
      state.paused = on;
      if (!on) clock.getDelta();
    },
    dispose() {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouse);
      [scene, nebScene].forEach((sc) =>
        sc.traverse((o) => {
          o.geometry?.dispose();
          o.material?.dispose();
        })
      );
      nebRT.dispose();
      renderer.dispose();
    },
  };
}

const easeOut = (x) => 1 - Math.pow(1 - x, 3);
