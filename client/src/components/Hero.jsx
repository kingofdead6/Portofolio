import { useEffect, useState } from "react";
import Split from "./Split";

const fmt = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Africa/Algiers",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

/* live local time at base — ticks every second */
function MissionClock() {
  const [now, setNow] = useState(() => fmt.format(new Date()));
  useEffect(() => {
    const id = setInterval(() => setNow(fmt.format(new Date())), 1000);
    return () => clearInterval(id);
  }, []);
  return <span className="tabular-nums text-bone/80">{now}</span>;
}

export default function Hero() {
  return (
    <section
      id="home"
      className="min-h-screen flex flex-col justify-center px-6 md:px-12 relative z-10"
    >
      <div className="hero-inner max-w-5xl">
        <div className="hero-fade inline-flex items-center gap-2.5 rounded-full border border-line bg-white/5 px-3.5 py-1 text-[10px] md:text-[11px] tracking-[0.22em] uppercase text-bone/60 backdrop-blur-sm">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-violet opacity-70 animate-ping" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-violet" />
          </span>
          Computer engineer · Full-stack &amp; CV developer
        </div>

        <h1
          className="glow-title font-display font-extrabold tracking-tight mt-7 leading-[0.9]"
          style={{ fontSize: "clamp(2.25rem,7vw,7rem)" }}
        >
          <span className="mask">
            <Split text="I'm Youcef —" cls="hero-char" />
          </span>
          <span className="mask">
            <Split text="I build " cls="hero-char" />
            <span
              className="font-serif italic text-mint"
              style={{ fontWeight: 400 }}
            >
              <Split text="intelligent" cls="hero-char" />
            </span>
          </span>
          <span className="mask">
            <span
              className="font-serif italic text-violet"
              style={{ fontWeight: 400 }}
            >
              <Split text="immersive" cls="hero-char" />
            </span>
            <Split text=" software" cls="hero-char" />
          </span>
        </h1>

        <div className="hero-fade hero-rule mt-10 h-px w-full max-w-3xl bg-gradient-to-r from-violet/60 via-line to-transparent" />

        <div className="flex flex-wrap items-end justify-between gap-8 mt-7">
          <p
            className="hero-fade text-bone/55 max-w-md leading-relaxed"
            style={{ fontSize: "clamp(.82rem,1vw,.95rem)" }}
          >
            Fourth-year computer-engineering student at ESI and founder of{" "}
            <span className="text-grad font-medium">Softweb Elevation</span> —
            building production web apps, computer-vision systems, and premium
            animated interfaces.
          </p>
          <div className="hero-fade flex items-center gap-3 text-xs tracking-[0.24em] uppercase text-bone/55">
            Scroll to explore
            <span className="scrollcue relative block w-px h-10 bg-bone/15 overflow-hidden" />
          </div>
        </div>
      </div>

      {/* mission telemetry — desktop only */}
      <div className="hero-fade hud-panel hidden lg:block absolute right-12 bottom-10 w-60 p-4 text-[10px] tracking-[0.22em] uppercase text-bone/45">
        <div className="flex justify-between">
          <span>Base</span>
          <span className="text-bone/80">Algiers, DZ</span>
        </div>
        <div className="mt-2 flex justify-between">
          <span>Local</span>
          <MissionClock />
        </div>
        <div className="mt-2 flex justify-between">
          <span>Coord</span>
          <span className="text-bone/80">36.75N · 3.06E</span>
        </div>
        <div className="mt-3 flex items-center gap-2 border-t border-line pt-3">
          <span className="h-1.5 w-1.5 rounded-full bg-mint shadow-[0_0_8px_#5BE9B9]" />
          <span className="text-mint/90">All systems nominal</span>
        </div>
      </div>
    </section>
  );
}
