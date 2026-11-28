/**
 * CursorTrail — a faint graphite pencil that reacts to what it is over.
 *
 * Rendering is the hand-drawn line: a lagging tip, subdivided points, uneven
 * grain, quadratic curves through midpoints, and ink that inverts on dark
 * surfaces so it stays a pencil rather than a glow.
 *
 * Reaction comes from the shared pointer engine (motion/pointer.ts):
 *   · velocity sets pressure — slower drawing deposits darker graphite
 *   · over photographs the nib lifts (wider, softer, blurred)
 *   · over links and controls it sharpens and a thin ring opens
 *   · pressing draws a registration-mark flourish that decays away
 *
 * One rAF for the whole page (the engine's), zero React renders while moving,
 * `pointer-events: none`, system cursor untouched. Fine pointer only, and
 * nothing at all when motion is reduced.
 */
import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "../motion/reveal";
import { onPointerFrame, pointer } from "../motion/pointer";

const FINE_POINTER = "(hover: hover) and (pointer: fine)";

const MAX_LENGTH = 190; // px of visible stroke
const LIFE = 780; // ms before a point has faded completely
const FOLLOW_TAU = 16; // ms, the nib sits on the cursor (a little lag only smooths jitter)
const MIN_STEP = 1.2; // px the tip must travel before a point is recorded
const MAX_STEP = 4.5; // px between recorded points (longer moves are subdivided)
/** Pressure: slow drags bite deeper into the paper, fast flicks skip across it. */
const SPEED_TO_PRESSURE = 0.9;

type Point = { x: number; y: number; t: number; g: number };

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => typeof window !== "undefined" && window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMatches(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [query]);
  return matches;
}

