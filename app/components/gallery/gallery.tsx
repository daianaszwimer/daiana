"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { ARTWORKS, COLLECTIONS, type Artwork, type CollectionId } from "@/app/lib/artworks";
import { Frame, frameHeightRatio } from "./frame";
import { InlineScript } from "@/app/components/inline-script";
import { revealScript, setupReveal } from "./reveal";

// Hang order. Paintings in a collection are pulled out and hung together in
// their series room after the standalone works, in this same order.
const ORDER = [
  "crosswalk",
  "yellow-house",
  "ducks",
  "asakusa",
  "coast-road",
  "cupid",
  "penguins",
  "sea-lion",
  "kiskadee",
];
const HUNG = ORDER.map((id) => ARTWORKS.find((a) => a.id === id)!);
const SOLO = HUNG.filter((a) => !a.collection);
const SERIES = (Object.keys(COLLECTIONS) as CollectionId[])
  .map((id) => ({ id, ...COLLECTIONS[id], works: HUNG.filter((a) => a.collection === id) }))
  .filter((c) => c.works.length > 0);

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

export function Gallery() {
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  // Counter label of the centered room, e.g. "03" or "07–09" for a series.
  const [current, setCurrent] = useState("—");

  // On hard navigations the inline script below has already run (no-op here).
  // On client-side navigations it doesn't run, so set up before first paint.
  useLayoutEffect(() => setupReveal(root.current), []);

  // Track which room is centered for the counter.
  useEffect(() => {
    const rooms = root.current!.querySelectorAll<HTMLElement>("[data-room]");
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setCurrent((e.target as HTMLElement).dataset.room || "—");
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    rooms.forEach((r) => io.observe(r));
    return () => io.disconnect();
  }, []);

  return (
    <>
      <div
        ref={root}
        id={id}
        data-page="gallery"
        suppressHydrationWarning
        className="bg-[#ebe7df] text-[#1d1b18]"
      >
        <p
          aria-hidden
          className="fixed left-6 top-6 z-10 font-mono text-xs tabular-nums tracking-wider opacity-60 md:left-10 md:top-8"
        >
          {current} / {pad(HUNG.length)}
        </p>

        <section data-room="" className="flex min-h-dvh flex-col justify-end px-6 pb-[18dvh] md:px-[8vw]">
          <h1 className="text-[clamp(3.5rem,11vw,10rem)] font-semibold leading-[0.9] tracking-tight">
            Paintings
          </h1>
          <div className="mt-8 flex flex-wrap gap-x-10 gap-y-2 text-sm opacity-60">
            <span>
              {SERIES.length > 0
                ? `${count(SOLO.length)} works and a series in progress, 2025`
                : `${count(SOLO.length)} works, 2025`}
            </span>
            <span>Acrylic on canvas and paper</span>
          </div>
        </section>

        {SOLO.map((art, i) => {
          const box = BOX[art.size];
          const place = PLACEMENT[i % PLACEMENT.length];
          const centered = i % PLACEMENT.length === 2;
          return (
            <section
              key={art.id}
              data-room={pad(i + 1)}
              className={`relative flex min-h-[92dvh] flex-col items-center justify-center gap-8 px-6 py-[10dvh] md:gap-[4vw] md:px-[8vw] ${place.row}`}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_40%_50%_at_50%_45%,rgb(255_253_248/0.9),transparent_70%)]"
              />
              <div
                data-reveal
                suppressHydrationWarning
                className={`relative w-(--w-mobile) shrink-0 md:w-(--w-desktop) ${place.self}`}
                style={
                  {
                    "--w-desktop": `min(${box.w}vw, calc(${box.h}dvh / ${frameHeightRatio(art)}))`,
                    "--w-mobile": `min(${box.mw}vw, calc(${box.h}dvh / ${frameHeightRatio(art)}))`,
                  } as CSSProperties
                }
              >
                <Frame art={art} sizes={`(min-width: 768px) ${box.w}vw, ${box.mw}vw`} eager={i === 0} />
              </div>
              <div
                data-reveal
                suppressHydrationWarning
                className={`relative max-w-xs ${centered ? "md:text-center" : ""}`}
              >
                <p className="font-mono text-xs tabular-nums opacity-50">{pad(i + 1)}</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">{art.title}</h2>
                <p className="mt-2 text-sm opacity-60">
                  {art.medium}, {art.year}
                </p>
              </div>
            </section>
          );
        })}

        {SERIES.map((series, s) => {
          const first = SOLO.length + 1 + SERIES.slice(0, s).reduce((n, c) => n + c.works.length, 0);
          return <SeriesRoom key={series.id} {...series} first={first} />;
        })}

        <section className="flex min-h-[60dvh] items-center justify-center px-6 pb-24 text-sm opacity-60">
          End of exhibition
        </section>
      </div>
      {/* Runs during HTML parsing, so paintings reveal before React hydrates. */}
      <InlineScript html={revealScript(id)} />
    </>
  );
}

/** A series hung together in one room: the works side by side on a shared eye line. */
function SeriesRoom({
  title,
  status,
  works,
  first,
}: {
  title: string;
  status: string;
  works: Artwork[];
  /** 1-based number of the first work, continuing from the standalone rooms. */
  first: number;
}) {
  const last = first + works.length - 1;
  return (
    <section
      data-room={`${pad(first)}–${pad(last)}`}
      className="relative flex min-h-dvh flex-col items-center justify-center gap-[7dvh] px-6 py-[12dvh] md:px-[8vw]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_62%_46%_at_50%_56%,rgb(255_253_248/0.95),transparent_72%)]"
      />
      <header data-reveal suppressHydrationWarning className="relative text-center">
        <p className="font-mono text-xs uppercase tracking-[0.2em] opacity-50">Collection</p>
        <h2 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">{title}</h2>
        <p className="mt-3 text-sm opacity-60">
          {status} · {works.length} {works.length === 1 ? "work" : "works"} so far
        </p>
      </header>

      <div className="relative flex w-full flex-col items-center gap-12 sm:flex-row sm:items-start sm:justify-center sm:gap-[4vw]">
        {works.map((art, i) => (
          <figure
            key={art.id}
            data-reveal
            suppressHydrationWarning
            className="flex flex-col items-center gap-4"
          >
            <div
              className="w-[min(64vw,calc(34dvh/var(--r)))] sm:w-[min(22vw,calc(34dvh/var(--r)))]"
              style={{ "--r": frameHeightRatio(art) } as CSSProperties}
            >
              <Frame art={art} sizes="(min-width: 640px) 22vw, 64vw" />
            </div>
            <figcaption className="text-center text-sm">
              <span className="font-mono text-xs tabular-nums opacity-50">{pad(first + i)}</span>
              <p className="mt-1 font-medium">{art.title}</p>
              <p className="opacity-60">{art.medium}</p>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
