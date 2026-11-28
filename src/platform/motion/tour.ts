/**
 * Guided tour — the slow cinematic scroll behind "Explore the platform".
 *
 * One rAF loop drives `window.scrollY` toward each section in turn, easing
 * with easeInOutCubic and re-measuring every target just before it travels
 * (lazy sections change height as images mount). It never touches the scroll
 * engine's listeners: it only moves the page, and the engine reads it.
 *
 * Deliberately interruptible. Wheel, touch, any key, or the Stop control ends
 * it immediately — a long automatic scroll that cannot be escaped would be
 * hostile. Reduced motion skips the whole thing and jumps normally.
 *
 * State lives in a tiny module store rather than React state, so the loop can
 * report progress every frame without re-rendering anything: overall progress
 * is written to `--tour` on <html> and the HUD reads it in CSS.
 */
import { useSyncExternalStore } from "react";

export const TOUR_STOPS = [
  { id: "how", label: "How it works" },
  { id: "academic", label: "Academic life" },
  { id: "community", label: "Community" },
  { id: "marketplace", label: "Marketplace" },
  { id: "utilities", label: "Campus utilities" },
  { id: "start", label: "Get started" },
] as const;

/** px per second — slow on purpose; the whole page takes about a minute */
const SPEED = 200;
const MIN_MS = 1500;
const MAX_MS = 9000;
const DWELL_MS = 900;
const LEAD_IN_MS = 420;

type State = { active: boolean; index: number };

let state: State = { active: false, index: 0 };
const subscribers = new Set<() => void>();

function emit() {
  for (const fn of subscribers) fn();
}

export function subscribeTour(fn: () => void) {
  subscribers.add(fn);
  return () => {
    subscribers.delete(fn);
  };
}

export function getTourState() {
  return state;
}

export function useTourState() {
  return useSyncExternalStore(subscribeTour, getTourState, getTourState);
}

const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

/* ─────────────────────────── run control ─────────────────────────── */

let run = 0; // incrementing token: any stale loop bails out
let raf = 0;
let restoreScrollBehavior: (() => void) | null = null;
let detach: (() => void) | null = null;

function setProgress(v: number) {
  document.documentElement.style.setProperty("--tour", clamp(v, 0, 1).toFixed(4));
}

function teardown() {
  if (raf) {
    cancelAnimationFrame(raf);
    raf = 0;
  }
  detach?.();
  detach = null;
  restoreScrollBehavior?.();
  restoreScrollBehavior = null;
  document.documentElement.removeAttribute("data-tour");
  document.documentElement.style.removeProperty("--tour");
}

export function stopTour() {
  const wasActive = state.active;
  run++;
  teardown();
  if (wasActive) {
    state = { active: false, index: state.index };
    emit();
  }
}

function finishTour() {
  run++;
  teardown();
  state = { active: false, index: TOUR_STOPS.length - 1 };
  emit();
}

/** Ease the page from its current position to `y`. Resolves when it lands. */
function travel(y: number, duration: number, token: number, onProgress: (p: number) => void) {
  return new Promise<void>((resolve) => {
    if (token !== run) return resolve();
    const from = window.scrollY;
    const delta = y - from;
    let start = 0;
    const step = (now: number) => {
      if (token !== run) return resolve();
      if (!start) start = now;
      const t = clamp((now - start) / duration, 0, 1);
      window.scrollTo(0, from + delta * easeInOutCubic(t));
      onProgress(t);
      if (t < 1) raf = requestAnimationFrame(step);
      else resolve();
    };
    raf = requestAnimationFrame(step);
  });
}

function wait(ms: number, token: number) {
  return new Promise<void>((resolve) => {
    const id = window.setTimeout(resolve, ms);
    if (token !== run) {
      window.clearTimeout(id);
      resolve();
    }
  });
}

/** Start (or restart) the tour. No-op when motion is reduced. */
export function startTour() {
  if (typeof window === "undefined") return;
  if (state.active) return;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const stops = TOUR_STOPS.map((s) => ({ ...s, el: document.getElementById(s.id) })).filter(
    (s): s is typeof s & { el: HTMLElement } => Boolean(s.el),
  );
  if (!stops.length) return;

  if (reduce) {
    stops[0].el.scrollIntoView({ block: "start" });
    return;
  }

  const token = ++run;

  // The stylesheet sets `scroll-behavior: smooth`; that would turn every
  // per-frame scrollTo into its own animation and fight the loop.
  const prev = document.documentElement.style.scrollBehavior;
  document.documentElement.style.scrollBehavior = "auto";
  restoreScrollBehavior = () => {
    document.documentElement.style.scrollBehavior = prev;
  };
  document.documentElement.setAttribute("data-tour", "");
  setProgress(0);
  state = { active: true, index: 0 };
  emit();

  // Any deliberate input hands control straight back to the reader.
  const onWheel = () => stopTour();
  const onTouch = () => stopTour();
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Shift" || e.key === "Control" || e.key === "Alt" || e.key === "Meta") return;
    stopTour();
  };
  const onHide = () => {
    if (document.hidden) stopTour();
  };
  window.addEventListener("wheel", onWheel, { passive: true });
  window.addEventListener("touchstart", onTouch, { passive: true });
  window.addEventListener("keydown", onKey);
  document.addEventListener("visibilitychange", onHide);
  detach = () => {
    window.removeEventListener("wheel", onWheel);
    window.removeEventListener("touchstart", onTouch);
    window.removeEventListener("keydown", onKey);
    document.removeEventListener("visibilitychange", onHide);
  };

  void (async () => {
    await wait(LEAD_IN_MS, token);
    for (let i = 0; i < stops.length; i++) {
      if (token !== run) return;
      state = { active: true, index: i };
      emit();

      // measured now, not upfront: lazy sections change height as they mount
      const el = stops[i].el;
      const y = Math.max(0, window.scrollY + el.getBoundingClientRect().top);
      const distance = Math.abs(y - window.scrollY);
      const duration = clamp((distance / SPEED) * 1000, MIN_MS, MAX_MS);

      await travel(y, duration, token, (t) => setProgress((i + t) / stops.length));
      if (token !== run) return;

      history.replaceState(null, "", `#${stops[i].id}`);
      await wait(DWELL_MS, token);
    }
    if (token === run) finishTour();
  })();
}
