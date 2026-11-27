import { useCallback, useRef, useState } from "react";
import { cn } from "@/utils/cn";
import { useScrollProgress } from "../motion/scroll";
import { usePrefersReducedMotion } from "../motion/reveal";
import { PhoneFrame } from "../components/DeviceFrames";
import { CommunityScreen } from "../components/AppScreens";
import { CinematicPhoto, CrossfadeStack, type CineDirection } from "../components/CinematicPhoto";
import { Kinetic } from "../components/Kinetic";
import { COMMUNITY_STEPS, IMG } from "../data";

function CommunityIntro() {
  const reduced = usePrefersReducedMotion();
  const ref = useScrollProgress<HTMLDivElement>("pass", undefined, !reduced);
  // each tile: its own edge to enter from, its own depth (drift) and its own camera move
  const tiles: Array<{
    img: (typeof IMG)[keyof typeof IMG];
    ratio: string;
    crop: [number, number];
    w: string;
    mt: string;
    cap: string;
    from: CineDirection;
    drift: number;
    pan: [number, number];
  }> = [
    { img: IMG.guitar, ratio: "3/4", crop: [3, 4], w: "lg:w-[17vw] w-[42vw]", mt: "lg:mt-[10vh]", cap: "Music", from: "up", drift: -120, pan: [0, 14] },
    { img: IMG.soldering, ratio: "4/5", crop: [4, 5], w: "lg:w-[23vw] w-[50vw]", mt: "lg:mt-[26vh] mt-[14vh]", cap: "Making things", from: "right", drift: -260, pan: [-12, 8] },
    { img: IMG.camera, ratio: "1/1", crop: [1, 1], w: "lg:w-[13vw] w-[34vw]", mt: "lg:mt-0 mt-[2vh]", cap: "Photography", from: "down", drift: -60, pan: [0, -12] },
    { img: IMG.chess, ratio: "3/4", crop: [3, 4], w: "lg:w-[16vw] w-[40vw]", mt: "lg:mt-[18vh] mt-[8vh]", cap: "Strategy", from: "left", drift: -200, pan: [12, 10] },
  ];
  return (
    <div ref={ref} className="scene relative overflow-clip pb-4 pt-28 lg:pb-0 lg:pt-36">
      <div className="mx-auto max-w-[1680px] px-5 sm:px-6 lg:px-10">
        <p className="eyebrow text-ivory/60" data-reveal>
          <span className="text-ivory">(04)</span> Community
        </p>
      </div>
      <h2 id="community-title" className="relative z-10 mt-6 select-none">
        <span
          className="display px block whitespace-nowrap pl-[4vw] text-[23vw] lg:text-[17vw]"
          style={{ ["--sx" as string]: "-26vw" }}
        >
          <Kinetic text="Find your" />
        </span>
      </h2>

      {/* staggered photography passing beneath the type */}
      <div className="relative z-0 -mt-[8vw] flex flex-wrap items-start justify-between gap-y-6 px-5 sm:px-6 lg:flex-nowrap lg:px-10">
        {tiles.map((t, i) => (
          <figure key={t.cap} className={cn(t.w, t.mt, i === 2 && "max-lg:ml-auto")}>
            <CinematicPhoto
              data-hover-media
              data-sheen
              img={t.img}
              preset={["wipe", "parallax", "float"]}
              params={{ from: t.from, drift: [0, t.drift], pan: t.pan, zoom: [1.3, 1.14], revealZoom: 0.18, window: [0.02 + i * 0.02, 0.3 + i * 0.03] }}
              ratio={t.ratio}
              crop={t.crop}
              sizes="(min-width:1024px) 22vw, 50vw"
              widths={[360, 640, 900]}
              frameClassName="rounded-[4px] bg-charcoal"
            >
              <figcaption className="caption mt-2 flex justify-between text-ivory/55">
                <span>{t.cap}</span>
                <span>0{i + 1}</span>
              </figcaption>
            </CinematicPhoto>
          </figure>
        ))}
      </div>

      <p className="relative z-10 -mt-[6vw] text-right" aria-hidden="true">
        <span className="display px serif-accent inline-block whitespace-nowrap pr-[4vw] text-[23vw] lg:text-[17vw]" style={{ ["--sx" as string]: "22vw" }}>
          <Kinetic text="people." />
        </span>
      </p>

      <div className="mx-auto mt-10 grid max-w-[1680px] gap-6 px-5 sm:px-6 lg:grid-cols-12 lg:px-10">
        <p className="text-[17px] leading-[1.55] text-ivory/75 lg:col-span-4 lg:col-start-8" data-reveal>
          Clubs, communities, posts and events from the people around you. Follow what interests you and join in when you
          want to.
        </p>
        <p className="caption text-ivory/45 lg:col-span-3 lg:col-start-1 lg:row-start-1">
          Photography is illustrative. Club and post names in the screens are demonstration content.
        </p>
      </div>
    </div>
  );
}

