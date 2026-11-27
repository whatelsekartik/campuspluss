import type { CSSProperties } from "react";
import { useScrollProgress } from "../motion/scroll";
import { usePrefersReducedMotion } from "../motion/reveal";
import { CinematicPhoto } from "../components/CinematicPhoto";
import { Kinetic } from "../components/Kinetic";
import { IMG } from "../data";

/*
  Sticky choreography driven by one --p value (0..1):
   --a : intro (giant type slides in from above)          p 0.00 → 0.35
   --e : expansion (photo grows to fill the viewport)     p 0.40 → 0.85
   --s : statement reveal over the expanded photo         p 0.70 → 0.92
   --k : internal camera drift (independent of the panel) p 0.00 → 1.00
*/
const sceneVars = {
  "--a": "clamp(0, calc(var(--p) / 0.35), 1)",
  "--e": "clamp(0, calc((var(--p) - 0.4) / 0.45), 1)",
  "--s": "clamp(0, calc((var(--p) - 0.7) / 0.22), 1)",
  "--k": "clamp(0, calc((var(--p) - 0.15) / 0.7), 1)",
} as CSSProperties;

const STEPS = [
  ["01", "Sign in", "Open Campus+ and sign in."],
  ["02", "Set your division", "Your timetable follows the division you pick."],
  ["03", "Everything else", "Clubs, events, the marketplace and more are one tap away."],
];

