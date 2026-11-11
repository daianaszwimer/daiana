import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const isProd = process.env.VERCEL_ENV === 'production'
  return {
    rules: isProd ? { userAgent: '*', allow: '/' } : { userAgent: '*', disallow: '/' },
    sitemap: 'https://daiana.dev/sitemap.xml',
  }
}