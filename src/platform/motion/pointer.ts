import { useEffect } from "react";

/**
 * Pointer field — one shared engine for every mouse-reactive surface.
 *
 * Mirrors the scroll engine's discipline: a single passive listener, one rAF
 * batched loop, read-then-write, and CSS custom properties as the only output.
 * React never re-renders because of this file.
 *
 * Written to `:root` every frame while the pointer is alive:
 *   --mvx/--mvy  smoothed pointer position in viewport px
 *   --pmx/--pmy  smoothed pointer offset from centre, -1..1
 *   --spd        smoothed speed, 0..1
 *
 * Written to the hovered element:
 *   --tx/--ty    local cursor offset from the centre, -1..1
 *   --td         normalised distance from centre, 0..1
 *   --sxp/--syp  cursor position inside the element, %
 *
 * Written to `[data-magnet]` elements within reach:
 *   --mgx/--mgy  attraction offset in px
 *
 * Opt in with plain attributes — no refs, no hooks per component:
 *   data-tilt          3D tilt + lift on hover
 *   data-magnet="90"   attraction radius in px
 *   data-sheen         cursor-following highlight
 *   data-hover-media   frame lifts + photograph warms (pure CSS)
 *   data-tilt="soft"   quieter tilt for large canvases
 *   .ink-link          underline that rides the cursor along the word
 */

export type PointerMode = "default" | "link" | "media" | "text" | "drag";

export const pointer = {
  /** fine pointer + motion allowed */
  enabled: false,
  /** pointer is on the page */
  active: false,
  x: 0,
  y: 0,
  /** smoothed position */
  x2: 0,
  y2: 0,
  /** smoothed velocity, -1..1 */
  vx: 0,
  vy: 0,
  /** smoothed speed, 0..1 */
  speed: 0,
  down: false,
  /** click flourish, decays 1 → 0 */
  pulse: 0,
  mode: "default" as PointerMode,
  /** angle of travel in radians (for cursor drawing) */
  angle: 0,
  /** timestamp of the last real movement, ms */
  ts: 0,
};

type Sub = (now: number) => void;

const subs = new Set<Sub>();
let started = false;
let raf = 0;
let lastMove = 0;
let magnets: HTMLElement[] = [];
let tiltEl: HTMLElement | null = null;
let sheenEl: HTMLElement | null = null;
let linkEl: HTMLElement | null = null;
let rescan = 0;
let observer: MutationObserver | null = null;
let media: MediaQueryList | null = null;

const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
const root = () => document.documentElement;

function rescanMagnets() {
  if (rescan) return;
  rescan = window.setTimeout(() => {
    rescan = 0;
    magnets = Array.from(document.querySelectorAll<HTMLElement>("[data-magnet]")).slice(0, 40);
  }, 220);
}

function setMode(target: EventTarget | null) {
  const el = target instanceof Element ? target : null;
  const mode: PointerMode = el?.closest("[data-cursor='drag']")
    ? "drag"
    : el?.closest("a,button,[role='button'],[role='tab'],summary,label")
      ? "link"
      : el?.closest("[data-cursor='media'],.cine-outer")
        ? "media"
        : el?.closest("h1,h2,h3,.display,.serif-accent")
          ? "text"
          : "default";
  pointer.mode = mode;
}

