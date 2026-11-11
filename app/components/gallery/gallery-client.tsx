"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { InlineScript } from "@/app/components/inline-script";
import { revealScript, setupReveal } from "./reveal";

/**
 * Sets up the scroll reveal for the gallery with this id. Render it right
 * after the gallery: on hard navigations its inline script runs during HTML
 * parsing, before React hydrates. On client-side navigations the script
 * doesn't run, so the layout effect sets it up before first paint instead.
 * See node_modules/next/dist/docs/01-app/02-guides/preventing-flash-before-hydration.md
 */
export function RevealSetup({ galleryId }: { galleryId: string }) {
  useLayoutEffect(() => setupReveal(document.getElementById(galleryId)), [galleryId]);
  return <InlineScript html={revealScript(galleryId)} />;
}

/** Fixed counter showing which room is centered, e.g. "03 / 10" or "01–04 / 10". */
export function RoomCounter({ galleryId, total }: { galleryId: string; total: string }) {
  const [current, setCurrent] = useState("—");

  useEffect(() => {
    const rooms = document.getElementById(galleryId)?.querySelectorAll<HTMLElement>("[data-room]");
    if (!rooms) return;
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
  }, [galleryId]);

  return (
    <p
      aria-hidden
      className="fixed left-6 top-6 z-10 font-mono text-xs tabular-nums tracking-wider opacity-70 md:left-10 md:top-8"
    >
      {current} / {total}
    </p>
  );
}
