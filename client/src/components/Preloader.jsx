import { useEffect, useRef } from "react";
import { gsap } from "gsap";

const STEPS = [
  [0, "Powering up systems"],
  [25, "Calibrating thrusters"],
  [50, "Plotting trajectory"],
  [75, "Loading payload"],
  [100, "Lift-off"],
];

/* Launch sequence shown while the API content loads.
   Counter crawls toward ~88% on its own, then completes once `ready` flips.
   At 100 the seam flashes and the two hangar doors slide apart; `onLaunch`
   fires the moment they start moving (App kicks the warp + hero intro off it)
   and `onDone` once they're fully out of frame so App can unmount us. */
export default function Preloader({ ready, onLaunch, onDone }) {
  const root = useRef(null);
  const num = useRef(null);
  const bar = useRef(null);
  const status = useRef(null);
  const prog = useRef({ v: 0 });
  const crawl = useRef(null);
  const born = useRef(0);
  const cbs = useRef({ onLaunch, onDone });

  useEffect(() => {
    cbs.current = { onLaunch, onDone };
  });

  const render = () => {
    const v = prog.current.v;
    if (num.current) num.current.textContent = String(Math.round(v)).padStart(3, "0");
    if (bar.current) bar.current.style.transform = `scaleX(${v / 100})`;
    if (status.current) {
      let label = STEPS[0][1];
      for (const [at, l] of STEPS) if (v >= at) label = l;
      if (status.current.textContent !== label) status.current.textContent = label;
    }
  };

  useEffect(() => {
    born.current = performance.now();
    crawl.current = gsap.to(prog.current, {
      v: 88,
      duration: 2.6,
      ease: "power2.out",
      onUpdate: render,
    });
    return () => crawl.current && crawl.current.kill();
  }, []);

  useEffect(() => {
    if (!ready) return;
    const el = root.current;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // keep the sequence on screen long enough to read, even on a warm cache
    const wait = Math.max(0, 1500 - (performance.now() - born.current)) / 1000;
    if (crawl.current) crawl.current.kill();

    if (reduce) {
      const tl = gsap.timeline({ delay: wait });
      tl.add(() => cbs.current.onLaunch && cbs.current.onLaunch())
        .to(el, { autoAlpha: 0, duration: 0.4 })
        .add(() => cbs.current.onDone && cbs.current.onDone());
      return () => tl.kill();
    }

    const q = (s) => el.querySelectorAll(s);
    const tl = gsap.timeline({ delay: wait });
    tl.to(prog.current, { v: 100, duration: 0.7, ease: "power2.inOut", onUpdate: render })
      .to(q(".pl-orbit"), { scale: 0.6, autoAlpha: 0, duration: 0.5, ease: "power3.in" }, "-=0.2")
      .to(q(".pl-seam"), { scaleX: 1, duration: 0.45, ease: "expo.out" }, "-=0.25")
      .to(q(".pl-seam"), { opacity: 1, boxShadow: "0 0 40px 6px rgba(150,140,255,.9)", duration: 0.15 })
      .add(() => cbs.current.onLaunch && cbs.current.onLaunch(), "open")
      .to(q(".pl-content"), { scale: 1.35, autoAlpha: 0, filter: "blur(8px)", duration: 0.6, ease: "power2.in" }, "open")
      .to(q(".pl-top"), { yPercent: -100, duration: 1.15, ease: "expo.inOut" }, "open")
      .to(q(".pl-bot"), { yPercent: 100, duration: 1.15, ease: "expo.inOut" }, "open")
      .to(q(".pl-seam"), { autoAlpha: 0, duration: 0.4 }, "open+=0.2")
      .add(() => cbs.current.onDone && cbs.current.onDone());
    return () => tl.kill();
  }, [ready]);

  return (
    <div ref={root} className="preloader fixed inset-0 z-[100]" aria-live="polite" aria-label="Loading">
      <div className="pl-top absolute inset-x-0 top-0 h-1/2 bg-[#05050a]">
        <div className="pl-door-grid absolute inset-0" />
      </div>
      <div className="pl-bot absolute inset-x-0 bottom-0 h-1/2 bg-[#05050a]">
        <div className="pl-door-grid absolute inset-0" />
      </div>
      <div
        className="pl-seam absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-[#c9c2ff] to-transparent opacity-60"
        style={{ transform: "scaleX(0)" }}
      />

      <div className="pl-content absolute inset-0 flex flex-col items-center justify-center px-6">
        <div className="pl-orbit relative h-40 w-40 md:h-52 md:w-52">
          <span className="pl-ring pl-ring--1" />
          <span className="pl-ring pl-ring--2" />
          <span className="pl-ring pl-ring--3" />
          <span className="absolute inset-0 m-auto h-3 w-3 rounded-full bg-bone shadow-[0_0_24px_6px_rgba(120,102,255,.8)]" />
        </div>

        <div className="mt-10 flex items-baseline gap-3">
          <span
            ref={num}
            className="font-display font-extrabold tabular-nums tracking-tight leading-none"
            style={{ fontSize: "clamp(3.5rem,10vw,7rem)" }}
          >
            000
          </span>
          <span className="text-bone/40 font-display text-xl">%</span>
        </div>

        <div className="mt-6 h-px w-56 md:w-72 overflow-hidden bg-bone/10">
          <span
            ref={bar}
            className="block h-full origin-left bg-gradient-to-r from-violet via-[#38D6FF] to-mint"
            style={{ transform: "scaleX(0)" }}
          />
        </div>
        <div className="mt-4 flex items-center gap-2 text-[11px] tracking-[0.3em] uppercase text-bone/55">
          <span className="h-1.5 w-1.5 rounded-full bg-mint animate-pulse" />
          <span ref={status}>{STEPS[0][1]}</span>
        </div>
      </div>

      {/* corner telemetry */}
      <div className="pl-content pointer-events-none absolute inset-0 p-6 md:p-10 text-[10px] md:text-[11px] tracking-[0.25em] uppercase text-bone/35">
        <div className="absolute left-6 top-6 md:left-10 md:top-10">Youcef // Mission control</div>
        <div className="absolute right-6 top-6 md:right-10 md:top-10 text-right">Sys v2.6</div>
        <div className="absolute left-6 bottom-6 md:left-10 md:bottom-10">36.75° N · 3.06° E</div>
        <div className="absolute right-6 bottom-6 md:right-10 md:bottom-10 text-right">Launch window open</div>
      </div>
    </div>
  );
}
