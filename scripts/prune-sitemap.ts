// Post-build sitemap prune — run after `vite build` (see package.json).
//
// Prerender with failOnError:false swallows non-2xx pages (e.g. zero-result
// /explore filter combos that 404) but their sitemap entries remain: the
// crawler registers a path for the sitemap before fetching it. A failed page
// never writes dist/client/<path>/index.html, so file absence identifies dead
// URLs. Limitation: a query-string URL maps to its base page's file, so an
// out-of-range ?page= that 404'd survives if the base page exists — the
// pagination UI only links in-range pages.
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const DIST = path.resolve(import.meta.dirname, '../dist/client')
const SITEMAP = path.join(DIST, 'sitemap.xml')

// Sitemap <loc> → the file prerender would have written for it: query/hash
// dropped, trailing slash tolerated, autoSubfolderIndex layout.
export function locToHtmlFile(loc: string): string {
  const pathname = decodeURIComponent(new URL(loc).pathname)
  const clean = pathname.replace(/\/+$/, '')
  if (clean === '') return 'index.html'
  if (clean.endsWith('.html')) return clean.slice(1)
  return `${clean.slice(1)}/index.html`
}

export function pruneSitemap(
  xml: string,
  pageExists: (relHtmlPath: string) => boolean,
): { xml: string; kept: number; removed: Array<string> } {
  const removed: Array<string> = []
  let kept = 0
  const out = xml.replace(/[ \t]*<url>[\s\S]*?<\/url>\r?\n?/g, (block) => {
    const loc = block.match(/<loc>([^<]*)<\/loc>/)?.[1]?.replace(/&amp;/g, '&')
    if (!loc || pageExists(locToHtmlFile(loc))) {
      kept += 1
      return block
    }
    removed.push(loc)
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
    (rel) => existsSync(path.join(DIST, rel)),
  )
  if (kept === 0 && removed.length === 0) {
    console.error('prune-sitemap: no <url> entries found — format change?')
    process.exit(1)
  }
  for (const loc of removed) console.log(`prune-sitemap: removed ${loc}`)
  if (removed.length > 0) writeFileSync(SITEMAP, xml)
  console.log(`prune-sitemap: kept ${kept}, removed ${removed.length}`)
}
