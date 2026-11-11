import Image from "next/image";
import type { CSSProperties } from "react";
import { aspect, type Artwork } from "@/app/lib/artworks";
import styles from "./gallery.module.css";

/**
 * A framed painting. The caller sets the width (via `className` or `style`);
 * moulding and mat thickness scale with it through container query units.
 */
export function Frame({
  art,
  widths,
  className = "",
  style,
  eager = false,
  format,
}: {
  art: Artwork;
  /**
   * The frame's CSS width at each breakpoint, last one without a media query,
   * e.g. `[{ media: "(min-width: 768px)", width: "min(46vw, 60vh)" }, { width: "84vw" }]`.
   * Used to build the image's `sizes` so the browser downloads the right file.
   */
  widths: { media?: string; width: string }[];
  className?: string;
  style?: CSSProperties;
  /** Load right away instead of lazily (for the likely LCP image). */
  eager?: boolean;
  /**
   * Show the painting at this width / height instead of its own, trimming
   * evenly from the longer side (never stretching). Lets a series share one
   * format so every frame in it is the same size.
   */
  format?: number;
}) {
  const c = format ? fitCrop(art, format) : art.crop;
  const w = 1 - c.l - c.r;
  const h = 1 - c.t - c.b;
  // The image is drawn wider than the frame: the frame's padding (moulding,
  // mat) is removed, then the photo is enlarged so its cropped edges overflow.
  const scale = ((1 - 2 * FRAME_PAD[art.frame]) / w).toFixed(3);
  const sizes = widths
    .map(({ media, width }) => `${media ? `${media} ` : ""}calc(${width} * ${scale})`)
    .join(", ");

  const painting = (
    <div
      className={styles.window}
      style={
        {
          aspectRatio: format ?? aspect(art),
          "--blur": `url(${art.image.blurDataURL})`,
        } as CSSProperties
      }
    >
      <Image
        src={art.image}
        alt={art.description}
        sizes={sizes}
        loading={eager ? "eager" : "lazy"}
        draggable={false}
        suppressHydrationWarning
        style={{
          position: "absolute",
          maxWidth: "none",
          width: `${100 / w}%`,
          height: `${100 / h}%`,
          left: `${(-c.l / w) * 100}%`,
          top: `${(-c.t / h) * 100}%`,
        }}
      />
    </div>
  );

  return (
    <div
      className={`${styles.frame} ${styles[art.frame]} ${className}`}
      style={{ "--ar": aspect(art), ...style } as CSSProperties}
    >
      <div className={styles.moulding}>
        {art.frame === "mat" || art.frame === "float" ? (
          <div className={styles.inset}>{painting}</div>
        ) : (
          painting
        )}
      </div>
    </div>
  );
}

/** The painting's crop, trimmed evenly on its longer side to reach `target`. */
function fitCrop({ image, crop: c }: Artwork, target: number) {
  const w = 1 - c.l - c.r;
  const h = 1 - c.t - c.b;
  const current = (image.width * w) / (image.height * h);
  if (current > target) {
    const trim = (w - (target * image.height * h) / image.width) / 2;
    return { ...c, l: c.l + trim, r: c.r + trim };
  }
  const trim = (h - (image.width * w) / (target * image.height)) / 2;
  return { ...c, t: c.t + trim, b: c.b + trim };
}

/** Total padding per side (moulding + mat/gap) as a fraction of frame width. */
const FRAME_PAD: Record<Artwork["frame"], number> = {
  gilt: 0.07,
  black: 0.026,
  oak: 0.046,
  mat: 0.018 + 0.09,
  float: 0.016 + 0.028,
};

/** Outer frame height divided by outer frame width. */
export function frameHeightRatio(art: Artwork) {
  const p = FRAME_PAD[art.frame];
  return (1 - 2 * p) / aspect(art) + 2 * p;
}
