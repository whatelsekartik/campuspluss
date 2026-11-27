/**
 * CursorTrail — a faint graphite line that follows the mouse, like a pencil
 * resting lightly on the page.
 *
 * - Canvas 2D, fixed to the viewport, `pointer-events: none`; the system
 *   cursor stays visible and nothing is ever blocked.
 * - Pointer data lives in refs / closures: moving the mouse never renders React.
 * - A follower point eases toward the pointer (slight lag); its positions form
 *   a small rolling history that is trimmed by length (~80px) and by age, so
 *   the line retracts when the mouse rests.
 * - The rAF loop runs only while there is something to draw, and each frame
 *   clears just the previous stroke's bounding box.
 * - Mounted only for fine, hover-capable pointers and when motion is allowed.
 */
import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "../motion/reveal";

const FINE_POINTER = "(hover: hover) and (pointer: fine)";

const MAX_LENGTH = 82; // px of visible stroke
const LIFE = 460; // ms before a point has faded completely
const FOLLOW_TAU = 46; // ms, lag of the pencil tip behind the pointer
const MIN_STEP = 1.4; // px the tip must travel before a point is recorded
const MAX_STEP = 5; // px between recorded points (longer moves are subdivided)

type Point = { x: number; y: number; t: number; /** per-point grain 0..1 */ g: number };

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
    const pointer = { x: 0, y: 0, seen: false };
    const tip = { x: 0, y: 0 };
    let onDark = false;
    let raf = 0;
    let last = 0;
    let box: [number, number, number, number] | null = null;

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
      ctx.clearRect(box[0] - 6, box[1] - 6, box[2] - box[0] + 12, box[3] - box[1] + 12);
      box = null;
    };

    const draw = (now: number) => {
      clear();
      const n = points.length;
      if (n < 3) return;
      let x0 = Infinity;
      let y0 = Infinity;
      let x1 = -Infinity;
      let y1 = -Infinity;
      // warm graphite, with a restrained clay undertone for the grain
      const ink = onDark ? "236,226,208" : "46,40,34";
      const grain = onDark ? "214,168,138" : "150,88,58";

      for (let i = 1; i < n - 1; i++) {
        const a = points[i - 1];
        const b = points[i];
        const c = points[i + 1];
        const u = i / (n - 1); // 0 tail → 1 tip
        const fresh = 1 - Math.min(1, (now - b.t) / LIFE);
        const alpha = Math.pow(u, 1.35) * Math.pow(fresh, 0.6) * (0.44 + 0.22 * b.g);
        if (alpha < 0.004) continue;
        const width = 0.4 + 1.3 * Math.pow(u, 0.85) * (0.78 + 0.44 * b.g); // tapered, slightly uneven

        // smooth curve through midpoints
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

        // graphite grain: a thinner, offset companion stroke that comes and goes
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
      if (x1 >= x0) box = [x0, y0, x1, y1];
    };

    const tick = (now: number) => {
      raf = 0;
      const dt = last ? Math.min(64, now - last) : 16;
      last = now;

      // the pencil tip eases toward the pointer
      const k = 1 - Math.exp(-dt / FOLLOW_TAU);
      const dx = pointer.x - tip.x;
      const dy = pointer.y - tip.y;
      tip.x += dx * k;
      tip.y += dy * k;

      // record the tip's path; fast moves (or slow frames) are subdivided so the
      // stroke stays continuous and evenly textured at any speed / frame rate
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
            // grain drifts slowly from point to point so the line looks hand-drawn, not noisy
            g = Math.min(1, Math.max(0, g + (Math.random() - 0.5) * 0.3));
            points.push({ x: head.x + (tip.x - head.x) * f, y: head.y + (tip.y - head.y) * f, t: head.t + (now - head.t) * f, g });
          }
        }
      }

      // age out old points
      while (points.length && now - points[0].t > LIFE) points.shift();
      // keep roughly MAX_LENGTH px of stroke
      let length = 0;
      for (let i = points.length - 1; i > 0; i--) {
        length += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
        if (length > MAX_LENGTH) {
          points.splice(0, i - 1);
          break;
        }
      }

      draw(now);

      const settling = Math.abs(dx) + Math.abs(dy) > 0.4;
      if (settling || points.length > 2) {
        raf = requestAnimationFrame(tick);
      } else {
        points.length = 0;
        clear();
        last = 0;
      }
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      if (!pointer.seen) {
        pointer.seen = true;
        tip.x = e.clientX;
        tip.y = e.clientY;
      }
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      const target = e.target as Element | null;
      onDark = !!target?.closest?.("[data-nav-dark], [data-trail-dark]");
      if (!raf) raf = requestAnimationFrame(tick);
    };
    // when the mouse leaves the window, let the stroke finish fading and start fresh on return
    const onLeave = () => {
      pointer.seen = false;
    };

    resize();
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("resize", resize, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", resize);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [enabled]);

  if (!enabled) return null;
  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-[80] size-full" />;
}
