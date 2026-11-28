import type { CSSProperties } from "react";
import { cn } from "@/utils/cn";
import { useScrollProgress } from "../motion/scroll";
import { usePrefersReducedMotion } from "../motion/reveal";
import { CinematicPhoto } from "../components/CinematicPhoto";
import { PhotoImg } from "../components/Photo";
import { IMG } from "../data";

/*
  Sticky choreography driven by one --p value (0..1). Each beat has its own
  window so the scene reads as a sequence of cuts rather than one tween:

   --a  headline descends from above the frame             p 0.00 → 0.30
   --w  side photographs wipe in                           p 0.04 → 0.26   (their own .cine window)
   --e  the inset photograph expands to the full viewport  p 0.34 → 0.80
   --s  "One campus." is unmasked over the photograph      p 0.66 → 0.88
   --t* the three steps follow, one after another          p 0.76 → 0.98

  Three things move independently on the main photograph:
   panel  (scale + rise)   — the frame growing
   camera (zoom + drift)   — the shot pulling back, then pushing in again
   veil   (opacity)        — light falling as the statement arrives
*/
const sceneVars = {
  "--a": "clamp(0, calc(var(--p) / 0.3), 1)",
  "--e": "clamp(0, calc((var(--p) - 0.34) / 0.46), 1)",
  "--s": "clamp(0, calc((var(--p) - 0.66) / 0.22), 1)",
} as CSSProperties;

const STEPS = [
  ["01", "Sign in", "Open Campus+ and sign in."],
  ["02", "Set your division", "Your timetable follows the division you pick."],
  ["03", "Everything else", "Clubs, events, the marketplace and more are one tap away."],
];

/** Reveal window for the floating side photographs (inside the sticky scene). */
const SIDE_WINDOW: [number, number] = [0.04, 0.26];

