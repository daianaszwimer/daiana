import type { CSSProperties } from "react";

// Thick strokes that trace the vine's stems, curls and leaves in /vine.png.
// They're used as a mask: drawing a stroke reveals the art underneath it.
// `from`/`to` are the slice of page scroll over which each stroke draws.
const STROKES: { d: string; width: number; from: number; to: number }[] = [
  // Main stem, from the base up to the top curl.
  { d: "M22,728 C60,650 120,600 128,530 C135,460 70,420 55,340 C45,280 90,225 160,195 C200,180 230,170 245,130 C260,80 245,15 195,15 C160,20 150,50 175,65 C200,75 205,55 195,45", width: 34, from: 0, to: 70 },
  // Second stem, from the base up to the right-hand leaves.
  { d: "M92,712 C110,640 150,570 160,520 C170,450 165,400 190,370", width: 34, from: 5, to: 40 },
  // Leaves on the lower stems.
  { d: "M85,625 C65,640 45,660 35,690", width: 50, from: 10, to: 22 },
  { d: "M140,525 C158,540 168,555 172,585", width: 54, from: 20, to: 32 },
  // Right-hand leaf pair, its curl and the leaf hanging off it.
  { d: "M185,365 C225,335 275,320 335,335", width: 64, from: 38, to: 52 },
  { d: "M215,370 C250,378 280,378 310,370", width: 30, from: 40, to: 52 },
  { d: "M290,370 C320,400 325,460 300,490 C275,510 240,490 240,465 C240,450 255,450 260,460", width: 30, from: 48, to: 66 },
  { d: "M290,495 C280,515 272,535 268,570", width: 60, from: 58, to: 70 },
  // Upper half: the left leaf, the middle curl, the big leaf and the top leaf.
  { d: "M75,268 C55,265 35,265 12,276", width: 56, from: 36, to: 48 },
  { d: "M110,215 C170,200 195,250 180,290 C165,320 115,320 105,290 C100,270 115,260 125,268", width: 30, from: 46, to: 66 },
  { d: "M215,145 C245,165 255,190 240,225", width: 90, from: 55, to: 72 },
  { d: "M180,75 C155,85 135,95 125,115", width: 60, from: 68, to: 82 },
];

export function CreeperVine({ side, className }: { side: "left" | "right"; className?: string }) {
  const maskId = `vine-mask-${side}`;
  const featherId = `vine-feather-${side}`;
  return (
    <svg viewBox="0 0 348 739" aria-hidden className={className}>
      <defs>
        {/* Blurs the mask so the art fades in at the edges of each stroke. */}
        <filter id={featherId} x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="8" />
        </filter>
        <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="348" height="739">
          <g filter={`url(#${featherId})`}>
            {STROKES.map(({ d, width, from, to }) => (
              <path
                key={d}
                d={d}
                pathLength={1}
                strokeWidth={width}
                className="vine-draw"
                style={{ "--from": `${from}%`, "--to": `${to}%` } as CSSProperties}
              />
            ))}
          </g>
        </mask>
      </defs>
      <image href="/vine.png" width="348" height="739" mask={`url(#${maskId})`} />
    </svg>
  );
}