function tick() {
  raf = 0;
  const now = performance.now();

  const dx = pointer.x - pointer.x2;
  const dy = pointer.y - pointer.y2;
  pointer.x2 += dx * 0.18;
  pointer.y2 += dy * 0.18;

  const vx = clamp(dx / 26, -1, 1);
  const vy = clamp(dy / 26, -1, 1);
  pointer.vx += (vx - pointer.vx) * 0.22;
  pointer.vy += (vy - pointer.vy) * 0.22;
  const speed = clamp(Math.hypot(pointer.vx, pointer.vy), 0, 1);
  pointer.speed += (speed - pointer.speed) * 0.2;
  if (Math.hypot(pointer.vx, pointer.vy) > 0.02) {
    pointer.angle = Math.atan2(pointer.vy, pointer.vx);
  }
  if (pointer.pulse > 0) pointer.pulse = Math.max(0, pointer.pulse - 0.045);

  const w = window.innerWidth || 1;
  const h = window.innerHeight || 1;
  const s = root().style;
  s.setProperty("--mvx", `${pointer.x2.toFixed(1)}px`);
  s.setProperty("--mvy", `${pointer.y2.toFixed(1)}px`);
  s.setProperty("--pmx", ((pointer.x2 / w) * 2 - 1).toFixed(4));
  s.setProperty("--pmy", ((pointer.y2 / h) * 2 - 1).toFixed(4));
  s.setProperty("--spd", pointer.speed.toFixed(3));

  // ── hovered element: local coordinates for tilt / sheen / underline ──
  if (tiltEl) {
    const r = tiltEl.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) {
      const tx = clamp(((pointer.x2 - (r.left + r.width / 2)) / (r.width / 2)) || 0, -1, 1);
      const ty = clamp(((pointer.y2 - (r.top + r.height / 2)) / (r.height / 2)) || 0, -1, 1);
      const d = clamp(Math.hypot(tx, ty) / Math.SQRT2, 0, 1);
      const st = tiltEl.style;
      st.setProperty("--tx", tx.toFixed(4));
      st.setProperty("--ty", ty.toFixed(4));
      st.setProperty("--td", d.toFixed(4));
      st.setProperty("--sxp", `${clamp(((pointer.x2 - r.left) / r.width) * 100, 0, 100).toFixed(2)}%`);
      st.setProperty("--syp", `${clamp(((pointer.y2 - r.top) / r.height) * 100, 0, 100).toFixed(2)}%`);
    }
  }

  if (linkEl) {
    const r = linkEl.getBoundingClientRect();
    if (r.width > 0) {
      linkEl.style.setProperty("--ux", `${clamp(((pointer.x2 - r.left) / r.width) * 100, 0, 100).toFixed(2)}%`);
    }
  }

  if (sheenEl) {
    const r = sheenEl.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) {
      // normalised -1..1 offsets let CSS move a static gradient with a
      // transform instead of repainting it every frame
      sheenEl.style.setProperty("--shx", clamp(((pointer.x2 - (r.left + r.width / 2)) / (r.width / 2)) || 0, -1.2, 1.2).toFixed(3));
      sheenEl.style.setProperty("--shy", clamp(((pointer.y2 - (r.top + r.height / 2)) / (r.height / 2)) || 0, -1.2, 1.2).toFixed(3));
    }
  }

  // ── magnetic pull ──
  for (let i = 0; i < magnets.length; i++) {
    const el = magnets[i];
    const reach = Number(el.dataset.magnet) || 90;
    const r = el.getBoundingClientRect();
    if (r.width === 0) continue;
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const ox = pointer.x2 - cx;
    const oy = pointer.y2 - cy;
    const dist = Math.hypot(ox, oy) - Math.max(r.width, r.height) * 0.32;
    if (dist > reach) {
      if (el.style.getPropertyValue("--mgx")) {
        el.style.setProperty("--mgx", "0px");
        el.style.setProperty("--mgy", "0px");
        el.style.setProperty("--mgd", "0");
      }
      continue;
    }
    const f = Math.pow(1 - clamp(dist / reach, 0, 1), 2);
    el.style.setProperty("--mgx", `${(ox * 0.26 * f).toFixed(2)}px`);
    el.style.setProperty("--mgy", `${(oy * 0.26 * f).toFixed(2)}px`);
    el.style.setProperty("--mgd", f.toFixed(3));
    // sheen coordinates travel with the magnet too
    el.style.setProperty("--sxp", `${clamp(((pointer.x2 - r.left) / r.width) * 100, 0, 100).toFixed(2)}%`);
    el.style.setProperty("--syp", `${clamp(((pointer.y2 - r.top) / r.height) * 100, 0, 100).toFixed(2)}%`);
  }

  subs.forEach((fn) => fn(now));

  const alive = pointer.active && now - lastMove < 1100;
  if (alive || pointer.pulse > 0.01) raf = requestAnimationFrame(tick);
}

