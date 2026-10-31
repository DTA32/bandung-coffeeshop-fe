import { createFileRoute } from '@tanstack/react-router'
import { getFilterOptions } from '@/lib/api/filters'
import { getSitemapData } from '@/lib/api/sitemap'
import { renderSitemapXml, sitemapEntries } from '@/lib/sitemap'

// /sitemap.xml, generated per request from GET /v1/sitemap (which the backend
// caches). If the backend fails it's a 503, never an empty or partial sitemap.
export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: async () => {
        try {
          const [data, options] = await Promise.all([
            getSitemapData(),
            getFilterOptions(),
          ])
          return new Response(renderSitemapXml(sitemapEntries(data, options)), {
            headers: {
              'Content-Type': 'application/xml; charset=utf-8',
              'Cache-Control': 'public, max-age=3600',
            },
          })
        } catch (err) {
          console.error(`sitemap: build failed: ${String(err)}`)
          return new Response('Sitemap temporarily unavailable', {
            status: 503,
            headers: { 'Retry-After': '300' },
          })
        }
      },
    },
  },
})
