import Split from "./Split";

export default function Hero() {
  return (
    <section
      id="home"
      className="min-h-screen flex flex-col justify-center px-6 md:px-12 relative z-10"
    >
      <div className="hero-inner max-w-5xl">
        <div className="hero-fade inline-flex items-center gap-2.5 rounded-full border border-line bg-white/5 px-3.5 py-1 text-[10px] md:text-[11px] tracking-[0.22em] uppercase text-bone/60 backdrop-blur-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-violet" />
          Computer engineer · Full-stack &amp; CV developer
        </div>

        <h1
          className="font-display font-extrabold tracking-tight mt-7 leading-[0.9]"
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

        <div className="hero-fade mt-10 h-px w-full max-w-3xl bg-gradient-to-r from-violet/50 via-line to-transparent" />

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
    </section>
  );
}