function kick() {
  if (!raf) raf = requestAnimationFrame(tick);
}

export function startPointerEngine() {
  if (started || typeof window === "undefined") return () => {};
  const fine = window.matchMedia("(pointer: fine)").matches;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!fine || reduce) return () => {};

  started = true;
  pointer.enabled = true;
  media = window.matchMedia("(prefers-reduced-motion: reduce)");
  pointer.x2 = pointer.x = window.innerWidth * 0.5;
  pointer.y2 = pointer.y = window.innerHeight * 0.42;

  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== "mouse" && e.pointerType !== "pen") return;
    pointer.active = true;
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    lastMove = pointer.ts = performance.now();
    setMode(e.target);
    kick();
  };

  const onOver = (e: PointerEvent) => {
    setMode(e.target);
    const el = e.target instanceof Element ? e.target : null;
    const tilt = el?.closest<HTMLElement>("[data-tilt]") ?? null;
    const link = el?.closest<HTMLElement>(".ink-link") ?? null;
    sheenEl = el?.closest<HTMLElement>("[data-sheen]") ?? null;
    if (tilt !== tiltEl) {
      if (tiltEl) {
        tiltEl.style.setProperty("--tx", "0");
        tiltEl.style.setProperty("--ty", "0");
        tiltEl.style.setProperty("--td", "0");
      }
      tiltEl = tilt;
    }
    linkEl = link;
    kick();
  };

  const onDown = () => {
    pointer.down = true;
    pointer.pulse = 1;
    kick();
  };
  const onUp = () => {
    pointer.down = false;
  };
  const onLeave = () => {
    pointer.active = false;
    pointer.speed = 0;
    if (tiltEl) {
      tiltEl.style.setProperty("--tx", "0");
      tiltEl.style.setProperty("--ty", "0");
      tiltEl.style.setProperty("--td", "0");
    }
    tiltEl = null;
    sheenEl = null;
    linkEl = null;
  };
  const onMotionChange = (e: MediaQueryListEvent) => {
    if (e.matches) {
      // motion preference switched on mid-session: release the pointer field
      started = false;
      pointer.enabled = false;
      pointer.active = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    }
  };

  window.addEventListener("pointermove", onMove, { passive: true });
  window.addEventListener("pointerover", onOver, { passive: true });
  window.addEventListener("pointerdown", onDown, { passive: true });
  window.addEventListener("pointerup", onUp, { passive: true });
  document.documentElement.addEventListener("pointerleave", onLeave);
  window.addEventListener("blur", onUp);
  media.addEventListener?.("change", onMotionChange);

  rescanMagnets();
  observer = new MutationObserver(rescanMagnets);
  observer.observe(document.body, { childList: true, subtree: true });

  const teardown = () => {
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerover", onOver);
    window.removeEventListener("pointerdown", onDown);
    window.removeEventListener("pointerup", onUp);
    document.documentElement.removeEventListener("pointerleave", onLeave);
    window.removeEventListener("blur", onUp);
    media?.removeEventListener?.("change", onMotionChange);
    observer?.disconnect();
    observer = null;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    started = false;
    pointer.enabled = false;
    magnets = [];
  };
  return teardown;
}

/** Subscribe to the shared pointer frame. Returns an unsubscribe function. */
export function onPointerFrame(fn: Sub) {
  subs.add(fn);
  return () => subs.delete(fn);
}

/** Mount once. Starts the engine and keeps it alive for the page's lifetime. */
export function usePointerEngine() {
  useEffect(() => {
    const stop = startPointerEngine();
    return stop;
  }, []);
}
