import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/utils/cn";
import { Photo } from "./Photo";
import { Icon } from "./Icon";
import type { MarketCategory } from "../data";
import { useScrollProgress } from "../motion/scroll";
import { usePrefersReducedMotion } from "../motion/reveal";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Editorial image carousel.
 * - Previous / next buttons, clickable progress segments, current index
 * - Pointer (touch + mouse) drag with threshold and live drag offset
 * - Arrow keys / Home / End when the region has focus
 * - Only the current and adjacent slides request images
 * - Scroll drives it: the whole thing pins and each category holds the screen
 *   for a viewport of scroll, so scrolling forward advances Books →
 *   Electronics → Furniture. Clicks, drag and keys still jump directly.
 * - Motion: every photograph travels from its OWN edge into its resting place,
 *   as the Community tiles do — the incoming shot slides in from the side
 *   scroll is heading, the outgoing one is carried out the opposite side, and
 *   both keep their own camera drift so nothing moves as one slab.
 */
export function EditorialCarousel({ slides }: { slides: MarketCategory[] }) {
  const [index, setIndex] = useState(0);
  const [drag, setDrag] = useState(0);
  const [seen, setSeen] = useState<Set<number>>(() => new Set([0, 1, slides.length - 1]));
  const start = useRef<{ x: number; y: number; id: number; locked: boolean | null } | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const n = slides.length;
  const reduced = usePrefersReducedMotion();

  /** Scroll drives the carousel everywhere, exactly as it does in section 04.
   *  This used to be gated on a `min-width: 1024px` query, so on any narrower
   *  viewport (a phone, or a preview pane) nothing pinned and the section read
   *  as a static block — which is why it never looked like 04. */
  const driven = !reduced;
  /** fractional position in slides (0 → n), written by the scroll scene */
  const [sp, setSp] = useState(0);
  /** travel direction, so every shot enters from the side scroll is heading */
  const [dir, setDir] = useState<1 | -1>(1);

  const currentRef = useRef(0);
  const dirRef = useRef<1 | -1>(1);
  /** last touch gesture on the stage, so a vertical page scroll is not hijacked */
  const touch = useRef<{ x: number; y: number; horizontal: boolean | null } | null>(null);

  /** Scroll to the band that makes `i` current, so the page and the stage agree. */
  const scrollToIndex = useCallback(
    (i: number) => {
      const el = scene.current;
      if (!el || !driven) return false;
      const top = el.getBoundingClientRect().top + window.scrollY;
      const total = el.offsetHeight - window.innerHeight;
      if (total <= 0) return false;
      window.scrollTo({ top: top + ((i + 0.5) / n) * total, behavior: reduced ? "auto" : "smooth" });
      return true;
    },
    [n, driven, reduced],
  );

  const goTo = useCallback(
    (i: number) => {
      const next = (i + n) % n;
      const d: 1 | -1 = next >= currentRef.current ? 1 : -1;
      dirRef.current = d;
      setDir(d);
      currentRef.current = next;
      setIndex(next);
      // While scroll owns the carousel, a click moves the PAGE to that band
      // rather than fighting it: the engine then reports the index change back.
      // When the pin is not available (reduced motion) the index is the only
      // source of truth, and goTo has already set it.
      scrollToIndex(next);
      setSeen((s) => new Set([...s, next, (next + 1) % n, (next - 1 + n) % n]));
    },
    [n, scrollToIndex],
  );
  const prev = () => goTo(index - 1);
  const next = () => goTo(index + 1);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") next();
    else if (e.key === "ArrowLeft") prev();
    else if (e.key === "Home") goTo(0);
    else if (e.key === "End") goTo(n - 1);
    else return;
    e.preventDefault();
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    start.current = { x: e.clientX, y: e.clientY, id: e.pointerId, locked: null };
  };
  // A touch that is clearly vertical belongs to the page, not the carousel:
  // the stage then lets the browser scroll instead of capturing the gesture.
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touch.current = { x: t.clientX, y: t.clientY, horizontal: null };
  };
  const onTouchMove = (e: React.TouchEvent) => {
    const g = touch.current;
    if (!g) return;
    const t = e.touches[0];
    if (g.horizontal === null) {
      const dx = Math.abs(t.clientX - g.x);
      const dy = Math.abs(t.clientY - g.y);
      if (dx > 8 || dy > 8) g.horizontal = dx > dy;
    }
    if (g.horizontal === false) start.current = null;
    if (g.horizontal === true) e.preventDefault();
  };
  const onTouchEnd = () => {
    touch.current = null;
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const s = start.current;
    if (!s || s.id !== e.pointerId) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    if (s.locked === null && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
      s.locked = Math.abs(dx) > Math.abs(dy);
      if (s.locked) stageRef.current?.setPointerCapture(e.pointerId);
    }
    if (s.locked) setDrag(dx);
  };
  const endDrag = (e: React.PointerEvent) => {
    const s = start.current;
    if (!s || s.id !== e.pointerId) return;
    const w = stageRef.current?.offsetWidth ?? 1000;
    if (s.locked && Math.abs(drag) > Math.min(90, w * 0.12)) (drag < 0 ? next : prev)();
    start.current = null;
    setDrag(0);
  };

  // Scroll drive. The stage sits in a tall scene whose sticky child holds the
  // screen; progress through it selects the category (the same pattern the
  // Community sequence uses). Once the reader has taken over, scroll no longer
  // moves the index — it just keeps feeding the shared engine.
  const scene = useRef<HTMLDivElement>(null);
  const onScrollProgress = useCallback(
    (p: number) => {
      const raw = Math.min(n - 0.0001, Math.max(0, p) * n);
      const i = Math.floor(raw);
      const target = p > 0.985 ? n - 1 : i;
      if (target !== currentRef.current) {
        const d: 1 | -1 = target > currentRef.current ? 1 : -1;
        dirRef.current = d;
        setDir(d);
        currentRef.current = target;
        setIndex(target);
        setSeen((s) => new Set([...s, target, (target + 1) % n, (target - 1 + n) % n]));
      }
      setSp(raw);
    },
    [n],
  );
  const sceneRef = useScrollProgress<HTMLDivElement>("sticky", onScrollProgress, driven);

  // keep transitions snappy but disable them while dragging
  const dragging = drag !== 0;
  // fractional slide position (index minus drag), consumed by each slide's
  // camera in CSS. While scrolling it is the continuous value, so a shot is
  // already travelling out before the index changes.
  const pos = dragging ? index - drag / (stageRef.current?.offsetWidth || 1) : driven ? sp : index;
  const slide = slides[index];
  const following = slides[(index + 1) % n];

  // announce changes politely
  const [announce, setAnnounce] = useState("");
  useEffect(() => setAnnounce(`Slide ${index + 1} of ${n}: ${slide.title}`), [index, n, slide.title]);

  return (
    // Tall scene + sticky child on wide viewports: the carousel holds the screen
    // while scroll walks through the categories. Below `lg` it is a plain block
    // and the stage swipes.
    <div
      // BOTH refs on the tall scene: the scroll engine must measure the element
      // that actually scrolls past (a "sticky" mode reads height - viewport, so
      // measuring the short pinned child yields a negative span and p stays 0).
      // The scene also carries .scene, which is what publishes --p to its
      // descendants — the category titles read it.
      ref={(node) => {
        scene.current = node;
        sceneRef.current = node;
      }}
      className={cn("scene relative", driven && "h-[calc(var(--n)*72vh+10vh)] lg:h-[calc(var(--n)*90vh+10vh)]")}
      style={{ ["--n" as string]: n }}
    >
      <div className={cn(driven && "sticky top-0 flex h-[100svh] items-center overflow-hidden")}>
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Marketplace categories"
      tabIndex={0}
      onKeyDown={onKey}
      className="relative w-full outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-4 focus-visible:ring-offset-sand"
      data-scroll-driven={driven ? "" : undefined}
    >
      <p className="sr-only" aria-live="polite">{announce}</p>

      <div className="grid gap-y-8 lg:grid-cols-12 lg:gap-x-6">
        {/* ── stage: backdrop track + layered stack ── */}
        <div className="relative lg:col-span-8 lg:col-start-5 lg:row-start-1">
          <div data-tilt="soft" data-sheen data-cursor="drag">
          <div
            ref={stageRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            className={cn(
              "relative aspect-[4/5] cursor-grab select-none overflow-hidden rounded-[6px] bg-dune active:cursor-grabbing sm:aspect-[16/11] lg:aspect-[16/10.5]",
              // the pinned stage must fit the screen beside / above the copy at
              // every width, so it can never overflow the pinned viewport
              driven && "max-h-[46svh] lg:max-h-[62svh] lg:w-auto",
              // wide: scroll owns the vertical axis, so a touch may not pan the page here
              driven ? "touch-none" : "touch-pan-y",
            )}
            style={{
              // the stage opens up as the carousel scrolls into view
              ["--r" as string]: "clamp(0, calc((var(--p) - 0.05) / 0.25), 1)",
              clipPath: "inset(calc((1 - var(--r)) * 9%) calc((1 - var(--r)) * 5%) round 6px)",
            }}
          >
            <div className={cn("relative h-full", dragging && "car-drag")} style={{ ["--pos" as string]: pos }}>
              {slides.map((s, i) => (
                <div
                  key={s.id}
                  // --d is this shot's distance from the live position, so each
                  // one travels from its own edge rather than riding a strip
                  className="car-slide absolute inset-0 h-full w-full overflow-hidden"
                  style={{ ["--i" as string]: i, ["--d" as string]: i - pos, ["--dir" as string]: dir }}
                  data-active={i === index ? "" : undefined}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${i + 1} of ${n}: ${s.title}`}
                  aria-hidden={i !== index}
                >
                  {seen.has(i) && (
                    <div className="car-cam">
                      <div className="car-zoom absolute inset-0">
                        <Photo img={s.backdrop} sizes="(min-width:1024px) 64vw, 100vw" widths={[640, 1024, 1600]} className="absolute inset-0" imgClassName="pointer-events-none" />
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,rgba(21,19,15,.45))]" />
                </div>
              ))}
            </div>

            {/* sample-content label */}
            <span className="eyebrow absolute left-4 top-4 rounded-full bg-ivory/85 px-3 py-1.5 text-[10px] text-ink">Sample imagery · not a real listing</span>
            <p key={slide.id + "c"} className="soft-in caption absolute bottom-4 left-4 right-4 max-w-sm text-ivory sm:bottom-6 sm:left-6">
              {slide.backdrop.alt}. Photo: {slide.backdrop.credit} / Pexels
            </p>
          </div>
          </div>

          {/* layered image stack overlapping the stage edge */}
          <div
            className="px pointer-events-none absolute -bottom-10 right-4 z-10 w-[38%] sm:w-[28%] lg:-bottom-14 lg:-left-[12%] lg:right-auto lg:w-[26%]"
            style={{ ["--sy" as string]: "-90px" }}
            aria-hidden="true"
          >
            <div key={slide.id + "s"} className="relative" style={{ ["--dir" as string]: dir }}>
              {/* prints laid onto the page: each slides in from the side scroll
                  is heading and rotates into its resting angle */}
              <div
                className="place shadow-[0_30px_50px_-25px_rgba(52,38,22,.6)]"
                style={{ ["--rot" as string]: "-4deg", ["--fr0" as string]: "7deg", ["--fx0" as string]: "calc(var(--dir, 1) * -46px)", ["--fy0" as string]: "54px", ["--d" as string]: "120ms" }}
              >
                <Photo img={slide.stack[0]} ratio="4/5" crop={[4, 5]} sizes="18vw" widths={[300, 500]} className="rounded-[4px] ring-[6px] ring-paper" />
              </div>
              <div
                className="place absolute -right-[38%] -top-[34%] w-[70%] shadow-[0_30px_50px_-25px_rgba(52,38,22,.6)]"
                style={{ ["--rot" as string]: "5deg", ["--fr0" as string]: "-8deg", ["--fx0" as string]: "calc(var(--dir, 1) * 52px)", ["--fy0" as string]: "-34px", ["--d" as string]: "300ms" }}
              >
                <Photo img={slide.stack[1]} ratio="1/1" crop={[1, 1]} sizes="12vw" widths={[240, 400]} className="rounded-[4px] ring-[6px] ring-paper" />
              </div>
            </div>
          </div>
        </div>

        {/* ── copy + controls ── */}
        <div className="relative z-20 flex flex-col lg:col-span-4 lg:row-start-1">
          <p className="font-serif leading-none text-ink">
            <span className="text-[3.4rem] italic lg:text-[8vw]">{pad(index + 1)}</span>
            <span className="ml-2 text-2xl text-stone">/ {pad(n)}</span>
          </p>
          <h3 className="mt-4 overflow-clip lg:-mr-[30%]">
            <span key={slide.id} className="title-in display block whitespace-nowrap text-[17vw] lg:text-[7.6vw]">
              {slide.title}
            </span>
          </h3>
          <p key={slide.id + "sf"} className="soft-in serif-accent text-3xl text-stone lg:text-[2.6vw]">{slide.serif}</p>
          <p key={slide.id + "b"} className="soft-in mt-6 max-w-sm text-[15px] leading-[1.6] text-stone max-lg:hidden" style={{ ["--d" as string]: "80ms" }}>
            {slide.blurb}
          </p>
          <ul key={slide.id + "t"} className="soft-in mt-5 flex flex-wrap gap-2 max-lg:hidden" style={{ ["--d" as string]: "140ms" }}>
            {slide.examples.map((x) => (
              <li key={x} className="caption rounded-full border border-ink/15 px-3 py-1 text-ink/80">{x}</li>
            ))}
          </ul>

          <div className="mt-6 flex items-center gap-3 lg:mt-auto lg:mt-10">
            <button
              type="button"
              onClick={prev}
              aria-label="Previous category"
              data-magnet="30"
              className="pressable group grid size-14 place-items-center rounded-full border border-ink/25 transition-colors hover:border-ink lg:size-16"
            >
              <Icon name="arrowLeft" size={22} className="transition-transform duration-500 group-hover:-translate-x-1" />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next category"
              data-magnet="30"
              className="pressable group grid size-14 place-items-center rounded-full bg-ink text-ivory transition-colors hover:bg-charcoal lg:size-16"
            >
              <Icon name="arrowRight" size={22} className="transition-transform duration-500 group-hover:translate-x-1" />
            </button>
            <button type="button" onClick={next} data-magnet="22" className="group ml-3 hidden text-left sm:block" aria-label={`Next: ${following.title}`}>
              <span className="eyebrow block text-stone">Next</span>
              <span className="ink-link inline-block text-sm font-medium">{following.title}</span>
            </button>
          </div>

          {/* progress segments */}
          <div className="mt-6 flex gap-1.5" role="group" aria-label="Choose category">
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`${s.title}`}
                aria-current={i === index ? "true" : undefined}
                className="group relative h-6 flex-1"
              >
                <span className="absolute inset-x-0 top-1/2 h-px bg-ink/20 transition-all duration-300 group-hover:h-[2px] group-hover:bg-ink/40" />
                <span
                  className="absolute left-0 top-1/2 h-px w-full origin-left bg-ink transition-transform duration-700"
                  style={{ transform: `scaleX(${i <= index ? 1 : 0})` }}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
      </div>
    </div>
  );
}
