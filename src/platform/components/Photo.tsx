import { useCallback, type CSSProperties } from "react";
import { cn } from "@/utils/cn";
import { imgUrl, type Img } from "../data";

export type PhotoSource = {
  img: Img;
  /** `sizes` hint for responsive selection */
  sizes?: string;
  /** widths to generate in srcset */
  widths?: number[];
  priority?: boolean;
  /** crop to ratio server-side when provided ("w/h" numbers) */
  crop?: [number, number];
};

/**
 * The graded, responsive <img> itself (srcset, lazy by default, fades in on
 * load). Shared by <Photo> and <CinematicPhoto> so loading behaviour is identical.
 */
export function PhotoImg({
  img,
  sizes = "50vw",
  widths = [480, 800, 1200, 1600],
  priority,
  crop,
  className,
  style,
}: PhotoSource & { className?: string; style?: CSSProperties }) {
  const h = (w: number) => (crop ? Math.round((w * crop[1]) / crop[0]) : undefined);
  const srcSet = widths.map((w) => `${imgUrl(img.src, w, h(w))} ${w}w`).join(", ");
  const onLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.setAttribute("data-loaded", "");
  }, []);
  const ref = useCallback((node: HTMLImageElement | null) => {
    if (node?.complete && node.naturalWidth) node.setAttribute("data-loaded", "");
  }, []);
  const fallback = widths[1] ?? widths[0];

  return (
    <img
      ref={ref}
      src={imgUrl(img.src, fallback, h(fallback))}
      srcSet={srcSet}
      sizes={sizes}
      alt={img.alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={priority ? "high" : "auto"}
      draggable={false}
      onLoad={onLoad}
      style={style}
      className={cn("photo-img grade absolute inset-0 size-full object-cover", className)}
    />
  );
}

type Props = PhotoSource & {
  /** CSS aspect ratio, e.g. "4/5". Prevents layout shift. */
  ratio?: string;
  className?: string;
  imgClassName?: string;
  style?: CSSProperties;
};

/**
 * Static graded photograph: fixed aspect box with sand placeholder.
 * For moving shots use <CinematicPhoto>.
 */
export function Photo({ ratio, className, imgClassName, style, ...source }: Props) {
  return (
    <div className={cn("relative overflow-hidden bg-sand", className)} style={{ aspectRatio: ratio, ...style }}>
      <PhotoImg {...source} className={imgClassName} />
    </div>
  );
}
