import type { CSSProperties } from "react";
import { cn } from "@/utils/cn";
import { Photo } from "./Photo";
import {
  CINE_DEFAULTS,
  CINE_REVEAL_DEFAULT,
  type CinePreset,
  type CineReveal,
} from "../motion/cinematic";
import type { Img } from "../data";

type Props = {
  img: Img;
  ratio?: string;
  sizes?: string;
  widths?: number[];
  priority?: boolean;
  crop?: [number, number];
  preset?: CinePreset;
  reveal?: CineReveal;
  /** 0..1 motion multiplier */
  intensity?: number;
  parallaxY?: string;
  parallaxX?: string;
  zoom?: number;
  rotate?: number;
  delay?: number;
  className?: string;
  imgClassName?: string;
  style?: CSSProperties;
};

/**
 * CinematicPhoto — reusable photographic motion wrapper.
 *
 * Three dedicated layers so entrance, parallax and zoom never fight:
 *   outer (.cine-outer)    — clip-path / opacity entrance (data-in)
 *   middle (.cine-parallax)— scroll-linked translation (--p)
 *   inner (.cine-zoom)     — scroll-linked scale / pan / rotation (--p)
 *
 * The parent must be a `.scene` (or otherwise set --p via useScrollProgress).
 * When no --p is present the photo still reveals via IntersectionObserver
 * and rests at a neutral transform — content never disappears.
 */
export function CinematicPhoto({
  img,
  ratio,
  sizes = "50vw",
  widths = [480, 800, 1200, 1600],
  priority,
  crop,
  preset = "zoom-reveal",
  reveal,
  intensity,
  parallaxY,
  parallaxX,
  zoom,
  rotate,
  delay = 0,
  className,
  imgClassName,
  style,
}: Props) {
  const d = CINE_DEFAULTS[preset];
  const revealMode = reveal ?? CINE_REVEAL_DEFAULT[preset];
  const vars = {
    "--py": parallaxY ?? d.parallaxY,
    "--px": parallaxX ?? d.parallaxX,
    "--zoom": String(zoom ?? d.zoom),
    "--rot": `${rotate ?? d.rotate}deg`,
    "--ci": String(intensity ?? d.intensity),
    "--rd": `${delay}ms`,
  } as CSSProperties;

  return (
    <div
      className={cn("cine-outer relative overflow-hidden bg-sand", className)}
      data-cine={preset}
      data-cine-reveal={revealMode}
      {...(revealMode !== "none" ? { "data-reveal": "" } : {})}
      style={{ aspectRatio: ratio, ...vars, ...style }}
    >
      <div className="cine-parallax absolute inset-0" aria-hidden="true">
        <div className="cine-zoom absolute inset-0">
          <Photo
            img={img}
            sizes={sizes}
            widths={widths}
            priority={priority}
            crop={crop}
            className="absolute inset-0 size-full"
            imgClassName={imgClassName}
          />
        </div>
      </div>
    </div>
  );
}
