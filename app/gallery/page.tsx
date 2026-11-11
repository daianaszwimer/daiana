import type { Metadata } from "next";
import { Gallery } from "@/app/components/gallery/gallery";

export const metadata: Metadata = {
  title: 'Gallery',
  description: 'Paintings by Daiana Szwimer: acrylic and oil on canvas and paper.',
  alternates: { canonical: '/gallery' },
  openGraph: {
    siteName: 'Daiana Szwimer',
    type: 'website',
    url: '/gallery',
    title: 'Gallery · Daiana Szwimer',
    description: 'Paintings by Daiana Szwimer.',
  },
}

export default function GalleryPage() {
  return <Gallery />;
}
