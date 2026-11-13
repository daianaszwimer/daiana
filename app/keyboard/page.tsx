import type { Metadata, Viewport } from "next";
import { Keyboard } from "@/app/components/keyboard/keyboard";

export const metadata: Metadata = {
  title: 'Keyboard',
  description: 'A 26-key piano you play with your computer keyboard, with a live piano roll, chord names and MIDI out.',
  alternates: { canonical: '/keyboard' },
  openGraph: {
    siteName: 'Daiana Szwimer',
    type: 'website',
    url: '/keyboard',
    title: 'Keyboard · Daiana Szwimer',
    description: 'Type q to m to play a piano in the browser.',
  },
}

export const viewport: Viewport = {
  viewportFit: 'cover',
  themeColor: '#0b0b0c',
}

export default function KeyboardPage() {
  return <Keyboard />;
}
