import type { CSSProperties } from "react";
import { useScrollProgress } from "../motion/scroll";
import { usePrefersReducedMotion } from "../motion/reveal";
import { PhoneFrame } from "../components/DeviceFrames";
import { HomeScreen } from "../components/AppScreens";
import { CinematicPhoto } from "../components/CinematicPhoto";
import { Icon } from "../components/Icon";
import { useSmoothNav } from "../components/ShowcaseNav";
import { IMG, ROUTES } from "../data";

/** translateY linked to hero exit progress (outer wrapper; inner handles intro). */
const drift = (y: string, x = "0px"): CSSProperties => ({
  transform: `translate3d(calc(var(--p) * ${x}), calc(var(--p) * ${y}), 0)`,
});

export function Hero() {
  const reduced = usePrefersReducedMotion();
  const ref = useScrollProgress<HTMLElement>("exit", undefined, !reduced);
  const go = useSmoothNav();

  return (
    <section
      id="top"
      ref={ref}
      aria-labelledby="hero-title"
      className="scene relative isolate overflow-clip bg-ivory pt-14 lg:h-[100svh] lg:min-h-[720px]"
    >
      {/* faint architectural backdrop — slow horizontal pan behind the type */}
      <div className="pointer-events-none absolute inset-0 z-0 hidden lg:block" aria-hidden="true">
        <div className="absolute inset-0 opacity-[0.14]" style={drift("-40px", "0px")}>
          <CinematicPhoto
            img={IMG.concreteGreen}
            ratio="16/9"
            crop={[16, 9]}
            sizes="100vw"
            widths={[1200, 1800]}
            priority
            preset="horizontal-pan"
            reveal="none"
            parallaxX="60px"
            zoom={1.25}
            className="absolute inset-0 size-full"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-ivory via-transparent to-ivory" />
      </div>

      {/* meta row */}
      <div className="relative z-30 mx-auto flex max-w-[1680px] items-start justify-between px-5 pt-6 sm:px-6 lg:px-10">
        <p className="eyebrow max-w-[16rem] text-stone">
          <span className="text-ink">(Platform)</span> An independent student platform for PCCOE
        </p>
        <a href="#how" onClick={(e) => go(e, "how")} className="eyebrow hidden items-center gap-2 text-stone hover:text-ink sm:flex">
          Scroll to explore <Icon name="arrowDown" size={14} />
        </a>
      </div>

      {/* ── Headline line 1 (behind the phone) ── */}
      <h1 id="hero-title" className="relative mx-auto max-w-[1680px] px-5 pt-6 sm:px-6 lg:px-10 lg:pt-[4vh]">
        <span className="display rm-static block text-[22vw] lg:text-[clamp(5rem,12.6vw,15.5rem)]" style={drift("-30px", "-14vw")}>
          Your <br className="lg:hidden" />
          campus.
        </span>
        {/* line 2 sits in front of the phone; difference blend keeps it legible over the device */}
        <span
          className="display rm-static relative z-20 block text-[22vw] text-ivory mix-blend-difference lg:absolute lg:left-[16vw] lg:top-[calc(4vh+12.6vw*0.86+1.5rem)] lg:text-[clamp(5rem,12.6vw,15.5rem)]"
          style={drift("-60px", "10vw")}
        >
          <span className="serif-accent">in</span> one <br className="lg:hidden" />
          place.
        </span>
      </h1>

      {/* ── Phone with depth + scroll-linked settling ── */}
      <div
        className="rm-static relative z-10 mx-auto -mt-[10vw] w-[min(62vw,300px)] translate-x-[12%] lg:absolute lg:left-[59vw] lg:top-[11vh] lg:mt-0 lg:w-[clamp(250px,21vw,360px)] lg:translate-x-0"
        style={{
          ...drift("-90px"),
          perspective: "1200px",
        }}
      >
        <div
          className="will-change-transform"
          style={{
            transform: "rotateX(calc(var(--p, 0) * 6deg)) rotateY(calc(var(--p, 0) * -4deg))",
            transformOrigin: "50% 80%",
          }}
        >
          <div className="intro-rise" style={{ ["--d" as string]: "120ms" }}>
            <PhoneFrame label="Campus+ home screen showing the next lecture, quick links and today's campus updates (demonstration data)">
              <HomeScreen />
            </PhoneFrame>
          </div>
          {/* depth shadow that deepens as the hero exits */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-x-6 -bottom-8 -z-10 h-16 rounded-[100%] bg-ink/20 blur-2xl"
            style={{ opacity: "calc(0.5 + var(--p, 0) * 0.5)", transform: "scaleX(calc(0.9 + var(--p, 0) * 0.15))" }}
          />
        </div>
        {/* mobile-only companion photo */}
        <div className="absolute -left-[39%] bottom-[10%] w-[33%] lg:hidden" aria-hidden="true">
          <CinematicPhoto img={IMG.libraryAisle} ratio="3/4" crop={[3, 4]} sizes="25vw" widths={[240, 400]} preset="zoom-reveal" reveal="scale" delay={500} className="rounded-[3px]" />
          <p className="caption mt-2 text-stone">(01) Up next, at a glance.</p>
        </div>
        {/* annotation attached to the phone */}
        <div className="intro-fade absolute -left-[58%] top-[74%] hidden w-[40%] lg:block" style={{ ["--d" as string]: "700ms" }}>
          <p className="caption text-stone">
            <span className="text-ink">(01)</span> Up next — your next class, the room, and how long until it starts.
          </p>
          <span className="mt-2 block h-px w-[calc(100%+2.5rem)] bg-ink/30" />
        </div>
      </div>

      {/* ── Floating photographs — staggered entrances, independent camera moves ── */}
      <div className="rm-static absolute right-[3vw] top-[19vh] z-0 hidden w-[10.5vw] lg:block" style={drift("140px")}>
        <CinematicPhoto img={IMG.concreteFacade} ratio="1/1" crop={[1, 1]} sizes="11vw" widths={[240, 400]} priority preset="zoom-reveal" reveal="clip-up" delay={260} className="rounded-[4px]" />
        <p className="caption mt-2 text-stone">Spaces you walk through daily.</p>
      </div>
      <div className="rm-static absolute bottom-[6vh] right-[2.5vw] z-0 hidden w-[17vw] lg:block" style={drift("-180px")}>
        <CinematicPhoto img={IMG.deskSun} ratio="4/3" crop={[4, 3]} sizes="17vw" widths={[400, 640]} priority preset="parallax" reveal="wipe-left" delay={380} parallaxY="50px" className="rounded-[4px]" />
      </div>
      <div className="rm-static absolute bottom-[5vh] left-[31vw] z-0 hidden w-[12.5vw] lg:block" style={drift("-60px")}>
        <CinematicPhoto img={IMG.libraryAisle} ratio="3/4" crop={[3, 4]} sizes="13vw" widths={[300, 500]} priority preset="vertical-pan" reveal="clip-up" delay={320} parallaxY="40px" className="rounded-[4px]" />
      </div>

      {/* ── CTA block ── */}
      <div className="relative z-30 mx-auto max-w-[1680px] px-5 pb-14 pt-8 sm:px-6 lg:absolute lg:bottom-[6vh] lg:left-0 lg:max-w-[25vw] lg:p-0 lg:pl-10">
        <p className="max-w-sm text-[15px] leading-[1.55] text-stone">
          Campus+ puts your timetable, clubs, events and a student marketplace together, along with rides, housing and lost
          &amp; found.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <a
            href="#how"
            onClick={(e) => go(e, "how")}
            className="group inline-flex items-center gap-3 rounded-full bg-ink py-2 pl-5 pr-2 text-sm font-medium text-ivory"
          >
            Explore the platform
            <span className="grid size-8 place-items-center rounded-full bg-ivory text-ink transition-transform duration-500 group-hover:translate-y-0.5">
              <Icon name="arrowDown" size={15} />
            </span>
          </a>
          <a href={ROUTES.login} className="rounded-full border border-ink/20 px-5 py-3 text-sm font-medium hover:border-ink">
            Get started
          </a>
        </div>
      </div>
    </section>
  );
}
