/* ----------------------------- DATA ----------------------------- */

// The CV lives in src/assets and is imported so Vite bundles it and hands us
// the correct built URL (a bare string path would not be resolved/copied).
import cvPdf from "../assets/cv.pdf";

export const NAV = [
  ["Home", "home"],
  ["About", "about"],
  ["Skills", "skills"],
  ["Work", "work"],
  ["Contact", "contact"],
];

export const SKILLS = [
  {
    group: "Frontend",
    label: "Interfaces & motion",
    accent: "#7866FF",
    items: [
      { n: "React", i: "react/react-original", level: 95, note: "Hooks · context · SPAs" },
      { n: "Vite", i: "vitejs/vitejs-original", level: 90, note: "Build tooling" },
      { n: "Tailwind", i: "tailwindcss/tailwindcss-original", level: 95, note: "Design systems" },
      { n: "TypeScript", i: "typescript/typescript-original", level: 85, note: "Typed apps" },
      { n: "JavaScript", i: "javascript/javascript-original", level: 95, note: "ES2023+" },
      { n: "Three.js", i: "threejs/threejs-original", level: 78, note: "WebGL & 3D" },
      { n: "GSAP", i: null, level: 88, note: "Scroll & timelines" },
    ],
  },
  {
    group: "Backend",
    label: "APIs & services",
    accent: "#5BE9B9",
    items: [
      { n: "Node.js", i: "nodejs/nodejs-original", level: 90, note: "Runtime & services" },
      { n: "Express", i: "express/express-original", level: 90, note: "REST APIs" },
      { n: "Python", i: "python/python-original", level: 90, note: "Scripting & ML" },
      { n: "FastAPI", i: "fastapi/fastapi-original", level: 85, note: "Async APIs" },
    ],
  },
  {
    group: "Computer Vision",
    label: "Perception & ML",
    accent: "#FF8A3D",
    items: [
      { n: "OpenCV", i: "opencv/opencv-original", level: 88, note: "Image pipelines" },
      { n: "PyTorch", i: "pytorch/pytorch-original", level: 80, note: "Model training" },
      { n: "NumPy", i: "numpy/numpy-original", level: 88, note: "Array compute" },
      { n: "YOLO", i: null, level: 85, note: "Object detection" },
    ],
  },
  {
    group: "Data & Infra",
    label: "Storage & delivery",
    accent: "#38D6FF",
    items: [
      { n: "PostgreSQL", i: "postgresql/postgresql-original", level: 85, note: "Relational data" },
      { n: "MongoDB", i: "mongodb/mongodb-original", level: 85, note: "Document stores" },
      { n: "Docker", i: "docker/docker-original", level: 82, note: "Containers" },
      { n: "Git", i: "git/git-original", level: 92, note: "Version control" },
      { n: "Blender", i: "blender/blender-original", level: 75, note: "3D modeling" },
    ],
  },
];

export const icon = (i) =>
  `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${i}.svg`;

/* ---- Random project card gradients ----
   Instead of hand-picking c1/c2 per project, we pick a colour pair at random
   from a curated on-brand palette. The choice is derived from a stable string
   key (the project title), so a given project keeps the SAME gradient across
   renders and across the card + detail page — it just isn't chosen by hand. */
const CARD_GRADIENTS = [
  ["#7866FF", "#2A1C9E"], // violet
  ["#5BE9B9", "#0B6E4F"], // mint
  ["#FF8A3D", "#9E3A12"], // amber
  ["#38D6FF", "#0B5E83"], // cyan
  ["#FF5E8A", "#9E1640"], // pink
  ["#9A6BFF", "#3A1C7E"], // indigo
  ["#48B6FF", "#143A99"], // blue
  ["#FFD166", "#8A5A00"], // gold
];

// simple deterministic hash → stable index for a given key
const hashKey = (key = "") => {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) | 0;
  return Math.abs(h);
};

// returns { c1, c2 } for a project — random per project, stable per session
export const cardGradient = (project) => {
  const key = project?.t || project?.title || project?._id || "";
  const [c1, c2] = CARD_GRADIENTS[hashKey(key) % CARD_GRADIENTS.length];
  return { c1, c2 };
};

/* High-level work categories. `key` ties projects to a category; `accent`
   colour-zones each section of the rail. Rename labels/sub freely. */
export const CATEGORIES = [
  { key: "web", label: "Web Dev", sub: "Full-stack platforms", accent: "#7866FF" },
  { key: "mobile", label: "Mobile Dev", sub: "Apps on the go", accent: "#5BE9B9" },
  { key: "agentic", label: "Agentic AI", sub: "Multi-agent systems", accent: "#FF8A3D" },
  { key: "ai", label: "AI & Vision", sub: "ML & computer vision", accent: "#38D6FF" },
  { key: "random", label: "Playground", sub: "Experiments & games", accent: "#FF5E8A" },
];

