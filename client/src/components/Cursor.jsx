import { useEffect, useRef } from "react";
import { gsap } from "gsap";

/* Unstable blob cursor.
   - follows the mouse with eased lerp (gsap.quickTo)
   - never fully settles: a small tremor keeps it shaking around the pointer
   - the inner blob wobbles (scale + rotate) and morphs its border-radius (CSS)
   - mix-blend-mode:difference (see index.css) recolours whatever sits beneath it
   - grows on any [data-hover] target via event delegation (works for the
     dynamically-mounted project page too) */
export default function Cursor() {
  const outer = useRef(null);
  const blob = useRef(null);

  useEffect(() => {
    if (window.matchMedia("(hover: none)").matches) return; // skip on touch
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const o = outer.current;
    const b = blob.current;
    if (!o) return;

    gsap.set(o, { xPercent: -50, yPercent: -50 });
    const xT = gsap.quickTo(o, "x", { duration: 0.35, ease: "power3" });
    const yT = gsap.quickTo(o, "y", { duration: 0.35, ease: "power3" });

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    const onMove = (e) => {
      mx = e.clientX;
      my = e.clientY;
    };
    window.addEventListener("mousemove", onMove);

    let raf;
    let t = 0;
    const tick = () => {
      t += 0.08;
      // tremor: organic sine wobble + a little randomness so it's truly "unstable"
      const trX = reduce ? 0 : Math.sin(t * 2.3) * 1.4 + (Math.random() - 0.5) * 2.4;
      const trY = reduce ? 0 : Math.cos(t * 1.9) * 1.4 + (Math.random() - 0.5) * 2.4;
      xT(mx + trX);
      yT(my + trY);
      if (b && !reduce) {
        const wob = Math.sin(t * 3.1) * 0.07;
        const sx = 1 + wob + (Math.random() - 0.5) * 0.05;
        const sy = 1 - wob + (Math.random() - 0.5) * 0.05;
        b.style.transform = `rotate(${Math.sin(t * 0.6) * 16}deg) scale(${sx}, ${sy})`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    // grow on interactive elements (delegated → covers later-mounted nodes)
    const over = (e) => {
      if (e.target.closest && e.target.closest("[data-hover]")) o.classList.add("big");
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
    };
  }, []);

  return (
    <div ref={outer} className="cursor" aria-hidden="true">
      <div ref={blob} className="cursor__blob" />
    </div>
  );
}