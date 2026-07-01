import { useState } from "react";
import anime from "animejs";
import Split from "./Split";
import { SOCIALS, EMAIL, CV_URL } from "../lib/data";
import { api } from "../lib/api";

const FIELDS = [
  ["name", "Your name", "text"],
  ["email", "Email", "email"],
];

const LABEL =
  "absolute left-4 top-4 text-bone/45 pointer-events-none transition-all duration-300 " +
  "peer-focus:-top-2.5 peer-focus:left-3 peer-focus:text-xs peer-focus:text-violet peer-focus:bg-ink2 peer-focus:px-1.5 peer-focus:rounded " +
  "peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-ink2 peer-[:not(:placeholder-shown)]:px-1.5 peer-[:not(:placeholder-shown)]:rounded";

const FIELD =
  "peer w-full bg-white/[0.04] rounded-xl border border-line px-4 py-4 outline-none focus:border-violet focus:bg-violet/[0.06] focus:ring-2 focus:ring-violet/20 transition-all text-bone placeholder-transparent";

export default function Contact({ scrollTo }) {
  const [sent, setSent] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = (data.get("name") || "").toString().trim();
    const email = (data.get("email") || "").toString().trim();
    const msg = (data.get("msg") || "").toString().trim();

    // Save the message to the backend. If the API is unreachable, fall back to
    // opening the visitor's mail client so a message is never lost.
    try {
      await api.post("/contact", { name, email, message: msg });
    } catch {
      const subject = `New message from ${name || "your site"}`;
      const body = `${msg}\n\n— ${name}\n${email}`;
      window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(body)}`;
    }

    setSent(true);
    anime({
      targets: ".sent-msg",
      opacity: [0, 1],
      translateY: [12, 0],
      duration: 700,
      easing: "easeOutQuart",
    });
  };

  return (
    <section
      id="contact"
      className="relative z-10 px-6 md:px-12 py-32 overflow-hidden"
    >
      {/* faint background word */}
      <span
        aria-hidden
        className="pointer-events-none select-none absolute -bottom-6 left-1/2 -translate-x-1/2 font-display font-extrabold text-white/[0.03] leading-none whitespace-nowrap"
        style={{ fontSize: "clamp(8rem,26vw,26rem)" }}
      >
        HELLO
      </span>

      <div className="contact-head relative text-center">
        <div className="flex items-center justify-center gap-3 mb-6 text-xs tracking-[0.24em] uppercase text-bone/55">
          <span className="font-display font-bold text-violet">04</span>
          <span className="w-7 h-px bg-mint inline-block" />
          Contact
        </div>
        <h2
          className="font-display font-extrabold tracking-tight leading-[0.92]"
          style={{ fontSize: "clamp(2.6rem,10vw,9rem)" }}
        >
          <span className="mask">
            <Split text="Let's build" />
          </span>
          <span className="mask">
            <Split text="something " />
            <span
              className="font-serif italic text-violet"
              style={{ fontWeight: 400 }}
            >
              <Split text="great" />
            </span>
          </span>
        </h2>
      </div>

      <div className="contact-body relative grid md:grid-cols-2 gap-10 lg:gap-16 mt-16 md:mt-20 max-w-5xl mx-auto items-start text-left">
        {!sent ? (
          <form
            onSubmit={submit}
            className="contact-row space-y-6 rounded-2xl border border-line bg-white/2 p-6 sm:p-8"
          >
            {FIELDS.map(([id, label, type]) => (
              <div key={id} className="relative">
                <input
                  id={id}
                  name={id}
                  type={type}
                  required
                  placeholder=" "
                  data-hover
                  className={FIELD}
                />
                <label htmlFor={id} className={LABEL}>
                  {label}
                </label>
              </div>
            ))}
            <div className="relative">
              <textarea
                id="msg"
                name="msg"
                rows="4"
                required
                placeholder=" "
                data-hover
                className={FIELD + " resize-none"}
              ></textarea>
              <label htmlFor="msg" className={LABEL}>
                Tell me about your project
              </label>
            </div>
            <button
              data-hover
              data-mag
              type="submit"
              className="group inline-flex w-full items-center justify-center gap-2 px-8 py-4 rounded-full bg-violet text-ink font-medium hover:scale-[1.02] transition-transform"
            >
              Send message
              <span className="inline-block transition-transform group-hover:translate-x-1">
                →
              </span>
            </button>
          </form>
        ) : (
          <div className="contact-row sent-msg rounded-2xl border border-line bg-white/2 p-6 sm:p-8">
            <div
              className="font-display font-bold text-mint"
              style={{ fontSize: "clamp(1.6rem,4vw,2.6rem)" }}
            >
              Thanks — your email client should be opening.
            </div>
            <p className="text-bone/55 mt-4">
              If nothing popped up, just reach me directly at{" "}
              <a href={`mailto:${EMAIL}`} className="text-bone underline">
                {EMAIL}
              </a>
              .
            </p>
            <button
              data-hover
              onClick={() => setSent(false)}
              className="mt-6 text-sm text-bone/60 hover:text-bone transition-colors"
            >
              ← Write another message
            </button>
          </div>
        )}

        <div className="contact-row flex flex-col justify-between gap-10">
          <div>
            <div className="text-xs tracking-[0.2em] uppercase text-bone/45 mb-3">
              Direct
            </div>
            <a
              href={`mailto:${EMAIL}`}
              data-hover
              className="font-display font-bold tracking-tight hover:text-violet transition-colors break-all"
              style={{ fontSize: "clamp(1.3rem,3vw,2.2rem)" }}
            >
              {EMAIL}
            </a>

            {/* CV download */}
            <div className="mt-6">
              <a
                href={CV_URL}
                download="cv.pdf"
                data-hover
                data-mag
                className="group inline-flex items-center gap-2 px-6 py-3 rounded-full border border-bone/35 text-bone hover:bg-bone/10 transition-colors"
              >
                Download CV
                <span className="inline-block transition-transform group-hover:translate-y-0.5">
                  ↓
                </span>
              </a>
            </div>
          </div>

          <div>
            <div className="text-xs tracking-[0.2em] uppercase text-bone/45 mb-4">
              Elsewhere
            </div>
            <div className="flex flex-col">
              {SOCIALS.map(([n, h], i) => (
                <a
                  key={n}
                  href={h}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-hover
                  className="group flex items-center justify-between border-t border-line px-2 -mx-2 py-4 rounded-lg transition-colors hover:bg-white/3 hover:text-bone"
                >
                  <span className="flex items-center gap-4">
                    <span className="text-bone/30 text-xs font-display">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-bone/85 group-hover:translate-x-1 transition-transform">
                      {n}
                    </span>
                  </span>
                  <span className="text-bone/40 group-hover:text-violet group-hover:translate-x-1 transition-all">
                    ↗
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="relative flex justify-between items-center flex-wrap gap-4 mt-24 pt-8 border-t border-line text-xs tracking-wide text-bone/45">
        <span>© 2026 Youcef — Designed &amp; built from Algeria.</span>
        <button
          data-hover
          onClick={() => scrollTo("home")}
          className="text-bone/70 hover:text-bone"
        >
          Back to top ↑
        </button>
      </div>
    </section>
  );
}