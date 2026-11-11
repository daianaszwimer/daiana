import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://www.daiana.dev", lastModified: new Date(), priority: 1 },
    { url: "https://www.daiana.dev/gallery", lastModified: new Date(), priority: 0.8 },
  ]
}