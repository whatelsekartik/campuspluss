import type { CSSProperties } from "react";
import { useScrollProgress } from "../motion/scroll";
import { usePrefersReducedMotion } from "../motion/reveal";
import { PhoneFrame } from "../components/DeviceFrames";
import { HomeScreen } from "../components/AppScreens";
import { CinematicPhoto } from "../components/CinematicPhoto";
import { Kinetic } from "../components/Kinetic";
import { Icon } from "../components/Icon";
import { useSmoothNav } from "../components/ShowcaseNav";
import { IMG, ROUTES } from "../data";

/**
 * Layer drift linked to the hero's exit progress (--p: 0 → 1 as it scrolls away).
 * Every layer gets its own speed, so headline, phone and photographs separate
 * in depth. Distances shrink on small screens through --k.
 */
const drift = (y: string, x = "0px"): CSSProperties => ({
  transform: `translate3d(calc(var(--p) * ${x} * var(--k)), calc(var(--p) * ${y} * var(--k)), 0)`,
});

/** The phone also turns slightly away from the viewer as it leaves. */
const phoneExit: CSSProperties = {
  transform:
    "perspective(1500px) translate3d(0, calc(var(--p) * -110px * var(--k)), 0) rotateY(calc(var(--p) * -16deg)) rotateX(calc(var(--p) * 9deg))",
};

