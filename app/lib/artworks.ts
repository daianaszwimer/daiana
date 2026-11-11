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
  /** Alt text: what the painting shows, for people who can't see it. */
  description: string;
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
    description:
      "Overhead view of people crossing a zebra crossing at midday, each trailing a long deep-blue shadow across the white stripes.",
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
    description:
      "A yellow house with a red tiled roof behind a black iron gate, a tree throwing its shadow across the facade and the tiled sidewalk.",
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
    description:
      "Three women in floral yukata, seen from behind, standing on a stone plaza before a large red temple gate under a blue sky.",
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
    description:
      "Two yellow ducks in polka-dot headscarves and red cat-eye sunglasses sharing red wine at a green table against a pink wall.",
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
    description:
      "A small blue car driving down a dirt road between rows of bright flowers and the sea, under purple clouds.",
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
    description:
      "A winged cupid seated on a stone ledge in a garden, looking down at a small violet flower.",
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
    description:
      "A kiskadee with a bright yellow chest and a black-and-white striped head, perched on a branch against dense green leaves.",
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
    description:
      "Two penguins standing close together, one leaning into the other, against an orange and violet sunset.",
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
    description:
      "A golden sea lion propped up on its front flippers, head tilted to the sky, among yellow and green rocks.",
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
