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
  sizes,
  className = "",
  style,
  eager = false,
}: {
  art: Artwork;
  sizes: string;
  className?: string;
  style?: CSSProperties;
  /** Load right away instead of lazily (for the likely LCP image). */
  eager?: boolean;
}) {
  const { crop: c } = art;
  const w = 1 - c.l - c.r;
  const h = 1 - c.t - c.b;

  const painting = (
    <div
      className={styles.window}
      style={
        {
          aspectRatio: aspect(art),
          "--blur": `url(${art.image.blurDataURL})`,
        } as CSSProperties
      }
    >
      <Image
        src={art.image}
        alt={`${art.title}, ${art.medium.toLowerCase()}`}
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
