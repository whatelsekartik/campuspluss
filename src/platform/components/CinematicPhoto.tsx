/**
 * CinematicPhoto — photographs that behave like camera shots.
 *
 * Nested layers, each owning ONE kind of motion so effects never
 * overwrite each other:
 *
 *   .cine        box    → static layout box; the only thing the scroll engine measures
 *   .cine-float  body   → parallax drift, entrance offset, rotational settling
 *   .cine-clip   frame  → clip-path reveal (wipe / inset mask)
 *   .cine-cam    camera → internal zoom + pan (Ken Burns), independent of the frame
 *   <img>        image  → load fade, optional one-off intro push-in
 *
 * All continuous motion is pure CSS derived from a single --p custom property
 * written by the shared scroll engine (motion/scroll.ts). No React renders
 * happen while scrolling.
 *
 *   scene="self"     the photo registers itself ("pass" progress through the viewport)
 *   scene="inherit"  the photo reads --p from an ancestor `.scene` (sticky / hero scenes)
 *
 * If the engine never runs (or reduced motion is on) --p falls back to 0.5,
 * which is the fully revealed, neutral state — content can never stay hidden.
 */
import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/utils/cn";
import type { Img } from "../data";
import { PhotoImg, type PhotoSource } from "./Photo";
import { useScrollProgress } from "../motion/scroll";
import { usePrefersReducedMotion } from "../motion/reveal";

export type CineDirection = "up" | "down" | "left" | "right";

export type CinePreset =
  /** inset mask opens while the camera pulls back */
  | "zoom-reveal"
  /** image travels slower than its frame (depth) */
  | "parallax"
  /** slow sideways camera pan */
  | "horizontal-pan"
  /** slow vertical camera tilt */
  | "vertical-pan"
  /** directional clip-path wipe */
  | "wipe"
  /** opacity + scale swap controlled by `active` */
  | "crossfade"
  /** the whole photograph drifts at its own scroll speed */
  | "float"
  /** slides in from an offset and rotates into its resting angle */
  | "stacked-reveal";

export type CineParams = {
  /** direction the wipe travels */
  from?: CineDirection;
  /** inset (in %) of the zoom-reveal mask at the start */
  inset?: number;
  /** camera scale at the start → end of the scroll pass */
  zoom?: [number, number];
  /** extra camera scale that settles to 0 during the reveal */
  revealZoom?: number;
  /** camera travel across the pass, in % of the frame [x, y] */
  pan?: [number, number];
  /** outer parallax travel across the pass, in px [x, y] */
  drift?: [number, number];
  /** entrance offset in px that settles to 0 during the reveal [x, y] */
  enter?: [number, number];
  /** resting rotation in degrees */
  rotate?: number;
  /** extra entrance rotation in degrees that settles to 0 */
  settle?: number;
  /** fade in with the reveal */
  fade?: boolean;
  /** portion of the scroll pass used for the reveal [start, end] */
  window?: [number, number];
};

const PRESETS: Record<CinePreset, CineParams> = {
  "zoom-reveal": { inset: 14, revealZoom: 0.22, zoom: [1.08, 1.02] },
  parallax: { pan: [0, 12], zoom: [1.16, 1.14] },
  "horizontal-pan": { pan: [-14, 0], zoom: [1.2, 1.16] },
  "vertical-pan": { pan: [0, -16], zoom: [1.2, 1.18] },
  wipe: { from: "up", revealZoom: 0.14 },
  crossfade: {},
  float: { drift: [0, -80] },
  "stacked-reveal": { enter: [0, 60], settle: 6, fade: true, revealZoom: 0.08 },
};

type Vars = Record<string, string | number>;

function resolve(presets: CinePreset[], params?: CineParams) {
  const m: CineParams = {};
  for (const p of presets) Object.assign(m, PRESETS[p]);
  Object.assign(m, params);

  const outer: Vars = {};
  const frame: Vars = {};
  const cam: Vars = {};

  // ── camera ──
  const pan = m.pan ?? [0, 0];
  const cover = 1 + Math.max(Math.abs(pan[0]), Math.abs(pan[1])) / 100; // never expose the frame edge
  const zoom = m.zoom ?? [cover, cover];
  cam["--z0"] = Math.max(zoom[0], cover);
  cam["--z1"] = Math.max(zoom[1], cover);
  if (pan[0]) cam["--cx"] = `${pan[0]}%`;
  if (pan[1]) cam["--cy"] = `${pan[1]}%`;
  if (m.revealZoom) cam["--zr"] = m.revealZoom;

  // ── frame clip ──
  let clip = false;
  if (presets.includes("wipe")) {
    clip = true;
    frame[{ up: "--ct", down: "--cb", left: "--cl", right: "--cr" }[m.from ?? "up"]] = "100%";
  }
  if (presets.includes("zoom-reveal")) {
    clip = true;
    const v = `${m.inset ?? 14}%`;
    for (const k of ["--ct", "--cr", "--cb", "--cl"]) frame[k] ??= v;
  }

  // ── outer ──
  let float = false;
  if (m.drift) {
    float = true;
    outer["--fx"] = `${m.drift[0]}px`;
    outer["--fy"] = `${m.drift[1]}px`;
  }
  if (m.enter) {
    float = true;
    outer["--ex"] = `${m.enter[0]}px`;
    outer["--ey"] = `${m.enter[1]}px`;
  }
  if (m.rotate) {
    float = true;
    outer["--rot"] = `${m.rotate}deg`;
  }
  if (m.settle) {
    float = true;
    outer["--er"] = `${m.settle}deg`;
  }
  if (m.window) {
    outer["--rs"] = m.window[0];
    outer["--re"] = m.window[1];
  }

  return { outer, frame, cam, clip, float, fade: !!m.fade };
}

