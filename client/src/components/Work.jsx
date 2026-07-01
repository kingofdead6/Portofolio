import { useEffect, useRef, Fragment } from "react";
import { gsap } from "gsap";
import { cardGradient } from "../lib/data";

/* big colour-zoned divider between categories in the horizontal rail */
function CategorySlab({ cat, index, count }) {
  return (
    <div
      className="flex-none flex flex-col justify-between py-2"
      style={{ width: "clamp(210px,26vw,340px)", height: "clamp(360px,62vh,560px)" }}
    >
      <div>
        <div className="font-display font-bold text-sm" style={{ color: cat.accent }}>
          {String(index + 1).padStart(2, "0")}
        </div>
        <div className="mt-4 h-px w-14" style={{ background: cat.accent }} />
      </div>
      <div>
        <h3
          className="font-display font-extrabold leading-[0.88] tracking-tight"
          style={{ fontSize: "clamp(2.4rem,4.5vw,4.5rem)" }}
        >
          {cat.label}
        </h3>
        <div className="mt-4 flex items-center gap-3 text-bone/50 text-sm">
          <span>
            {count} {count === 1 ? "project" : "projects"}
          </span>
          <span className="h-1 w-1 rounded-full" style={{ background: cat.accent }} />
          <span>{cat.sub}</span>
        </div>
      </div>
    </div>
  );
}

/* placeholder for categories with no projects yet */
function EmptyCard({ accent }) {
  return (
    <div
      className="flex-none rounded-[28px] border border-dashed border-line grid place-items-center"
      style={{ width: "clamp(240px,60vw,380px)", aspectRatio: "4/5" }}
    >
      <div className="text-center px-6">
        <div
          className="mx-auto mb-4 h-10 w-10 rounded-full grid place-items-center text-lg"
          style={{ background: `${accent}22`, color: accent }}
        >
          +
        </div>
        <div className="text-bone/60 text-sm">In the works</div>
        <div className="text-bone/30 text-xs mt-1">Projects coming soon</div>
      </div>
    </div>
  );
}

