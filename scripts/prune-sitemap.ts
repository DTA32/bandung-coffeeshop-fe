// Post-build sitemap prune — run after `vite build` (see package.json).
//
// The prerender crawler (crawlLinks: true) registers every path it finds for the
// sitemap, so the raw sitemap lists every reachable page. This keeps only the
// URLs worth indexing, dropping:
//   - missing:  prerender with failOnError:false swallows non-2xx pages (e.g.
//               zero-result /explore filter combos that 404) but their sitemap
//               entries remain — the crawler registers a path before fetching
//               it. A failed page never writes dist/client/<path>/index.html,
//               so file absence identifies dead URLs.
//   - paginated: any ?page= URL. Pages 2+ stay indexable (no noindex), but only
//               page 1 is listed — Google finds the rest via pagination links.
//   - noindex:  pages whose prerendered HTML carries a robots noindex meta
//               (multi-filter / thin SRPs, see isIndexableSrp in src/lib/srp.ts).
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const DIST = path.resolve(import.meta.dirname, '../dist/client')
const SITEMAP = path.join(DIST, 'sitemap.xml')

type PruneReason = 'missing' | 'paginated' | 'noindex'

// Sitemap <loc> → the file prerender would have written for it: query/hash
// dropped, trailing slash tolerated, autoSubfolderIndex layout.
export function locToHtmlFile(loc: string): string {
  const pathname = decodeURIComponent(new URL(loc).pathname)
  const clean = pathname.replace(/\/+$/, '')
  if (clean === '') return 'index.html'
  if (clean.endsWith('.html')) return clean.slice(1)
  return `${clean.slice(1)}/index.html`
}

// <meta name="robots" content="noindex, …">, in either attribute order.
const NOINDEX_META =
  /<meta(?=[^>]*\bname="robots")(?=[^>]*\bcontent="[^"]*noindex)[^>]*>/i

// Why a sitemap URL should be dropped, or null to keep it. readPage returns the
// prerendered HTML for a dist-relative path, or null when it wasn't written.
export function pruneReason(
  loc: string,
  readPage: (relHtmlPath: string) => string | null,
): PruneReason | null {
  if (new URL(loc).searchParams.has('page')) return 'paginated'
  const html = readPage(locToHtmlFile(loc))
  if (html === null) return 'missing'
  if (NOINDEX_META.test(html)) return 'noindex'
  return null
}

export function pruneSitemap(
  xml: string,
  readPage: (relHtmlPath: string) => string | null,
): { xml: string; kept: number; removed: Array<[string, PruneReason]> } {
  const removed: Array<[string, PruneReason]> = []
  let kept = 0
  const out = xml.replace(/[ \t]*<url>[\s\S]*?<\/url>\r?\n?/g, (block) => {
    const loc = block.match(/<loc>([^<]*)<\/loc>/)?.[1]?.replace(/&amp;/g, '&')
    const reason = loc ? pruneReason(loc, readPage) : null
    if (!loc || !reason) {
      kept += 1
      return block
    }
    removed.push([loc, reason])
    return ''
  })
  return { xml: out, kept, removed }
}

if (import.meta.main) {
  if (!existsSync(SITEMAP)) {
    console.error(`prune-sitemap: ${SITEMAP} not found — did vite build run?`)
    process.exit(1)
  }
  const { xml, kept, removed } = pruneSitemap(
    readFileSync(SITEMAP, 'utf8'),
    (rel) => {
      const file = path.join(DIST, rel)
      return existsSync(file) ? readFileSync(file, 'utf8') : null
    },
  )
  if (kept === 0 && removed.length === 0) {
    console.error('prune-sitemap: no <url> entries found — format change?')
    process.exit(1)
  }
  const counts: Record<PruneReason, number> = {
    missing: 0,
    paginated: 0,
    noindex: 0,
  }
  for (const [loc, reason] of removed) {
    counts[reason] += 1
    if (reason === 'missing') console.log(`prune-sitemap: removed ${loc} (404)`)
  }
  if (removed.length > 0) writeFileSync(SITEMAP, xml)
  console.log(
    `prune-sitemap: kept ${kept}, removed ${removed.length} ` +
      `(missing ${counts.missing}, paginated ${counts.paginated}, noindex ${counts.noindex})`,
  )
}