type Props = PhotoSource & {
  preset?: CinePreset | CinePreset[];
  params?: CineParams;
  scene?: "self" | "inherit";
  /** CSS aspect ratio of the frame, e.g. "4/5" */
  ratio?: string;
  /** fill the positioned parent instead of using a ratio */
  fill?: boolean;
  /** one-off entrance on page load (hero): timed wipe + camera push-in */
  intro?: { from: CineDirection; delay?: number };
  /** for the `crossfade` preset */
  active?: boolean;
  className?: string;
  frameClassName?: string;
  imgClassName?: string;
  style?: CSSProperties;
  /** rendered below the frame, moves with the outer layer (captions) */
  children?: ReactNode;
};

const INTRO_VAR = { up: "--wt", down: "--wb", left: "--wl", right: "--wr" } as const;

export function CinematicPhoto({
  preset = "parallax",
  params,
  scene = "self",
  ratio,
  fill,
  intro,
  active,
  className,
  frameClassName,
  imgClassName,
  style,
  children,
  ...source
}: Props) {
  const reduced = usePrefersReducedMotion();
  const ref = useScrollProgress<HTMLDivElement>("pass", undefined, scene === "self" && !reduced);
  const presets = Array.isArray(preset) ? preset : [preset];
  const m = resolve(presets, params);
  const crossfade = presets.includes("crossfade");

  const frameStyle: Vars = { ...m.frame };
  if (ratio) frameStyle.aspectRatio = ratio;
  if (intro) {
    frameStyle[INTRO_VAR[intro.from]] = "100%";
    frameStyle["--d"] = `${intro.delay ?? 0}ms`;
  }

  const frame = (
    <div
      className={cn("relative overflow-hidden bg-sand", fill && "absolute inset-0", m.clip && !intro && "cine-clip", intro && "intro-wipe", frameClassName)}
      style={frameStyle as CSSProperties}
    >
      <div className="cine-cam" style={m.cam as CSSProperties}>
        <PhotoImg
          {...source}
          className={cn(intro && "intro-kb", imgClassName)}
          style={intro ? ({ "--d": `${intro.delay ?? 0}ms` } as CSSProperties) : undefined}
        />
      </div>
    </div>
  );
  const moving = m.float || m.fade;

  return (
    // The outer box is what the scroll engine measures, so it must never be
    // transformed itself — drift / settling live on the inner .cine-float layer.
    <div
      ref={ref}
      data-active={crossfade ? (active ? "" : undefined) : undefined}
      className={cn("cine relative", scene === "self" && "cine-self", crossfade && "cine-xfade", fill && "absolute inset-0", className)}
      style={{ ...(m.outer as CSSProperties), ...style }}
    >
      {moving ? (
        <div className={cn(m.float && "cine-float", m.fade && "cine-fade", fill && "absolute inset-0")}>
          {frame}
          {children}
        </div>
      ) : (
        <>
          {frame}
          {children}
        </>
      )}
    </div>
  );
}

/**
 * CrossfadeStack — several photographs sharing one frame. The active image is
 * swapped with a directional wipe: scrolling forward the new shot rises from
 * below while the old one is carried away upward; scrolling back reverses it.
 * Each layer's camera also settles as it becomes active, and every image keeps
 * panning with the ancestor scene's scroll progress.
 */
export function CrossfadeStack({
  images,
  index,
  ratio,
  crop,
  sizes,
  widths,
  axis = "y",
  className,
}: {
  images: Img[];
  index: number;
  ratio?: string;
  crop?: [number, number];
  sizes?: string;
  widths?: number[];
  axis?: "x" | "y";
  className?: string;
}) {
  return (
    <div className={cn("xfade relative overflow-hidden", className)} data-axis={axis} style={{ aspectRatio: ratio }}>
      {images.map((img, i) => (
        <div key={img.src + i} className="xfade-layer" data-state={i === index ? "active" : i < index ? "before" : "after"} aria-hidden={i !== index}>
          <div className="xfade-cam">
            <CinematicPhoto img={img} fill scene="inherit" preset="parallax" params={{ pan: [0, 10], zoom: [1.16, 1.1] }} crop={crop} sizes={sizes} widths={widths} />
          </div>
        </div>
      ))}
    </div>
  );
}
