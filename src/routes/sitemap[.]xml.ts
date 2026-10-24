import { createFileRoute } from '@tanstack/react-router'
import { getFilterOptions } from '@/lib/api/filters'
import { getSitemapData } from '@/lib/api/sitemap'
import { renderSitemapXml, sitemapEntries } from '@/lib/sitemap'

// How long a built sitemap is served before the next request rebuilds it.
const TTL_MS = 60 * 60 * 1000

let cached: { xml: string; builtAt: number } | null = null
let building: Promise<string> | null = null

async function build(): Promise<string> {
  const [data, options] = await Promise.all([
    getSitemapData(),
    getFilterOptions(),
  ])
  return renderSitemapXml(sitemapEntries(data, options))
}

// Concurrent requests share one in-flight build.
function rebuild(): Promise<string> {
  building ??= build()
    .then((xml) => {
      cached = { xml, builtAt: Date.now() }
      return xml
    })
    .finally(() => {
      building = null
    })
  return building
}

function xmlResponse(xml: string): Response {
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}

// /sitemap.xml, generated from live data (GET /v1/sitemap). A failed rebuild
// serves the last good copy; with none yet it's a 503, never an empty or partial
// sitemap.
export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: async () => {
        if (cached && Date.now() - cached.builtAt < TTL_MS) {
          return xmlResponse(cached.xml)
        }
        try {
          return xmlResponse(await rebuild())
        } catch (err) {
          console.error(`sitemap: rebuild failed: ${String(err)}`)
          if (cached) return xmlResponse(cached.xml)
          return new Response('Sitemap temporarily unavailable', {
            status: 503,
            headers: { 'Retry-After': '300' },
          })
        }
      },
    },
  },
})
