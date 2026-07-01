import { useEffect, useRef } from "react";
import { gsap } from "gsap";

const TRAIL = 14; // number of ghost dots in the trailing trace

/* Unstable, colour-shifting cursor.
   - the main blob follows the pointer (GSAP moves the outer .cursor element),
     morphs its border-radius, wobbles in scale/rotation and cycles its hue
     continuously so it never looks the same
   - a pool of ghost dots trails behind, each easing toward the one in front,
     leaving a soft fading, colour-shifting trace of the movement
   - grows over any [data-hover] target via event delegation (covers the
     dynamically-mounted project page and admin views too)
   - rendered above everything (z-index in index.css) so overlays never hide it */
export default function Cursor() {
  const outer = useRef(null);
  const blob = useRef(null);
  const trailWrap = useRef(null);

  useEffect(() => {
    if (window.matchMedia("(hover: none)").matches) return; // skip on touch
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const o = outer.current; // GSAP moves this (positioning)
    const b = blob.current; // JS wobbles/morphs/recolours this
    if (!o || !b) return;

    gsap.set(o, { xPercent: -50, yPercent: -50 });
    const xT = gsap.quickTo(o, "x", { duration: 0.18, ease: "power3" });
    const yT = gsap.quickTo(o, "y", { duration: 0.18, ease: "power3" });

    // build the trailing ghost dots (absolutely positioned, moved via left/top)
    const trailEls = [];
    const trailPts = [];
    if (trailWrap.current && !reduce) {
      for (let i = 0; i < TRAIL; i++) {
        const el = document.createElement("span");
        el.className = "cursor__trail";
        trailWrap.current.appendChild(el);
        trailEls.push(el);
        trailPts.push({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
      }
    }

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    // place it at the current pointer immediately so it's visible before moving
    xT(mx);
    yT(my);
    const onMove = (e) => {
      mx = e.clientX;
      my = e.clientY;
      xT(mx);
      yT(my);
    };
    window.addEventListener("mousemove", onMove);

    let raf;
    let t = 0;
    let hue = 0;
    const tick = () => {
      t += 0.05;

      // ---- unstable blob: wobble + morph + hue cycle ----
      if (!reduce) {
        hue = (hue + 1.4) % 360;
        const wob = Math.sin(t * 3.1) * 0.09;
        const sx = 1 + wob + (Math.random() - 0.5) * 0.06;
        const sy = 1 - wob + (Math.random() - 0.5) * 0.06;
        const rot = Math.sin(t * 0.7) * 20;
        b.style.transform = `rotate(${rot}deg) scale(${sx}, ${sy})`;
        b.style.borderColor = `hsl(${hue}, 90%, 65%)`;
        b.style.boxShadow = `0 0 18px hsla(${hue}, 90%, 60%, 0.55)`;
        b.style.background = `hsla(${hue}, 90%, 60%, 0.12)`;
      }

      // ---- trailing trace: each dot chases the one ahead of it ----
      for (let i = 0; i < trailEls.length; i++) {
        const p = trailPts[i];
        const target = i === 0 ? { x: mx, y: my } : trailPts[i - 1];
        p.x += (target.x - p.x) * 0.35;
        p.y += (target.y - p.y) * 0.35;
        const el = trailEls[i];
        const h = (hue - i * 12 + 360) % 360;
        const scale = 1 - i / trailEls.length;
        el.style.left = `${p.x}px`;
        el.style.top = `${p.y}px`;
        el.style.transform = `translate(-50%, -50%) scale(${scale})`;
        el.style.background = `hsl(${h}, 90%, 62%)`;
        el.style.opacity = `${0.5 * scale}`;
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    // grow on interactive elements (delegated → covers later-mounted nodes)
    const over = (e) => {
      if (e.target.closest && e.target.closest("[data-hover]"))
        o.classList.add("big");
    };
    const out = (e) => {
      const to = e.relatedTarget;
      const stillOn = to && to.closest && to.closest("[data-hover]");
      if (!stillOn) o.classList.remove("big");
    };
    document.addEventListener("mouseover", over);
    document.addEventListener("mouseout", out);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", over);
      document.removeEventListener("mouseout", out);
      trailEls.forEach((el) => el.remove());
    };
  }, []);

  return (
    <>
      <div ref={trailWrap} className="cursor__trailwrap" aria-hidden="true" />
      <div ref={outer} className="cursor" aria-hidden="true">
        <div ref={blob} className="cursor__blob" />
      </div>
    </>
  );
}
