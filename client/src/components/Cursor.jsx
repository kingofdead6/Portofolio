import { useEffect, useRef } from "react";
import { gsap } from "gsap";

const COLORS = ["#ffffff", "#c9c2ff", "#7866FF", "#5BE9B9", "#38D6FF"];
const MAX = 260; // particle pool cap

/* Comet cursor.
   - a hot white core snaps to the pointer
   - a reticle ring (rotating dashed arcs) eases behind it and locks onto any
     [data-hover] target by growing + showing crosshair ticks
   - moving sheds stardust particles onto a full-viewport canvas, drawn with
     additive blending so overlapping sparks bloom like a comet tail
   - clicking fires a small burst + a shockwave ring
   Touch devices skip all of it; reduced-motion keeps the core/ring only. */
export default function Cursor() {
  const core = useRef(null);
  const ring = useRef(null);
  const wave = useRef(null);
  const dust = useRef(null);

  useEffect(() => {
    if (window.matchMedia("(hover: none)").matches) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const c = core.current;
    const r = ring.current;
    const w = wave.current;
    const cnv = dust.current;
    if (!c || !r || !cnv) return;

    gsap.set([c, r, w], { xPercent: -50, yPercent: -50 });
    const cx = gsap.quickTo(c, "x", { duration: 0.08, ease: "power3" });
    const cy = gsap.quickTo(c, "y", { duration: 0.08, ease: "power3" });
    const rx = gsap.quickTo(r, "x", { duration: 0.45, ease: "power3" });
    const ry = gsap.quickTo(r, "y", { duration: 0.45, ease: "power3" });

    const ctx = cnv.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const size = () => {
      cnv.width = window.innerWidth * dpr;
      cnv.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size();
    window.addEventListener("resize", size);

    const parts = [];
    const spawn = (x, y, vx, vy, n, spread, life) => {
      for (let i = 0; i < n && parts.length < MAX; i++) {
        const a = Math.random() * Math.PI * 2;
        const s = Math.random() * spread;
        parts.push({
          x,
          y,
          vx: vx + Math.cos(a) * s,
          vy: vy + Math.sin(a) * s,
          life: 1,
          decay: 1 / (life * (0.6 + Math.random() * 0.8)),
          size: 0.6 + Math.random() * 1.8,
          col: COLORS[(Math.random() * COLORS.length) | 0],
        });
      }
    };

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let lx = mx;
    let ly = my;
    let shown = false;

    const onMove = (e) => {
      mx = e.clientX;
      my = e.clientY;
      if (!shown) {
        shown = true;
        gsap.set([c, r], { x: mx, y: my });
        gsap.to([c, r], { autoAlpha: 1, duration: 0.3 });
      }
      cx(mx);
      cy(my);
      rx(mx);
      ry(my);
    };
    window.addEventListener("mousemove", onMove);

    const onDown = () => {
      if (!reduce) spawn(mx, my, 0, 0, 26, 4.5, 0.9);
      gsap.fromTo(
        w,
        { x: mx, y: my, scale: 0.2, autoAlpha: 0.9 },
        { scale: 2.6, autoAlpha: 0, duration: 0.7, ease: "expo.out" }
      );
      gsap.fromTo(r, { scale: 0.75 }, { scale: 1, duration: 0.5, ease: "elastic.out(1,.45)" });
    };
    window.addEventListener("mousedown", onDown);

    const onLeaveWin = () => gsap.to([c, r], { autoAlpha: 0, duration: 0.3 });
    const onEnterWin = () => shown && gsap.to([c, r], { autoAlpha: 1, duration: 0.3 });
    document.addEventListener("mouseleave", onLeaveWin);
    document.addEventListener("mouseenter", onEnterWin);

    let raf;
    let last = performance.now();
    const tick = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      // shed dust proportional to how far the pointer travelled this frame
      const dx = mx - lx;
      const dy = my - ly;
      const dist = Math.hypot(dx, dy);
      if (!reduce && dist > 0.5) {
        const n = Math.min(Math.ceil(dist / 9), 6);
        for (let i = 0; i < n; i++) {
          const t = i / n;
          spawn(lx + dx * t, ly + dy * t, -dx * 0.02, -dy * 0.02, 1, 0.5, 0.75);
        }
      }
      lx = mx;
      ly = my;

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      ctx.globalCompositeOperation = "lighter";
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.life -= p.decay * dt;
        if (p.life <= 0) {
          parts.splice(i, 1);
          continue;
        }
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.94;
        p.vy *= 0.94;
        ctx.globalAlpha = p.life * p.life;
        ctx.fillStyle = p.col;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (0.4 + p.life * 0.6), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    // lock-on over interactive targets (delegated → covers later-mounted nodes)
    const over = (e) => {
      if (e.target.closest && e.target.closest("[data-hover]")) r.classList.add("lock");
    };
    const out = (e) => {
      const to = e.relatedTarget;
      if (!(to && to.closest && to.closest("[data-hover]"))) r.classList.remove("lock");
    };
    document.addEventListener("mouseover", over);
    document.addEventListener("mouseout", out);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", size);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      document.removeEventListener("mouseleave", onLeaveWin);
      document.removeEventListener("mouseenter", onEnterWin);
      document.removeEventListener("mouseover", over);
      document.removeEventListener("mouseout", out);
    };
  }, []);

  return (
    <>
      <canvas ref={dust} className="cursor-dust" aria-hidden="true" />
      <div ref={wave} className="cursor-wave" aria-hidden="true" />
      <div ref={ring} className="cursor-ring" aria-hidden="true">
        <span className="cursor-ring__arcs" />
        <span className="cursor-ring__tick t" />
        <span className="cursor-ring__tick r" />
        <span className="cursor-ring__tick b" />
        <span className="cursor-ring__tick l" />
      </div>
      <div ref={core} className="cursor-core" aria-hidden="true" />
    </>
  );
}
