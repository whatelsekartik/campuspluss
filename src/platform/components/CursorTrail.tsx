import { useEffect, useRef } from "react";
import { onPointerFrame, pointer } from "../motion/pointer";

/**
 * CursorTrail — a graphite pencil that reacts to what it is over.
 *
 * Canvas 2D, one rAF loop shared with the pointer engine, zero React renders.
 * The stroke itself behaves like a pencil on paper:
 *   · velocity changes pressure (faster = lighter, slower = darker)
 *   · over media it lifts and blurs slightly (like shading over a photo)
 *   · over links and headings it sharpens, and the nib grows a hair
 *   · on mousedown it presses and draws a brief flourish
 * A thin charcoal ring is drawn with the same instrument, offset from the
 * system cursor so the pointer stays exactly where the OS draws it.
 *
 * Fine-pointer only. Disabled for touch and prefers-reduced-motion.
 * pointer-events: none; system cursor stays visible.
 */
type Pt = { x: number; y: number; t: number; w: number };

const MAX_AGE = 460;
const MAX_LEN = 92;
const MIN_DIST = 1.15;

export function CursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;

    const pts: Pt[] = [];
    const smooth: Pt[] = [];
    let lastX = -100;
    let lastY = -100;
    // eased "instrument" state so mode changes feel like handling a tool
    let nib = 1;
    let lift = 0;
    let press = 0;
    let ring = 0;

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

    const record = () => {
      const now = performance.now();
      if (!pointer.active) return;
      const dx = pointer.x2 - lastX;
      const dy = pointer.y2 - lastY;
      if (Math.hypot(dx, dy) < MIN_DIST && pts.length) return;
      lastX = pointer.x2;
      lastY = pointer.y2;
      // pressure: slow movement deposits more graphite
      const weight = 0.55 + (1 - pointer.speed) * 0.75;
      pts.push({ x: pointer.x2, y: pointer.y2, t: now, w: weight });
      if (pts.length > 64) pts.shift();
    };

    const draw = () => {
      const now = performance.now();

      // ease instrument state toward the current mode
      const mode = pointer.mode;
      const targetNib = mode === "link" ? 1.5 : mode === "text" ? 1.35 : mode === "drag" ? 0.85 : 1;
      const targetLift = mode === "media" ? 1 : 0;
      nib += (targetNib - nib) * 0.09;
      lift += (targetLift - lift) * 0.08;
      press += ((pointer.down ? 1 : 0) - press) * 0.14;
      ring += ((mode === "link" || mode === "drag" ? 1 : 0) - ring) * 0.12;

      record();

      while (pts.length && now - pts[0].t > MAX_AGE) pts.shift();
      while (pts.length > 2) {
        const a = pts[0];
        const b = pts[pts.length - 1];
        if (Math.hypot(b.x - a.x, b.y - a.y) <= MAX_LEN) break;
        pts.shift();
      }

      ctx.clearRect(0, 0, w, h);

      if (pts.length > 1) {
        smooth.length = 0;
        for (let i = 0; i < pts.length; i++) {
          const p = pts[i];
          const prev = smooth[i - 1];
          if (!prev) smooth.push({ ...p });
          else {
            const k = i === pts.length - 1 ? 0.55 : 0.34;
            smooth.push({
              x: prev.x + (p.x - prev.x) * k,
              y: prev.y + (p.y - prev.y) * k,
              t: p.t,
              w: prev.w + (p.w - prev.w) * 0.5,
            });
          }
        }

        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        // a lifted pencil is a softer, wider, fainter mark
        ctx.filter = lift > 0.05 ? `blur(${(lift * 1.15).toFixed(2)}px)` : "none";

        for (let i = 1; i < smooth.length; i++) {
          const a = smooth[i - 1];
          const b = smooth[i];
          const ageFade = Math.max(0, 1 - (now - b.t) / MAX_AGE);
          const posFade = i / smooth.length;
          const alpha = ageFade * posFade * (lift > 0.05 ? 0.3 : 0.46) * (0.8 + b.w * 0.35);
          if (alpha <= 0.004) continue;
          const width = (0.28 + posFade * 1.15 * b.w) * nib;
          // warm charcoal + a restrained muted-clay cast at the tip
          const clay = Math.pow(posFade, 2.2) * 0.5;
          const r = Math.round(96 + 24 * clay);
          const g = Math.round(84 + 6 * clay);
          const bl = Math.round(66 - 12 * clay);
          ctx.strokeStyle = `rgba(${r}, ${g}, ${bl}, ${alpha.toFixed(3)})`;
          ctx.lineWidth = width;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
        ctx.filter = "none";
      }

      // ── nib: a hairline cross that marks exactly where you are ──
      if (pointer.active) {
        const nx = pointer.x2;
        const ny = pointer.y2;
        const len = 3.2 + ring * 2.4 + press * 1.6;
        ctx.strokeStyle = `rgba(96, 84, 66, ${(0.34 + ring * 0.22 + press * 0.2).toFixed(3)})`;
        ctx.lineWidth = 0.7 + press * 0.5;
        ctx.beginPath();
        ctx.moveTo(nx - len, ny);
        ctx.lineTo(nx + len, ny);
        ctx.moveTo(nx, ny - len);
        ctx.lineTo(nx, ny + len);
        ctx.stroke();

        // ── ring: opens on interactive surfaces, closes on press ──
        if (ring > 0.02 || press > 0.02) {
          const rr = 15 + ring * 5 - press * 4;
          ctx.strokeStyle = `rgba(96, 84, 66, ${(ring * 0.26 + press * 0.22).toFixed(3)})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.arc(nx, ny, rr, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // ── click flourish: a quick pencil halo that decays away ──
      if (pointer.pulse > 0.01) {
        const p = pointer.pulse;
        const rr = 8 + (1 - p) * 34;
        ctx.strokeStyle = `rgba(150, 96, 74, ${(p * 0.34).toFixed(3)})`;
        ctx.lineWidth = 0.9 * p;
        ctx.beginPath();
        ctx.arc(pointer.x2, pointer.y2, rr, 0, Math.PI * 2);
        ctx.stroke();
        // four short ticks, like a registration mark
        ctx.strokeStyle = `rgba(96, 84, 66, ${(p * 0.3).toFixed(3)})`;
        for (let i = 0; i < 4; i++) {
          const a = (Math.PI / 2) * i + 0.78;
          ctx.beginPath();
          ctx.moveTo(pointer.x2 + Math.cos(a) * (rr - 4), pointer.y2 + Math.sin(a) * (rr - 4));
          ctx.lineTo(pointer.x2 + Math.cos(a) * (rr + 4), pointer.y2 + Math.sin(a) * (rr + 4));
          ctx.stroke();
        }
      }

      const live =
        pointer.active &&
        (pts.length > 1 || now - pointer.ts < 520 || pointer.pulse > 0.01 || ring > 0.02 || press > 0.02);
      if (!live) smooth.length = 0;
    };

    const off = onPointerFrame(draw);
    const clear = () => {
      ctx.clearRect(0, 0, w, h);
      pts.length = 0;
      smooth.length = 0;
    };
    document.documentElement.addEventListener("pointerleave", clear);
    window.addEventListener("blur", clear);
    window.addEventListener("resize", resize, { passive: true });

    return () => {
      off();
      document.documentElement.removeEventListener("pointerleave", clear);
      window.removeEventListener("blur", clear);
      window.removeEventListener("resize", resize);
      pts.length = 0;
      smooth.length = 0;
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="cursor-trail pointer-events-none fixed inset-0 z-[80]" />;
}
