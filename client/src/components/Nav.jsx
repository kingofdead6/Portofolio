import { useState, useEffect } from "react";
import { NAV } from "../lib/data";

export default function Nav({ activeSec, scrollTo }) {
  const [open, setOpen] = useState(false);

  // lock background scroll while the mobile menu is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const go = (id) => {
    scrollTo(id);
    setOpen(false);
  };

  return (
    <>
      <nav
        className="nav fixed top-0 inset-x-0 z-50 flex justify-between items-center px-6 md:px-12 py-5"
        style={{ mixBlendMode: "difference" }}
      >
        <button
          data-hover
          onClick={() => go("home")}
          className="font-display font-extrabold text-xl tracking-tight"
        >
          Youcef<span className="text-violet">.</span>
        </button>

        {/* desktop links */}
        <div className="hidden md:flex items-center gap-7">
          {NAV.map(([label, id]) => {
            const on = activeSec === id;
            return (
              <button
                key={id}
                data-hover
                onClick={() => scrollTo(id)}
                className={
                  "group relative text-sm tracking-wide transition-colors " +
                  (on ? "text-bone" : "text-bone/50 hover:text-bone")
                }
              >
                <span className="inline-flex items-center gap-1.5">
                  <span
                    className={
                      "h-1 w-1 rounded-full bg-violet transition-all duration-300 " +
                      (on ? "opacity-100 scale-100" : "opacity-0 scale-0")
                    }
                  />
                  {label}
                </span>
                <span className="absolute -bottom-1 left-0 h-px w-full origin-right scale-x-0 bg-bone transition-transform duration-300 group-hover:origin-left group-hover:scale-x-100" />
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3 md:gap-0">
          <button
            data-hover
            onClick={() => go("contact")}
            className="hidden xs:flex items-center gap-2 text-sm tracking-wide"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-mint opacity-60 animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-mint" />
            </span>
            <span className="hidden sm:inline">Available</span>
          </button>

          {/* mobile hamburger / close toggle */}
          <button
            data-hover
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="md:hidden relative z-50 flex h-10 w-10 flex-col items-center justify-center gap-[5px]"
          >
            <span
              className={
                "block h-px w-6 bg-bone transition-all duration-300 " +
                (open ? "translate-y-[6.5px] rotate-45" : "")
              }
            />
            <span
              className={
                "block h-px w-6 bg-bone transition-all duration-300 " +
                (open ? "opacity-0" : "opacity-100")
              }
            />
            <span
              className={
                "block h-px w-6 bg-bone transition-all duration-300 " +
                (open ? "-translate-y-[6.5px] -rotate-45" : "")
              }
            />
          </button>
        </div>
      </nav>

      {/* mobile full-screen menu (outside <nav> so it isn't affected by mix-blend-mode: difference) */}
      <div
        className={
          "md:hidden fixed inset-0 z-40 flex flex-col items-center justify-center gap-3 bg-ink/98 backdrop-blur-md transition-opacity duration-500 " +
          (open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none")
        }
      >
        {NAV.map(([label, id], i) => {
          const on = activeSec === id;
          return (
            <button
              key={id}
              data-hover
              onClick={() => go(id)}
              style={{
                fontSize: "clamp(2rem,9vw,3rem)",
                transitionDelay: open ? `${i * 60 + 80}ms` : "0ms",
              }}
              className={
                "font-display font-bold tracking-tight transition-all duration-500 " +
                (open ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4") +
                " " +
                (on ? "text-violet" : "text-bone/70 hover:text-bone")
              }
            >
              {label}
            </button>
          );
        })}

        <button
          data-hover
          onClick={() => go("contact")}
          style={{ transitionDelay: open ? `${NAV.length * 60 + 120}ms` : "0ms" }}
          className={
            "mt-8 flex items-center gap-2 text-sm tracking-wide text-bone/60 transition-all duration-500 " +
            (open ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4")
          }
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-mint opacity-60 animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-mint" />
          </span>
          Available
        </button>
      </div>
    </>
  );
}