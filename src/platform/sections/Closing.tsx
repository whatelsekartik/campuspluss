import { useScrollProgress } from "../motion/scroll";
import { CinematicPhoto } from "../components/CinematicPhoto";
import { Wordmark } from "../components/BrandMark";
import { Icon } from "../components/Icon";
import { useSmoothNav } from "../components/ShowcaseNav";
import { IMG, NAV, ROUTES } from "../data";

export function Closing() {
  const ref = useScrollProgress<HTMLElement>("pass");
  const go = useSmoothNav();

  return (
    <section id="start" ref={ref} aria-labelledby="closing-title" className="scene relative overflow-clip bg-ivory outline-none">
      {/* ── ivory statement — echoes the hero's cinematic language ── */}
      <div className="relative mx-auto max-w-[1680px] px-5 pb-[22vw] pt-28 sm:px-6 lg:px-10 lg:pb-[14vw] lg:pt-40">
        <p className="eyebrow text-stone" data-reveal>
          <span className="text-ink">(07)</span> Get started
        </p>
        <h2 id="closing-title" className="display relative z-10 mt-8 text-[18vw] lg:text-[11.6vw]" data-reveal-group>
          <span className="line-mask"><span>Make your</span></span>
          <span className="line-mask">
            <span style={{ ["--rd" as string]: "100ms" }}>
              campus <span className="serif-accent">yours.</span>
            </span>
          </span>
        </h2>

        {/* floating photographs around the statement — slow camera moves */}
        <div className="px absolute right-[6vw] top-[16vh] z-0 hidden w-[14vw] lg:block" style={{ ["--sy" as string]: "-160px", ["--pr" as string]: "2deg" }}>
          <CinematicPhoto img={IMG.concreteDawn} ratio="3/4" crop={[3, 4]} sizes="14vw" widths={[300, 500]} preset="zoom-reveal" reveal="clip-up" parallaxY="40px" zoom={1.2} className="rounded-[4px]" />
        </div>
        <div className="px absolute bottom-[20vw] right-[24vw] z-20 hidden w-[9vw] lg:block" style={{ ["--sy" as string]: "-60px", ["--pr" as string]: "-2deg" }}>
          <CinematicPhoto img={IMG.libraryLamp} ratio="1/1" crop={[1, 1]} sizes="9vw" widths={[200, 360]} preset="float" reveal="scale" parallaxY="30px" className="rounded-[4px]" />
        </div>
        {/* wide architectural strip that pans as you approach the footer */}
        <div className="pointer-events-none absolute inset-x-0 bottom-[8vw] z-0 hidden opacity-[0.16] lg:block" aria-hidden="true">
          <CinematicPhoto img={IMG.hall} ratio="21/9" crop={[21, 9]} sizes="100vw" widths={[1200, 1800]} preset="horizontal-pan" reveal="none" parallaxX="80px" zoom={1.25} className="size-full" />
        </div>

        <div className="relative z-10 mt-12 flex flex-col gap-8 lg:mt-16 lg:flex-row lg:items-end lg:justify-between">
          <p className="max-w-md text-[15px] leading-[1.6] text-stone" data-reveal>
            Sign in to see your timetable, follow clubs and use the marketplace. Or just open the public timetable, no account
            needed.
          </p>
          <div className="flex flex-wrap gap-3" data-reveal style={{ ["--rd" as string]: "100ms" }}>
            <a href={ROUTES.app} className="group inline-flex items-center gap-3 rounded-full bg-ink py-2 pl-6 pr-2 text-sm font-medium text-ivory">
              Open Campus+
              <span className="grid size-9 place-items-center rounded-full bg-ivory text-ink transition-transform duration-500 group-hover:rotate-45">
                <Icon name="arrowUpRight" size={16} />
              </span>
            </a>
            <a href={ROUTES.login} className="rounded-full border border-ink/20 px-6 py-3.5 text-sm font-medium hover:border-ink">
              Sign in
            </a>
            <a href={ROUTES.timetable} className="rounded-full px-4 py-3.5 text-sm font-medium underline decoration-ink/30 underline-offset-4 hover:decoration-ink">
              Public timetable
            </a>
          </div>
        </div>
      </div>

      {/* ── curved boundary: a dark dome that rises (and flattens) as you arrive ── */}
      <footer data-nav-dark className="relative bg-ink text-ivory">
        <div
          aria-hidden="true"
          className="rm-static absolute inset-x-0 bottom-[calc(100%-1px)] h-[18vw] origin-bottom rounded-t-[50%] bg-ink"
          style={{ transform: "scaleY(calc(1.15 - var(--p) * 0.75))" }}
        />
        <div className="relative mx-auto max-w-[1680px] px-5 pt-6 sm:px-6 lg:px-10">
          <div className="grid gap-12 border-b border-ivory/10 pb-14 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <Wordmark tone="light" />
              <p id="independence" className="mt-6 max-w-sm text-[14px] leading-[1.6] text-ivory/60">
                Campus+ is an independent, student-built platform. It is not an official service of Pimpri Chinchwad
                College of Engineering (PCCOE), and the college does not endorse it.
              </p>
            </div>
            <nav aria-label="Platform sections" className="lg:col-span-3 lg:col-start-6">
              <p className="eyebrow text-ivory/40">Explore</p>
              <ul className="mt-4 space-y-2 text-[15px]">
                {NAV.map((n) => (
                  <li key={n.id}>
                    <a href={`#${n.id}`} onClick={(e) => go(e, n.id)} className="text-ivory/80 hover:text-ivory">{n.label}</a>
                  </li>
                ))}
                <li><a href="#utilities" onClick={(e) => go(e, "utilities")} className="text-ivory/80 hover:text-ivory">Utilities</a></li>
              </ul>
            </nav>
            <nav aria-label="Campus+" className="lg:col-span-2">
              <p className="eyebrow text-ivory/40">Campus+</p>
              <ul className="mt-4 space-y-2 text-[15px]">
                <li><a href={ROUTES.app} className="text-ivory/80 hover:text-ivory">Open Campus+</a></li>
                <li><a href={ROUTES.login} className="text-ivory/80 hover:text-ivory">Sign in</a></li>
                <li><a href={ROUTES.timetable} className="text-ivory/80 hover:text-ivory">Public timetable</a></li>
              </ul>
            </nav>
            <nav aria-label="Legal" className="lg:col-span-2">
              <p className="eyebrow text-ivory/40">Legal</p>
              <ul className="mt-4 space-y-2 text-[15px]">
                <li><a href="/privacy" className="text-ivory/80 hover:text-ivory">Privacy</a></li>
                <li><a href="/terms" className="text-ivory/80 hover:text-ivory">Terms</a></li>
                <li><a href="#independence" className="text-ivory/80 hover:text-ivory">Independence notice</a></li>
              </ul>
            </nav>
          </div>

          <div className="caption mt-8 flex flex-col justify-between gap-2 text-ivory/40 sm:flex-row">
            <span>© {new Date().getFullYear()} Campus+. Built by students.</span>
            <span>Photography: Pexels contributors, used for illustration. Not PCCOE photography.</span>
          </div>
          {/* oversized wordmark, cropped by the page edge */}
          <p className="display pointer-events-none -mb-[9vw] mt-10 select-none whitespace-nowrap text-center text-[23vw] leading-[0.78] text-ivory/[0.07]" aria-hidden="true">
            Campus+
          </p>
        </div>
      </footer>
    </section>
  );
}
