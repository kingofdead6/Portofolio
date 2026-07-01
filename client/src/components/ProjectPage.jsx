import { CATEGORIES } from "../lib/data";

export default function ProjectPage({ p, onClose, pageRef }) {
  const catLabel = (CATEGORIES.find((c) => c.key === p.category) || {}).label;

  return (
    <div
      ref={pageRef}
      className="fixed inset-0 z-[60] overflow-y-auto"
   
    >
      <div className="grain" />

      {/* watermark title */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 overflow-hidden leading-none select-none"
      >
        <span
          className="block font-display font-extrabold text-white/[0.06] whitespace-nowrap px-6"
          style={{ fontSize: "clamp(6rem,22vw,20rem)" }}
        >
          {p.t}
        </span>
      </div>

      <div className="relative min-h-screen px-6 md:px-16 py-10 md:py-16">
        <button
          data-hover
          onClick={onClose}
          className="pp-el group inline-flex items-center gap-2 rounded-full border border-bone/25 px-4 py-2 text-sm tracking-wide text-bone/80 hover:text-bone hover:border-bone/50 transition-colors"
        >
          <span className="inline-block transition-transform group-hover:-translate-x-1">←</span>
          Back to work
        </button>

        <div className="mt-16 md:mt-24 grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-start">
          <div className="max-w-2xl">
            <div className="pp-el flex flex-wrap items-center gap-3">
              {catLabel && (
                <span className="rounded-full border border-bone/30 bg-white/10 px-3 py-1 text-[11px] tracking-[0.18em] uppercase text-bone backdrop-blur-sm">
                  {catLabel}
                </span>
              )}
              <span className="text-xs tracking-[0.24em] uppercase text-bone/70">
                {p.cat} — {p.year}
              </span>
            </div>
            <h1
              className="pp-el font-display font-extrabold leading-[0.92] tracking-tight mt-5"
              style={{ fontSize: "clamp(2.6rem,8vw,6.5rem)" }}
            >
              {p.t}
            </h1>
            <p
              className="pp-el font-serif italic text-bone/90 mt-6"
              style={{ fontSize: "clamp(1.2rem,2.6vw,2rem)" }}
            >
              {p.blurb}
            </p>
            <p
              className="pp-el text-bone/80 mt-8 leading-relaxed"
              style={{ fontSize: "clamp(1rem,1.4vw,1.15rem)" }}
            >
              {p.desc}
            </p>

            <div className="pp-el flex flex-wrap gap-2 mt-10">
              {p.stack.map((s) => (
                <span
                  key={s}
                  className="px-3 py-1.5 rounded-full border border-bone/25 text-bone/85 text-sm backdrop-blur-sm"
                >
                  {s}
                </span>
              ))}
            </div>

            {(p.liveUrl || p.sourceUrl) && (
              <div className="pp-el flex flex-wrap gap-4 mt-12">
                {p.liveUrl && (
                  <a
                    href={p.liveUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    data-hover
                    className="px-6 py-3 rounded-full bg-bone text-ink font-medium hover:scale-[1.03] transition-transform"
                  >
                    View live ↗
                  </a>
                )}
                {p.sourceUrl && (
                  <a
                    href={p.sourceUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    data-hover
                    className="px-6 py-3 rounded-full border border-bone/35 text-bone hover:bg-bone/10 transition-colors"
                  >
                    Source code ↗
                  </a>
                )}
              </div>
            )}
          </div>

          {/* visual panel — project screenshot, or a gradient placeholder */}
          <div
            className="pp-el relative rounded-3xl overflow-hidden ring-1 ring-white/15 aspect-[4/3] hidden lg:block"
            style={{ background: `linear-gradient(135deg, ${p.c1}, ${p.c2})` }}
          >
            {p.image?.url ? (
              <img
                src={p.image.url}
                alt={p.t}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <>
                <div className="noise-layer absolute inset-0 opacity-[0.15] mix-blend-overlay" />
                <div className="absolute inset-0 grid place-items-center text-bone/40 text-sm tracking-wide">
                  Add a screenshot here
                </div>
              </>
            )}
          </div>
        </div>

        <div className="pp-el mt-16 md:mt-24 grid md:grid-cols-3 gap-6">
          {[
            ["Role", "Design & full-stack build"],
            ["Timeline", p.year],
            ["Stack", p.stack.slice(0, 3).join(" · ")],
          ].map(([k, v]) => (
            <div key={k} className="border-t border-bone/25 pt-4">
              <div className="text-xs tracking-[0.2em] uppercase text-bone/60">{k}</div>
              <div className="mt-2 text-bone/90">{v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}