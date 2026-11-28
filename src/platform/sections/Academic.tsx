import { useState } from "react";
import { useScrollProgress } from "../motion/scroll";
import { BrowserFrame } from "../components/DeviceFrames";
import { TimetablePreview } from "../components/TimetablePreview";
import { CinematicPhoto } from "../components/CinematicPhoto";
import { usePrefersReducedMotion } from "../motion/reveal";
import { Icon } from "../components/Icon";
import { ScrubText } from "../components/ScrubText";
import { IMG, ROUTES } from "../data";

export function Academic() {
  const reduced = usePrefersReducedMotion();
  const ref = useScrollProgress<HTMLElement>("pass", undefined, !reduced);
  const [divLabel, setDivLabel] = useState("SE · A");

  return (
    <section id="academic" ref={ref} aria-labelledby="academic-title" className="scene relative overflow-clip bg-beige pb-28 pt-28 outline-none lg:pb-40 lg:pt-36">
      <div className="mx-auto max-w-[1680px] px-5 sm:px-6 lg:px-10">
        <div className="flex items-start justify-between">
          <p className="eyebrow text-stone">
            <span className="numeral text-ink" style={{ ["--ns" as string]: "0.03" }}>(03)</span> Academic life
            <span className="rule mt-3 block h-px w-10 bg-ink/30" />
          </p>
          <p className="caption hidden max-w-[14rem] text-right text-stone sm:block" data-reveal style={{ ["--rd" as string]: "120ms" }}>
            Timetables by division, readable at a glance, on any screen.
          </p>
        </div>

        <div className="relative mt-10 grid gap-12 lg:mt-14 lg:grid-cols-12 lg:gap-6">
          {/* headline column — the type runs into the photo on desktop */}
          <div className="relative z-20 lg:col-span-6 lg:pt-6">
            <h2 id="academic-title" className="display text-[19vw] lg:w-[54vw] lg:text-[10.4vw]">
              <span className="line-mask"><span><ScrubText start={0.04} turn={5}>Know what’s</ScrubText></span></span>
              <span className="line-mask">
                <span>
                  <span className="serif-accent"><ScrubText start={0.14} turn={-6}>next.</ScrubText></span>
                </span>
              </span>
            </h2>
            <div className="mt-10 grid max-w-xl gap-8 sm:grid-cols-2 lg:mt-16">
              <p className="text-[15px] leading-[1.6] text-stone" data-reveal>
                Choose your division and see the day: lectures, labs, rooms and batches, with the next slot highlighted.
              </p>
              <ul className="drift caption space-y-3 border-l border-ink/15 pl-5 text-stone" data-reveal style={{ ["--rd" as string]: "120ms", ["--dy" as string]: "34px" }}>
                <li className="scan-row -mx-2 rounded-md px-2 py-1"><span className="text-ink">Divisions</span>, switch in one tap</li>
                <li className="scan-row -mx-2 rounded-md px-2 py-1"><span className="text-ink">Days</span>, Monday to Saturday</li>
                <li className="scan-row -mx-2 rounded-md px-2 py-1"><span className="text-ink">Slot details</span>, tap to expand</li>
              </ul>
            </div>
            <a
              href={ROUTES.timetable}
              className="group mt-10 inline-flex items-center gap-3 border-b border-ink pb-1 text-sm font-medium"
              data-reveal
            >
              Open the public timetable
              <Icon name="arrowRight" size={16} className="transition-transform duration-500 group-hover:translate-x-1" />
            </a>
          </div>

          {/* layered product composition */}
          <div className="relative lg:col-span-6 lg:min-h-[760px]">
            {/* campus photograph behind the product: wipes down, drifts against the page, pans inside its frame */}
            <CinematicPhoto
              img={IMG.hall}
              preset={["wipe", "parallax", "float"]}
              params={{ from: "down", drift: [0, -150], pan: [-6, 14], zoom: [1.3, 1.16], revealZoom: 0.16, window: [0.04, 0.32] }}
              ratio="4/5"
              crop={[4, 5]}
              sizes="(min-width:1024px) 38vw, 70vw"
              widths={[480, 800, 1100]}
              className="absolute -right-5 -top-16 z-0 w-[70%] sm:-right-6 lg:-right-10 lg:-top-24 lg:w-[78%]"
              frameClassName="rounded-[4px]"
              data-hover-media
              data-sheen
            >
              <p className="caption mt-2 text-right text-stone">Illustrative photography</p>
            </CinematicPhoto>

            {/* main frame: unveiled through a rising mask (one-off, so the controls are never half-clipped) */}
            <div className="relative z-10 pt-[38%] lg:absolute lg:-left-[6%] lg:top-[18%] lg:w-[86%] lg:pt-0" data-reveal-group>
              <div data-tilt="soft" data-cursor="media">
              <div className="mask-reveal">
                <BrowserFrame url={`${ROUTES.timetable} · ${divLabel}`}>
                  <TimetablePreview onDivision={setDivLabel} />
                </BrowserFrame>
              </div>
              </div>
            </div>

            {/* floating schedule fragments: staggered, each settling from its own angle, on separate depth planes */}
            <div className="px absolute -left-2 top-[30%] z-20 hidden sm:block lg:-left-[16%] lg:top-[10%]" style={{ ["--sy" as string]: "150px" }}>
              <div data-tilt>
              <div
                className="rotate-[-3deg] rounded-2xl bg-ivory px-4 py-3 shadow-[0_24px_40px_-24px_rgba(52,38,22,.5)] ring-1 ring-ink/5"
                data-reveal
                style={{ ["--rd" as string]: "500ms", ["--rx" as string]: "-40px", ["--ry" as string]: "30px", ["--rr" as string]: "-9deg" }}
              >
                <p className="eyebrow text-clay">Lab · Batch B2</p>
                <p className="mt-1 text-sm font-semibold">14:00 – 16:00</p>
                <p className="caption text-stone">Two-hour slot, batch-wise</p>
              </div>
              </div>
            </div>
            <div className="px absolute -bottom-6 right-2 z-20 lg:-bottom-2 lg:right-[2%]" style={{ ["--sy" as string]: "-110px" }}>
              <div data-tilt>
              <div
                className="flex items-center gap-3 rounded-full bg-ink py-2 pl-2 pr-5 text-ivory shadow-[0_24px_40px_-20px_rgba(20,18,15,.6)]"
                data-reveal
                style={{ ["--rd" as string]: "760ms", ["--rx" as string]: "50px", ["--ry" as string]: "20px", ["--rr" as string]: "5deg" }}
              >
                <span className="grid size-9 place-items-center rounded-full bg-app-accent text-ink">
                  <Icon name="clock" size={16} />
                </span>
                <span>
                  <span className="block text-[13px] font-medium">Next up, highlighted</span>
                  <span className="caption block opacity-60">Based on your device time</span>
                </span>
              </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
