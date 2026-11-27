import { useState } from "react";
import { useScrollProgress } from "../motion/scroll";
import { BrowserFrame } from "../components/DeviceFrames";
import { TimetablePreview } from "../components/TimetablePreview";
import { CinematicPhoto } from "../components/CinematicPhoto";
import { Kinetic } from "../components/Kinetic";
import { Icon } from "../components/Icon";
import { IMG, ROUTES } from "../data";

export function Academic() {
  const ref = useScrollProgress<HTMLElement>("pass");
  const [divLabel, setDivLabel] = useState("SE · A");

  return (
    <section id="academic" ref={ref} aria-labelledby="academic-title" className="scene relative overflow-clip bg-beige pb-28 pt-28 outline-none lg:pb-40 lg:pt-36">
      <div className="mx-auto max-w-[1680px] px-5 sm:px-6 lg:px-10">
        <div className="flex items-start justify-between">
          <p className="eyebrow text-stone" data-reveal>
            <span className="text-ink">(03)</span> Academic life
          </p>
          <p className="caption hidden max-w-[14rem] text-right text-stone sm:block" data-reveal style={{ ["--rd" as string]: "120ms" }}>
            Timetables by division, readable at a glance, on any screen.
          </p>
        </div>

        <div className="relative mt-10 grid gap-12 lg:mt-14 lg:grid-cols-12 lg:gap-6">
          {/* headline column — the type runs into the photo on desktop */}
          <div className="relative z-20 lg:col-span-6 lg:pt-6">
            <h2 id="academic-title" className="display text-[19vw] lg:w-[54vw] lg:text-[10.4vw]" data-reveal-group>
              <span className="line-mask"><span><Kinetic text="Know what’s" /></span></span>
              <span className="line-mask"><span className="serif-accent" style={{ ["--rd" as string]: "120ms" }}><Kinetic text="next." /></span></span>
            </h2>
            <div className="mt-10 grid max-w-xl gap-8 sm:grid-cols-2 lg:mt-16">
              <p className="text-[15px] leading-[1.6] text-stone" data-reveal>
                Choose your division and see the day: lectures, labs, rooms and batches, with the next slot highlighted.
              </p>
              <ul className="caption space-y-3 border-l border-ink/15 pl-5 text-stone" data-reveal style={{ ["--rd" as string]: "120ms" }}>
                <li className="scan-row -mx-2 rounded-md px-2 py-1 transition-colors hover:bg-ink/[0.04]"><span className="text-ink">Divisions</span>, switch in one tap</li>
                <li className="scan-row -mx-2 rounded-md px-2 py-1 transition-colors hover:bg-ink/[0.04]"><span className="text-ink">Days</span>, Monday to Saturday</li>
                <li className="scan-row -mx-2 rounded-md px-2 py-1 transition-colors hover:bg-ink/[0.04]"><span className="text-ink">Slot details</span>, tap to expand</li>
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
            {/* campus photograph behind the product — independent zoom + parallax */}
            <div className="px absolute -right-5 -top-16 z-0 w-[70%] sm:-right-6 lg:-right-10 lg:-top-24 lg:w-[78%]" style={{ ["--sy" as string]: "-140px" }}>
              <div data-hover-media data-sheen className="relative overflow-hidden rounded-[4px]">
                <CinematicPhoto img={IMG.hall} ratio="4/5" crop={[4, 5]} sizes="(min-width:1024px) 38vw, 70vw" widths={[480, 800, 1100]} preset="zoom-reveal" reveal="clip-up" parallaxY="30px" zoom={1.2} className="rounded-[4px]" />
              </div>
              <p className="caption mt-2 text-right text-stone">Illustrative photography</p>
            </div>

            {/* main frame — masked wipe reveal; stays fully interactive */}
            <div className="relative z-10 pt-[38%] lg:absolute lg:-left-[6%] lg:top-[18%] lg:w-[86%] lg:pt-0" data-reveal style={{ ["--ry" as string]: "80px" }}>
              <div data-tilt="soft" className="relative" data-cursor="media">
              <div className="academic-mask" data-reveal style={{ ["--rd" as string]: "150ms" }}>
                <BrowserFrame url={`${ROUTES.timetable} · ${divLabel}`}>
                  <TimetablePreview onDivision={setDivLabel} />
                </BrowserFrame>
              </div>
              </div>
            </div>

            {/* floating schedule fragments — staggered float with rotational settling */}
            <div className="px absolute -left-2 top-[30%] z-20 hidden sm:block lg:-left-[16%] lg:top-[10%]" style={{ ["--sy" as string]: "120px", ["--pr" as string]: "2deg" }}>
              <div data-tilt>
              <div className="rotate-[-3deg] rounded-2xl bg-ivory px-4 py-3 shadow-[0_24px_40px_-24px_rgba(52,38,22,.5)] ring-1 ring-ink/5" data-reveal style={{ ["--rd" as string]: "350ms", ["--ry" as string]: "28px", ["--rr" as string]: "-3deg" }}>
                <p className="eyebrow text-clay">Lab · Batch B2</p>
                <p className="mt-1 text-sm font-semibold">14:00 – 16:00</p>
                <p className="caption text-stone">Two-hour slot, batch-wise</p>
              </div>
              </div>
            </div>
            <div className="px absolute -bottom-6 right-2 z-20 lg:-bottom-2 lg:right-[2%]" style={{ ["--sy" as string]: "-90px", ["--pr" as string]: "-2deg" }}>
              <div data-tilt className="rounded-full" style={{ ["--rd" as string]: "500ms", ["--ry" as string]: "28px", ["--rr" as string]: "2deg" }}>
                <div className="flex items-center gap-3 rounded-full bg-ink py-2 pl-2 pr-5 text-ivory shadow-[0_24px_40px_-20px_rgba(20,18,15,.6)]" data-reveal>
                  <span className="grid size-9 place-items-center rounded-full bg-app-accent text-ink" data-magnet="50">
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
