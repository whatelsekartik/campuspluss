/**
 * Shared scroll engine for /platform — the ONLY scroll-driven animation loop.
 *
 * - One passive scroll + resize listener for the whole page, batched in rAF.
 * - Only scenes near the viewport (IntersectionObserver) are measured.
 * - Rects are read first, then all writes happen — no layout thrashing.
 * - Each scene receives a single CSS custom property (--p, 0..1). Every piece
 *   of choreography (scale, pan, clip, parallax) is derived from it in CSS, so
 *   nothing re-renders in React while scrolling.
 * - Progress is eased toward its target (frame-rate independent), which gives
 *   wheel scrolling a camera-like glide. The loop stops as soon as every scene
 *   has settled — there is no continuous rendering.
 * - When a scene leaves the observed band it is measured one last time and
 *   snapped, so fast scrolling / anchor jumps never leave a stale state.
 */
import { useEffect, useRef, type RefObject } from "react";

export type ScrollMode =
  /** progress across a tall section whose child is `position: sticky` */
  | "sticky"
  /** progress while the element travels from viewport bottom to viewport top */
  | "pass"
  /** progress while the element leaves the top of the viewport (hero) */
  | "exit"
  /** progress while the element comes into view: 0 = top touches viewport bottom, 1 = fully entered */
  | "enter";

type Entry = {
  el: HTMLElement;
  mode: ScrollMode;
  visible: boolean;
  /** measure + snap once after leaving the observed band */
  flush: boolean;
  target: number;
  current: number;
  smooth: boolean;
  cb?: (p: number) => void;
};

const entries = new Set<Entry>();
const byEl = new WeakMap<Element, Entry>();
let io: IntersectionObserver | null = null;
let listening = false;
let ticking = false;
let dirty = true;
let lastTime = 0;

/** easing time-constant in ms (smaller = tighter to the scroll position) */
const TAU = 95;
const EPS = 0.0004;

const clamp = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

function progressOf(e: Entry, vh: number) {
  const r = e.el.getBoundingClientRect();
  switch (e.mode) {
    case "sticky": {
      const total = r.height - vh;
      return total > 0 ? clamp(-r.top / total) : 0;
    }
    case "exit":
      return clamp(-r.top / Math.max(1, r.height));
    case "enter":
      return clamp((vh - r.top) / Math.max(1, Math.min(r.height, vh)));
    default:
      return clamp((vh - r.top) / (vh + r.height));
  }
}

function write(e: Entry, p: number) {
  e.current = p;
  e.el.style.setProperty("--p", p.toFixed(4));
  e.cb?.(p);
}

function frame(now: number) {
  ticking = false;
  const dt = lastTime ? Math.min(64, now - lastTime) : 16;
  lastTime = now;

  // ── read phase ──
  if (dirty) {
    dirty = false;
    const vh = window.innerHeight;
    for (const e of entries) if (e.visible || e.flush) e.target = progressOf(e, vh);
  }

  // ── write phase ──
  const k = 1 - Math.exp(-dt / TAU);
  let active = false;
  for (const e of entries) {
    if (e.flush) {
      e.flush = false;
      if (e.current !== e.target) write(e, e.target);
      continue;
    }
    if (!e.visible) continue;
    const d = e.target - e.current;
    if (d === 0) continue;
    if (e.current < 0 || !e.smooth || Math.abs(d) < EPS) {
      write(e, e.target); // first measurement, or close enough: snap
    } else {
      write(e, e.current + d * k);
      active = true;
    }
  }

  if (active) schedule();
  else lastTime = 0;
}

function schedule() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(frame);
}

function invalidate() {
  dirty = true;
  schedule();
}

function ensureListening() {
  if (listening) return;
  listening = true;
  window.addEventListener("scroll", invalidate, { passive: true });
  window.addEventListener("resize", invalidate, { passive: true });
  io = new IntersectionObserver(
    (records) => {
      for (const rec of records) {
        const e = byEl.get(rec.target);
        if (!e) continue;
        if (e.visible && !rec.isIntersecting) e.flush = true;
        // re-entering the band: snap to the true position instead of easing from a
        // possibly stale value (the element may have been jumped over while unobserved)
        if (!e.visible && rec.isIntersecting) e.current = -1;
        e.visible = rec.isIntersecting;
      }
      invalidate();
    },
    { rootMargin: "30% 0px 30% 0px" },
  );
}

function maybeStop() {
  if (entries.size > 0 || !listening) return;
  listening = false;
  window.removeEventListener("scroll", invalidate);
  window.removeEventListener("resize", invalidate);
  io?.disconnect();
  io = null;
}

export type ScrollOptions = {
  /** set false to leave the element untouched (e.g. reduced motion) */
  enabled?: boolean;
  /** ease toward the scroll position instead of snapping (default true) */
  smooth?: boolean;
};

/**
 * Attach an element to the shared engine. Returns a ref to put on the scene.
 * `enabled` may be passed positionally (legacy) or inside an options object.
 */
export function useScrollProgress<T extends HTMLElement>(
  mode: ScrollMode,
  onProgress?: (p: number) => void,
  options: boolean | ScrollOptions = true,
): RefObject<T | null> {
  const ref = useRef<T | null>(null);
  const cbRef = useRef(onProgress);
  cbRef.current = onProgress;
  const enabled = typeof options === "boolean" ? options : (options.enabled ?? true);
  const smooth = typeof options === "boolean" ? true : (options.smooth ?? true);

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;
    ensureListening();
    const entry: Entry = {
      el,
      mode,
      visible: true,
      flush: false,
      target: 0,
      current: -1,
      smooth,
      cb: (p) => cbRef.current?.(p),
    };
    entries.add(entry);
    byEl.set(el, entry);
    io?.observe(el);
    invalidate();
    return () => {
      io?.unobserve(el);
      entries.delete(entry);
      byEl.delete(el);
      el.style.removeProperty("--p");
      maybeStop();
    };
  }, [mode, enabled, smooth]);

  return ref;
}
