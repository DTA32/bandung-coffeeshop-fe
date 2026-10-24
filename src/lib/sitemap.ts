import type { FilterOptions } from '@/lib/api/filters'
import type { SitemapData } from '@/lib/api/sitemap'
import { SITE_URL, alternateLinks } from '@/lib/seo'
import {
  buildSrpRegistry,
  countSrpFilters,
  isIndexableSrp,
  resolveSrp,
} from '@/lib/srp'

// Pages with no data behind them. They carry no <lastmod>: a build or request
// date tells crawlers nothing.
const STATIC_PATHS = [
  '/',
  '/explore',
  '/meet-in-the-middle',
  '/about',
  '/privacy-policy',
  '/closed-cafes',
]

interface SitemapEntry {
  path: string // bare (Indonesian) path
  lastmod?: string
}

// The sitemap's pages: the static ones, every active or closed cafe, and the
// indexable SRPs. Only the bare (default-locale) URL of each page is listed; its
// /en twin rides along as an hreflang alternate. SRP paths go through the same
// registry, canonical ordering and isIndexableSrp verdict as the SRP loader, so
// a listed SRP never 301s or renders noindex.
export function sitemapEntries(
  data: SitemapData,
  options: FilterOptions,
): SitemapEntry[] {
  const entries: SitemapEntry[] = STATIC_PATHS.map((path) => ({ path }))

  for (const cafe of data.cafes) {
    entries.push({ path: `/cafe/${cafe.id}`, lastmod: cafe.updated_at })
  }

  const registry = buildSrpRegistry(options)
  for (const srp of data.srps) {
    const segments = srp.filter
      ? [...srp.locations, srp.filter.slug]
      : srp.locations
    const resolved = resolveSrp(segments, registry)
    // A location id that collides with a filter slug resolves differently on
    // the page too; leave it out rather than list a URL that means something
    // else.
    if (
      !resolved ||
      resolved.locationIds.join('/') !== srp.locations.join('/')
    ) {
      continue
    }
    const indexable = isIndexableSrp({
      filterCount: countSrpFilters(resolved.params),
      resultCount: srp.count,
    })
    if (!indexable) continue
    entries.push({
      path: `/explore/${resolved.canonical}`,
      lastmod: srp.last_modified,
    })
  }

  return entries
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

// Renders the entries as a sitemap with hreflang alternates, per Google's
// localized-versions format. The namespace is the protocol's exact http:// URI.
export function renderSitemapXml(entries: SitemapEntry[]): string {
  const urls = entries.map(({ path, lastmod }) => {
    const lines = [`    <loc>${escapeXml(SITE_URL + path)}</loc>`]
    if (lastmod) lines.push(`    <lastmod>${escapeXml(lastmod)}</lastmod>`)
    for (const link of alternateLinks(path)) {
      lines.push(
        `    <xhtml:link rel="alternate" hreflang="${link.hrefLang}" href="${escapeXml(link.href)}" />`,
      )
    }
    return `  <url>\n${lines.join('\n')}\n  </url>`
  })
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...urls,
    '</urlset>',
    '',
  ].join('\n')
}
