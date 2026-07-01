import { useEffect, useRef, useState, Fragment } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cardGradient } from "../lib/data";

gsap.registerPlugin(ScrollTrigger);

/* one filter pill */
function FilterChip({ label, accent, active, count, onClick }) {
  return (
    <button
      data-hover
      onClick={onClick}
      className={
        "flex-none rounded-full border px-4 py-1.5 text-sm font-display font-medium whitespace-nowrap transition-colors duration-300 " +
        (active
          ? ""
          : "border-line text-bone/65 hover:text-bone hover:border-bone/40")
      }
      style={
        active
          ? { background: accent, borderColor: accent, color: "#0B0B0F" }
          : undefined
      }
    >
      {label}
      {typeof count === "number" && (
        <span className="ml-1.5 text-[11px] opacity-60 tabular-nums">{count}</span>
      )}
    </button>
  );
}

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

/* ---- redesigned project card ----
   Keeps every animation hook (.work-card / .work-card-inner / .work-img /
   .work-glare, the onClick currentTarget used for the FLIP open, and the
   per-project gradient) — only the visual layer on top is reworked. */
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
        className="work-card-inner relative rounded-[26px] overflow-hidden ring-1 ring-white/10 transition-shadow duration-500 group-hover:shadow-2xl group-hover:shadow-black/50"
        style={{ aspectRatio: "4/5", willChange: "transform" }}
      >
        {/* image / gradient background — parallax target (scaled in App.jsx) */}
        <div
          className="work-img absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: p.image?.url
              ? `radial-gradient(120% 120% at 75% 12%, ${c1}cc 0%, ${c2}b3 55%, rgba(10,10,14,.92) 100%), url(${p.image.url})`
              : `radial-gradient(120% 120% at 75% 12%, ${c1} 0%, ${c2} 58%, #0A0A0E 100%)`,
            willChange: "transform",
          }}
        />
        <div className="noise-layer absolute inset-0 opacity-[0.12] mix-blend-overlay pointer-events-none" />

        {/* legibility scrim — stronger toward the bottom where the text sits */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(8,8,11,.15) 0%, transparent 32%, rgba(8,8,11,.4) 58%, rgba(8,8,11,.92) 100%)",
          }}
        />

        {/* accent bar that draws across the top edge on hover */}
        <div
          className="absolute top-0 left-0 h-[3px] w-0 group-hover:w-full transition-all duration-700 ease-out"
          style={{ background: accent }}
        />

        {/* top row — frosted index + year tags */}
        <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
          <span
            className="font-display font-bold text-xs tabular-nums rounded-full px-2.5 py-1 bg-black/35 backdrop-blur-md ring-1 ring-white/10"
            style={{ color: accent }}
          >
            {String(num).padStart(2, "0")}
          </span>
          <span className="text-[10px] tracking-[0.2em] uppercase text-bone/75 rounded-full bg-black/35 backdrop-blur-md ring-1 ring-white/10 px-3 py-1">
            {p.year}
          </span>
        </div>

        {/* accent edge on hover */}
        <div
          className="pointer-events-none absolute inset-0 rounded-[26px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ boxShadow: `inset 0 0 0 1px ${accent}` }}
        />
        {/* cursor glare for the 3D tilt */}
        <div className="work-glare pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 mix-blend-overlay" />

        {/* bottom content block */}
        <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
          <div
            className="text-[11px] tracking-[0.22em] uppercase font-semibold"
            style={{ color: accent }}
          >
            {p.cat}
          </div>

          <h3
            className="font-display font-extrabold tracking-tight mt-2 leading-[0.95]"
            style={{ fontSize: "clamp(1.5rem,3.2vw,2.2rem)" }}
          >
            {p.t}
          </h3>

          {/* short accent rule that extends on hover */}
          <div
            className="h-px mt-3 w-10 group-hover:w-20 transition-all duration-500 ease-out"
            style={{ background: accent }}
          />

          {/* tech stack — smoothly expands in on hover */}
          {p.stack?.length > 0 && (
            <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-out">
              <div className="overflow-hidden">
                <div className="flex flex-wrap gap-1.5 mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                  {p.stack.slice(0, 3).map((s) => (
                    <span
                      key={s}
                      className="text-[11px] rounded-full px-2.5 py-1 bg-white/10 ring-1 ring-white/15 text-bone/80 backdrop-blur-sm"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* CTA row — label + circular arrow that fills with the accent */}
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-bone/80 font-medium tracking-wide">
              View project
            </span>
            <span className="relative grid place-items-center h-10 w-10 rounded-full ring-1 ring-white/25 overflow-hidden text-bone group-hover:text-ink transition-colors duration-300">
              <span
                className="absolute inset-0 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300 ease-out"
                style={{ background: accent }}
              />
              <span className="relative text-lg leading-none transition-transform duration-300 group-hover:translate-x-0.5">
                →
              </span>
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function Work({ projects = [], categories = [], openProject, scrollTo }) {
  const sectionRef = useRef(null);
  const [activeCat, setActiveCat] = useState("all");

  // which categories are rendered into the rail right now
  const shownCategories =
    activeCat === "all"
      ? categories
      : categories.filter((c) => c.key === activeCat);

  // small helper: how many projects sit in a given category
  const countFor = (key) => projects.filter((p) => p.category === key).length;

  // When the filter changes, the rail's total width changes — so the pinned
  // horizontal scroll distance (set up in App.jsx with invalidateOnRefresh)
  // must be recomputed. We refresh on the next frame (after React paints the
  // new set) and snap back to the top of the section so the filtered rail
  // reads from its first card.
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      if (scrollTo) scrollTo("work");
    });
    return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCat]);

  // interactive 3D tilt + glare on the cards (pointer devices only).
  // Re-runs whenever the visible set changes so freshly-shown cards get wired up.
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
  }, [activeCat, projects.length, categories.length]);

  return (
    <section ref={sectionRef} id="work" className="relative z-10 bg-ink/70 overflow-hidden">
      {/* header + filter chips (stay visible through the pin) */}
      <div className="absolute top-8 md:top-10 left-0 right-0 z-20 px-6 md:px-12">
        <div className="flex items-center gap-3 text-xs tracking-[0.24em] uppercase text-bone/55">
          <span className="font-display font-bold text-violet">03</span>
          <span className="w-7 h-px bg-violet inline-block" />
          Selected work
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          <FilterChip
            label="All"
            accent="#7866FF"
            active={activeCat === "all"}
            count={projects.length}
            onClick={() => setActiveCat("all")}
          />
          {categories.map((c) => (
            <FilterChip
              key={c.key}
              label={c.label}
              accent={c.accent}
              active={activeCat === c.key}
              count={countFor(c.key)}
              onClick={() => setActiveCat(c.key)}
            />
          ))}
        </div>
      </div>

      <div className="h-screen flex items-center">
        <div
          className="work-track flex items-center gap-6 md:gap-10 px-6 md:px-12"
          style={{ willChange: "transform" }}
        >
          {shownCategories.map((cat, ci) => {
            const items = projects
              .map((p, idx) => ({ p, idx }))
              .filter((x) => x.p.category === cat.key);
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