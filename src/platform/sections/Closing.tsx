import { useScrollProgress } from "../motion/scroll";
import { CinematicPhoto } from "../components/CinematicPhoto";
import { PhoneFrame } from "../components/DeviceFrames";
import { HomeScreenLight } from "../components/AppScreens";
import { ScrubText } from "../components/ScrubText";
import { usePrefersReducedMotion } from "../motion/reveal";
import { Wordmark } from "../components/BrandMark";
import { Icon } from "../components/Icon";
import { useSmoothNav } from "../components/ShowcaseNav";
import { IMG, NAV, ROUTES } from "../data";

export function Closing() {
  const reduced = usePrefersReducedMotion();
  const ref = useScrollProgress<HTMLElement>("pass", undefined, !reduced);
  // the footer is its own scene: 0 when its top edge appears, 1 once it has fully arrived
  const footerRef = useScrollProgress<HTMLElement>("enter", undefined, !reduced);
  const go = useSmoothNav();

  return (
    <section id="start" ref={ref} aria-labelledby="closing-title" className="scene relative overflow-clip bg-ivory outline-none">
      {/* ── ivory statement ── */}
      <div className="relative mx-auto max-w-[1680px] px-5 pb-[26vw] pt-28 sm:px-6 lg:px-10 lg:pb-[18vw] lg:pt-40">
        <p className="eyebrow text-stone">
          <span className="numeral text-ink" style={{ ["--ns" as string]: "0.03" }}>(07)</span> Get started
          <span className="rule mt-3 block h-px w-10 bg-ink/30" />
        </p>
        <h2 id="closing-title" className="display relative z-10 mt-8 text-[18vw] lg:text-[11.6vw]">
          {/* as in the opening, the two lines travel in opposite directions,
              and their letters settle out of the line as the statement arrives */}
          <span className="px block" style={{ ["--sx" as string]: "-7vw" }}>
            <span className="line-mask"><span><ScrubText start={0.05} turn={6}>Make your</ScrubText></span></span>
          </span>
          <span className="px block" style={{ ["--sx" as string]: "5vw" }}>
            <span className="line-mask">
              <span>
                <ScrubText start={0.12}>campus</ScrubText>{" "}
                <span className="serif-accent"><ScrubText start={0.17} turn={-7}>yours.</ScrubText></span>
              </span>
            </span>
          </span>
        </h2>

        {/* the product itself, once more: the light theme, where the page is light */}
        <div className="relative z-10 mx-auto mt-12 w-[min(46vw,220px)] lg:absolute lg:right-[6vw] lg:top-[42vh] lg:mt-0 lg:w-[min(13vw,214px)]">
          <div className="phone-in" style={{ ["--d" as string]: "260ms" }}>
            <PhoneFrame label="Campus+ home screen in the light theme">
              <HomeScreenLight />
            </PhoneFrame>
          </div>
          <p className="caption mt-3 text-stone lg:max-w-[10rem]">
            <span className="text-ink">(07)</span> The same campus, in daylight.
          </p>
        </div>

        {/* slow-moving architecture around the statement: each shot wipes open, tilts inside its frame and floats on its own plane */}
        <CinematicPhoto
          img={IMG.concreteDawn}
          preset={["wipe", "vertical-pan", "float"]}
          params={{ from: "down", drift: [0, -190], pan: [0, -24], zoom: [1.34, 1.24], revealZoom: 0.18, window: [0.04, 0.32] }}
          ratio="3/4"
          crop={[3, 4]}
          sizes="(min-width:1024px) 14vw, 56vw"
          widths={[300, 500, 800]}
          className="z-0 ml-auto mt-10 w-[56%] lg:absolute lg:right-[6vw] lg:top-[16vh] lg:mt-0 lg:w-[14vw]"
          frameClassName="rounded-[4px]"
          data-hover-media
          data-sheen
        />
        <CinematicPhoto
          img={IMG.libraryLamp}
          preset={["stacked-reveal", "horizontal-pan", "float"]}
          params={{ enter: [90, 50], settle: 9, rotate: -2, drift: [0, -70], pan: [-14, 0], window: [0.1, 0.4] }}
          ratio="1/1"
          crop={[1, 1]}
          sizes="9vw"
          widths={[200, 360]}
          className="bottom-[24vw] right-[24vw] z-20 hidden w-[9vw] lg:absolute lg:block"
          frameClassName="rounded-[4px]"
          data-hover-media
          data-sheen
        />

        <div className="drift relative z-10 mt-12 flex flex-col gap-8 lg:mt-16 lg:flex-row lg:items-end lg:justify-between" style={{ ["--dy" as string]: "-58px" }}>
          <p className="max-w-md text-[15px] leading-[1.6] text-stone" data-reveal>
            Sign in to see your timetable, follow clubs and use the marketplace. Or just open the public timetable, no account
            needed.
          </p>
          <div className="flex flex-wrap gap-3" data-reveal style={{ ["--rd" as string]: "100ms" }}>
            <a href={ROUTES.app} data-magnet="44" className="pressable group inline-flex items-center gap-3 rounded-full bg-ink py-2 pl-6 pr-2 text-sm font-medium text-ivory">
              Open Campus+
              <span className="grid size-9 place-items-center rounded-full bg-ivory text-ink transition-transform duration-500 group-hover:rotate-45">
                <Icon name="arrowUpRight" size={16} />
              </span>
            </a>
            <a href={ROUTES.login} data-magnet="30" className="pressable rounded-full border border-ink/20 px-6 py-3.5 text-sm font-medium hover:border-ink">
              Sign in
            </a>
            <a href={ROUTES.timetable} className="ink-link rounded-full px-4 py-3.5 text-sm font-medium underline decoration-ink/30 underline-offset-4 hover:decoration-ink">
              Public timetable
            </a>
          </div>
        </div>
      </div>

      {/* ── curved boundary: a dark dome that rises (and flattens) as you arrive ── */}
      <footer
        ref={footerRef}
        data-nav-dark
        className="scene relative bg-ink text-ivory"
        style={{
          ...(reduced ? { ["--p" as string]: 1 } : null),
          ["--f1" as string]: "clamp(0, calc((var(--p) - 0.12) / 0.4), 1)",
          ["--f2" as string]: "clamp(0, calc((var(--p) - 0.3) / 0.5), 1)",
        }}
      >
        <div
          aria-hidden="true"
          className="rm-static absolute inset-x-0 bottom-[calc(100%-1px)] h-[20vw] origin-bottom rounded-t-[50%] bg-ink will-change-transform lg:h-[14vw]"
          style={{ transform: "scaleY(calc(1 - var(--p) * 0.6))" }}
        />
        <div className="relative mx-auto max-w-[1680px] px-5 pt-6 sm:px-6 lg:px-10">
          <div
            className="rm-static rm-visible grid gap-12 border-b border-ivory/10 pb-14 lg:grid-cols-12"
            style={{ opacity: "var(--f1)", transform: "translate3d(0, calc((1 - var(--f1)) * 40px), 0)" }}
          >
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
          <p
            className="display rm-static pointer-events-none -mb-[9vw] mt-10 select-none whitespace-nowrap text-center text-[23vw] leading-[0.78] text-ivory/[0.07] will-change-transform"
            style={{ transform: "translate3d(0, calc((1 - var(--f2)) * 42%), 0) scale(calc(1.08 - var(--f2) * 0.08))" }}
            aria-hidden="true"
          >
            Campus+
          </p>
        </div>
      </footer>
    </section>
  );
}
