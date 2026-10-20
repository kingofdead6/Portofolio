import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import anime from "animejs";
import Lenis from "lenis";

import { initThree } from "./lib/blob";
import { initSpace } from "./lib/space";
import { useData } from "./lib/DataContext";

import Cursor from "./components/Cursor";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import About from "./components/About";
import Skills from "./components/Skills";
import Work from "./components/Work";
import Contact from "./components/Contact";
import ProjectPage from "./components/ProjectPage";
import Preloader from "./components/Preloader";
import { NAV, cardGradient } from "./lib/data";

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const root = useRef(null);
  const canvasRef = useRef(null);
  const transRef = useRef(null);
  const pageRef = useRef(null);
  const three = useRef(null);
  const lenisRef = useRef(null);
  const spaceCanvas = useRef(null);
  const modelWrap = useRef(null);
  const wasActive = useRef(false);
  const workST = useRef(null);
  const navBusy = useRef(false);
  const space = useRef(null);
  const introRef = useRef(null);
  const launchedRef = useRef(false);
  const altRef = useRef(null);
  const altNum = useRef(null);
  const [active, setActive] = useState(null);
  const [activeSec, setActiveSec] = useState("home");
  const [launched, setLaunched] = useState(false);
  const [booted, setBooted] = useState(false);

  const { projects, skills, categories, loading } = useData();

  // deep-space backdrop — starts immediately so it's alive behind the preloader
  useEffect(() => {
    if (!spaceCanvas.current) return;
    try {
      space.current = initSpace(spaceCanvas.current);
    } catch (e) {
      console.warn("Space off:", e);
    }
    return () => {
      if (space.current) space.current.dispose();
      space.current = null;
    };
  }, []);

  // launch: hyperspace burst, release the scroll lock and run the hero intro
  const onLaunch = () => {
    launchedRef.current = true;
    if (space.current) space.current.warp(2.4);
    setLaunched(true);
  };
  useEffect(() => {
    if (!launched) return;
    if (lenisRef.current) lenisRef.current.start();
    if (introRef.current) introRef.current.play();
  }, [launched]);

  // lock scroll behind project page
  useEffect(() => {
    document.body.style.overflow = active !== null ? "hidden" : "";
    if (lenisRef.current) {
      active !== null ? lenisRef.current.stop() : lenisRef.current.start();
    }
    // Hide the 3D model via its wrapper, never the canvas itself — the canvas
    // opacity belongs to the About scroll-fade, and resetting it would bring
    // the model back over Work after closing a project.
    const open = active !== null;
    if (modelWrap.current && (open || wasActive.current))
      gsap.to(modelWrap.current, { autoAlpha: open ? 0 : 1, duration: 0.5, ease: "power2.out" });
    wasActive.current = open;
    // the project page is opaque — stop rendering the galaxy behind it
    if (space.current) space.current.pause(active !== null);
  }, [active]);

  // project page entrance — overlay stays on top through the mount, then
  // cross-fades to reveal the (identical) page underneath, content staggers in.
  useEffect(() => {
    if (active === null || !pageRef.current) return;
    const ov = transRef.current;
    const page = pageRef.current;
    const els = page.querySelectorAll(".pp-el");
    const words = page.querySelectorAll(".pp-word");
    const title = page.querySelector(".pp-title");

    gsap.set(page, { clearProps: "transform,opacity,visibility" });
    gsap.set(page, { autoAlpha: 1 });
    anime.set(els, { opacity: 0, translateY: 40 });
    if (title) anime.set(title, { opacity: 1, translateY: 0 });
    anime.set(words, { translateY: "110%", rotate: 6 });

    // Fade + fully hide the FLIP overlay with GSAP — autoAlpha guarantees
// opacity:0 + visibility:hidden, and onComplete reliably fires, so no dark
// tint is ever left sitting on top of the project page.
if (ov) {
  gsap.to(ov, {
    autoAlpha: 0,
    duration: 0.45,
    ease: "power2.out",
    onComplete: () => {
      ov.style.display = "none";
      ov.style.background = "transparent";
    },
  });
}

const tl = anime.timeline();
tl.add(
  {
    targets: els,
    opacity: [0, 1],
    translateY: [40, 0],
    delay: anime.stagger(75, { start: 40 }),
    duration: 950,
    easing: "easeOutQuart",
  },
  120
).add(
  {
    targets: words,
    translateY: ["110%", "0%"],
    rotate: [6, 0],
    delay: anime.stagger(70),
    duration: 1100,
    easing: "easeOutExpo",
  },
  220
);
  }, [active]);

  useEffect(() => {
    // Wait until the API data is in so the project cards / skill tiles exist
    // in the DOM before ScrollTrigger measures the pinned Work width etc.
    if (loading) return;
    const el = root.current;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const qa = (s) => Array.from(el.querySelectorAll(s));
    const q = (s) => el.querySelector(s);

    // 3D
    try {
      if (canvasRef.current) three.current = initThree(canvasRef.current);
    } catch (e) {
      console.warn("3D off:", e);
      if (canvasRef.current) canvasRef.current.style.display = "none";
    }

    // Active section = the last one whose top has crossed 55% of the screen.
    // Read from live layout rather than per-section ScrollTriggers: pinned
    // sections (Skills, Work) are one screen tall but stay on screen for
    // thousands of px, which trigger ranges measured at refresh got wrong.
    const SECS = ["home", "about", "skills", "work", "contact"];
    let lastSec = null;
    let secRaf = 0;
    // deferred a frame so pins have settled (a pin releasing in the same
    // update would still read as fixed at top: 0)
    const updateSec = () => {
      if (!secRaf) secRaf = requestAnimationFrame(readSec);
    };
    const readSec = () => {
      secRaf = 0;
      const line = window.innerHeight * 0.55;
      let cur = SECS[0];
      for (const id of SECS) {
        const n = document.getElementById(id);
        if (n && n.getBoundingClientRect().top <= line) cur = id;
      }
      if (cur !== lastSec) {
        lastSec = cur;
        setActiveSec(cur);
      }
    };

    // ---- space: travel through the nebula with page progress, raise the
    // planet as Contact arrives, feed the altitude HUD ----
    const spaceTriggers = [
      // refreshPriority -1: measured after the Skills/Work pins have added
      // their spacing — these are created before them, and would otherwise
      // see a page ~25,000px too short.
      ScrollTrigger.create({
        trigger: document.body,
        start: "top top",
        end: "bottom bottom",
        refreshPriority: -1,
        onUpdate: (self) => {
          updateSec();
          if (space.current) space.current.setScroll(self.progress);
          if (altRef.current) altRef.current.style.transform = `translateY(${self.progress * 100}%)`;
          if (altNum.current)
            altNum.current.textContent = String(Math.round(self.progress * 100)).padStart(3, "0");
        },
      }),
      ScrollTrigger.create({
        trigger: "#contact",
        start: "top bottom",
        end: "top 15%",
        invalidateOnRefresh: true,
        refreshPriority: -1,
        onUpdate: (self) => space.current && space.current.setPlanet(self.progress),
      }),
    ];

    if (reduce) {
      return () => {
        cancelAnimationFrame(secRaf);
        spaceTriggers.forEach((t) => t.kill());
      };
    }

    // ---- smooth scroll (Lenis) ----
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenisRef.current = lenis;
    // hold the page still until the launch sequence has cleared
    if (!launchedRef.current) lenis.stop();
    lenis.on("scroll", (l) => {
      ScrollTrigger.update();
      // scroll speed drives the warp streaks
      if (space.current) space.current.setVelocity(l.velocity);
    });

    // Drive Lenis from GSAP's own ticker instead of a separate rAF loop —
    // this is the officially recommended Lenis + GSAP pairing and avoids
    // the two loops drifting out of sync with each other.
    const lenisTick = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(lenisTick);
    gsap.ticker.lagSmoothing(0);

    const onStRefresh = () => lenis.resize();
    ScrollTrigger.addEventListener("refresh", onStRefresh);

    // ---- intro (anime) ----
    anime.set(q(".nav"), { opacity: 0, translateY: -20 });
    anime.set(qa(".hero-char"), { translateY: "110%", rotate: 8, opacity: 0 });
    anime.set(qa(".hero-fade"), { opacity: 0, translateY: 22 });
    anime.set(qa(".hud-alt"), { opacity: 0 });
    anime.set(modelWrap.current, { opacity: 0 });
    const tl = anime.timeline({ easing: "easeOutQuart", autoplay: false });
    tl.add(
      {
        targets: modelWrap.current,
        opacity: [0, 1],
        duration: 1600,
        easing: "easeInOutQuad",
      },
      350
    )
      .add(
        { targets: q(".nav"), opacity: [0, 1], translateY: [-20, 0], duration: 900 },
        500
      )
      .add(
        {
          targets: qa(".hero-char"),
          translateY: ["110%", "0%"],
          rotate: [8, 0],
          opacity: [0, 1],
          duration: 1300,
          easing: "easeOutExpo",
          delay: anime.stagger(24),
        },
        650
      )
      .add(
        {
          targets: qa(".hero-fade"),
          opacity: [0, 1],
          translateY: [22, 0],
          duration: 900,
          delay: anime.stagger(120),
        },
        1150
      )
      .add({ targets: qa(".hud-alt"), opacity: [0, 1], duration: 900 }, 1400);
    introRef.current = tl;
    if (launchedRef.current) tl.play();

    // ---- 3D scroll choreography ----
    if (three.current) {
      const { blob } = three.current;
      const edgeX = three.current.edgeX;
      const cnv = canvasRef.current;
      // hero -> about : model glides fully to the LEFT edge (text is on the right).
      gsap.to(blob.position, {
        x: () => edgeX(),
        y: -0.2,
        ease: "none",
        scrollTrigger: {
          trigger: "#about",
          start: "top bottom",
          end: "center center",
          scrub: 1.4,
          invalidateOnRefresh: true,
        },
      });
      // fade the model OUT while still inside About, gone before Skills.
      gsap.to(cnv, {
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: "#about",
          start: "center center",
          end: "bottom center",
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });
    }

    // ---- hero parallax ----
    gsap.to(".hero-inner", {
      yPercent: -22,
      autoAlpha: 0.25,
      ease: "none",
      scrollTrigger: {
        trigger: "#home",
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });

    // ---- about word reveal (scrub) ----
    gsap.to(".about-word", {
      color: "#ECECF1",
      ease: "none",
      stagger: 1,
      scrollTrigger: {
        trigger: "#about",
        start: "top 65%",
        end: "bottom 75%",
        scrub: 0.5,
      },
    });
    gsap.from(".about-fact", {
      y: 30,
      autoAlpha: 0,
      duration: 0.9,
      ease: "power3.out",
      stagger: 0.12,
      scrollTrigger: { trigger: ".about-facts", start: "top 85%" },
    });

    // ---- (Skills animations now live inside Skills.jsx) ----

    // ---- projects horizontal ----
    const track = q(".work-track");
    if (track) {
      const amount = () =>
        track.scrollWidth - window.innerWidth + window.innerWidth * 0.06;

      // Live collections — they follow the filter as React swaps cards in/out.
      const items = track.getElementsByClassName("work-rail-item");
      const cards = track.getElementsByClassName("work-card");
      const sec = q("#work");
      // Orbital curve: items bank and recede the further they sit from the
      // centre of the screen, so the rail reads like a carousel in space.
      // Also lights up the HUD counter with the card nearest the centre.
      const curve = () => {
        const vw = window.innerWidth;
        const x = gsap.getProperty(track, "x");
        for (let i = 0; i < items.length; i++) {
          const el = items[i];
          const d = (el.offsetLeft + el.offsetWidth / 2 + x - vw / 2) / vw;
          const a = Math.min(Math.abs(d), 1.2);
          // perspective() per item keeps the vanishing point on each card —
          // a shared one on the (very wide) track skews the whole rail
          el.style.transform = `perspective(1600px) rotateY(${(-d * 14).toFixed(2)}deg) scale(${(1 - a * 0.08).toFixed(3)})`;
          el.style.opacity = (1 - Math.max(0, a - 0.42) * 0.85).toFixed(3);
        }
        let best = 0;
        let bestD = Infinity;
        for (let i = 0; i < cards.length; i++) {
          const el = cards[i];
          const d = Math.abs(el.offsetLeft + el.offsetWidth / 2 + x - vw / 2);
          if (d < bestD) {
            bestD = d;
            best = i;
          }
        }
        const cnt = sec && sec.querySelector(".work-hud-count");
        if (cnt) cnt.textContent = String(cards.length ? best + 1 : 0).padStart(2, "0");
      };

      const railTween = gsap.to(track, {
        x: () => -amount(),
        ease: "none",
        onUpdate: curve,
        scrollTrigger: {
          trigger: "#work",
          start: "top top",
          end: () => "+=" + amount(),
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            const bar = sec && sec.querySelector(".work-hud-bar");
            if (bar) bar.style.transform = `scaleX(${self.progress})`;
          },
          onRefresh: () => requestAnimationFrame(curve),
        },
      });
      workST.current = railTween.scrollTrigger;
      curve();
      gsap.utils.toArray(".work-card .work-img").forEach((img) => {
        gsap.fromTo(
          img,
          { scale: 1.18 },
          {
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: "#work",
              start: "top top",
              end: () => "+=" + amount(),
              scrub: 1,
            },
          }
        );
      });

      // The pin distance above is calculated from track.scrollWidth, which
      // is only accurate once every project image has actually finished
      // loading. Force a refresh (which also resyncs Lenis, see above)
      // the moment they're all in, so the page height — and everything
      // positioned after #work, including #contact — settles correctly.
      const imgs = track.querySelectorAll("img");
      let pending = imgs.length;
      const onImgSettled = () => {
        pending -= 1;
        if (pending <= 0) ScrollTrigger.refresh();
      };
      if (pending === 0) {
        ScrollTrigger.refresh();
      } else {
        imgs.forEach((img) => {
          if (img.complete) {
            onImgSettled();
          } else {
            img.addEventListener("load", onImgSettled, { once: true });
            img.addEventListener("error", onImgSettled, { once: true });
          }
        });
      }
    }

    // ---- contact reveal ----
    gsap.from(".contact-head .mask span", {
      yPercent: 110,
      duration: 1.1,
      ease: "power4.out",
      stagger: 0.03,
      scrollTrigger: {
        trigger: "#contact",
        start: "top 70%",
        invalidateOnRefresh: true,
      },
    });
    gsap.from(".contact-row", {
      y: 40,
      autoAlpha: 0,
      duration: 0.9,
      ease: "power3.out",
      stagger: 0.1,
      scrollTrigger: {
        trigger: ".contact-body",
        start: "top 80%",
        invalidateOnRefresh: true,
      },
    });

    // ---- nav active section ----
    // Driven by the body progress trigger above (see updateSec).

    // ---- progress bar ----
    gsap.to("#bar", {
      scaleX: 1,
      ease: "none",
      scrollTrigger: {
        trigger: document.body,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.2,
      },
    });

    // ---- magnetic ----
    if (window.matchMedia("(hover:hover)").matches) {
      qa("[data-mag]").forEach((n) => {
        const mv = (e) => {
          const r = n.getBoundingClientRect();
          gsap.to(n, {
            x: (e.clientX - (r.left + r.width / 2)) * 0.3,
            y: (e.clientY - (r.top + r.height / 2)) * 0.5,
            duration: 0.6,
            ease: "power3",
          });
        };
        const lv = () =>
          gsap.to(n, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1,.4)" });
        n.addEventListener("mousemove", mv);
        n.addEventListener("mouseleave", lv);
      });
    }

    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);
    if (document.fonts && document.fonts.ready)
      document.fonts.ready.then(() => ScrollTrigger.refresh());
    const refreshT = setTimeout(() => ScrollTrigger.refresh(), 1400);

    return () => {
      
      window.removeEventListener("load", onLoad);
      clearTimeout(refreshT);
      gsap.ticker.remove(lenisTick);
      ScrollTrigger.removeEventListener("refresh", onStRefresh);
      try {
        if (lenisRef.current) lenisRef.current.destroy();
      } catch {
        /* noop */
      }
      try {
        if (three.current) three.current.dispose();
      } catch {
        /* noop */
      }
      introRef.current = null;
      workST.current = null;
      cancelAnimationFrame(secRaf);
      try {
        ScrollTrigger.getAll().forEach((t) => t.kill());
      } catch {
        /* noop */
      }
    };
  }, [loading]);

  const scrollTo = (target) => {
    // `target` is either a section id (string) or an absolute pixel position
    // (number) — the latter lets the Work rail jump to a specific category.
    if (typeof target === "number") {
      if (lenisRef.current) lenisRef.current.scrollTo(target, { duration: 1.4 });
      else window.scrollTo({ top: target, behavior: "smooth" });
      return;
    }
    const t = document.getElementById(target);
    if (lenisRef.current) lenisRef.current.scrollTo(t, { offset: 0, duration: 1.4 });
    else if (t) t.scrollIntoView({ behavior: "smooth" });
  };

  // OPEN: FLIP the project's colour from the card to fullscreen (GPU transform),
  // keep the overlay on top until the page mounts (entrance effect cross-fades it).
  const openProject = (idx, cardEl) => {
    const ov = transRef.current;
    if (lenisRef.current) lenisRef.current.stop();
    if (!ov) {
      setActive(idx);
      return;
    }
    const r = cardEl.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    // The overlay is painted like the project page's own backdrop (deep space
    // + the project's accent glow), so the card visibly becomes the page.
    const acc = accentOf(projects[idx]);
    ov.style.background = `radial-gradient(90% 70% at 80% 0%, ${acc}38, transparent 60%), radial-gradient(70% 60% at 0% 100%, ${acc}1f, transparent 60%), #05050a`;
    gsap.set(ov, {
      display: "block",
      top: 0,
      left: 0,
      width: vw,
      height: vh,
      transformOrigin: "0 0",
      x: r.left,
      y: r.top,
      scaleX: r.width / vw,
      scaleY: r.height / vh,
      borderRadius: 24,
      opacity: 1,
      willChange: "transform",
    });
    gsap.to(ov, {
      x: 0,
      y: 0,
      scaleX: 1,
      scaleY: 1,
      borderRadius: 0,
      duration: 0.9,
      ease: "expo.inOut",
      onComplete: () => setActive(idx),
    });
  };

  // CLOSE: content out, then slide the whole page down to reveal Work behind it.
  const closeProject = () => {
    const page = pageRef.current;
    if (!page) {
      setActive(null);
      return;
    }
    if (navBusy.current) return;
    navBusy.current = true;

    // While the page still covers the screen, jump the pinned rail so the card
    // for this project sits centred — closing lands you back where you were.
    let parked = false;
    const st = workST.current;
    const card = document.querySelector(`.work-card[data-idx="${active}"]`);
    if (st && card && lenisRef.current) {
      const off = card.offsetLeft + card.offsetWidth / 2 - window.innerWidth / 2;
      const y = st.start + Math.max(0, Math.min(st.end - st.start, off));
      lenisRef.current.scrollTo(y, { immediate: true, force: true });
      ScrollTrigger.update();
      const tw = st.getTween && st.getTween();
      if (tw) tw.progress(1);
      parked = true;
    }

    const els = page.querySelectorAll(".pp-el, .pp-title");
    anime({
      targets: els,
      opacity: [1, 0],
      translateY: [0, -22],
      delay: anime.stagger(25),
      duration: 320,
      easing: "easeInQuad",
    });
    gsap.to(page, {
      yPercent: 10,
      autoAlpha: 0,
      duration: 0.6,
      ease: "power3.in",
      delay: 0.18,
      onComplete: () => {
        navBusy.current = false;
        setActive(null);
        if (lenisRef.current) lenisRef.current.start();
        if (!parked) scrollTo("work");
      },
    });
  };

  // Rail order (category by category) — prev/next on the project page walk it.
  const order = categories.flatMap((c) =>
    projects.reduce((acc, p, i) => (p.category === c.key ? [...acc, i] : acc), [])
  );
  const accentOf = (p) =>
    (p && (categories.find((c) => c.key === p.category) || {}).accent) ||
    cardGradient(p || {}).c1;

  // PREV / NEXT inside the project page: content out, swap, content back in
  // (the [active] entrance effect replays the stagger for the new project).
  const navProject = (dir) => {
    if (active === null || navBusy.current || order.length < 2) return;
    const pos = order.indexOf(active);
    const nextIdx = order[(Math.max(pos, 0) + dir + order.length) % order.length];
    const page = pageRef.current;
    if (!page) return setActive(nextIdx);
    navBusy.current = true;
    anime({
      targets: page.querySelectorAll(".pp-el, .pp-title"),
      opacity: [1, 0],
      translateY: [0, dir > 0 ? -26 : 26],
      delay: anime.stagger(18),
      duration: 300,
      easing: "easeInQuad",
      complete: () => {
        page.scrollTop = 0;
        navBusy.current = false;
        setActive(nextIdx);
      },
    });
  };

  return (

    <div ref={root} className="font-body text-bone">
      {/* deep-space WebGL backdrop — fixed behind all content */}
      <canvas ref={spaceCanvas} className="space-canvas" aria-hidden="true" />
      <div className="space-vignette" aria-hidden="true" />
      <div ref={modelWrap} className="fixed inset-0 z-0 pointer-events-none">
        <canvas id="bg" ref={canvasRef}></canvas>
      </div>
      <div className="grain"></div>
      <Cursor />
      {!booted && (
        <Preloader ready={!loading} onLaunch={onLaunch} onDone={() => setBooted(true)} />
      )}
      <div
        className="fixed top-0 left-0 h-[2px] z-[80] origin-left bg-gradient-to-r from-violet via-[#38D6FF] to-mint shadow-[0_0_12px_rgba(120,102,255,.9)]"
        id="bar"
        style={{ transform: "scaleX(0)", width: "100%" }}
      ></div>

      {/* altitude HUD — page progress + current sector (desktop) */}
      <div className="hud-alt hidden lg:flex fixed right-6 top-1/2 -translate-y-1/2 z-40 items-center gap-3 pointer-events-none">
        <div className="text-right text-[10px] tracking-[0.25em] uppercase text-bone/40 leading-relaxed">
          <div>
            Alt <span ref={altNum} className="tabular-nums text-bone/80">000</span>
          </div>
          <div className="text-violet/90">
            {(NAV.find(([, id]) => id === activeSec) || NAV[0])[0]}
          </div>
        </div>
        <div className="hud-alt__track relative h-40 w-2">
          <div className="absolute inset-x-0 top-0 h-full">
            <span ref={altRef} className="hud-alt__mark absolute left-0 top-0 block h-full w-full">
              <span className="absolute -left-1 top-0 block h-px w-4 -translate-y-1/2 bg-mint shadow-[0_0_8px_#5BE9B9]" />
            </span>
          </div>
        </div>
      </div>
      <div
        ref={transRef}
        className="fixed z-[70] hidden"
        style={{ top: 0, left: 0 }}
      ></div>

      <Nav activeSec={activeSec} scrollTo={scrollTo} />
      <Hero />
      <About />
      <Skills skills={skills} />
      <Work
        projects={projects}
        categories={categories}
        openProject={openProject}
        scrollTo={scrollTo}
      />
      <Contact scrollTo={scrollTo} />

      {active !== null && projects[active] && (
        <ProjectPage
          p={projects[active]}
          accent={accentOf(projects[active])}
          category={categories.find((c) => c.key === projects[active].category)}
          pos={Math.max(order.indexOf(active), 0)}
          total={order.length || projects.length}
          next={projects[order[(order.indexOf(active) + 1) % order.length]]}
          onNav={navProject}
          onClose={closeProject}
          pageRef={pageRef}
        />
      )}
    </div>
  );
}