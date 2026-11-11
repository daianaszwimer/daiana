import type { CSSProperties } from "react";
import { ARTWORKS, COLLECTIONS, type Artwork, type CollectionId } from "@/app/lib/artworks";
import { Frame, frameHeightRatio } from "./frame";
import { RevealSetup, RoomCounter } from "./gallery-client";
import styles from "./gallery.module.css";

/** The gallery's root id, used by the reveal script and the room counter. */
const GALLERY_ID = "gallery";

// Hang order: series rooms first, then standalone works newest year first.
// Within a series or a year, paintings follow this list.
const ORDER = [
  "crosswalk",
  "cupid",
  "yellow-house",
  "ducks",
  "asakusa",
  "coast-road",
  "penguins",
  "sea-lion",
  "kiskadee",
  "aguara-guazu",
];
const HUNG = ORDER.map((id) => ARTWORKS.find((a) => a.id === id)!);
// Array sort is stable, so ORDER still decides within the same year.
const SOLO = HUNG.filter((a) => !a.collection).sort((a, b) => Number(b.year) - Number(a.year));
const SERIES = (Object.keys(COLLECTIONS) as CollectionId[])
  .map((id) => ({ id, ...COLLECTIONS[id], works: HUNG.filter((a) => a.collection === id) }))
  .filter((c) => c.works.length > 0);
/** Width / height every work in a series is shown at. */
const SERIES_FORMAT = 1;
const SERIES_TOTAL = SERIES.reduce((n, c) => n + c.works.length, 0);

/** Max frame width (vw) and height (dvh) per hang size; the tighter one wins. */
const BOX = {
  L: { w: 46, h: 76, mw: 84 },
  M: { w: 32, h: 62, mw: 72 },
  S: { w: 18, h: 34, mw: 50 },
} as const;

// Piece position in its room, cycling: left with label right, right with label left, centered with label below.
const PLACEMENT = [
  { row: "md:flex-row", self: "md:mr-[6vw]" },
  { row: "md:flex-row-reverse", self: "md:ml-[6vw]" },
  { row: "md:flex-col", self: "" },
];

const pad = (n: number) => String(n).padStart(2, "0");

const WORDS = ["No", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];
const count = (n: number) => WORDS[n] ?? String(n);

/**
 * Server Component: the rooms are static markup. Only the room counter and
 * the reveal setup run on the client (see ./gallery-client).
 */
export function Gallery() {
  return (
    <>
      <main
        id={GALLERY_ID}
        suppressHydrationWarning
        className={`${styles.page} bg-[#ebe7df] text-[#1d1b18]`}
      >
        <RoomCounter galleryId={GALLERY_ID} total={pad(HUNG.length)} />

        <section data-room="" className="flex min-h-dvh flex-col justify-end px-6 pb-[18dvh] md:px-[8vw]">
          <h1 className="text-[clamp(3.5rem,11vw,10rem)] font-semibold leading-[0.9] tracking-tight">
            Paintings
          </h1>
          <div className="mt-8 flex flex-wrap gap-x-10 gap-y-2 text-sm opacity-70">
            <span>
              {SERIES.length > 0
                ? `${count(SOLO.length)} works and a series in progress, 2025 & 2026`
                : `${count(SOLO.length)} works, 2025 & 2026`}
            </span>
            <span>Acrylic on canvas and paper. Oil on canvas.</span>
          </div>
        </section>

        {SERIES.map((series, s) => {
          const first = 1 + SERIES.slice(0, s).reduce((n, c) => n + c.works.length, 0);
          return <SeriesRoom key={series.id} {...series} first={first} eager={s === 0} />;
        })}

        {SOLO.map((art, i) => {
          const n = SERIES_TOTAL + i + 1;
          const box = BOX[art.size];
          const place = PLACEMENT[i % PLACEMENT.length];
          const centered = i % PLACEMENT.length === 2;
          return (
            <section
              key={art.id}
              data-room={pad(n)}
              className={`relative flex min-h-[92dvh] flex-col items-center justify-center gap-8 px-6 py-[10dvh] md:gap-[4vw] md:px-[8vw] ${place.row}`}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_40%_50%_at_50%_45%,rgb(255_253_248/0.9),transparent_70%)]"
              />
              <div
                data-reveal
                suppressHydrationWarning
                className={`${styles.reveal} relative w-(--w-mobile) shrink-0 md:w-(--w-desktop) ${place.self}`}
                style={
                  {
                    "--w-desktop": `min(${box.w}vw, calc(${box.h}dvh / ${frameHeightRatio(art)}))`,
                    "--w-mobile": `min(${box.mw}vw, calc(${box.h}dvh / ${frameHeightRatio(art)}))`,
                  } as CSSProperties
                }
              >
                <Frame
                  art={art}
                  widths={[
                    {
                      media: "(min-width: 768px)",
                      width: `min(${box.w}vw, ${(box.h / frameHeightRatio(art)).toFixed(1)}vh)`,
                    },
                    { width: `min(${box.mw}vw, ${(box.h / frameHeightRatio(art)).toFixed(1)}vh)` },
                  ]}
                  eager={SERIES.length === 0 && i === 0}
                />
              </div>
              <div
                data-reveal
                suppressHydrationWarning
                className={`${styles.reveal} relative max-w-xs ${centered ? "md:text-center" : ""}`}
              >
                <p className="font-mono text-xs tabular-nums opacity-70">{pad(n)}</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">{art.title}</h2>
                <p className="mt-2 text-sm opacity-70">
                  {art.medium}, {art.year}
                </p>
              </div>
            </section>
          );
        })}

        <section className="flex min-h-[60dvh] items-center justify-center px-6 pb-24 text-sm opacity-70">
          End of exhibition
        </section>
      </main>
      <RevealSetup galleryId={GALLERY_ID} />
    </>
  );
}

