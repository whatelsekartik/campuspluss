/**
 * One shared IntersectionObserver that sets `data-in` on any element marked
 * with `data-reveal` (or `data-reveal-group`) once it enters the viewport.
 * Elements are unobserved immediately afterwards, so the cost is one-off.
 */
import { useEffect, useState } from "react";

let observer: IntersectionObserver | null = null;

function getObserver() {
  if (observer) return observer;
  observer = new IntersectionObserver(
    (records) => {
      for (const r of records) {
        if (r.isIntersecting) {
          r.target.setAttribute("data-in", "");
          observer?.unobserve(r.target);
        }
      }
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0.01 },
  );
  return observer;
}

/** Observe every reveal target inside `root` (call once at page level). */
export function useRevealScope(rootSelector = "[data-platform]") {
  useEffect(() => {
    const root = document.querySelector(rootSelector);
    if (!root) return;
    const io = getObserver();
    const scan = () =>
      root
        .querySelectorAll("[data-reveal]:not([data-in]), [data-reveal-group]:not([data-in])")
        .forEach((el) => io.observe(el));
    scan();
    // Lazily-mounted sections add new targets later.
    const mo = new MutationObserver(scan);
    mo.observe(root, { childList: true, subtree: true });
    return () => {
      mo.disconnect();
      io.disconnect();
      observer = null;
    };
  }, [rootSelector]);
}

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
}

/** Mount children only when near the viewport (keeps first paint light). */
export function useNearViewport<T extends HTMLElement>(ref: React.RefObject<T | null>, margin = "600px") {
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || near) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: `${margin} 0px ${margin} 0px` },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, margin, near]);
  return near;
}
