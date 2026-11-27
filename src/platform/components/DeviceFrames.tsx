import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

/**
 * Believable smartphone frame built in CSS (no image request, crisp at any
 * size). All interior UI is sized in `em`, keyed off the container width, so
 * the screen scales as one coherent object.
 */
export function PhoneFrame({ children, className, label }: { children: ReactNode; className?: string; label?: string }) {
  return (
    <div className={cn("relative [container-type:inline-size]", className)} role="img" aria-label={label}>
      <div className="relative aspect-[9/19.4] w-full">
        {/* side buttons */}
        <span className="absolute -left-[0.9cqw] top-[18%] h-[6%] w-[1.2cqw] rounded-l-sm bg-[#2b2925]" />
        <span className="absolute -left-[0.9cqw] top-[27%] h-[10%] w-[1.2cqw] rounded-l-sm bg-[#2b2925]" />
        <span className="absolute -right-[0.9cqw] top-[24%] h-[13%] w-[1.2cqw] rounded-r-sm bg-[#2b2925]" />
        {/* chassis */}
        <div
          className="absolute inset-0 rounded-[15cqw] bg-[linear-gradient(145deg,#3a3732,#141310_40%,#24221e)] p-[2.6cqw] shadow-[0_60px_90px_-40px_rgba(52,38,22,.55),0_25px_40px_-25px_rgba(52,38,22,.45)]"
        >
          <div className="absolute inset-[0.8cqw] rounded-[14.4cqw] ring-1 ring-white/10" />
          {/* screen */}
          <div className="relative size-full overflow-hidden rounded-[12.6cqw] bg-app text-white">
            <div className="absolute inset-0 text-[4.3cqw] leading-[1.35]">{children}</div>
            {/* dynamic island */}
            <span className="absolute left-1/2 top-[1.6%] z-20 h-[3.4%] w-[30%] -translate-x-1/2 rounded-full bg-black" />
            {/* glass sheen */}
            <span className="pointer-events-none absolute inset-0 z-30 bg-[linear-gradient(115deg,rgba(255,255,255,.07)_0%,transparent_32%)]" />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Minimal browser chrome for larger product views. */
export function BrowserFrame({ children, className, url = "campus.plus/timetable" }: { children: ReactNode; className?: string; url?: string }) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[18px] bg-app shadow-[0_60px_100px_-50px_rgba(52,38,22,.6),0_20px_40px_-30px_rgba(52,38,22,.4)] ring-1 ring-black/10",
        className,
      )}
    >
      <div className="flex items-center gap-3 border-b border-app-line bg-[#141417] px-4 py-2.5">
        <span className="flex gap-1.5" aria-hidden="true">
          <i className="size-2.5 rounded-full bg-[#3a3a40]" />
          <i className="size-2.5 rounded-full bg-[#3a3a40]" />
          <i className="size-2.5 rounded-full bg-[#3a3a40]" />
        </span>
        <span className="mx-auto max-w-[60%] truncate rounded-md bg-[#1f1f24] px-3 py-1 text-[11px] text-app-mute">{url}</span>
        <span className="w-10" />
      </div>
      {children}
    </div>
  );
}

/** Thin status bar for phone screens. */
export function StatusBar({ time = "9:41" }: { time?: string }) {
  return (
    <div className="flex items-center justify-between px-[1.6em] pt-[0.9em] text-[0.78em] font-semibold">
      <span>{time}</span>
      <span className="flex items-center gap-[0.35em]" aria-hidden="true">
        <span className="flex items-end gap-[0.12em]">
          {[0.35, 0.55, 0.75, 1].map((h) => (
            <i key={h} className="block w-[0.22em] rounded-[1px] bg-white" style={{ height: `${h * 0.75}em` }} />
          ))}
        </span>
        <span className="ml-[0.2em] block h-[0.75em] w-[1.5em] rounded-[0.22em] border border-white/70 p-[0.1em]">
          <i className="block h-full w-[70%] rounded-[0.1em] bg-white" />
        </span>
      </span>
    </div>
  );
}