/** A series hung together in one room: the works side by side on a shared eye line. */
function SeriesRoom({
  title,
  status,
  works,
  first,
  eager = false,
}: {
  title: string;
  status: string;
  works: Artwork[];
  /** 1-based number of the first work in this series. */
  first: number;
  /** Load the first work right away (it's the first painting on the page). */
  eager?: boolean;
}) {
  const last = first + works.length - 1;
  // Side by side from 640px up: each frame shares the row (84vw minus 4vw
  // gaps), capped at 22vw. Phones wrap two per row.
  const rowWidth = Math.min(22, (84 - (works.length - 1) * 4) / works.length);
  // Every work in a series is shown square, so with equal widths every frame is
  // an identical square whatever its moulding (see Frame's `format`).
  return (
    <section
      data-room={`${pad(first)}–${pad(last)}`}
      className="relative flex min-h-dvh flex-col items-center justify-center gap-[7dvh] px-6 py-[12dvh] md:px-[8vw]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_62%_46%_at_50%_56%,rgb(255_253_248/0.95),transparent_72%)]"
      />
      <header data-reveal suppressHydrationWarning className={`${styles.reveal} relative text-center`}>
        <p className="font-mono text-xs uppercase tracking-[0.2em] opacity-70">Collection</p>
        <h2 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">{title}</h2>
        <p className="mt-3 text-sm opacity-70">
          {status} · {works.length} {works.length === 1 ? "work" : "works"} so far
        </p>
      </header>

      <div
        className={`${styles.seriesRow} relative flex w-full flex-wrap justify-center gap-x-[6vw] gap-y-10 sm:flex-nowrap sm:items-start sm:gap-[4vw]`}
      >
        {works.map((art, i) => (
          <figure
            key={art.id}
            data-reveal
            suppressHydrationWarning
            className={`${styles.reveal} flex max-w-[40vw] flex-col items-center gap-4 sm:max-w-none`}
            style={{ "--i": i } as CSSProperties}
          >
            <div
              className="w-[min(40vw,30dvh)] sm:w-[min(var(--row),34dvh)]"
              style={{ "--row": `${rowWidth}vw` } as CSSProperties}
            >
              <Frame
                art={art}
                widths={[
                  { media: "(min-width: 640px)", width: `min(${rowWidth}vw, 34vh)` },
                  { width: "min(40vw, 30vh)" },
                ]}
                format={SERIES_FORMAT}
                eager={eager && i === 0}
              />
            </div>
            <figcaption className="text-center text-sm">
              <span className="font-mono text-xs tabular-nums opacity-70">{pad(first + i)}</span>
              <h3 className="mt-1 font-medium">{art.title}</h3>
              <p className="opacity-70">{art.medium}</p>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
