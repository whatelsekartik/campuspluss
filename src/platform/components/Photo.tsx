import { useCallback, type CSSProperties } from "react";
import { cn } from "@/utils/cn";
import { imgUrl, type Img } from "../data";

type Props = {
  img: Img;
  /** CSS aspect ratio, e.g. "4/5". Prevents layout shift. */
  ratio?: string;
  /** `sizes` hint for responsive selection */
  sizes?: string;
  /** widths to generate in srcset */
  widths?: number[];
  priority?: boolean;
  className?: string;
  imgClassName?: string;
  style?: CSSProperties;
  /** crop to ratio server-side when provided ("w/h" numbers) */
  crop?: [number, number];
};

/**
 * Graded editorial photograph: fixed aspect box with sand placeholder, responsive
 * srcset, lazy by default, eager + high priority when `priority`.
 */
export function Photo({ img, ratio, sizes = "50vw", widths = [480, 800, 1200, 1600], priority, className, imgClassName, style, crop }: Props) {
  const h = (w: number) => (crop ? Math.round((w * crop[1]) / crop[0]) : undefined);
  const srcSet = widths.map((w) => `${imgUrl(img.src, w, h(w))} ${w}w`).join(", ");
  const onLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.setAttribute("data-loaded", "");
  }, []);
  const ref = useCallback((node: HTMLImageElement | null) => {
    if (node?.complete && node.naturalWidth) node.setAttribute("data-loaded", "");
  }, []);

  return (
    <div className={cn("relative overflow-hidden bg-sand", className)} style={{ aspectRatio: ratio, ...style }}>
      <img
        ref={ref}
        src={imgUrl(img.src, widths[1] ?? widths[0], h(widths[1] ?? widths[0]))}
        srcSet={srcSet}
        sizes={sizes}
        alt={img.alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        // eslint-disable-next-line react/no-unknown-property
        fetchPriority={priority ? "high" : "auto"}
        onLoad={onLoad}
        className={cn("photo-img grade absolute inset-0 size-full object-cover", imgClassName)}
      />
    </div>
  );
}