export function Everything() {
  const reduced = usePrefersReducedMotion();
  const ref = useScrollProgress<HTMLElement>("sticky", undefined, !reduced);

  return (
    <section
      id="how"
      ref={ref}
      aria-labelledby="how-title"
      className="scene relative bg-ivory outline-none"
      style={{ ...sceneVars, height: reduced ? "auto" : "260vh", ...(reduced ? { ["--p" as string]: 1 } : null) }}
    >
      <div className={reduced ? "relative h-[100svh] overflow-hidden" : "sticky top-0 h-[100svh] overflow-hidden"}>
        {/* giant headline entering from the top — with a slow scale settle */}
        <h2
          id="how-title"
          className="display rm-static pointer-events-none absolute inset-x-0 top-[3.5rem] z-0 whitespace-nowrap px-4 text-center text-[18vw] leading-[0.8] lg:text-[19.5vw]"
          style={{
            transform:
              "translate3d(0, calc((var(--a) - 1) * 45%), 0) scale(calc(1.04 - var(--a) * 0.04))",
            opacity: "calc(0.25 + var(--a) * 0.75)",
          }}
        >
          <Kinetic text="Everything" />
          <span className="serif-accent mt-[0.1em] block text-[0.3em] leading-none">
            <Kinetic text="you need, kept together." />
          </span>
        </h2>

        {/* main photographic panel — expands to fill the viewport.
            Outer scales + rounds away; inner camera moves independently. */}
        <div
          className="rm-static absolute inset-0 z-10 origin-[50%_62%] overflow-hidden rounded-[28px] will-change-transform"
          style={{
            transform: "scale(calc(0.4 + var(--e) * 0.6)) translate3d(0, calc((1 - var(--e)) * 14%), 0)",
            borderRadius: "calc(28px * (1 - var(--e)))",
            clipPath: "inset(calc((1 - var(--e)) * 6%) calc((1 - var(--e)) * 4%) calc((1 - var(--e)) * 6%) calc((1 - var(--e)) * 4%))",
          }}
        >
          {/* independent camera: slow zoom + gentle vertical pan as --e advances */}
          <div
            className="absolute inset-0 will-change-transform"
            style={{
              transform:
                "scale(calc(1.22 - var(--e) * 0.22)) translate3d(0, calc((var(--k) - 0.5) * 4%), 0)",
              transformOrigin: "50% 58%",
            }}
          >
            <CinematicPhoto
              img={IMG.library}
              sizes="100vw"
              widths={[800, 1280, 1920]}
              preset="zoom-reveal"
              reveal="none"
              zoom={1.02}
              className="absolute inset-0 size-full"
            />
          </div>
          <div className="absolute inset-0 bg-ink" style={{ opacity: "calc(var(--e) * 0.55)" }} />
          {/* closing statement over the photo */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-ivory"
            style={{
              opacity: "var(--s)",
              transform: "translate3d(0, calc((1 - var(--s)) * 40px), 0) scale(calc(0.98 + var(--s) * 0.02))",
            }}
          >
            <p className="eyebrow mb-6 opacity-80">(02) How it works</p>
            <p className="display text-[19vw] lg:text-[12vw]">
              <span className="serif-accent">One</span> campus.
            </p>
            <ol className="mt-10 grid max-w-4xl gap-6 text-left sm:grid-cols-3">
              {STEPS.map(([n, t, d]) => (
                <li
                  key={n}
                  data-magnet="40"
                  className="scan-row group border-t border-ivory/30 pb-3 pt-3"
                >
                  <span className="caption opacity-70 transition-colors group-hover:text-clay">{n}</span>
                  <p className="mt-1 text-base font-semibold transition-transform duration-500 group-hover:translate-x-1">{t}</p>
                  <p className="caption mt-1 opacity-80">{d}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* floating side photographs (in front of the panel, drifting outward) */}
        <div
          className="rm-static absolute left-[5vw] top-[40vh] z-20 w-[30vw] lg:left-[7vw] lg:top-[38vh] lg:w-[13vw]"
          style={{
            transform: "translate3d(calc(var(--e) * -24vw), calc(var(--p) * -26vh), 0) rotate(calc(var(--e) * -3deg))",
            opacity: "calc(1 - var(--e) * 1.2)",
          }}
        >
          <div data-hover-media data-sheen className="relative overflow-hidden rounded-[4px]">
            <CinematicPhoto img={IMG.stairs} ratio="3/4" crop={[3, 4]} sizes="(min-width:1024px) 13vw, 30vw" widths={[300, 500]} preset="float" reveal="none" parallaxY="30px" className="rounded-[4px]" />
          </div>
          <p className="caption mt-2 text-stone">Between lectures.</p>
        </div>
        <div
          className="rm-static absolute bottom-[6vh] right-[5vw] z-20 w-[36vw] lg:bottom-[9vh] lg:right-[6vw] lg:w-[18vw]"
          style={{
            transform: "translate3d(calc(var(--e) * 24vw), calc(var(--p) * -18vh), 0) rotate(calc(var(--e) * 2.5deg))",
            opacity: "calc(1 - var(--e) * 1.2)",
          }}
        >
          <div data-hover-media data-sheen className="relative overflow-hidden rounded-[4px]">
            <CinematicPhoto img={IMG.notebook} ratio="4/5" crop={[4, 5]} sizes="(min-width:1024px) 18vw, 36vw" widths={[360, 600]} preset="float" reveal="none" parallaxY="40px" className="rounded-[4px]" />
          </div>
        </div>
        <div
          className="rm-static absolute right-[16vw] top-[22vh] z-20 hidden w-[8vw] lg:block"
          style={{
            transform: "translate3d(calc(var(--e) * 14vw), calc(var(--p) * -40vh), 0) rotate(calc(var(--e) * 4deg))",
            opacity: "calc(1 - var(--e) * 1.3)",
          }}
        >
          <div data-hover-media data-sheen className="relative overflow-hidden rounded-[4px]">
            <CinematicPhoto img={IMG.concreteGreen} ratio="1/1" crop={[1, 1]} sizes="8vw" widths={[200, 320]} preset="float" reveal="none" parallaxY="24px" className="rounded-[4px]" />
          </div>
        </div>

        {/* short central statement before the expansion */}
        <p
          className="rm-static absolute bottom-[7vh] left-1/2 z-20 w-[min(88vw,26rem)] -translate-x-1/2 text-center text-[15px] leading-[1.55] text-stone max-lg:bottom-auto max-lg:top-[26vh]"
          style={{ opacity: "calc(1 - var(--e) * 2.5)", transform: "translate3d(-50%, calc(var(--e) * -30px), 0)" }}
        >
          From your first lecture to the ride home, everyday student life in one place.
        </p>
      </div>
    </section>
  );
}