function ProjectCard({ p, index, num, accent, onOpen }) {
  // colours are picked at random (stable per project) rather than hand-set
  const { c1, c2 } = cardGradient(p);
  return (
    <article
      data-hover
      onClick={(e) => onOpen(index, e.currentTarget)}
      className="work-card group relative flex-none cursor-pointer"
      style={{ width: "clamp(280px,72vw,460px)", perspective: "1000px" }}
    >
      <div
        className="work-card-inner relative rounded-[28px] overflow-hidden ring-1 ring-white/10"
        style={{ aspectRatio: "4/5", willChange: "transform" }}
      >
        <div
          className="work-img absolute inset-0 bg-cover bg-center"
          style={{
            // If the project has an image, show it tinted with the random
            // gradient so the colourful design language is preserved;
            // otherwise use the pure colour gradient.
            backgroundImage: p.image?.url
              ? `radial-gradient(120% 120% at 75% 12%, ${c1}cc 0%, ${c2}b3 55%, rgba(10,10,14,.92) 100%), url(${p.image.url})`
              : `radial-gradient(120% 120% at 75% 12%, ${c1} 0%, ${c2} 58%, #0A0A0E 100%)`,
            willChange: "transform",
          }}
        />
        <div className="noise-layer absolute inset-0 opacity-[0.12] mix-blend-overlay pointer-events-none" />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(180deg,transparent 40%,rgba(8,8,11,.82))" }}
        />
        {/* accent edge on hover */}
        <div
          className="pointer-events-none absolute inset-0 rounded-[28px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ boxShadow: `inset 0 0 0 1px ${accent}` }}
        />
        {/* cursor glare for the 3D tilt */}
        <div className="work-glare pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 mix-blend-overlay" />

        <span
          className="absolute -top-3 right-4 font-display font-extrabold leading-none text-white/10 select-none"
          style={{ fontSize: "clamp(5rem,12vw,9rem)" }}
        >
          {String(num).padStart(2, "0")}
        </span>

        <div className="absolute top-5 left-5">
          <span className="text-[10px] tracking-[0.2em] uppercase text-bone/70 rounded-full bg-black/25 backdrop-blur px-3 py-1">
            {p.year}
          </span>
        </div>

        <div className="absolute bottom-5 left-5 right-5">
          <div className="text-[11px] tracking-[0.18em] uppercase" style={{ color: accent }}>
            {p.cat}
          </div>
          <h3
            className="font-display font-extrabold tracking-tight mt-1.5 leading-none"
            style={{ fontSize: "clamp(1.4rem,3vw,2.3rem)" }}
          >
            {p.t}
          </h3>
          <div className="mt-4 flex items-center gap-2 text-sm text-bone">
            <span className="translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
              View project
            </span>
            <span className="translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 delay-75">
              →
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function Work({ projects = [], categories = [], openProject, scrollTo }) {
  const sectionRef = useRef(null);

  // interactive 3D tilt + glare on the cards (pointer devices only)
  useEffect(() => {
    if (!window.matchMedia("(hover:hover)").matches) return;
    const sec = sectionRef.current;
    if (!sec) return;
    const removers = [];

    sec.querySelectorAll(".work-card-inner").forEach((card) => {
      const glare = card.querySelector(".work-glare");
      const rX = gsap.quickTo(card, "rotationX", { duration: 0.4, ease: "power3" });
      const rY = gsap.quickTo(card, "rotationY", { duration: 0.4, ease: "power3" });

      const onMove = (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        rY(px * 12);
        rX(-py * 12);
        if (glare) {
          glare.style.opacity = "1";
          glare.style.background = `radial-gradient(circle at ${(px + 0.5) * 100}% ${
            (py + 0.5) * 100
          }%, rgba(255,255,255,0.25), transparent 55%)`;
        }
      };
      const onEnter = () =>
        gsap.to(card, { y: -10, scale: 1.02, duration: 0.4, ease: "power3", overwrite: "auto" });
      const onLeave = () => {
        rX(0);
        rY(0);
        if (glare) glare.style.opacity = "0";
        gsap.to(card, { y: 0, scale: 1, duration: 0.6, ease: "power3", overwrite: "auto" });
      };

      card.addEventListener("mousemove", onMove);
      card.addEventListener("mouseenter", onEnter);
      card.addEventListener("mouseleave", onLeave);
      removers.push(() => {
        card.removeEventListener("mousemove", onMove);
        card.removeEventListener("mouseenter", onEnter);
        card.removeEventListener("mouseleave", onLeave);
      });
    });

    return () => removers.forEach((r) => r());
  }, []);

  return (
    <section ref={sectionRef} id="work" className="relative z-10 bg-ink/70 overflow-hidden">
      <div className="absolute top-10 left-6 md:left-12 z-20 flex items-center gap-3 text-xs tracking-[0.24em] uppercase text-bone/55">
        <span className="font-display font-bold text-violet">03</span>
        <span className="w-7 h-px bg-violet inline-block" />
        Selected work — by category
      </div>

      <div className="h-screen flex items-center">
        <div
          className="work-track flex items-center gap-6 md:gap-10 px-6 md:px-12"
          style={{ willChange: "transform" }}
        >
          {categories.map((cat, ci) => {
            const items = projects.map((p, idx) => ({ p, idx })).filter(
              (x) => x.p.category === cat.key
            );
            return (
              <Fragment key={cat.key}>
                <CategorySlab cat={cat} index={ci} count={items.length} />
                {items.length === 0 ? (
                  <EmptyCard accent={cat.accent} />
                ) : (
                  items.map(({ p, idx }, n) => (
                    <ProjectCard
                      key={p.t}
                      p={p}
                      index={idx}
                      num={n + 1}
                      accent={cat.accent}
                      onOpen={openProject}
                    />
                  ))
                )}
              </Fragment>
            );
          })}

          <div className="flex-none w-[60vw] md:w-[34vw] grid place-items-center px-8">
            <button
              data-hover
              onClick={() => scrollTo("contact")}
              className="group font-display font-bold text-bone/40 hover:text-bone transition-colors text-center"
              style={{ fontSize: "clamp(1.4rem,3vw,2.6rem)" }}
            >
              Let's talk
              <span className="inline-block ml-2 transition-transform group-hover:translate-x-2">→</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}