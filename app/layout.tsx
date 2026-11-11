import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { DEFAULT_PHASE, PHASE_SCRIPT } from "@/app/lib/phase";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.daiana.dev'),
  title: {
    default: 'Daiana Szwimer',
    template: '%s · Daiana Szwimer',
  },
  description:
      'Senior product engineer based in Buenos Aires, focused on frontend. Building great apps for the web.',
  authors: [{ name: 'Daiana Szwimer', url: 'https://www.daiana.dev' }],
  openGraph: {
    siteName: 'Daiana Szwimer',
    type: 'website',
    locale: 'en_US',
  },
  twitter: { card: 'summary_large_image' },
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-phase={DEFAULT_PHASE}
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: PHASE_SCRIPT }} />
      </head>
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