/** Camera move shared by the hero photographs: slow tilt + push-in while scrolling. */
const SHOT = { pan: [0, 14] as [number, number], zoom: [1.15, 1.26] as [number, number] };

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
      style={{ ["--p" as string]: 0 }}
    >
      {/* meta row */}
      <div className="relative z-30 mx-auto flex max-w-[1680px] items-start justify-between px-5 pt-6 sm:px-6 lg:px-10">
        <p className="pointer-shift eyebrow max-w-[16rem] text-stone" style={{ ["--ps" as string]: "3px" }}>
          <span className="text-ink">(Platform)</span> An independent student platform for PCCOE
        </p>
        <a href="#how" onClick={(e) => go(e, "how")} className="eyebrow hidden items-center gap-2 text-stone hover:text-ink sm:flex">
          Scroll to explore <Icon name="arrowDown" size={14} />
        </a>
      </div>

      {/* ── Headline: painted immediately, each line travels on its own track ── */}
      <h1 id="hero-title" className="relative mx-auto max-w-[1680px] px-5 pt-6 sm:px-6 lg:px-10 lg:pt-[4vh]">
        <span className="display rm-static block will-change-transform text-[22vw] lg:text-[clamp(5rem,12.6vw,15.5rem)]" style={drift("0px", "-18vw")}>
          <Kinetic text="Your" /> <br className="lg:hidden" />
          <Kinetic text="campus." />
        </span>
        {/* line 2 sits in front of the phone; difference blend keeps it legible over the device */}
        <span
          className="display rm-static relative z-20 block will-change-transform text-[22vw] text-ivory mix-blend-difference lg:absolute lg:left-[16vw] lg:top-[calc(4vh+12.6vw*0.86+1.5rem)] lg:text-[clamp(5rem,12.6vw,15.5rem)]"
          style={{ ...drift("0px", "14vw"), ["--kch" as string]: "var(--color-ivory)" }}
        >
          <Kinetic text="in" as="em" className="serif-accent" /> <Kinetic text="one" /> <br className="lg:hidden" />
          <Kinetic text="place." />
        </span>
      </h1>

      {/* ── Phone: arrives with depth, tilts away on exit ── */}
      <div
        className="rm-static relative z-10 mx-auto -mt-[10vw] w-[min(62vw,300px)] translate-x-[12%] will-change-transform lg:absolute lg:left-[59vw] lg:top-[11vh] lg:mt-0 lg:w-[clamp(250px,21vw,360px)] lg:translate-x-0"
        style={phoneExit}
      >
        <div data-tilt data-cursor="media">
        <div className="phone-in" style={{ ["--d" as string]: "140ms" }}>
          <PhoneFrame label="Campus+ home screen showing the next lecture, quick links and today's campus updates (demonstration data)">
            <HomeScreen />
          </PhoneFrame>
        </div>
        </div>
        {/* mobile-only companion photo */}
        <div className="absolute -left-[39%] bottom-[10%] w-[33%] lg:hidden" aria-hidden="true">
          <CinematicPhoto
            img={IMG.libraryAisle}
            scene="inherit"
            params={SHOT}
            intro={{ from: "up", delay: 420 }}
            ratio="3/4"
            crop={[3, 4]}
            sizes="25vw"
            widths={[240, 400]}
            frameClassName="rounded-[3px]"
          />
          <p className="caption intro-fade mt-2 text-stone" style={{ ["--d" as string]: "900ms" }}>
            (01) Up next, at a glance.
          </p>
        </div>
        {/* annotation attached to the phone */}
        <div className="intro-fade absolute -left-[58%] top-[74%] hidden w-[40%] lg:block" style={{ ["--d" as string]: "1100ms" }}>
          <p className="caption text-stone">
            <span className="text-ink">(01)</span> Up next — your next class, the room, and how long until it starts.
          </p>
          <span className="mt-2 block h-px w-[calc(100%+2.5rem)] bg-ink/30" />
        </div>
      </div>

      {/* ── Photographs: staggered wipes from different edges, each on its own depth plane ── */}
      <div className="rm-static absolute right-[3vw] top-[19vh] z-0 hidden w-[10.5vw] will-change-transform lg:block" style={drift("170px")}>
        <div data-hover-media data-sheen className="relative overflow-hidden rounded-[4px]">
        <CinematicPhoto
          img={IMG.concreteFacade}
          scene="inherit"
          params={SHOT}
          intro={{ from: "down", delay: 260 }}
          ratio="1/1"
          crop={[1, 1]}
          sizes="11vw"
          widths={[240, 400]}
          priority
          frameClassName="rounded-[4px]"
        />
        </div>
        <p className="caption intro-fade mt-2 text-stone" style={{ ["--d" as string]: "1000ms" }}>
          Spaces you walk through daily.
        </p>
      </div>
      <div className="rm-static absolute bottom-[6vh] right-[2.5vw] z-0 hidden w-[17vw] will-change-transform lg:block" style={drift("-230px")}>
        <div data-hover-media data-sheen className="relative overflow-hidden rounded-[4px]">
        <CinematicPhoto
          img={IMG.deskSun}
          scene="inherit"
          params={{ pan: [-10, 0], zoom: [1.14, 1.24] }}
          intro={{ from: "left", delay: 520 }}
          ratio="4/3"
          crop={[4, 3]}
          sizes="17vw"
          widths={[400, 640]}
          priority
          frameClassName="rounded-[4px]"
        />
        </div>
      </div>
      <div className="rm-static absolute bottom-[5vh] left-[31vw] z-0 hidden w-[12.5vw] will-change-transform lg:block" style={drift("-80px")}>
        <div data-hover-media data-sheen className="relative overflow-hidden rounded-[4px]">
        <CinematicPhoto
          img={IMG.libraryAisle}
          scene="inherit"
          params={SHOT}
          intro={{ from: "up", delay: 400 }}
          ratio="3/4"
          crop={[3, 4]}
          sizes="13vw"
          widths={[300, 500]}
          priority
          frameClassName="rounded-[4px]"
        />
        </div>
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
            data-magnet="46"
            className="pressable group inline-flex items-center gap-3 rounded-full bg-ink py-2 pl-5 pr-2 text-sm font-medium text-ivory"
          >
            Explore the platform
            <span className="grid size-8 place-items-center rounded-full bg-ivory text-ink transition-transform duration-500 group-hover:translate-y-0.5">
              <Icon name="arrowDown" size={15} />
            </span>
          </a>
          <a href={ROUTES.login} data-magnet="34" className="pressable rounded-full border border-ink/20 px-5 py-3 text-sm font-medium hover:border-ink">
            Get started
          </a>
        </div>
      </div>
    </section>
  );
}