function CommunitySequence() {
  const reduced = usePrefersReducedMotion();
  const [idx, setIdx] = useState(0);
  const idxRef = useRef(0);
  const n = COMMUNITY_STEPS.length;
  const onProgress = useCallback(
    (p: number) => {
      const i = Math.min(n - 1, Math.floor(p * n));
      if (i !== idxRef.current) {
        idxRef.current = i;
        setIdx(i);
      }
    },
    [n],
  );
  const ref = useScrollProgress<HTMLDivElement>("sticky", onProgress);
  const step = COMMUNITY_STEPS[idx];

  const jump = (i: number) => {
    const el = ref.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const total = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + ((i + 0.5) / n) * total, behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <div
      ref={ref}
      className="scene relative h-[calc(var(--n)*72vh+10vh)] lg:h-[calc(var(--n)*90vh+10vh)]"
      style={{ ["--n" as string]: n, ["--in" as string]: "clamp(0, calc(var(--p) / 0.07), 1)" }}
    >
      <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden">
        <div className="mx-auto grid w-full max-w-[1680px] grid-cols-12 items-center gap-x-4 px-5 pt-14 sm:px-6 lg:px-10">
          {/* left: counter + title */}
          <div className="col-span-12 lg:col-span-5">
            <p className="flex items-baseline gap-3 font-serif text-ivory/50" aria-live="polite">
              <span className="text-[2.6rem] italic leading-none text-ivory lg:text-[4.5rem]">{String(idx + 1).padStart(2, "0")}</span>
              <span className="text-lg">/ {String(n).padStart(2, "0")}</span>
              <span className="sr-only">{step.title}</span>
            </p>
            <h3 className="mt-3 overflow-clip lg:mt-6">
              <span key={step.key} className="title-in display block whitespace-nowrap text-[14vw] text-ivory lg:text-[6vw]">
                <Kinetic text={step.title} />
              </span>
            </h3>
            <p key={step.key + "s"} className="soft-in serif-accent mt-1 text-[7vw] leading-none text-ivory/60 lg:text-[3vw]">
              {step.serif}
            </p>
            <p key={step.key + "b"} className="soft-in mt-4 max-w-sm text-[15px] leading-[1.55] text-ivory/70 max-lg:hidden" style={{ ["--d" as string]: "80ms" }}>
              {step.body}
            </p>
            <div className="mt-8 hidden gap-2 lg:flex" role="group" aria-label="Community features">
              {COMMUNITY_STEPS.map((s, i) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => jump(i)}
                  aria-current={i === idx ? "step" : undefined}
                  data-magnet="26"
                  className={cn(
                    "eyebrow pressable rounded-full border px-3.5 py-2 transition-colors",
                    i === idx ? "border-ivory bg-ivory text-ink" : "border-ivory/20 text-ivory/60 hover:border-ivory/50 hover:text-ivory",
                  )}
                >
                  {s.title}
                </button>
              ))}
            </div>
          </div>

          {/* centre: the phone stays, its screen evolves */}
          <div className="relative col-span-7 col-start-6 mt-4 flex justify-center max-lg:col-span-12 max-lg:col-start-1 lg:col-span-3 lg:col-start-6 lg:mt-0">
            {/* the phone settles into place as the sequence pins, then stays put */}
            <div
              className="rm-static relative z-10 will-change-transform"
              style={{ transform: "translate3d(0, calc((1 - var(--in)) * 9vh), 0) scale(calc(0.92 + var(--in) * 0.08))" }}
            >
              <PhoneFrame className="w-[min(54vw,40svh)] lg:w-[min(19vw,40svh)]" label={`Campus+ ${step.title} screen (demonstration content)`}>
                <CommunityScreen step={step.key} />
              </PhoneFrame>
            </div>
            {/* progress rail */}
            <div className="absolute -right-1 top-1/2 hidden h-40 w-px -translate-y-1/2 bg-ivory/15 sm:block lg:-right-8">
              <span
                className="block w-px origin-top bg-ivory transition-transform duration-500"
                style={{ height: "100%", transform: `scaleY(${(idx + 1) / n})` }}
              />
            </div>
          </div>

          {/* right: swapping photograph */}
          <div className="absolute bottom-[6vh] left-[4vw] z-0 w-[30vw] lg:static lg:col-span-3 lg:col-start-10 lg:w-auto">
            {/* shots swap with a wipe that follows the scroll direction; every shot keeps panning with the sequence */}
            <div data-hover-media data-sheen className="relative overflow-hidden rounded-[4px]">
            <CrossfadeStack
              images={COMMUNITY_STEPS.map((c) => c.photo)}
              index={idx}
              ratio="3/4"
              crop={[3, 4]}
              sizes="(min-width:1024px) 22vw, 30vw"
              widths={[360, 640]}
              className="rounded-[4px] bg-charcoal"
            />
            </div>
            <p key={step.key + "cap"} className="soft-in caption mt-2 hidden text-ivory/45 lg:block">{step.photo.alt}. Illustrative.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Community() {
  return (
    <section id="community" aria-labelledby="community-title" data-nav-dark className="relative bg-ink text-ivory outline-none">
      <CommunityIntro />
      <CommunitySequence />
    </section>
  );
}
