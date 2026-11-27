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

const MAX_LENGTH = 86; // px of visible stroke
const LIFE = 470; // ms before a point has faded completely
const FOLLOW_TAU = 44; // ms, lag of the pencil tip behind the pointer
const MIN_STEP = 1.4; // px the tip must travel before a point is recorded
const MAX_STEP = 5; // px between recorded points (longer moves are subdivided)

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
    // eased instrument state: nib width, lift over media, press, ring
    let nib = 1;
    let lift = 0;
    let press = 0;
    let ring = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.lineCap = "butt";
      ctx.lineJoin = "round";
      box = null; // resizing clears the bitmap
    };

    const clear = () => {
      if (!box) return;
      ctx.clearRect(box[0] - 8, box[1] - 8, box[2] - box[0] + 16, box[3] - box[1] + 16);
      box = null;
    };

    const draw = (now: number) => {
      clear();

      const mode = pointer.mode;
      const targetNib = mode === "link" ? 1.45 : mode === "text" ? 1.3 : mode === "drag" ? 0.9 : 1;
      nib += (targetNib - nib) * 0.1;
      lift += ((mode === "media" ? 1 : 0) - lift) * 0.08;
      press += ((pointer.down ? 1 : 0) - press) * 0.16;
      ring += ((mode === "link" || mode === "drag" ? 1 : 0) - ring) * 0.12;

      const n = points.length;
      if (n >= 3) {
        let x0 = Infinity;
        let y0 = Infinity;
        let x1 = -Infinity;
        let y1 = -Infinity;
        // warm graphite, inverted on dark surfaces; clay undertone for grain
        const ink = onDark ? "236,226,208" : "46,40,34";
        const grain = onDark ? "214,168,138" : "150,88,58";
        // a lifted pencil is softer and wider
        ctx.filter = lift > 0.06 ? `blur(${(lift * 1.1).toFixed(2)}px)` : "none";

        for (let i = 1; i < n - 1; i++) {
          const a = points[i - 1];
          const b = points[i];
          const c = points[i + 1];
          const u = i / (n - 1); // 0 tail → 1 tip
          const fresh = 1 - Math.min(1, (now - b.t) / LIFE);
          const alpha =
            Math.pow(u, 1.35) * Math.pow(fresh, 0.6) * (0.42 + 0.22 * b.g) * (lift > 0.06 ? 0.72 : 1);
          if (alpha < 0.004) continue;
          const width = (0.38 + 1.3 * Math.pow(u, 0.85) * (0.78 + 0.44 * b.g)) * nib + press * 0.25;

          const mx0 = (a.x + b.x) / 2;
          const my0 = (a.y + b.y) / 2;
          const mx1 = (b.x + c.x) / 2;
          const my1 = (b.y + c.y) / 2;
          ctx.beginPath();
          ctx.moveTo(mx0, my0);
          ctx.quadraticCurveTo(b.x, b.y, mx1, my1);
          ctx.strokeStyle = `rgba(${ink},${alpha.toFixed(3)})`;
          ctx.lineWidth = width;
          ctx.stroke();

          if (b.g > 0.35) {
            const dx = c.x - a.x;
            const dy = c.y - a.y;
            const len = Math.hypot(dx, dy) || 1;
            const off = (b.g - 0.65) * 1.5;
            const ox = (-dy / len) * off;
            const oy = (dx / len) * off;
            ctx.beginPath();
            ctx.moveTo(mx0 + ox, my0 + oy);
            ctx.quadraticCurveTo(b.x + ox, b.y + oy, mx1 + ox, my1 + oy);
            ctx.strokeStyle = `rgba(${grain},${(alpha * 0.5).toFixed(3)})`;
            ctx.lineWidth = width * 0.5;
            ctx.stroke();
          }

          if (b.x < x0) x0 = b.x;
          if (b.y < y0) y0 = b.y;
          if (b.x > x1) x1 = b.x;
          if (b.y > y1) y1 = b.y;
          if (c.x < x0) x0 = c.x;
          if (c.y < y0) y0 = c.y;
          if (c.x > x1) x1 = c.x;
          if (c.y > y1) y1 = c.y;
          if (a.x < x0) x0 = a.x;
          if (a.y < y0) y0 = a.y;
          if (a.x > x1) x1 = a.x;
          if (a.y > y1) y1 = a.y;
        }
        ctx.filter = "none";
        if (x1 >= x0) box = [x0, y0, x1, y1];
      }

      // ── nib: a hairline cross marks exactly where the pencil is ──
      if (pointer.active) {
        const nx = tip.x;
        const ny = tip.y;
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

        // ring opens on interactive surfaces, closes on press
        if (ring > 0.02 || press > 0.02) {
          const rr = 15 + ring * 5 - press * 4;
          ctx.strokeStyle = `rgba(${ink},${(ring * 0.24 + press * 0.2).toFixed(3)})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.arc(nx, ny, rr, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // ── press flourish: a quick halo with four registration ticks ──
      if (pointer.pulse > 0.01) {
        const p = pointer.pulse;
        const rr = 9 + (1 - p) * 32;
        ctx.strokeStyle = `rgba(150, 96, 74, ${(p * 0.32).toFixed(3)})`;
        ctx.lineWidth = 0.9 * p;
        ctx.beginPath();
        ctx.arc(tip.x, tip.y, rr, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = `rgba(${onDark ? "236,226,208" : "46,40,34"},${(p * 0.3).toFixed(3)})`;
        for (let i = 0; i < 4; i++) {
          const a = (Math.PI / 2) * i + 0.78;
          ctx.beginPath();
          ctx.moveTo(tip.x + Math.cos(a) * (rr - 4), tip.y + Math.sin(a) * (rr - 4));
          ctx.lineTo(tip.x + Math.cos(a) * (rr + 4), tip.y + Math.sin(a) * (rr + 4));
          ctx.stroke();
        }
      }
    };

    const frame = (now: number) => {
      const dt = last ? Math.min(64, now - last) : 16;
      last = now;
      if (!pointer.active) return;

      const target = pointer.x2;
      const targetY = pointer.y2;
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
