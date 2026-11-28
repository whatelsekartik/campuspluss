/**
 * A real Campus+ screen capture, dropped into a device frame.
 *
 * The captures were taken in a browser, so the exports in `public/shots` start at
 * the top of the application's own nav bar and end at the bottom of its tab bar:
 * no iOS status bar, no Safari chrome. A capture is a phone viewport (9:17.8) and
 * the frame's screen is 9:19.4, so each export carries a band of ambient colour
 * above the capture — the capture's own first rows, stretched and feathered so
 * the seam disappears. That band is where the frame's status bar and island sit,
 * which means the app's interface is never cropped away at the sides.
 *
 * Swap-only: the DOM mock that used to live inside the frame stays as the
 * loading state (and as the no-JS state), so nothing flashes empty while the
 * WebP decodes, and the frame's dimensions never change.
 */
import { useState } from "react";
import { cn } from "@/utils/cn";

export type ShotName = "home-dark" | "home-light" | "feed" | "clubs" | "events" | "composer" | "communities";

const SIZES = "(min-width: 1024px) 360px, 62vw";

/**
 * Screens live in `public/` — the single-file build inlines any bundled asset,
 * so these must stay external requests under an absolute path.
 */
function srcSet(name: ShotName) {
  return `/shots/${name}-720.webp 720w, /shots/${name}-1080.webp 1080w`;
}

export function PrototypeShot({
  name,
  alt,
  className,
  priority = false,
}: {
  name: ShotName;
  alt: string;
  className?: string;
  /** Above-the-fold screens decode immediately; the rest wait for the section to approach. */
  priority?: boolean;
}) {
  const [state, setState] = useState<"idle" | "ready">("idle");
  return (
    <img
      src={`/shots/${name}-720.webp`}
      srcSet={srcSet(name)}
      sizes={SIZES}
      alt={alt}
      width={720}
      height={1552}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding={priority ? "sync" : "async"}
      onLoad={() => setState("ready")}
      className={cn(
        "absolute inset-0 z-20 size-full bg-app object-cover transition-opacity duration-700 ease-out",
        state === "ready" ? "opacity-100" : "opacity-0",
        className,
      )}
    />
  );
}
