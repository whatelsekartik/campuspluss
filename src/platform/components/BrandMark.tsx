import { cn } from "@/utils/cn";

/** Campus+ mark: a rounded tile carrying the "+" — kept in one place so it can be swapped for the production logo. */
export function BrandMark({ className, tone = "dark" }: { className?: string; tone?: "dark" | "light" }) {
  return (
    <span
      className={cn(
        "inline-grid size-7 place-items-center rounded-[9px] transition-colors duration-500",
        tone === "dark" ? "bg-ink text-ivory" : "bg-ivory text-ink",
        className,
      )}
      aria-hidden="true"
    >
      <svg viewBox="0 0 20 20" className="size-[58%]" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
        <path d="M10 3.5v13M3.5 10h13" />
      </svg>
    </span>
  );
}

export function Wordmark({ className, tone = "dark" }: { className?: string; tone?: "dark" | "light" }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <BrandMark tone={tone} />
      <span className="text-[15px] font-semibold tracking-[-0.02em]">
        Campus<span className="text-clay">+</span>
      </span>
    </span>
  );
}
