// Hero-style headline lines. Each inner array is one masked line; a word can be
// a plain string, or [word, accentColor] to render it as a serif-italic accent
// (exactly like the hero's "intelligent" / "immersive").
const LINES = [
  ["I", "turn", "complex", "problems"],
  ["into", ["effortless", "text-mint"], "software"],
  ["—", "real-time", ["vision", "text-violet"]],
  ["and", ["immersive", "text-mint"], "web."],
];

const FACTS = [
  ["Based in", "Algeria"],
  ["Studio", "Softweave Elevation"],
  ["Focus", "Full-stack · CV · Creative dev"],
  ["Status", "Open to remote freelance"],
];

export default function About() {
  return (
    <section
      id="about"
      className="min-h-screen flex items-center justify-end px-6 md:px-12 relative z-10"
    >
      <div className="max-w-4xl ml-auto text-right">
        <div className="flex items-center justify-end gap-3 mb-8 text-xs tracking-[0.24em] uppercase text-bone/55">
          <span className="font-display font-bold text-violet">01</span>
          <span className="w-7 h-px bg-mint inline-block" />
          About
        </div>

        <h2
          className="about-text font-display font-extrabold leading-[0.9] tracking-tight"
          style={{ fontSize: "clamp(2.25rem,7vw,7rem)" }}
        >
          {LINES.map((line, li) => (
            <span key={li} className="mask">
              {line.map((w, wi) => {
                const [text, accent] = Array.isArray(w) ? w : [w, null];
                return (
                  <span key={wi} className="about-word inline-block text-bone/15">
                    {accent ? (
                      <span
                        className={`font-serif italic ${accent}`}
                        style={{ fontWeight: 400 }}
                      >
                        {text}
                      </span>
                    ) : (
                      text
                    )}
                    &nbsp;
                  </span>
                );
              })}
            </span>
          ))}
        </h2>

        <div className="about-facts grid grid-cols-2 md:grid-cols-4 gap-px mt-16 bg-line rounded-2xl overflow-hidden">
          {FACTS.map(([k, v]) => (
            <div
              key={k}
              className="about-fact group bg-ink px-5 py-6 hover:bg-ink2 transition-colors duration-300"
            >
              <div className="flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-bone/45">
                <span className="h-1 w-1 rounded-full bg-violet opacity-0 group-hover:opacity-100 transition-opacity" />
                {k}
              </div>
              <div className="mt-2 text-bone/90 text-sm md:text-base">{v}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}