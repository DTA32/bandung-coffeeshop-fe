import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// The <link rel="alternate" hreflang href> tags seoHead renders, in page order.
// React SSR keeps the prop casing (hrefLang), so match case-insensitively and
// in any attribute order.
function hreflangLinks(
  html: string,
): Array<{ href: string; hreflang: string }> {
  const refs: Array<{ href: string; hreflang: string }> = []
  for (const [tag] of html.matchAll(/<link\b[^>]*>/gi)) {
    if (!/\brel="alternate"/i.test(tag)) continue
    const hreflang = tag.match(/\bhreflang="([^"]+)"/i)?.[1]
    const href = tag.match(/\bhref="([^"]+)"/i)?.[1]
    if (hreflang && href)
      refs.push({ href: href.replace(/&amp;/g, '&'), hreflang })
  }
  return refs
}

const config = defineConfig(({ mode }) => ({
  preview: {
    host: '127.0.0.1',
  },
  resolve: { tsconfigPaths: true },
  plugins: [
    tanstackStart({
      server: {
        build: {
          staticNodeEnv: true,
        },
      },
      prerender: {
        enabled: true,
        crawlLinks: true,
        failOnError: false,
        concurrency: 5,
        // Patches must be RETURNED — `page` is a zod-parsed copy, mutating it
        // does nothing.
        onSuccess: ({ page, html }) => {
          // The page's hreflang links → sitemap <xhtml:link rel="alternate">,
          // so each id URL carries its /en twin (prune-sitemap then drops the
          // /en <url> entries themselves).
          const alternateRefs = hreflangLinks(html)
          // Cafe pages: lift review.updated_at (rendered as JSON-LD
          // "dateModified" by cafeJsonLd) into sitemap <lastmod>.
          const lastmod = /^\/cafe\//.test(page.path)
            ? html.match(/"dateModified":"([^"]+)"/)?.[1]
            : undefined
          return {
            sitemap: {
              ...(alternateRefs.length > 0 && { alternateRefs }),
              ...(lastmod && { lastmod }),
            },
          }
        },
      },
      sitemap: {
        enabled: true,
        host: 'https://bdgcafe.com',
      },
    }),
    tailwindcss(),
    mode !== 'production' ? devtools() : null,
    viteReact(),
  ],
}))

export default config