export const PROJECTS = [
  {
    t: "Atlas Network",
    category: "web",
    cat: "Community Platform",
    year: "2025",
    blurb:
      "A professional community platform for Algerian students, researchers & founders.",
    desc: "A 14-section member network: real-time messaging, connection states, feeds, profiles and activity. Built with React/Vite, Tailwind, Framer Motion, Socket.io and MongoDB — with a nav context that keeps the dashboard shell mounted across routes.",
    stack: ["React", "Tailwind", "Socket.io", "MongoDB", "Framer Motion"],
    c1: "#7866FF",
    c2: "#2A1C9E",
  },
  {
    t: "Dawai",
    category: "web",
    cat: "HealthTech",
    year: "2025",
    blurb: "Real-time medication availability & pharmacy locator for Algeria.",
    desc: "A platform mapping live medication stock and de-garde pharmacy rotations, designed around Algerian rails (Chifa coverage, BarediMob), backed by user research, personas, competitive analysis and a delivery roadmap.",
    stack: ["React", "Node", "MongoDB", "Maps"],
    c1: "#9A6BFF",
    c2: "#3A1C7E",
  },
  {
    t: "Store Factory",
    category: "agentic",
    cat: "Multi-agent System",
    year: "2025",
    blurb: "Multi-client e-commerce store generator.",
    desc: "A two-phase engine — templatize, then generate — driven by a multi-agent system (brand-themer, copywriter, catalog-generator, reviewer) that produces branded white-label storefronts from a single demo template.",
    stack: ["React", "Node", "Agents", "Vercel"],
    c1: "#FF8A3D",
    c2: "#9E3A12",
  },
  {
    t: "ANPR & Smart Parking",
    category: "ai",
    cat: "Computer Vision · Full-stack",
    year: "2025",
    blurb:
      "Production-grade automatic number-plate recognition & smart-parking platform.",
    desc: "A real-time ANPR system: YOLO-based plate detection, a FastAPI backend with fuzzy plate search over PostgreSQL, and a React/Vite operations dashboard — fully containerised with Docker and shipped as a runnable platform.",
    stack: ["YOLO", "FastAPI", "React", "PostgreSQL", "Docker"],
    c1: "#38D6FF",
    c2: "#0B5E83",
  },
  {
    t: "Plate Dataset Builder",
    category: "ai",
    cat: "CV Tooling",
    year: "2025",
    blurb: "Autonomous dataset pipeline for Algerian license plates.",
    desc: "A multi-stage pipeline — acquire, dedupe (pHash), label, validate via three-tier triage, split and report — with dual COCO/YOLO export, built to bootstrap high-quality CV training data end to end.",
    stack: ["Python", "OpenCV", "pHash", "COCO", "YOLO"],
    c1: "#3DC9FF",
    c2: "#0B4E73",
  },
  {
    t: "Local AI Companion",
    category: "ai",
    cat: "Applied AI",
    year: "2025",
    blurb: "Fully self-hosted AI companion app.",
    desc: "An Express backend with JWT auth, Ollama model tiers selected by VRAM, Stable Diffusion image generation, MongoDB sliding-window memory and a PWA frontend — remotely reachable through a Cloudflare Tunnel.",
    stack: ["Ollama", "Express", "MongoDB", "PWA"],
    c1: "#48B6FF",
    c2: "#143A99",
  },
  {
    t: "Cotton Picker Sim",
    category: "random",
    cat: "Browser Multiplayer Game",
    year: "2024",
    blurb: "Real-time multiplayer browser game.",
    desc: "A vanilla-JS canvas game ported to React with a deliberately framework-agnostic engine, WebRTC/PeerJS multiplayer and a TURN relay set up for production deployment on Vercel.",
    stack: ["React", "Canvas", "WebRTC", "PeerJS"],
    c1: "#FF5E8A",
    c2: "#9E1640",
  },
];

/* ---- contact details — swap these for your real ones ---- */
export const EMAIL = "youceftargerian@gmail.com";

export const CV_URL = cvPdf;

export const SOCIALS = [
  ["Instagram", "https://instagram.com/softwebelevation"],
  // WhatsApp: country code + number, no +, no spaces. Algeria = 213.
  ["WhatsApp", "https://wa.me/213553670046"],
  ["GitHub", "https://github.com/kingofdead6"],
];