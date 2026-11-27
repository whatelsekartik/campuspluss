/**
 * Shared, lightweight scroll engine for /platform.
 *
 * - One passive scroll + resize listener for the whole page, batched in rAF.
 * - Only scenes currently near the viewport (IntersectionObserver) are measured.
 * - All rects are read first, then all writes happen — no layout thrashing.
 * - Each scene receives a single CSS custom property (--p, 0..1); visual
 *   choreography is expressed in CSS transforms/opacity only.
 */
import { useEffect, useRef, type RefObject } from "react";

export type ScrollMode =
  /** progress across a tall section whose child is `position: sticky` */
  | "sticky"
  /** progress while the element travels from viewport bottom to top */
  | "pass"
  /** progress while the element leaves the top of the viewport (hero) */
  | "exit";

type Entry = {
  el: HTMLElement;
  mode: ScrollMode;
  visible: boolean;
  last: number;
  cb?: (p: number) => void;
};

const entries = new Set<Entry>();
let ticking = false;
let listening = false;
let io: IntersectionObserver | null = null;
const byEl = new WeakMap<Element, Entry>();

const clamp = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

function measure() {
  ticking = false;
  const vh = window.innerHeight;
  const reads: Array<[Entry, number]> = [];
  for (const e of entries) {
    if (!e.visible) continue;
    const r = e.el.getBoundingClientRect();
    let p: number;
    if (e.mode === "sticky") {
      const total = r.height - vh;
      p = total > 0 ? clamp(-r.top / total) : 0;
    } else if (e.mode === "exit") {
      p = clamp(-r.top / Math.max(1, r.height));
    } else {
      p = clamp((vh - r.top) / (vh + r.height));
    }
    reads.push([e, p]);
  }
  for (const [e, p] of reads) {
    if (Math.abs(p - e.last) < 0.0004) continue;
    e.last = p;
    e.el.style.setProperty("--p", p.toFixed(4));
    e.cb?.(p);
  }
}

function schedule() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(measure);
}

function ensureListening() {
  if (listening) return;
  listening = true;
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule, { passive: true });
  io = new IntersectionObserver(
    (records) => {
      for (const rec of records) {
        const e = byEl.get(rec.target);
        if (e) e.visible = rec.isIntersecting;
      }
      schedule();
    },
    { rootMargin: "25% 0px 25% 0px" },
  );
}

function maybeStop() {
  if (entries.size > 0 || !listening) return;
  listening = false;
  window.removeEventListener("scroll", schedule);
  window.removeEventListener("resize", schedule);
  io?.disconnect();
  io = null;
}

export function useScrollProgress<T extends HTMLElement>(
  mode: ScrollMode,
  onProgress?: (p: number) => void,
  enabled = true,
): RefObject<T | null> {
  const ref = useRef<T | null>(null);
  const cbRef = useRef(onProgress);
  cbRef.current = onProgress;

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;
    ensureListening();
    const entry: Entry = {
      el,
      mode,
      visible: true,
      last: -1,
      cb: (p) => cbRef.current?.(p),
    };
    entries.add(entry);
    byEl.set(el, entry);
    io?.observe(el);
    schedule();
    return () => {
      io?.unobserve(el);
      entries.delete(entry);
      byEl.delete(el);
      maybeStop();
    };
  }, [mode, enabled]);

  return ref;
}
