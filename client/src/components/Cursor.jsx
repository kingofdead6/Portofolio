import { useEffect, useRef } from "react";
import { gsap } from "gsap";

/* Custom cursor.
   - the dot snaps to the pointer with a quick eased follow
   - the ring + glow trail a touch slower, giving a fluid, elastic feel
   - grows over any [data-hover] target via event delegation (covers the
     dynamically-mounted project page and admin views too)
   - rendered above everything (z-index in index.css) so overlays never hide it */
export default function Cursor() {
  const dot = useRef(null);
  const ring = useRef(null);

  useEffect(() => {
    if (window.matchMedia("(hover: none)").matches) return; // skip on touch
    const d = dot.current;
    const r = ring.current;
    if (!d || !r) return;

    gsap.set([d, r], { xPercent: -50, yPercent: -50 });
    // dot follows fast, ring lags slightly for the trailing effect
    const dx = gsap.quickTo(d, "x", { duration: 0.12, ease: "power3" });
    const dy = gsap.quickTo(d, "y", { duration: 0.12, ease: "power3" });
    const rx = gsap.quickTo(r, "x", { duration: 0.4, ease: "power3" });
    const ry = gsap.quickTo(r, "y", { duration: 0.4, ease: "power3" });

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    const onMove = (e) => {
      mx = e.clientX;
      my = e.clientY;
      dx(mx);
      dy(my);
      rx(mx);
      ry(my);
    };
    window.addEventListener("mousemove", onMove);

    // grow on interactive elements (delegated → covers later-mounted nodes)
    const over = (e) => {
      if (e.target.closest && e.target.closest("[data-hover]"))
        r.parentElement.classList.add("big");
    };
    const out = (e) => {
      const to = e.relatedTarget;
      const stillOn = to && to.closest && to.closest("[data-hover]");
      if (!stillOn) r.parentElement.classList.remove("big");
    };
    document.addEventListener("mouseover", over);
    document.addEventListener("mouseout", out);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", over);
      document.removeEventListener("mouseout", out);
    };
  }, []);

  return (
    <div className="cursor" aria-hidden="true">
      <div ref={ring} className="cursor__ring" />
      <span className="cursor__glow" />
      <div ref={dot} className="cursor__dot" />
    </div>
  );
}