"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { ARTWORKS } from "@/app/lib/artworks";
import { Frame, frameHeightRatio } from "./frame";
import { InlineScript } from "@/app/components/inline-script";
import { revealScript, setupReveal } from "./reveal";

const ORDER = [
  "crosswalk",
  "kiskadee",
  "yellow-house",
  "ducks",
  "penguins",
  "asakusa",
  "coast-road",
  "sea-lion",
  "cupid",
];
const HUNG = ORDER.map((id) => ARTWORKS.find((a) => a.id === id)!);

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

export function Gallery() {
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);

  // On hard navigations the inline script below has already run (no-op here).
  // On client-side navigations it doesn't run, so set up before first paint.
  useLayoutEffect(() => setupReveal(root.current), []);

  // Track which room is centered for the counter.
  useEffect(() => {
    const rooms = root.current!.querySelectorAll<HTMLElement>("[data-room]");
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setCurrent(Number((e.target as HTMLElement).dataset.room));
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
          {current === 0 ? "—" : pad(current)} / {pad(HUNG.length)}
        </p>

        <section data-room="0" className="flex min-h-dvh flex-col justify-end px-6 pb-[18dvh] md:px-[8vw]">
          <h1 className="text-[clamp(3.5rem,11vw,10rem)] font-semibold leading-[0.9] tracking-tight">
            Paintings
          </h1>
          <div className="mt-8 flex flex-wrap gap-x-10 gap-y-2 text-sm opacity-60">
            <span>Nine works, 2025</span>
            <span>Acrylic on canvas and paper</span>
          </div>
        </section>

        {HUNG.map((art, i) => {
          const box = BOX[art.size];
          const place = PLACEMENT[i % PLACEMENT.length];
          const centered = i % PLACEMENT.length === 2;
          return (
            <section
              key={art.id}
              data-room={i + 1}
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

        <section className="flex min-h-[60dvh] items-center justify-center px-6 pb-24 text-sm opacity-60">
          End of exhibition
        </section>
      </div>
      {/* Runs during HTML parsing, so paintings reveal before React hydrates. */}
      <InlineScript html={revealScript(id)} />
    </>
  );
}
