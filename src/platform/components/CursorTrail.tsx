import { useEffect, useRef } from "react";

/**
 * CursorTrail — subtle pencil / graphite mouse trail (Canvas 2D).
 *
 * - Thin, organic graphite stroke (~70px visible trail) with gentle lag.
 * - Rolling pointer history in refs; zero React renders per frame.
 * - Fine-pointer only, disabled for reduced-motion and touch.
 * - pointer-events: none, system cursor stays visible.
 */
type Pt = { x: number; y: number; t: number };

const MAX_AGE = 420; // ms a point stays visible
const MAX_LEN = 88; // px of visible trail
const MIN_DIST = 1.2; // px between stored points

export function CursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    let raf = 0;
    let running = false;
    let lastMove = 0;

    const pts: Pt[] = [];
    const smooth: Pt[] = [];
    let target: Pt | null = null;
    let lastX = -100;
    let lastY = -100;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const draw = () => {
      raf = 0;
      const now = performance.now();
      // Age out old points.
      while (pts.length && now - pts[0].t > MAX_AGE) pts.shift();
      // Trim to visible length.
      while (pts.length > 2) {
        const a = pts[0];
        const b = pts[pts.length - 1];
        if (Math.hypot(b.x - a.x, b.y - a.y) <= MAX_LEN) break;
        pts.shift();
      }

      ctx.clearRect(0, 0, w, h);

      if (pts.length > 1) {
        // Smooth with a simple lagging lerp toward the raw history.
        smooth.length = 0;
        for (let i = 0; i < pts.length; i++) {
          const p = pts[i];
          const prev = smooth[i - 1];
          if (!prev) smooth.push({ ...p });
          else {
            const k = i === pts.length - 1 ? 0.55 : 0.35;
            smooth.push({
              x: prev.x + (p.x - prev.x) * k,
              y: prev.y + (p.y - prev.y) * k,
              t: p.t,
            });
          }
        }

        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        for (let i = 1; i < smooth.length; i++) {
          const a = smooth[i - 1];
          const b = smooth[i];
          const age = now - b.t;
          const ageFade = Math.max(0, 1 - age / MAX_AGE);
          const posFade = i / smooth.length; // tapered tail
          const alpha = ageFade * posFade * 0.42;
          if (alpha <= 0.004) continue;
          const width = 0.3 + posFade * 1.1; // 0.3 → 1.4px
          // Warm charcoal with a restrained muted-clay influence.
          ctx.strokeStyle = `rgba(96, 84, 66, ${alpha.toFixed(3)})`;
          ctx.lineWidth = width;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      // Keep looping while the trail is alive or recently moved.
      if (pts.length > 1 || now - lastMove < 900) {
        raf = requestAnimationFrame(draw);
      } else {
        running = false;
        smooth.length = 0;
      }
    };

    const kick = () => {
      if (!running) {
        running = true;
        raf = requestAnimationFrame(draw);
      }
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      lastMove = performance.now();
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      if (Math.hypot(dx, dy) < MIN_DIST && pts.length) return;
      lastX = e.clientX;
      lastY = e.clientY;
      target = { x: e.clientX, y: e.clientY, t: lastMove };
      pts.push(target);
      if (pts.length > 60) pts.shift();
      kick();
    };

    const onLeave = () => {
      // Let the trail age out naturally; stop feeding points.
      lastX = -100;
      lastY = -100;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    window.addEventListener("resize", resize, { passive: true });

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", resize);
      if (raf) cancelAnimationFrame(raf);
      running = false;
      pts.length = 0;
      smooth.length = 0;
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="cursor-trail pointer-events-none fixed inset-0 z-[80]"
    />
  );
}
