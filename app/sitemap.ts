import type { MetadataRoute } from 'next'
import { PROJECTS } from '@/app/lib/projects'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://www.daiana.dev", lastModified: new Date(), priority: 1 },
    { url: "https://www.daiana.dev/gallery", lastModified: new Date(), priority: 0.8 },
    ...PROJECTS.map(({ slug }) => ({
      url: `https://www.daiana.dev/projects/${slug}`,
      lastModified: new Date(),
      priority: 0.9,
    })),
  ]
}