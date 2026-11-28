/**
 * Status bar + dynamic island, drawn over a screen capture.
 *
 * The captures are of the real app running in a browser, so they carry the
 * browser's status bar area but not a phone's. The frame repaints that strip:
 * the top of the capture is extended upward in the export as a soft gradient,
 * and this lays the clock, signal and island back over it.
 *
 * A progressive fade keeps it from sitting on the app's nav bar as a hard band —
 * it is legible at the top edge and gone by the time the capture's own header
 * begins. Light screens pass `tone="dark"`.
 */
import { cn } from "@/utils/cn";

export function ScreenStatusBar({ tone = "light" }: { tone?: "light" | "dark" }) {
  const ink = tone === "dark" ? "bg-ink" : "bg-white";
  const ring = tone === "dark" ? "border-ink/60" : "border-white/60";
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-30">
      <div
        className="relative h-[8.5cqw]"
        style={{
          maskImage: "linear-gradient(to bottom, #000 42%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, #000 42%, transparent 100%)",
          opacity: 0.9,
        }}
      >
        <div className={cn("flex h-full items-center justify-between px-[5.4cqw] pt-[1.2cqw] text-[3.05cqw] font-semibold", tone === "dark" ? "text-ink" : "text-white")}>
          <span>9:41</span>
          <span className="flex items-center gap-[1.1cqw]" aria-hidden="true">
            <span className="flex items-end gap-[0.4cqw]">
              {[0.35, 0.55, 0.75, 1].map((h) => (
                <i key={h} className={cn("block w-[0.8cqw] rounded-[1px]", ink)} style={{ height: `${h * 2.9}cqw` }} />
              ))}
            </span>
            <span className={cn("ml-[0.4cqw] block h-[2.9cqw] w-[5.6cqw] rounded-[1cqw] border p-[0.35cqw]", ring)}>
              <i className={cn("block h-full w-[70%] rounded-[0.5cqw]", ink)} />
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
