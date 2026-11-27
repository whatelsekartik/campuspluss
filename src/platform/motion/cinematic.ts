/**
 * Cinematic motion presets for photographic storytelling.
 *
 * All presets are driven by a single scroll-progress custom property
 * (--p, 0..1) written by the shared scroll engine (see scroll.ts).
 * Visual choreography is expressed in CSS transforms/opacity/clip-path
 * only — no per-frame React renders.
 *
 * Layering contract (so animations never overwrite each other):
 *   .cine-outer    — entrance reveal (clip-path / opacity, data-in)
 *   .cine-parallax — scroll-linked translation (--p)
 *   .cine-zoom     — scroll-linked scale / pan / rotation (--p)
 *   <img>          — load fade (photo-img)
 */

export type CinePreset =
  | "zoom-reveal"
  | "parallax"
  | "horizontal-pan"
  | "vertical-pan"
  | "wipe"
  | "crossfade"
  | "float"
  | "stacked-reveal";

export type CineReveal = "clip-up" | "wipe-left" | "wipe-up" | "scale" | "fade" | "none";

export type CineOptions = {
  preset?: CinePreset;
  reveal?: CineReveal;
  /** 0..1 multiplier for motion intensity (mobile reduces this via CSS). */
  intensity?: number;
  /** Scroll-linked parallax distance, e.g. "60px". */
  parallaxY?: string;
  parallaxX?: string;
  /** Base zoom for zoom-reveal / pan presets, e.g. 1.18. */
  zoom?: number;
  /** Rotational settling in degrees (stacked-reveal / float). */
  rotate?: number;
  /** Entrance delay in ms. */
  delay?: number;
};

/** Sensible defaults per preset so call-sites stay terse. */
export const CINE_DEFAULTS: Record<CinePreset, Required<Omit<CineOptions, "preset" | "reveal" | "delay">>> = {
  "zoom-reveal": { intensity: 1, parallaxY: "0px", parallaxX: "0px", zoom: 1.18, rotate: 0 },
  parallax: { intensity: 1, parallaxY: "70px", parallaxX: "0px", zoom: 1.12, rotate: 0 },
  "horizontal-pan": { intensity: 1, parallaxY: "0px", parallaxX: "48px", zoom: 1.22, rotate: 0 },
  "vertical-pan": { intensity: 1, parallaxY: "56px", parallaxX: "0px", zoom: 1.18, rotate: 0 },
  wipe: { intensity: 1, parallaxY: "0px", parallaxX: "0px", zoom: 1.12, rotate: 0 },
  crossfade: { intensity: 1, parallaxY: "0px", parallaxX: "0px", zoom: 1.08, rotate: 0 },
  float: { intensity: 1, parallaxY: "44px", parallaxX: "0px", zoom: 1.1, rotate: 2 },
  "stacked-reveal": { intensity: 1, parallaxY: "0px", parallaxX: "0px", zoom: 1.14, rotate: 3 },
};

export const CINE_REVEAL_DEFAULT: Record<CinePreset, CineReveal> = {
  "zoom-reveal": "scale",
  parallax: "fade",
  "horizontal-pan": "wipe-left",
  "vertical-pan": "clip-up",
  wipe: "wipe-left",
  crossfade: "fade",
  float: "scale",
  "stacked-reveal": "scale",
};
