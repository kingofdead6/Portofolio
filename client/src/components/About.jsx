
import SectionTag from "./SectionTag";

const LINES = [
  ["I", "turn", "complex", "problems"],
  ["into", ["effortless", "text-mint"], "software"],
  ["—", "real-time", ["vision", "text-violet"]],
  ["and", ["immersive", "text-mint"], "web."],
];

const FACTS = [
  ["Based in", "Algeria"],
  ["Studio", "Softweb Elevation"],
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
        <SectionTag num="01" label="About" align="end" className="mb-8" />

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

        <div className="about-facts grid grid-cols-2 md:grid-cols-4 gap-3 mt-16">
          {FACTS.map(([k, v]) => (
            <div
              key={k}
              data-hover
              className="about-fact hud-panel group px-5 py-6 text-left transition-colors duration-300 hover:bg-violet/[0.06]"
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