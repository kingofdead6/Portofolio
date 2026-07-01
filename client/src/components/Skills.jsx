import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Split from "./Split";
import { icon } from "../lib/DataContext";

gsap.registerPlugin(ScrollTrigger);

function SkillTile({ it, accent }) {
  return (
    <div
      data-hover
      className="skill-card group relative overflow-hidden rounded-2xl border border-line bg-white/5 backdrop-blur-sm p-5"
      style={{ willChange: "transform" }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: `radial-gradient(120% 120% at 50% 0%, ${accent}24, transparent 70%)` }}
      />
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl border opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ borderColor: `${accent}90` }}
      />
      <div className="tile-glare pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 mix-blend-overlay" />

      <div className="relative flex items-start justify-between">
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-white/5 ring-1 ring-white/10 transition-colors duration-500 group-hover:ring-white/25 overflow-hidden">
          {it.image?.url ? (
            <img
              src={it.image.url}
              alt={it.n}
              className="h-full w-full object-cover transition-all duration-500"
            />
          ) : it.i ? (
            <img
              src={icon(it.i)}
              alt={it.n}
              className="h-7 w-7 object-contain grayscale transition-all duration-500 group-hover:grayscale-0"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <span className="text-xs font-display font-bold" style={{ color: accent }}>
              {it.n.slice(0, 2)}
            </span>
          )}
        </div>
        <span
          className="tile-num font-display text-[11px] tabular-nums text-bone/30"
          data-level={it.level}
        >
          {it.level}
        </span>
      </div>

      <h4 className="relative mt-5 font-display font-bold text-lg leading-tight text-bone">
        {it.n}
      </h4>
      <p className="relative mt-1 text-xs text-bone/45">{it.note}</p>

      <div className="relative mt-4 h-1 overflow-hidden rounded-full bg-white/5">
        <span
          className="tile-bar block h-full rounded-full"
          style={{ width: `${it.level}%`, background: accent, transformOrigin: "left" }}
        />
      </div>
    </div>
  );
}

