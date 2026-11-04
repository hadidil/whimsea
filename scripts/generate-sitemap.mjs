import { existsSync, unlinkSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const siteUrl = process.env.VITE_SITE_URL?.replace(/\/+$/, '')
const outputPath = resolve('public/sitemap.xml')

if (!siteUrl) {
  if (existsSync(outputPath)) unlinkSync(outputPath)
  console.log('VITE_SITE_URL is not set; sitemap generation skipped.')
  process.exit(0)
}

const routes = [
  '/',
  '/shop',
  '/about',
  '/contact',
  '/delivery-returns',
  '/privacy',
  '/terms',
]
const urls = routes
  .map(
    (route) =>
      `  <url><loc>${siteUrl}${route}</loc><changefreq>weekly</changefreq></url>`,
  )
  .join('\n')

writeFileSync(
  outputPath,
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
)
console.log(`Sitemap generated for ${siteUrl}.`)