export function Everything() {
  const reduced = usePrefersReducedMotion();
  const ref = useScrollProgress<HTMLElement>("sticky", undefined, !reduced);

  return (
    <section
      id="how"
      ref={ref}
      aria-labelledby="how-title"
      className={cn("scene relative bg-ivory outline-none", !reduced && "h-[230vh] lg:h-[270vh]")}
      style={{ ...sceneVars, ["--p" as string]: reduced ? 1 : 0 }}
    >
      <div className={reduced ? "relative h-[100svh] overflow-hidden" : "sticky top-0 h-[100svh] overflow-hidden"}>
        {/* giant headline entering from the top, then lifting away as the photograph grows */}
        <h2
          id="how-title"
          className="display rm-static pointer-events-none absolute inset-x-0 top-[3.5rem] z-0 whitespace-nowrap px-4 text-center text-[18vw] leading-[0.8] will-change-transform lg:text-[19.5vw]"
          style={{
            transform:
              "translate3d(0, calc((var(--a) - 1) * 45% - var(--e) * 10%), 0) scale(calc(1.07 - var(--a) * 0.07))",
          }}
        >
          Everything
          <span
            className="serif-accent mt-[0.1em] block text-[0.3em] leading-none"
            style={{ opacity: "clamp(0, calc((var(--p) - 0.12) / 0.14), 1)" }}
          >
            you need, kept together.
          </span>
        </h2>

        {/* main photographic panel — the frame expands to fill the viewport */}
        <div
          className="rm-static absolute inset-0 z-10 origin-[50%_62%] overflow-hidden rounded-[28px] bg-sand will-change-transform"
          style={{ transform: "scale(calc(0.4 + var(--e) * 0.6)) translate3d(0, calc((1 - var(--e)) * 14%), 0)" }}
        >
          {/* camera: pulls back while the frame opens, drifts, then pushes in under the statement */}
          <div
            className="rm-static absolute inset-0 will-change-transform"
            style={{
              transform:
                "translate3d(0, calc((0.5 - var(--p)) * 5%), 0) scale(calc(1.36 - var(--e) * 0.27 + var(--s) * 0.08))",
            }}
          >
            <PhotoImg img={IMG.library} sizes="100vw" widths={[800, 1280, 1920]} />
          </div>
          <div className="absolute inset-0 bg-ink" style={{ opacity: "calc(var(--e) * 0.3 + var(--s) * 0.28)" }} />

          {/* closing statement, unmasked from below */}
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-ivory">
            <p className="eyebrow mb-6" style={{ opacity: "calc(var(--s) * 0.8)" }}>
              <span className="numeral">(02)</span> How it works
            </p>
            <p
              className="display rm-static text-[19vw] will-change-transform lg:text-[12vw]"
              style={{
                clipPath: "inset(-0.1em -0.1em calc((1 - var(--s)) * 100%) -0.1em)",
                transform: "translate3d(0, calc((1 - var(--s)) * 0.45em), 0)",
              }}
            >
              <span className="serif-accent">One</span> campus.
            </p>
            <ol className="mt-10 grid max-w-4xl gap-6 text-left sm:grid-cols-3">
              {STEPS.map(([n, t, d], i) => (
                <li
                  key={n}
                  className="rm-static rm-visible group border-t border-ivory/30 pb-3 pt-3"
                  style={{
                    ["--t" as string]: `clamp(0, calc((var(--p) - ${(0.76 + i * 0.04).toFixed(2)}) / 0.14), 1)`,
                    opacity: "var(--t)",
                    transform: "translate3d(0, calc((1 - var(--t)) * 28px), 0)",
                  }}
                >
                  <span className="caption opacity-70 transition-colors group-hover:text-clay">{n}</span>
                  <p className="mt-1 text-base font-semibold transition-transform duration-500 group-hover:translate-x-1">{t}</p>
                  <span className="mt-2 block h-px w-0 bg-ivory/40 transition-[width] duration-500 group-hover:w-full" aria-hidden="true" />
                  <p className="caption mt-1 opacity-80">{d}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* floating side photographs: wipe in, pan internally, then drift outward as the panel takes over */}
        <div
          className="rm-static absolute left-[5vw] top-[40vh] z-20 w-[30vw] will-change-transform lg:left-[7vw] lg:top-[38vh] lg:w-[13vw]"
          style={{
            transform: "translate3d(calc(var(--e) * -24vw), calc(var(--p) * -26vh), 0)",
            opacity: "calc(1 - var(--e) * 1.2)",
          }}
        >
          <div data-hover-media data-sheen className="relative overflow-hidden rounded-[4px]">
          <CinematicPhoto
            img={IMG.stairs}
            scene="inherit"
            preset={["wipe", "vertical-pan"]}
            params={{ from: "up", window: SIDE_WINDOW, pan: [0, -22], revealZoom: 0.2 }}
            ratio="3/4"
            crop={[3, 4]}
            sizes="(min-width:1024px) 13vw, 30vw"
            widths={[300, 500]}
            frameClassName="rounded-[4px]"
          />
          </div>
          <p className="caption mt-2 text-stone" style={{ opacity: "clamp(0, calc((var(--p) - 0.2) / 0.08), 1)" }}>
            Between lectures.
          </p>
        </div>
        <div
          className="rm-static absolute bottom-[6vh] right-[5vw] z-20 w-[36vw] will-change-transform lg:bottom-[9vh] lg:right-[6vw] lg:w-[18vw]"
          style={{
            transform: "translate3d(calc(var(--e) * 24vw), calc(var(--p) * -18vh), 0)",
            opacity: "calc(1 - var(--e) * 1.2)",
          }}
        >
          <div data-hover-media data-sheen className="relative overflow-hidden rounded-[4px]">
          <CinematicPhoto
            img={IMG.notebook}
            scene="inherit"
            preset={["wipe", "horizontal-pan"]}
            params={{ from: "left", window: [0.08, 0.3], pan: [18, 0], revealZoom: 0.2 }}
            ratio="4/5"
            crop={[4, 5]}
            sizes="(min-width:1024px) 18vw, 36vw"
            widths={[360, 600]}
            frameClassName="rounded-[4px]"
          />
          </div>
        </div>
        <div
          className="rm-static absolute right-[16vw] top-[22vh] z-20 hidden w-[8vw] will-change-transform lg:block"
          style={{
            transform: "translate3d(calc(var(--e) * 14vw), calc(var(--p) * -40vh), 0)",
            opacity: "calc(1 - var(--e) * 1.3)",
          }}
        >
          <div data-hover-media data-sheen className="relative overflow-hidden rounded-[4px]">
          <CinematicPhoto
            img={IMG.concreteGreen}
            scene="inherit"
            preset={["zoom-reveal", "parallax"]}
            params={{ window: [0.12, 0.32], inset: 50, revealZoom: 0.3 }}
            ratio="1/1"
            crop={[1, 1]}
            sizes="8vw"
            widths={[200, 320]}
            frameClassName="rounded-[4px] bg-transparent"
          />
          </div>
        </div>

        {/* short central statement before the expansion */}
        <p
          className="rm-static absolute bottom-[7vh] left-1/2 z-20 w-[min(88vw,26rem)] -translate-x-1/2 text-center text-[15px] leading-[1.55] text-stone max-lg:bottom-auto max-lg:top-[26vh]"
          style={{
            opacity: "calc(clamp(0, calc((var(--p) - 0.1) / 0.12), 1) - var(--e) * 2.5)",
            transform: "translate3d(0, calc((1 - clamp(0, calc((var(--p) - 0.1) / 0.12), 1)) * 18px), 0)",
          }}
        >
          From your first lecture to the ride home, everyday student life in one place.
        </p>
      </div>
    </section>
  );
}