export function CursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fine = useMediaQuery(FINE_POINTER);
  const reduced = usePrefersReducedMotion();
  const enabled = fine && !reduced;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!enabled || !canvas || !ctx) return;

    const points: Point[] = [];
    const tip = { x: pointer.x2, y: pointer.y2, seen: false };
    let onDark = false;
    let last = 0;
    let box: [number, number, number, number] | null = null;
    /** union of everything drawn this frame; clear() erases exactly this */
    const marks = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity };
    const mark = (x: number, y: number, pad = 0) => {
      if (x - pad < marks.x0) marks.x0 = x - pad;
      if (y - pad < marks.y0) marks.y0 = y - pad;
      if (x + pad > marks.x1) marks.x1 = x + pad;
      if (y + pad > marks.y1) marks.y1 = y + pad;
    };
    // eased instrument state: nib width, lift over media, press, ring
    let nib = 1;
    let lift = 0;
    let press = 0;
    let ring = 0;
    let weight = 0.7; // how hard the pencil is leaning, 0..1

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      // the CSS box is the viewport; the bitmap must match it or every point is
      // drawn against a 300x150 default and lands in the wrong place entirely
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.lineCap = "butt";
      ctx.lineJoin = "round";
      box = null; // resizing clears the bitmap
    };
    resize(); // must run before the first frame

    const clear = () => {
      if (!box) return;
      ctx.clearRect(box[0] - 8, box[1] - 8, box[2] - box[0] + 16, box[3] - box[1] + 16);
      box = null;
    };

    /** Publish this frame's marks as the box the next frame will erase. */
    const commit = () => {
      if (marks.x1 >= marks.x0) box = [marks.x0, marks.y0, marks.x1, marks.y1];
      marks.x0 = Infinity;
      marks.y0 = Infinity;
      marks.x1 = -Infinity;
      marks.y1 = -Infinity;
    };

    const draw = (now: number) => {
      clear();

      const mode = pointer.mode;
      const targetNib = mode === "link" ? 1.45 : mode === "text" ? 1.3 : mode === "drag" ? 0.9 : 1;
      nib += (targetNib - nib) * 0.1;
      lift += ((mode === "media" ? 1 : 0) - lift) * 0.08;
      press += ((pointer.down ? 1 : 0) - press) * 0.16;
      ring += ((mode === "link" || mode === "drag" ? 1 : 0) - ring) * 0.12;

      // a fast pointer lifts the nib; a slow one digs in
      const targetWeight = 1 - Math.min(1, pointer.speed / SPEED_TO_PRESSURE);
      weight += (targetWeight - weight) * 0.09;

      const n = points.length;
      if (n >= 3) {
        // warm graphite, inverted on dark surfaces; clay undertone for grain
        const ink = onDark ? "236,226,208" : "46,40,34";
        const grain = onDark ? "214,168,138" : "150,88,58";
        // a lifted pencil is softer and wider: drawing a wide, faint under-stroke
        // reads the same as a blur but avoids a filtered repaint of the whole
        // path every frame (the stroke is long, so the filter pass was not cheap)
        const softPass = lift > 0.06;

        for (let i = 1; i < n - 1; i++) {
          const a = points[i - 1];
          const b = points[i];
          const c = points[i + 1];
          const u = i / (n - 1); // 0 tail → 1 tip
          const fresh = 1 - Math.min(1, (now - b.t) / LIFE);
          // Pressure and grain are separate axes: pressure changes width, grain
          // changes only the edges. (Modulating opacity by grain — the obvious
          // implementation — makes alternating segments disappear and the stroke
          // reads as a dashed line. It has to stay continuous.)
          const pressure = 0.34 + 0.66 * weight;
          const taper = Math.pow(u, 0.6) * (0.7 + 0.3 * Math.pow(1 - u * 0.12, 2));
          const alpha =
            taper * Math.pow(fresh, 0.5) * (0.8 + 0.25 * b.g) * pressure * (lift > 0.06 ? 0.78 : 1);
          if (alpha < 0.004) continue;
          const width =
            (0.9 + 2.6 * Math.pow(u, 0.7) * (0.9 + 0.2 * b.g)) * nib * (0.62 + 0.5 * weight) +
            press * 0.35;

          const mx0 = (a.x + b.x) / 2;
          const my0 = (a.y + b.y) / 2;
          const mx1 = (b.x + c.x) / 2;
          const my1 = (b.y + c.y) / 2;
          ctx.beginPath();
          ctx.moveTo(mx0, my0);
          ctx.quadraticCurveTo(b.x, b.y, mx1, my1);
          if (softPass) {
            // the pad of the pencil: no graphite in the middle, a soft edge around it
            ctx.strokeStyle = `rgba(${ink},${(alpha * 0.3 * lift).toFixed(3)})`;
            ctx.lineWidth = width + 2.4 + lift * 2.2;
            ctx.stroke();
          }
          ctx.strokeStyle = `rgba(${ink},${alpha.toFixed(3)})`;
          ctx.lineWidth = width;
          ctx.stroke();

          // A single hairline a hair off the body where the grain peaks. Any
          // larger offset reads as a second, parallel line rather than a fibre.
          if (b.g > 0.45) {
            const dx = c.x - a.x;
            const dy = c.y - a.y;
            const len = Math.hypot(dx, dy) || 1;
            const off = (b.g - 0.6) * 0.55;
            const ox = (-dy / len) * off;
            const oy = (dx / len) * off;
            ctx.beginPath();
            ctx.moveTo(mx0 + ox, my0 + oy);
            ctx.quadraticCurveTo(b.x + ox, b.y + oy, mx1 + ox, my1 + oy);
            ctx.strokeStyle = `rgba(${grain},${(alpha * 0.5).toFixed(3)})`;
            ctx.lineWidth = Math.max(0.35, width * 0.35);
            ctx.stroke();
          }

          // the erased region grows to include the whole stroke; the soft pad
          // and the fibre sit a couple of px outside the centre line
          mark(a.x, a.y, 4);
          mark(c.x, c.y, 4);
        }
      }

      // ── nib: a hairline cross marks exactly where the pencil is ──
      if (pointer.active) {
        const nx = pointer.x;
        const ny = pointer.y;
        const len = 3.1 + ring * 2.2 + press * 1.6;
        const ink = onDark ? "236,226,208" : "46,40,34";
        ctx.strokeStyle = `rgba(${ink},${(0.3 + ring * 0.22 + press * 0.2).toFixed(3)})`;
        ctx.lineWidth = 0.7 + press * 0.5;
        ctx.beginPath();
        ctx.moveTo(nx - len, ny);
        ctx.lineTo(nx + len, ny);
        ctx.moveTo(nx, ny - len);
        ctx.lineTo(nx, ny + len);
        ctx.stroke();
        mark(nx, ny, len + 2);

        // ring opens on interactive surfaces, closes on press
        if (ring > 0.02 || press > 0.02) {
          const rr = 15 + ring * 5 - press * 4;
          ctx.strokeStyle = `rgba(${ink},${(ring * 0.24 + press * 0.2).toFixed(3)})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.arc(nx, ny, rr, 0, Math.PI * 2);
          ctx.stroke();
          mark(nx, ny, rr + 2);
        }
      }

      // ── press flourish: a quick halo with four registration ticks ──
      if (pointer.pulse > 0.01) {
        const p = pointer.pulse;
        const rr = 9 + (1 - p) * 32;
        ctx.strokeStyle = `rgba(150, 96, 74, ${(p * 0.32).toFixed(3)})`;
        ctx.lineWidth = 0.9 * p;
        ctx.beginPath();
        ctx.arc(pointer.x, pointer.y, rr, 0, Math.PI * 2);
        ctx.stroke();
        mark(pointer.x, pointer.y, rr + 3);
        ctx.strokeStyle = `rgba(${onDark ? "236,226,208" : "46,40,34"},${(p * 0.3).toFixed(3)})`;
        for (let i = 0; i < 4; i++) {
          const a = (Math.PI / 2) * i + 0.78;
          ctx.beginPath();
          ctx.moveTo(pointer.x + Math.cos(a) * (rr - 4), pointer.y + Math.sin(a) * (rr - 4));
          ctx.lineTo(pointer.x + Math.cos(a) * (rr + 4), pointer.y + Math.sin(a) * (rr + 4));
          ctx.stroke();
        }
        mark(pointer.x, pointer.y, rr + 5);
      }

      // whatever was drawn above becomes the region the next frame erases
      commit();
    };

    const frame = (now: number) => {
      const dt = last ? Math.min(64, now - last) : 16;
      last = now;
      if (!pointer.active) return;

      const target = pointer.x;
      const targetY = pointer.y;
      if (!tip.seen) {
        tip.seen = true;
        tip.x = target;
        tip.y = targetY;
      }
      // the pencil tip eases toward the pointer
      const k = 1 - Math.exp(-dt / FOLLOW_TAU);
      const dx = target - tip.x;
      const dy = targetY - tip.y;
      tip.x += dx * k;
      tip.y += dy * k;

      const el = document.elementFromPoint(tip.x, tip.y);
      onDark = !!el?.closest?.("[data-nav-dark], [data-trail-dark]");

      // record the tip's path; long moves are subdivided so the grain stays even
      const head = points[points.length - 1];
      if (!head) {
        points.push({ x: tip.x, y: tip.y, t: now, g: Math.random() });
      } else {
        const dist = Math.hypot(tip.x - head.x, tip.y - head.y);
        if (dist >= MIN_STEP) {
          const steps = Math.min(24, Math.ceil(dist / MAX_STEP));
          let g = head.g;
          for (let i = 1; i <= steps; i++) {
            const f = i / steps;
            g = Math.min(1, Math.max(0, g + (Math.random() - 0.5) * 0.3));
            points.push({
              x: head.x + (tip.x - head.x) * f,
              y: head.y + (tip.y - head.y) * f,
              t: head.t + (now - head.t) * f,
              g,
            });
          }
        }
      }

      while (points.length && now - points[0].t > LIFE) points.shift();
      let length = 0;
      for (let i = points.length - 1; i > 0; i--) {
        length += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
        if (length > MAX_LENGTH) {
          points.splice(0, i - 1);
          break;
        }
      }

      draw(now);

      if (points.length <= 2 && Math.abs(dx) + Math.abs(dy) < 0.4) {
        points.length = 0;
        clear();
        last = 0;
        tip.seen = false;
      }
    };

    const off = onPointerFrame(frame);
    const wipe = () => {
      points.length = 0;
      clear();
      tip.seen = false;
    };
    document.documentElement.addEventListener("pointerleave", wipe);
    window.addEventListener("blur", wipe);
    window.addEventListener("resize", resize, { passive: true });

    return () => {
      off();
      document.documentElement.removeEventListener("pointerleave", wipe);
      window.removeEventListener("blur", wipe);
      window.removeEventListener("resize", resize);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [enabled]);

  if (!enabled) return null;
  return <canvas ref={canvasRef} aria-hidden="true" className="cursor-trail pointer-events-none fixed inset-0 z-[80] size-full" />;
}
