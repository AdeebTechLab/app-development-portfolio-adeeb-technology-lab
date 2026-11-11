// Writes public/sitemap.xml and public/robots.txt at the start of every production build,
// listing the home page, the work page and every published project in src/data/site-data.json.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'

interface Data {
  projects?: Array<{ slug?: string; published?: boolean; updatedAt?: number }>
}

export function writeSitemap(siteUrl: string) {
  const site = siteUrl.replace(/\/$/, '')
  const today = new Date().toISOString().slice(0, 10)
  let data: Data = {}
  try {
    data = JSON.parse(readFileSync('src/data/site-data.json', 'utf8')) as Data
  } catch (err) {
    console.warn(`[sitemap] Could not read src/data/site-data.json (${(err as Error).message}).`)
  }
  const urls = [
    { loc: `${site}/`, lastmod: today, priority: '1.0' },
    { loc: `${site}/work`, lastmod: today, priority: '0.9' },
  ]
  for (const p of data.projects ?? []) {
    if (!p.published || !p.slug || !/^[a-z0-9-]+$/.test(p.slug)) continue
    urls.push({ loc: `${site}/work/${p.slug}`, lastmod: p.updatedAt ? new Date(p.updatedAt).toISOString().slice(0, 10) : today, priority: '0.8' })
  }
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u.loc}</loc><lastmod>${u.lastmod}</lastmod><priority>${u.priority}</priority></url>`).join('\n')}
</urlset>
`
  const robots = `User-agent: *
Allow: /
Disallow: /admin

Sitemap: ${site}/sitemap.xml
`
  mkdirSync('public', { recursive: true })
  writeFileSync('public/sitemap.xml', xml)
  writeFileSync('public/robots.txt', robots)
  console.log(`[sitemap] Wrote public/sitemap.xml (${urls.length} URLs) and public/robots.txt`)
}
