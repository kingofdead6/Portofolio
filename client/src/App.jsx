import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import anime from "animejs";
import Lenis from "lenis";

import { initThree } from "./lib/blob";
import { useData } from "./lib/DataContext";

import Cursor from "./components/Cursor";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import About from "./components/About";
import Skills from "./components/Skills";
import Work from "./components/Work";
import Contact from "./components/Contact";
import ProjectPage from "./components/ProjectPage";
import { GravityStarsBackground } from "./components/bg";

gsap.registerPlugin(ScrollTrigger);

// The project page has no background of its own — it shows the same starry
// backdrop as every other section. The open/close FLIP overlay therefore uses
// a neutral, mostly-transparent tint so the transition reveals that same
// background instead of a distinct dark colored panel.
const projectBg = () => "rgba(11, 11, 15, 0.55)";

export default function App() {
  const root = useRef(null);
  const canvasRef = useRef(null);
  const transRef = useRef(null);
  const pageRef = useRef(null);
  const three = useRef(null);
  const lenisRef = useRef(null);
  const [active, setActive] = useState(null);
  const [activeSec, setActiveSec] = useState("home");

  const { projects, skills, categories, loading } = useData();

  // lock scroll behind project page
  useEffect(() => {
    document.body.style.overflow = active !== null ? "hidden" : "";
    if (lenisRef.current) {
      active !== null ? lenisRef.current.stop() : lenisRef.current.start();
    }
    if (canvasRef.current)
      canvasRef.current.style.transition = "opacity .5s ease";
    if (canvasRef.current)
      canvasRef.current.style.opacity = active !== null ? "0" : "";
  }, [active]);

  // project page entrance — overlay stays on top through the mount, then
  // cross-fades to reveal the (identical) page underneath, content staggers in.
  useEffect(() => {
    if (active === null || !pageRef.current) return;
    const ov = transRef.current;
    const page = pageRef.current;
    const els = page.querySelectorAll(".pp-el");

    gsap.set(page, { clearProps: "transform,opacity,visibility" });
    gsap.set(page, { autoAlpha: 1 });
    anime.set(els, { opacity: 0, translateY: 40 });

    const tl = anime.timeline();
    if (ov) {
      tl.add(
        {
          targets: ov,
          opacity: [1, 0],
          duration: 450,
          easing: "easeOutQuad",
          complete: () => {
            ov.style.display = "none";
          },
        },
        0
      );
    }
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

    if (reduce) return;

    // ---- smooth scroll (Lenis) ----
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenisRef.current = lenis;
    lenis.on("scroll", ScrollTrigger.update);

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
    anime.set(qa(".hero-char"), { translateY: "110%" });
    anime.set(qa(".hero-fade"), { opacity: 0, translateY: 22 });
    const tl = anime.timeline({ easing: "easeOutQuart" });
    tl.add(
      { targets: q(".nav"), opacity: [0, 1], translateY: [-20, 0], duration: 900 },
      300
    )
      .add(
        {
          targets: qa(".hero-char"),
          translateY: ["110%", "0%"],
          duration: 1100,
          delay: anime.stagger(22),
        },
        500
      )
      .add(
        {
          targets: qa(".hero-fade"),
          opacity: [0, 1],
          translateY: [22, 0],
          duration: 900,
          delay: anime.stagger(120),
        },
        900
      );

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
      gsap.to(track, {
        x: () => -amount(),
        ease: "none",
        scrollTrigger: {
          trigger: "#work",
          start: "top top",
          end: () => "+=" + amount(),
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      });
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
    ["home", "about", "skills", "work", "contact"].forEach((id) => {
      ScrollTrigger.create({
        trigger: "#" + id,
        start: "top 55%",
        end: "bottom 55%",
        onToggle: (self) => {
          if (self.isActive) setActiveSec(id);
        },
      });
    });

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
      try {
        ScrollTrigger.getAll().forEach((t) => t.kill());
      } catch {
        /* noop */
      }
    };
  }, [loading]);

  const scrollTo = (id) => {
    const t = document.getElementById(id);
    if (lenisRef.current) lenisRef.current.scrollTo(t, { offset: 0, duration: 1.4 });
    else if (t) t.scrollIntoView({ behavior: "smooth" });
  };

  // OPEN: FLIP the project's colour from the card to fullscreen (GPU transform),
  // keep the overlay on top until the page mounts (entrance effect cross-fades it).
  const openProject = (idx, cardEl) => {
    const ov = transRef.current;
    const p = projects[idx];
    if (lenisRef.current) lenisRef.current.stop();
    if (!ov) {
      setActive(idx);
      return;
    }
    const r = cardEl.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    ov.style.background = projectBg(p);
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
    const els = page.querySelectorAll(".pp-el");
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
        setActive(null);
        if (lenisRef.current) lenisRef.current.start();
        scrollTo("work");
      },
    });
  };

  return (

    <div ref={root} className="font-body text-bone">
      {/* animated gravity-stars background — fixed behind all content */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{ color: "#ECECF1" }}
        aria-hidden="true"
      >
        <GravityStarsBackground
          starsCount={90}
          starsOpacity={0.7}
          glowIntensity={14}
          mouseInfluence={140}
          gravityStrength={80}
          className="pointer-events-auto"
        />
      </div>
      <div className="ambient ambient--1" />
      <div className="ambient ambient--2" />
      <canvas id="bg" ref={canvasRef}></canvas>
      <div className="grain"></div>
      <Cursor />
      <div
        className="fixed top-0 left-0 h-[2px] bg-violet z-[80] origin-left"
        id="bar"
        style={{ transform: "scaleX(0)", width: "100%" }}
      ></div>
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
          onClose={closeProject}
          pageRef={pageRef}
        />
      )}
    </div>
  );
}