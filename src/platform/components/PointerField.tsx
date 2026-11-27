import { useEffect, useRef } from "react";
import { pointer, usePointerEngine } from "../motion/pointer";

/**
 * PointerField — the ambient half of the pointer system.
 *
 * Mounts the shared pointer engine once and paints a very faint warm light
 * that follows the pointer across the whole page (soft-light, behind text,
 * non-interactive). On touch or reduced-motion it renders nothing at all.
 */
export function PointerField() {
  usePointerEngine();
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const tick = () => {
      raf = 0;
      if (pointer.active) {
        el.setAttribute("data-live", "");
        el.style.opacity = "1";
      } else {
        el.style.opacity = "0";
      }
    };
    const onMove = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const off = () => {
      el.style.opacity = "0";
    };
    document.documentElement.addEventListener("pointerleave", off);
    window.addEventListener("blur", off);
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      document.documentElement.removeEventListener("pointerleave", off);
      window.removeEventListener("blur", off);
      window.removeEventListener("pointermove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return <div ref={ref} aria-hidden="true" className="pointer-field" />;
}
