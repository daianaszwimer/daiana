import type { StaticImageData } from "next/image";
import crosswalk from "@/public/gallery/crosswalk.jpg";
import yellowHouse from "@/public/gallery/yellow-house.jpg";
import asakusa from "@/public/gallery/asakusa.jpg";
import ducks from "@/public/gallery/ducks.jpg";
import coastRoad from "@/public/gallery/coast-road.jpg";
import cupid from "@/public/gallery/cupid.jpg";
import kiskadee from "@/public/gallery/kiskadee.jpg";
import penguins from "@/public/gallery/penguins.jpg";
import seaLion from "@/public/gallery/sea-lion.jpg";

export type FrameKind = "gilt" | "black" | "oak" | "mat" | "float";
export type HangSize = "S" | "M" | "L";

/** Series of paintings hung together in one room on /gallery. */
export const COLLECTIONS = {
  "argentinas-fauna": { title: "Argentina’s Fauna", status: "Ongoing series" },
} as const;
export type CollectionId = keyof typeof COLLECTIONS;

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
  /** Set to hang the painting with its series instead of in its own room. */
  collection?: CollectionId;
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
    crop: crop(0.04, 0.085, 0.02, 0.085),
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
    crop: crop(0.235, 0.17, 0.205, 0.065),
    collection: "argentinas-fauna",
  },
  {
    id: "penguins",
    image: penguins,
    title: "Penguins at Dusk",
    year: "2025",
    medium: "Acrylic on canvas board",
    frame: "black",
    size: "S",
    crop: crop(0.215, 0.13, 0.22, 0.095),
    collection: "argentinas-fauna",
  },
  {
    id: "sea-lion",
    image: seaLion,
    title: "Sea Lion",
    year: "2025",
    medium: "Acrylic on canvas board",
    frame: "oak",
    size: "S",
    crop: crop(0.25, 0.165, 0.21, 0.095),
    collection: "argentinas-fauna",
  },
];

/** Width / height of the painted area once the crop is applied. */
export function aspect({ image, crop: c }: Artwork) {
  return (image.width * (1 - c.l - c.r)) / (image.height * (1 - c.t - c.b));
}
