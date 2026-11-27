import type { CSSProperties } from "react";
import { useScrollProgress } from "../motion/scroll";
import { usePrefersReducedMotion } from "../motion/reveal";
import { Photo } from "../components/Photo";
import { IMG } from "../data";

/*
  Sticky choreography driven by one --p value (0..1):
   --a : intro (giant type slides in from above)          p 0.00 → 0.35
   --e : expansion (photo grows to fill the viewport)     p 0.40 → 0.85
   --s : statement reveal over the expanded photo         p 0.70 → 0.92
*/
const sceneVars = {
  "--a": "clamp(0, calc(var(--p) / 0.35), 1)",
  "--e": "clamp(0, calc((var(--p) - 0.4) / 0.45), 1)",
  "--s": "clamp(0, calc((var(--p) - 0.7) / 0.22), 1)",
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
        {/* giant headline entering from the top */}
        <h2
          id="how-title"
          className="display rm-static pointer-events-none absolute inset-x-0 top-[3.5rem] z-0 whitespace-nowrap px-4 text-center text-[18vw] leading-[0.8] lg:text-[19.5vw]"
          style={{ transform: "translate3d(0, calc((var(--a) - 1) * 45%), 0)" }}
        >
          Everything
          <span className="serif-accent mt-[0.1em] block text-[0.3em] leading-none">you need, kept together.</span>
        </h2>

        {/* main photographic panel — expands to fill the viewport */}
        <div
          className="rm-static absolute inset-0 z-10 origin-[50%_62%] overflow-hidden rounded-[28px] will-change-transform"
          style={{ transform: "scale(calc(0.4 + var(--e) * 0.6)) translate3d(0, calc((1 - var(--e)) * 14%), 0)" }}
        >
          <div className="absolute inset-0" style={{ transform: "scale(calc(1.18 - var(--e) * 0.18))" }}>
            <Photo img={IMG.library} sizes="100vw" widths={[800, 1280, 1920]} className="absolute inset-0" />
          </div>
          <div className="absolute inset-0 bg-ink" style={{ opacity: "calc(var(--e) * 0.55)" }} />
          {/* closing statement over the photo */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-ivory"
            style={{ opacity: "var(--s)", transform: "translate3d(0, calc((1 - var(--s)) * 40px), 0)" }}
          >
            <p className="eyebrow mb-6 opacity-80">(02) How it works</p>
            <p className="display text-[19vw] lg:text-[12vw]">
              <span className="serif-accent">One</span> campus.
            </p>
            <ol className="mt-10 grid max-w-4xl gap-6 text-left sm:grid-cols-3">
              {STEPS.map(([n, t, d]) => (
                <li key={n} className="border-t border-ivory/30 pt-3">
                  <span className="caption opacity-70">{n}</span>
                  <p className="mt-1 text-base font-semibold">{t}</p>
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
            transform: "translate3d(calc(var(--e) * -24vw), calc(var(--p) * -26vh), 0)",
            opacity: "calc(1 - var(--e) * 1.2)",
          }}
        >
          <Photo img={IMG.stairs} ratio="3/4" crop={[3, 4]} sizes="(min-width:1024px) 13vw, 30vw" widths={[300, 500]} className="rounded-[4px]" />
          <p className="caption mt-2 text-stone">Between lectures.</p>
        </div>
        <div
          className="rm-static absolute bottom-[6vh] right-[5vw] z-20 w-[36vw] lg:bottom-[9vh] lg:right-[6vw] lg:w-[18vw]"
          style={{
            transform: "translate3d(calc(var(--e) * 24vw), calc(var(--p) * -18vh), 0)",
            opacity: "calc(1 - var(--e) * 1.2)",
          }}
        >
          <Photo img={IMG.notebook} ratio="4/5" crop={[4, 5]} sizes="(min-width:1024px) 18vw, 36vw" widths={[360, 600]} className="rounded-[4px]" />
        </div>
        <div
          className="rm-static absolute right-[16vw] top-[22vh] z-20 hidden w-[8vw] lg:block"
          style={{
            transform: "translate3d(calc(var(--e) * 14vw), calc(var(--p) * -40vh), 0)",
            opacity: "calc(1 - var(--e) * 1.3)",
          }}
        >
          <Photo img={IMG.concreteGreen} ratio="1/1" crop={[1, 1]} sizes="8vw" widths={[200, 320]} className="rounded-[4px]" />
        </div>

        {/* short central statement before the expansion */}
        <p
          className="rm-static absolute bottom-[7vh] left-1/2 z-20 w-[min(88vw,26rem)] -translate-x-1/2 text-center text-[15px] leading-[1.55] text-stone max-lg:bottom-auto max-lg:top-[26vh]"
          style={{ opacity: "calc(1 - var(--e) * 2.5)" }}
        >
          From your first lecture to the ride home, everyday student life in one place.
        </p>
      </div>
    </section>
  );
}
