/**
 * ScrubText — a headline line whose letters rise into place as its scene passes.
 *
 * Each character is a transformed *descendant*, so the line box is exactly the
 * same as plain text: display line-height, wrapping and offsets are untouched
 * (the failure mode that killed the earlier per-glyph kinetic pass).
 *
 * The glyphs carry the real text, so there is no duplicate copy for a screen
 * reader to read twice — but they are separate boxes, which a reader would
 * otherwise announce letter by letter. `role="text"` groups them back into a
 * single string. They are deliberately NOT aria-hidden: hiding them would leave
 * the headline with no accessible text at all.
 *
 * Motion comes from the scene's --p through the .scrub rules in index.css —
 * no listener, no per-frame React render, and nothing at all under reduced
 * motion.
 */
import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

/** Characters that should not get their own animated span. */
const isSpace = (ch: string) => ch === " " || ch === "\u00a0";

export function ScrubText({
  children,
  className,
  stagger = 0.018,
  turn = 5,
  start = 0.06,
}: {
  /** Plain text only — markup inside a scrubbed run is not supported. */
  children: string;
  className?: string;
  /** extra --p delay per letter, 0..1 */
  stagger?: number;
  /** degrees a letter rotates out of */
  turn?: number;
  /** --p at which the run starts */
  start?: number;
}) {
  const chars = Array.from(children);
  return (
    <span
      className={cn("scrub", className)}
      // The engine registers this element too, so the run can never be left
      // settled-and-dim if an ancestor forgets to carry data-reveal-group.
      data-reveal=""
      data-in=""
      role="text"
      style={{ ["--sr" as string]: `${turn}deg` }}
    >
      <span>
        {chars.map((ch, i) =>
          isSpace(ch) ? (
            " "
          ) : (
            <span
              key={i}
              className="scrub-g"
              style={{ ["--ss" as string]: (start + i * stagger).toFixed(3) }}
            >
              {ch}
            </span>
          ),
        )}
      </span>
    </span>
  );
}

/** Convenience for lines that mix plain text with a styled accent. */
export function ScrubLine({
  text,
  accent,
  className,
  accentClassName,
}: {
  text: string;
  accent?: string;
  className?: string;
  accentClassName?: string;
}): ReactNode {
  return (
    <span className={className}>
      <ScrubText>{text}</ScrubText>
      {accent ? (
        <span className={accentClassName}>
          <ScrubText>{accent}</ScrubText>
        </span>
      ) : null}
    </span>
  );
}
