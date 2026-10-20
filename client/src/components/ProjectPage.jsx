import { useEffect } from "react";
import { cardGradient, cld, hostOf } from "../lib/data";
import { BrowserBar, Shot } from "./Work";

/* title split into words, each rising out of its own mask on entrance */
function RevealTitle({ text }) {
  return text.split(/\s+/).map((w, i) => (
    <span key={i} className="inline-block overflow-hidden align-bottom pb-[0.08em] -mb-[0.08em] mr-[0.22em] last:mr-0">
      <span className="pp-word inline-block">{w}</span>
    </span>
  ));
}

function Label({ children, accent }) {
  return (
    <div className="flex items-center gap-3 text-[10px] tracking-[0.3em] uppercase text-bone/45">
      <span className="h-px w-6" style={{ background: accent }} />
      {children}
    </div>
  );
}

function ArrowBtn({ dir, onClick, label }) {
  return (
    <button
      data-hover
      onClick={onClick}
      aria-label={label}
      className="group grid h-10 w-10 place-items-center rounded-full border border-bone/20 text-bone/70 transition-all duration-300 hover:border-bone/60 hover:text-bone hover:bg-white/5"
    >
      <span className={"transition-transform duration-300 " + (dir < 0 ? "group-hover:-translate-x-0.5" : "group-hover:translate-x-0.5")}>
        {dir < 0 ? "←" : "→"}
      </span>
    </button>
  );
}

