import { useEffect, useRef, useState, Fragment } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cardGradient, cld, hostOf } from "../lib/data";
import SectionTag from "./SectionTag";

gsap.registerPlugin(ScrollTrigger);

/* one filter pill */
function FilterChip({ label, accent, active, count, onClick }) {
  return (
    <button
      data-hover
      onClick={onClick}
      className={
        "flex-none rounded-full border px-4 py-1.5 text-sm font-display font-medium whitespace-nowrap transition-all duration-300 backdrop-blur-sm " +
        (active
          ? ""
          : "border-line bg-white/[0.03] text-bone/65 hover:text-bone hover:border-bone/40")
      }
      style={
        active
          ? {
              background: accent,
              borderColor: accent,
              color: "#0B0B0F",
              boxShadow: `0 0 22px ${accent}66`,
            }
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

/* sector divider between categories in the horizontal rail */
function CategorySlab({ cat, index, count }) {
  return (
    <div
      className="work-rail-item relative flex-none flex flex-col justify-between py-2"
      style={{ width: "clamp(230px,24vw,340px)", height: "var(--work-h)" }}
    >
      {/* huge outlined sector number */}
      <span
        aria-hidden
        className="pointer-events-none absolute -left-2 top-1/2 -translate-y-1/2 font-display font-extrabold leading-none select-none"
        style={{
          fontSize: "clamp(9rem,16vw,15rem)",
          color: "transparent",
          WebkitTextStroke: `1px ${cat.accent}40`,
        }}
      >
        {String(index + 1).padStart(2, "0")}
      </span>

      <div className="relative flex items-center gap-2 text-[11px] tracking-[0.26em] uppercase font-display font-bold" style={{ color: cat.accent }}>
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: cat.accent, boxShadow: `0 0 10px ${cat.accent}` }}
        />
        Sector {String(index + 1).padStart(2, "0")}
      </div>

      <div className="relative">
        <h3
          className="font-display font-extrabold leading-[0.88] tracking-tight"
          style={{ fontSize: "clamp(2.4rem,4.2vw,4.2rem)" }}
        >
          {cat.label}
        </h3>
        <div className="mt-5 h-px w-full" style={{ background: `linear-gradient(90deg, ${cat.accent}, transparent)` }} />
        <div className="mt-4 flex items-center gap-3 text-sm">
          <span className="font-display font-bold tabular-nums text-bone">
            {String(count).padStart(2, "0")}
          </span>
          <span className="text-bone/45">{count === 1 ? "project" : "projects"}</span>
          {cat.sub && (
            <>
              <span className="h-1 w-1 rounded-full" style={{ background: cat.accent }} />
              <span className="text-bone/45">{cat.sub}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* placeholder for categories with no projects yet */
function EmptyCard({ accent }) {
  return (
    <div
      className="work-rail-item flex-none rounded-[22px] border border-dashed border-line bg-[#0a0a14]/40 backdrop-blur-sm grid place-items-center"
      style={{ width: "var(--work-w)", height: "var(--work-h)" }}
    >
      <div className="text-center px-6">
        <div className="relative mx-auto mb-5 h-14 w-14">
          <span className="absolute inset-0 rounded-full border border-dashed animate-[reticle_8s_linear_infinite]" style={{ borderColor: `${accent}66` }} />
          <span className="absolute inset-0 grid place-items-center text-xl" style={{ color: accent }}>
            +
          </span>
        </div>
        <div className="text-bone/70 text-sm font-display font-bold">Under construction</div>
        <div className="text-bone/35 text-xs mt-1">New missions launching soon</div>
      </div>
    </div>
  );
}

/* the three traffic-light dots + address bar shared by cards & project page */
export function BrowserBar({ url, accent, right }) {
  const host = hostOf(url);
  return (
    <div className="flex items-center gap-3 h-9 px-3.5 border-b border-white/[0.06] bg-[#0b0b14]/90">
      <div className="flex gap-1.5">
        <span className="bdot h-2.5 w-2.5 rounded-full bg-white/15" style={{ "--dot": "#FF5F57" }} />
        <span className="bdot h-2.5 w-2.5 rounded-full bg-white/15" style={{ "--dot": "#FEBC2E" }} />
        <span className="bdot h-2.5 w-2.5 rounded-full bg-white/15" style={{ "--dot": "#28C840" }} />
      </div>
      <div className="flex-1 min-w-0 flex justify-center">
        <div className="flex min-w-0 max-w-[75%] items-center gap-1.5 rounded-md bg-white/[0.05] px-3 py-1 text-[11px] text-bone/50">
          <svg viewBox="0 0 16 16" className="h-2.5 w-2.5 flex-none" fill="currentColor" aria-hidden>
            <path d="M4 7V5a4 4 0 1 1 8 0v2h1v8H3V7h1Zm2 0h4V5a2 2 0 1 0-4 0v2Z" />
          </svg>
          <span className="truncate">{host || "localhost"}</span>
        </div>
      </div>
      <div className="flex-none text-[11px] font-display font-bold tabular-nums" style={{ color: accent }}>
        {right}
      </div>
    </div>
  );
}

/* screenshot, or an on-brand fallback when a project has no image yet */
export function Shot({ p, w, className = "", eager = false }) {
  const { c1, c2 } = cardGradient(p);
  if (p.image?.url) {
    return (
      <img
        src={cld(p.image.url, w)}
        alt={p.t}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        draggable="false"
        // if the resized derivative ever fails, fall back to the original upload
        onError={(e) => {
          if (e.currentTarget.src !== p.image.url) e.currentTarget.src = p.image.url;
        }}
        className={"h-full w-full object-cover object-top " + className}
      />
    );
  }
  return (
    <div
      className={"relative h-full w-full grid place-items-center " + className}
      style={{ background: `radial-gradient(120% 120% at 75% 10%, ${c1}, ${c2} 60%, #07070d)` }}
    >
      <div className="noise-layer absolute inset-0 opacity-[0.15] mix-blend-overlay" />
      <span className="relative font-display font-extrabold text-white/85 tracking-tight" style={{ fontSize: "clamp(2.5rem,7vw,5rem)" }}>
        {p.t
          .split(/\s+/)
          .slice(0, 2)
          .map((s) => s[0])
          .join("")
          .toUpperCase()}
      </span>
    </div>
  );
}

/* ---- project card ----
   Animation hooks kept for App.jsx: .work-card (FLIP origin via onClick
   currentTarget, curve transform), .work-card-inner (3D tilt), .work-img
   (scroll parallax scale) and .work-glare. */
function ProjectCard({ p, index, num, accent, onOpen }) {
  const extra = Math.max(0, (p.stack?.length || 0) - 3);
  return (
    <article
      data-hover
      data-idx={index}
      onClick={(e) => onOpen(index, e.currentTarget)}
      className="work-card work-rail-item group relative flex-none cursor-pointer"
      style={{ width: "var(--work-w)", perspective: "1000px", "--acc": accent }}
    >
      <div
        className="work-card-inner holo relative rounded-[22px] p-2 border border-white/[0.08] bg-[#0b0b16]/90"
        style={{ willChange: "transform" }}
      >
        {/* accent bloom behind the card on hover */}
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-px rounded-[22px] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{ boxShadow: `0 30px 80px -20px ${accent}66, inset 0 0 0 1px ${accent}55` }}
        />

        {/* browser window */}
        <div className="relative overflow-hidden rounded-[14px] ring-1 ring-white/[0.06]">
          <BrowserBar url={p.liveUrl} accent={accent} right={String(num).padStart(2, "0")} />
          <div className="relative aspect-[16/9] overflow-hidden bg-[#07070d]">
            <div className="h-full w-full transition-transform duration-[900ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.06]">
              <div className="work-img h-full w-full" style={{ willChange: "transform" }}>
                <Shot p={p} w={960} eager={num <= 2} />
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#07070d]/70 via-transparent to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-90" />
            <div className="work-glare pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 mix-blend-overlay" />

            {/* "open" pill rises on hover */}
            <div className="absolute inset-x-0 bottom-4 flex justify-center">
              <span
                className="translate-y-4 opacity-0 transition-all duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:translate-y-0 group-hover:opacity-100 rounded-full px-4 py-2 text-xs font-medium text-ink backdrop-blur-md"
                style={{ background: accent, boxShadow: `0 0 24px ${accent}88` }}
              >
                Open mission file →
              </span>
            </div>
          </div>
        </div>

        {/* meta */}
        <div className="relative px-3 pt-4 pb-3">
          <div className="flex items-center justify-between gap-3 text-[10px] tracking-[0.22em] uppercase">
            <span className="truncate font-semibold" style={{ color: accent }}>
              {p.cat || "Project"}
            </span>
            <span className="flex flex-none items-center gap-3 text-bone/45">
              {p.year && <span className="tabular-nums">{p.year}</span>}
              {p.liveUrl && (
                <span className="flex items-center gap-1.5 text-mint/90">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-mint opacity-60 animate-ping" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-mint" />
                  </span>
                  Live
                </span>
              )}
            </span>
          </div>

          <div className="mt-2 flex items-end justify-between gap-4">
            <div className="min-w-0">
              <h3
                className="font-display font-extrabold tracking-tight leading-[0.95] truncate"
                style={{ fontSize: "clamp(1.4rem,2.4vw,2rem)" }}
              >
                {p.t}
              </h3>
              {p.blurb ? (
                <p className="mt-1.5 text-sm text-bone/50 line-clamp-1">{p.blurb}</p>
              ) : p.stack?.length > 0 ? (
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {p.stack.slice(0, 3).map((s) => (
                    <span key={s} className="text-[11px] rounded-full px-2.5 py-0.5 bg-white/[0.06] ring-1 ring-white/10 text-bone/70">
                      {s}
                    </span>
                  ))}
                  {extra > 0 && (
                    <span className="text-[11px] rounded-full px-2 py-0.5 text-bone/40">+{extra}</span>
                  )}
                </div>
              ) : (
                <p className="mt-1.5 text-sm text-bone/40">{hostOf(p.liveUrl) || "Case study"}</p>
              )}
            </div>

            <span className="relative grid flex-none place-items-center h-11 w-11 rounded-full ring-1 ring-white/20 overflow-hidden text-bone group-hover:text-ink transition-colors duration-300">
              <span
                className="absolute inset-0 rounded-full scale-0 group-hover:scale-100 transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)]"
                style={{ background: accent }}
              />
              <span className="relative text-lg leading-none transition-transform duration-500 group-hover:-rotate-45">
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
  const shownTotal = shownCategories.reduce((n, c) => n + countFor(c.key), 0);
  const activeAccent =
    (categories.find((c) => c.key === activeCat) || {}).accent || "#7866FF";

  // When the filter changes, the rail's total width changes — so the pinned
  // horizontal scroll distance (set up in App.jsx with invalidateOnRefresh)
  // must be recomputed. We refresh on the next frame (after React paints the
  // new set) and snap back to the top of the section so the filtered rail
  // reads from its first card.
  // Only on an actual filter change — never on mount, or the page would jump
  // to Work on load. (Comparing values also survives StrictMode's re-run.)
  const prevCat = useRef(activeCat);
  useEffect(() => {
    if (prevCat.current === activeCat) return;
    prevCat.current = activeCat;
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
        rY(px * 10);
        rX(-py * 10);
        if (glare) {
          glare.style.opacity = "1";
          glare.style.background = `radial-gradient(circle at ${(px + 0.5) * 100}% ${
            (py + 0.5) * 100
          }%, rgba(255,255,255,0.25), transparent 55%)`;
        }
      };
      const onEnter = () =>
        gsap.to(card, { y: -10, duration: 0.4, ease: "power3", overwrite: "auto" });
      const onLeave = () => {
        rX(0);
        rY(0);
        if (glare) glare.style.opacity = "0";
        gsap.to(card, { y: 0, duration: 0.6, ease: "power3", overwrite: "auto" });
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
    <section
      ref={sectionRef}
      id="work"
      className="work-section relative z-10 bg-[#05050a]/40 overflow-hidden"
    >
      {/* header + filter chips (stay visible through the pin) */}
      <div className="absolute top-20 md:top-24 left-0 right-0 z-20 px-6 md:px-12 flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
        <SectionTag num="03" label="Selected work" className="flex-none" />

        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
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

      <div className="h-screen flex items-center pt-24 md:pt-20">
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
                      key={p._id || p.t}
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

          {/* end of the rail — orbiting CTA */}
          <div className="work-rail-item flex-none w-[70vw] md:w-[34vw] grid place-items-center px-8">
            <button
              data-hover
              onClick={() => scrollTo("contact")}
              className="group relative grid h-56 w-56 md:h-64 md:w-64 place-items-center rounded-full"
            >
              <span className="absolute inset-0 rounded-full border border-dashed border-bone/20 animate-[reticle_18s_linear_infinite]" />
              <span className="absolute inset-5 rounded-full border border-line transition-colors duration-500 group-hover:border-violet/60" />
              <span className="absolute inset-5 rounded-full bg-violet/0 transition-colors duration-500 group-hover:bg-violet/10" />
              <span className="absolute inset-0 animate-[reticle_9s_linear_infinite]">
                <span className="absolute left-1/2 -top-1 h-2 w-2 -translate-x-1/2 rounded-full bg-mint shadow-[0_0_10px_#5BE9B9]" />
              </span>
              <span className="relative text-center">
                <span className="block text-[10px] tracking-[0.3em] uppercase text-bone/40">
                  End of transmission
                </span>
                <span className="mt-2 block font-display font-bold text-2xl md:text-3xl text-bone/80 transition-colors group-hover:text-bone">
                  Let's talk
                  <span className="inline-block ml-2 transition-transform duration-500 group-hover:translate-x-1.5">→</span>
                </span>
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* rail HUD — progress through the current set (driven from App.jsx) */}
      <div className="pointer-events-none absolute bottom-6 md:bottom-8 left-0 right-0 z-20 px-6 md:px-12 flex items-center gap-5 text-[10px] tracking-[0.28em] uppercase text-bone/40">
        <span className="hidden sm:inline">Scroll to travel</span>
        <div className="relative h-px flex-1 bg-white/10 overflow-hidden">
          <span
            className="work-hud-bar absolute inset-0 origin-left"
            style={{
              transform: "scaleX(0)",
              background: `linear-gradient(90deg, ${activeAccent}, #5BE9B9)`,
              boxShadow: `0 0 10px ${activeAccent}`,
            }}
          />
        </div>
        <span className="tabular-nums text-bone/70">
          <span className="work-hud-count text-bone">01</span>
          <span className="mx-1.5 text-bone/30">/</span>
          {String(shownTotal).padStart(2, "0")}
        </span>
      </div>
    </section>
  );
}
