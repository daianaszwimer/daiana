import type { Metadata } from "next";
import { Gallery } from "@/app/components/gallery/gallery";

export const metadata: Metadata = {
  title: "Gallery · Daiana",
  description: "Paintings by Daiana.",
};

export default function GalleryPage() {
  return <Gallery />;
}
