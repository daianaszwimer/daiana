import type { StaticImageData } from "next/image";
import crosswalk from "@/public/gallery/8A156B11-8611-4049-8510-F22BA558C642_1_102_a.jpg";
import yellowHouse from "@/public/gallery/D25090DD-6641-4C18-A0D9-6055EA1A5ED7_1_105_c.jpg";
import asakusa from "@/public/gallery/25DDAFEA-6262-492F-B1D2-3594E173F62F_1_105_c.jpg";
import ducks from "@/public/gallery/304868C8-C10D-4B37-B707-1C3462AD575B_1_105_c.jpg";
import coastRoad from "@/public/gallery/420574B2-F2BC-4246-BA5D-7FC38ADB7B59_1_105_c.jpg";
import cupid from "@/public/gallery/C21CB5BD-68B2-4B25-AEF3-D9FAEE480F37_1_105_c.jpg";
import kiskadee from "@/public/gallery/54A8A561-7222-4111-92CB-A16F49F5D147_1_105_c.jpg";
import penguins from "@/public/gallery/Pasted 2026-11-10 at 8.18.36 PM.jpg";
import seaLion from "@/public/gallery/Pasted 2026-11-10 at 8.18.45 PM.jpg";

export type FrameKind = "gilt" | "black" | "oak" | "mat" | "float";
export type HangSize = "S" | "M" | "L";

/** Fractions of the photo to hide on each side (easel, table, fingers). */
type Crop = { t: number; r: number; b: number; l: number };

export type Artwork = {
  id: string;
  image: StaticImageData;
  title: string;
  year: string;
  medium: string;
  frame: FrameKind;
  size: HangSize;
  crop: Crop;
};

const crop = (t: number, r: number, b: number, l: number): Crop => ({ t, r, b, l });

export const ARTWORKS: Artwork[] = [
  {
    id: "crosswalk",
    image: crosswalk,
    title: "Crosswalk at Noon",
    year: "2025",
    medium: "Acrylic on paper",
    frame: "mat",
    size: "L",
    crop: crop(0.02, 0.06, 0.03, 0.03),
  },
  {
    id: "yellow-house",
    image: yellowHouse,
    title: "The Yellow House",
    year: "2025",
    medium: "Acrylic on canvas",
    frame: "gilt",
    size: "L",
    crop: crop(0.02, 0.01, 0.02, 0.055),
  },
  {
    id: "asakusa",
    image: asakusa,
    title: "Asakusa, Three Friends",
    year: "2025",
    medium: "Acrylic on canvas",
    frame: "float",
    size: "M",
    crop: crop(0.03, 0.075, 0.025, 0.06),
  },
  {
    id: "ducks",
    image: ducks,
    title: "Ladies Who Lunch",
    year: "2025",
    medium: "Acrylic on paper",
    frame: "black",
    size: "M",
    crop: crop(0.025, 0.03, 0.02, 0.03),
  },
  {
    id: "coast-road",
    image: coastRoad,
    title: "Coast Road",
    year: "2025",
    medium: "Acrylic on paper",
    frame: "mat",
    size: "M",
    crop: crop(0.03, 0.08, 0.05, 0.025),
  },
  {
    id: "cupid",
    image: cupid,
    title: "Cupid in the Garden",
    year: "2025",
    medium: "Acrylic on canvas",
    frame: "gilt",
    size: "M",
    crop: crop(0.02, 0.06, 0.04, 0.05),
  },
  {
    id: "kiskadee",
    image: kiskadee,
    title: "Kiskadee",
    year: "2025",
    medium: "Acrylic on canvas",
    frame: "oak",
    size: "S",
    crop: crop(0.05, 0.08, 0.1, 0.06),
  },
  {
    id: "penguins",
    image: penguins,
    title: "Penguins at Dusk",
    year: "2025",
    medium: "Acrylic on canvas board",
    frame: "black",
    size: "S",
    crop: crop(0.08, 0.08, 0.09, 0.07),
  },
  {
    id: "sea-lion",
    image: seaLion,
    title: "Sea Lion",
    year: "2025",
    medium: "Acrylic on canvas board",
    frame: "oak",
    size: "S",
    crop: crop(0.05, 0.05, 0.06, 0.05),
  },
];

/** Width / height of the painted area once the crop is applied. */
export function aspect({ image, crop: c }: Artwork) {
  return (image.width * (1 - c.l - c.r)) / (image.height * (1 - c.t - c.b));
}