export default function Skills({ skills = [] }) {
  const SKILLS = skills;
  const sectionRef = useRef(null);

  useEffect(() => {
    const sec = sectionRef.current;
    if (!sec) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const desktop =
      window.matchMedia("(min-width: 1024px)").matches &&
      window.matchMedia("(hover: hover)").matches;
    const groups = Array.from(sec.querySelectorAll(".skill-group"));
    const pills = Array.from(sec.querySelectorAll(".skills-cat"));
    const removers = [];

    // Data arrives asynchronously from the API, so the very first effect run
    // can happen before any .skill-group exists. Bail until they're rendered;
    // the [skills] dependency re-runs this once the tiles are in the DOM.
    if (groups.length === 0) return;

    // ---------- fallback: natural flow (mobile / reduced motion) ----------
    if (reduce || !desktop) {
      sec.style.height = "auto";
      sec.style.justifyContent = "flex-start";
      sec.classList.remove("overflow-hidden");
      const stage = sec.querySelector(".skills-stage");
      if (stage) {
        stage.style.position = "static";
        stage.style.height = "auto";
        stage.style.flex = "none";
      }
      groups.forEach((g, i) => {
        g.style.position = "relative";
        g.style.opacity = "1";
        g.style.visibility = "visible";
        if (i < groups.length - 1) g.style.marginBottom = "4rem";
      });
      pills.forEach((p) => (p.style.opacity = "1"));
      return;
    }

    // ---------- desktop: pinned scroll-driven stepper ----------
    groups.forEach((g, i) => {
      gsap.set(g, { autoAlpha: i === 0 ? 1 : 0, yPercent: i === 0 ? 0 : 14 });
      g.querySelectorAll(".tile-bar").forEach((b) => gsap.set(b, { scaleX: 0 }));
      g.querySelectorAll(".tile-num").forEach((n) => (n.textContent = "0"));
    });

    const activated = new Set();
    const activate = (g) => {
      if (activated.has(g)) return;
      activated.add(g);
      g.querySelectorAll(".tile-bar").forEach((b) =>
        gsap.to(b, { scaleX: 1, duration: 0.9, ease: "power2.out" })
      );
      g.querySelectorAll(".tile-num").forEach((numEl) => {
        const target = +numEl.dataset.level;
        const o = { v: 0 };
        gsap.to(o, {
          v: target,
          duration: 1,
          ease: "power2.out",
          onUpdate: () => {
            numEl.textContent = Math.round(o.v);
          },
        });
      });
    };

    const ctx = gsap.context(() => {
      // heading reveal (non-scrub, as you arrive)
      gsap.from(sec.querySelectorAll(".skills-head .mask span"), {
        yPercent: 110,
        duration: 1,
        ease: "power4.out",
        stagger: 0.04,
        scrollTrigger: { trigger: sec, start: "top 70%" },
      });

      // endless marquee — two identical copies, wrapped at one-copy width so it
      // loops seamlessly. Scrubbed across the exact same scroll distance as the
      // card stepper below, so the strip travels in lockstep with the cards.
      const track = sec.querySelector(".skills-marquee-track");
      if (track) {
        const wrapX = gsap.utils.wrap(-50, 0); // one copy = 50% of the track width
        gsap.to(track, {
          xPercent: -50 * 0.5, // 6 copy-lengths over the pin; wrap keeps it infinite
          ease: "none",
          modifiers: {
            xPercent: (v) => wrapX(parseFloat(v)),
          },
          scrollTrigger: {
            trigger: sec,
            start: "top top",
            end: "+=" + groups.length * 85 + "%", // == the pinned timeline's range
            scrub: 1,
          },
        });
      }

      const total = groups.length;
      const cardsOf = (g) => g.querySelectorAll(".skill-card");

      // master pinned timeline — scroll scrubs through the categories
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sec,
          start: "top top",
          end: "+=" + total * 85 + "%",
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const idx = Math.min(total - 1, Math.floor(self.progress * total));
            pills.forEach((p, i) => {
              p.style.opacity = i === idx ? "1" : "0.35";
            });
          },
        },
      });

      // group 0 — cards rise into place as the pin begins
      tl.from(
        cardsOf(groups[0]),
        {
          yPercent: 60,
          autoAlpha: 0,
          rotateX: -40,
          transformOrigin: "50% 100%",
          stagger: { each: 0.05, from: "random" },
          duration: 0.6,
          ease: "power3.out",
        },
        0
      );
      tl.call(() => activate(groups[0]), null, 0.1);

      // each subsequent group: previous rises out, next rises in
      let pos = 1.2;
      for (let i = 1; i < total; i++) {
        const prev = groups[i - 1];
        const cur = groups[i];
        tl.to(prev, { yPercent: -16, autoAlpha: 0, duration: 0.5, ease: "power2.in" }, pos);
        tl.fromTo(
          cur,
          { yPercent: 16, autoAlpha: 0 },
          { yPercent: 0, autoAlpha: 1, duration: 0.5, ease: "power2.out" },
          pos + 0.12
        );
        tl.from(
          cardsOf(cur),
          {
            yPercent: 60,
            autoAlpha: 0,
            rotateX: -40,
            transformOrigin: "50% 100%",
            stagger: { each: 0.05, from: "random" },
            duration: 0.6,
            ease: "power3.out",
          },
          pos + 0.18
        );
        tl.call(() => activate(cur), null, pos + 0.25);
        pos += 1.3;
      }
      tl.to({}, { duration: 0.4 }, pos); // trailing hold before unpin
    }, sec);

    // interactive 3D tilt + glare on the active group's cards
    sec.querySelectorAll(".skill-card").forEach((card) => {
      const glare = card.querySelector(".tile-glare");
      const rX = gsap.quickTo(card, "rotationX", { duration: 0.4, ease: "power3" });
      const rY = gsap.quickTo(card, "rotationY", { duration: 0.4, ease: "power3" });

      const onMove = (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        rY(px * 18);
        rX(-py * 18);
        if (glare) {
          glare.style.opacity = "1";
          glare.style.background = `radial-gradient(circle at ${(px + 0.5) * 100}% ${
            (py + 0.5) * 100
          }%, rgba(255,255,255,0.28), transparent 55%)`;
        }
      };
      const onEnter = () =>
        gsap.to(card, { y: -8, scale: 1.04, duration: 0.4, ease: "power3", overwrite: "auto" });
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

    return () => {
      removers.forEach((r) => r());
      ctx.revert();
    };
    // re-run if the skills data arrives/changes so the tiles are measured
  }, [skills]);

  return (
    <section
      ref={sectionRef}
      id="skills"
      className="skills-section relative z-10 h-screen overflow-hidden flex flex-col px-6 md:px-12 pt-24 pb-8"
    >
      {/* header */}
      <div className="skills-head shrink-0">
        <div className="flex items-center gap-4 mb-4">
          <span className="font-display font-bold text-violet text-sm md:text-base">02</span>
          <span className="text-xs tracking-[0.24em] uppercase text-bone/45">Skills</span>
        </div>
        <h2
          className="font-display font-extrabold tracking-tight leading-[0.95]"
          style={{ fontSize: "clamp(1.8rem,5vw,4rem)" }}
        >
          <span className="mask">
            <Split text="Everything I" />
          </span>
          <span className="mask font-serif italic text-mint" style={{ fontWeight: 400 }}>
            <Split text="build with." />
          </span>
        </h2>
      </div>

      {/* category progress */}
      <div className="shrink-0 mt-6 flex flex-wrap gap-x-6 gap-y-2">
        {SKILLS.map((grp, i) => (
          <div
            key={grp.group}
            className="skills-cat flex items-center gap-2 transition-opacity duration-300"
            style={{ opacity: i === 0 ? 1 : 0.35 }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: grp.accent }} />
            <span className="text-sm font-display font-bold text-bone">{grp.group}</span>
            <span className="text-bone/30 text-xs">{String(i + 1).padStart(2, "0")}</span>
          </div>
        ))}
      </div>

      {/* stage — one category shown at a time, cards rise through it */}
      <div className="skills-stage relative flex-1 mt-8">
        {SKILLS.map((grp) => (
          <div
            key={grp.group}
            className="skill-group absolute inset-0 flex flex-col justify-center"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -top-6 right-0 h-48 w-48 rounded-full blur-3xl opacity-[0.07]"
              style={{ background: grp.accent }}
            />
            <div className="relative flex items-center gap-4 mb-7">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: grp.accent }} />
              <div className="flex items-baseline gap-3">
                <h3 className="font-display font-bold text-xl md:text-2xl tracking-tight text-bone">
                  {grp.group}
                </h3>
                <span className="text-sm text-bone/40">{grp.label}</span>
              </div>
              <span className="font-display text-bone/25 text-sm">
                ({String(grp.items.length).padStart(2, "0")})
              </span>
              <span
                className="group-line hidden sm:block flex-1 h-px"
                style={{
                  backgroundImage: `linear-gradient(90deg, transparent, ${grp.accent}99 50%, transparent)`,
                  backgroundSize: "120px 100%",
                  backgroundRepeat: "repeat-x",
                }}
              />
            </div>

            <div
              className="relative grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4"
              style={{ perspective: "1200px" }}
            >
              {grp.items.map((it) => (
                <SkillTile key={it.n} it={it} accent={grp.accent} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* persistent marquee strip */}
      <div className="skills-marquee shrink-0 relative mt-6 overflow-hidden border-t border-line pt-4 hidden md:block">
        <div className="skills-marquee-track flex w-max items-center gap-8 whitespace-nowrap will-change-transform">
          {[...SKILLS, ...SKILLS].flatMap((grp, gi) =>
            grp.items.map((it, ii) => (
              <span
                key={`${gi}-${ii}-${it.n}`}
                className="font-display font-extrabold uppercase tracking-tight text-bone/10"
                style={{ fontSize: "clamp(1.2rem,3vw,2.2rem)" }}
              >
                {it.n}
                <span className="mx-8 align-middle" style={{ color: grp.accent }}>
                  ·
                </span>
              </span>
            ))
          )}
        </div>
      </div>
    </section>
  );
}