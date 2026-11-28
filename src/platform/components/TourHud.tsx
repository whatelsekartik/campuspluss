import { TOUR_STOPS, stopTour, useTourState } from "../motion/tour";
import { cn } from "@/utils/cn";

/**
 * TourHud — a quiet chapter card that appears only while the guided tour is
 * running. It shows where the sweep is, gives a visible way out, and follows
 * the page's own dark/light surfaces.
 *
 * Progress is read from `--tour` on <html> (written by the tour loop), so
 * nothing here re-renders per frame.
 */
export function TourHud() {
  const { active, index } = useTourState();
  if (!active) return null;

  const current = TOUR_STOPS[index];
  const total = TOUR_STOPS.length;

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-4 z-[65] flex justify-center px-4 sm:bottom-6",
        "pointer-events-none",
      )}
      role="status"
      aria-live="polite"
    >
      <div className="pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-full border border-ink/10 bg-ivory/92 px-3 py-2 shadow-[0_20px_40px_-24px_rgba(52,38,22,.55)] backdrop-blur-md sm:gap-4 sm:px-4">
        {/* chapter */}
        <span className="eyebrow shrink-0 tabular-nums text-stone">
          <span className="text-ink">{String(index + 1).padStart(2, "0")}</span>
          <span className="mx-1 opacity-40">/</span>
          {String(total).padStart(2, "0")}
        </span>

        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-medium text-ink">{current.label}</span>
          {/* overall progress, driven by --tour in CSS */}
          <span className="mt-1 block h-px w-full overflow-hidden bg-ink/15">
            <span
              className="block h-full origin-left bg-ink"
              style={{ transform: "scaleX(var(--tour, 0))" }}
            />
          </span>
        </span>

        <button
          type="button"
          onClick={stopTour}
          aria-label="Stop the guided tour"
          className="shrink-0 rounded-full border border-ink/15 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-ink transition-colors hover:bg-ink hover:text-ivory"
        >
          Exit
        </button>
      </div>
    </div>
  );
}