export default function ProjectPage({
  p,
  accent,
  category,
  pos = 0,
  total = 1,
  next,
  onNav,
  onClose,
  pageRef,
}) {
  const { c2 } = cardGradient(p);
  const host = hostOf(p.liveUrl);
  const stack = p.stack || [];
  const catLabel = category?.label;

  // keyboard: Esc closes, ← / → walk the missions
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") onNav && onNav(1);
      else if (e.key === "ArrowLeft") onNav && onNav(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onNav]);

  const facts = [
    ["Role", "Design & full-stack build"],
    catLabel && ["Sector", catLabel],
    p.cat && ["Type", p.cat],
    p.year && ["Year", p.year],
    ["Status", p.liveUrl ? "Live in production" : p.sourceUrl ? "Open source" : "Case study"],
  ].filter(Boolean);

  return (
    <div
      ref={pageRef}
      // Lenis is stopped while a project is open, and a stopped Lenis cancels
      // every wheel event on the page — this opts the overlay out so it can
      // scroll natively.
      data-lenis-prevent
      className="pp fixed inset-0 z-[60] overflow-y-auto overscroll-contain"
      style={{ "--acc": accent }}
    >
      {/* ---- backdrop: deep space tinted by the project ---- */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[#05050a]" aria-hidden>
        {p.image?.url && (
          <img
            src={cld(p.image.url, 640)}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-[0.16] blur-3xl scale-125 saturate-150"
          />
        )}
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(90% 70% at 80% 0%, ${accent}38, transparent 60%), radial-gradient(70% 60% at 0% 100%, ${c2}30, transparent 60%)`,
          }}
        />
        <div className="pp-stars absolute inset-0 opacity-70" />
        <div className="absolute inset-0 bg-[radial-gradient(130%_100%_at_50%_40%,transparent_50%,rgba(3,3,8,.85)_100%)]" />
      </div>
      <div className="grain" />

      {/* ---- top bar ---- */}
      <header className="pp-el sticky top-0 z-20 border-b border-white/[0.06] bg-[#05050a]/55 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-5 md:px-12 py-3.5">
          <button
            data-hover
            onClick={onClose}
            className="group inline-flex items-center gap-2 rounded-full border border-bone/20 px-4 py-2 text-sm text-bone/80 transition-colors hover:border-bone/50 hover:text-bone"
          >
            <span className="inline-block transition-transform group-hover:-translate-x-1">←</span>
            <span className="hidden sm:inline">Back to work</span>
            <span className="sm:hidden">Back</span>
          </button>

          <div className="hidden md:flex items-center gap-3 text-[10px] tracking-[0.3em] uppercase text-bone/45">
            <span className="orbit-ico" aria-hidden />
            Mission
            <span className="tabular-nums text-bone">
              {String(pos + 1).padStart(2, "0")}
            </span>
            <span className="text-bone/25">/</span>
            <span className="tabular-nums">{String(total).padStart(2, "0")}</span>
          </div>

          <div className="flex items-center gap-2">
            <ArrowBtn dir={-1} label="Previous project" onClick={() => onNav && onNav(-1)} />
            <ArrowBtn dir={1} label="Next project" onClick={() => onNav && onNav(1)} />
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-[1400px] px-5 md:px-12 pt-12 md:pt-20 pb-16">
        {/* ---- heading ---- */}
        <div className="pp-el flex flex-wrap items-center gap-2.5">
          {catLabel && (
            <span
              className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] tracking-[0.22em] uppercase backdrop-blur-sm"
              style={{ borderColor: `${accent}66`, background: `${accent}14`, color: accent }}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: accent, boxShadow: `0 0 8px ${accent}` }} />
              {catLabel}
            </span>
          )}
          {p.cat && (
            <span className="rounded-full border border-line px-3 py-1 text-[10px] tracking-[0.22em] uppercase text-bone/60">
              {p.cat}
            </span>
          )}
          {p.year && (
            <span className="rounded-full border border-line px-3 py-1 text-[10px] tracking-[0.22em] uppercase text-bone/60 tabular-nums">
              {p.year}
            </span>
          )}
          {p.liveUrl && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-mint/30 bg-mint/[0.07] px-3 py-1 text-[10px] tracking-[0.22em] uppercase text-mint">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-mint opacity-60 animate-ping" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-mint" />
              </span>
              Live
            </span>
          )}
        </div>

        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <h1
            className="pp-title glow-title font-display font-extrabold leading-[0.9] tracking-tight"
            style={{ fontSize: "clamp(2.8rem,8.5vw,8rem)" }}
          >
            <RevealTitle text={p.t} />
          </h1>

          {(p.liveUrl || p.sourceUrl) && (
            <div className="pp-el flex flex-wrap gap-3 lg:justify-end lg:pb-3">
              {p.liveUrl && (
                <a
                  href={p.liveUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  data-hover
                  className="btn-launch group relative inline-flex items-center gap-2 overflow-hidden rounded-full px-6 py-3 font-medium text-ink"
                  style={{ background: accent }}
                >
                  <span className="relative">Visit live site</span>
                  <span className="relative transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">↗</span>
                </a>
              )}
              {p.sourceUrl && (
                <a
                  href={p.sourceUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  data-hover
                  className="group inline-flex items-center gap-2 rounded-full border border-bone/30 px-6 py-3 text-bone transition-colors hover:bg-bone/10"
                >
                  Source code
                  <span className="transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">↗</span>
                </a>
              )}
            </div>
          )}
        </div>

        {p.blurb && (
          <p
            className="pp-el mt-6 max-w-3xl font-serif italic text-bone/80"
            style={{ fontSize: "clamp(1.15rem,2.2vw,1.8rem)" }}
          >
            {p.blurb}
          </p>
        )}

        {/* ---- showcase: the screenshot in a browser window ---- */}
        <div className="pp-el pp-shot relative mt-12 md:mt-16">
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-x-6 -bottom-10 top-1/3 rounded-[50%] blur-3xl opacity-40"
            style={{ background: `radial-gradient(closest-side, ${accent}, transparent)` }}
          />
          <a
            href={p.liveUrl || undefined}
            target="_blank"
            rel="noreferrer noopener"
            data-hover={p.liveUrl ? "" : undefined}
            className={
              "group relative block overflow-hidden rounded-[18px] border border-white/10 bg-[#0b0b14] shadow-[0_40px_120px_-30px_rgba(0,0,0,.9)] transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] " +
              (p.liveUrl ? "hover:-translate-y-1.5" : "pointer-events-none")
            }
          >
            <BrowserBar url={p.liveUrl} accent={accent} right={p.liveUrl ? "↗" : ""} />
            <div className="relative aspect-[16/9] overflow-hidden">
              <Shot p={p} w={1800} eager className="transition-transform duration-[1200ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.03]" />
              <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/5" />
              {p.liveUrl && (
                <div className="absolute inset-0 grid place-items-center bg-[#05050a]/0 transition-colors duration-500 group-hover:bg-[#05050a]/35">
                  <span
                    className="translate-y-3 scale-95 opacity-0 transition-all duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100 rounded-full px-5 py-2.5 text-sm font-medium text-ink"
                    style={{ background: accent, boxShadow: `0 0 30px ${accent}99` }}
                  >
                    Open {host} ↗
                  </span>
                </div>
              )}
            </div>
          </a>
        </div>

        {/* ---- overview + mission data ---- */}
        <div className="mt-16 md:mt-24 grid gap-12 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="min-w-0">
            <div className="pp-el">
              <Label accent={accent}>Overview</Label>
              <p
                className="mt-5 max-w-2xl leading-relaxed text-bone/80"
                style={{ fontSize: "clamp(1.02rem,1.4vw,1.2rem)" }}
              >
                {p.desc ||
                  `${p.t} was designed and built end to end — from interface and motion to the code that ships it.${
                    host ? ` It's live at ${host}; open it to explore the full experience.` : ""
                  }`}
              </p>
            </div>

            {stack.length > 0 && (
              <div className="pp-el mt-12">
                <Label accent={accent}>Built with</Label>
                <div className="mt-5 flex flex-wrap gap-2">
                  {stack.map((s, i) => (
                    <span
                      key={s}
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-sm text-bone/85 backdrop-blur-sm"
                    >
                      <span className="text-[10px] tabular-nums text-bone/35">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <aside className="pp-el hud-panel self-start p-6 md:p-7">
            <div className="flex items-center justify-between text-[10px] tracking-[0.3em] uppercase text-bone/45">
              Mission data
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: accent, boxShadow: `0 0 8px ${accent}` }} />
            </div>
            <dl className="mt-5 divide-y divide-white/[0.06]">
              {facts.map(([k, v]) => (
                <div key={k} className="flex items-baseline justify-between gap-6 py-3">
                  <dt className="text-xs tracking-[0.16em] uppercase text-bone/40">{k}</dt>
                  <dd className="text-right text-sm text-bone/90">{v}</dd>
                </div>
              ))}
              {host && (
                <div className="flex items-baseline justify-between gap-6 py-3">
                  <dt className="text-xs tracking-[0.16em] uppercase text-bone/40">Link</dt>
                  <dd className="min-w-0 truncate text-right text-sm">
                    <a href={p.liveUrl} target="_blank" rel="noreferrer noopener" data-hover className="text-bone/90 underline decoration-white/20 underline-offset-4 transition-colors hover:text-[color:var(--acc)]">
                      {host}
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          </aside>
        </div>

        {/* ---- next mission ---- */}
        {next && next !== p && (
          <button
            data-hover
            onClick={() => onNav && onNav(1)}
            className="pp-el group relative mt-24 md:mt-32 block w-full overflow-hidden rounded-[24px] border border-white/[0.08] bg-white/[0.02] p-6 md:p-10 text-left transition-colors duration-500 hover:bg-white/[0.04]"
          >
            <div className="grid items-center gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
              <div className="min-w-0">
                <div className="text-[10px] tracking-[0.3em] uppercase text-bone/45">
                  Next mission →
                </div>
                <div
                  className="mt-3 font-display font-extrabold leading-[0.9] tracking-tight text-bone/70 transition-colors duration-500 group-hover:text-bone truncate"
                  style={{ fontSize: "clamp(2.2rem,6vw,5rem)" }}
                >
                  {next.t}
                </div>
                <div className="mt-4 h-px w-16 transition-all duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:w-40" style={{ background: accent }} />
              </div>
              <div className="relative overflow-hidden rounded-[14px] ring-1 ring-white/10 aspect-[16/9]">
                <Shot
                  p={next}
                  w={840}
                  className="scale-110 opacity-60 grayscale transition-all duration-[900ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-100 group-hover:opacity-100 group-hover:grayscale-0"
                />
              </div>
            </div>
          </button>
        )}

        <div className="mt-12 flex items-center justify-end md:justify-between text-[10px] tracking-[0.28em] uppercase text-bone/35">
          <span className="hidden md:inline">Esc to close · ← → to navigate</span>
          <button data-hover onClick={onClose} className="text-bone/60 hover:text-bone transition-colors">
            Back to work ↑
          </button>
        </div>
      </main>
    </div>
  );
}
