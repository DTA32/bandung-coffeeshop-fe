import { createFileRoute } from '@tanstack/react-router'
import { Hero, FeaturedCafes, DistrictList } from '@/components/home'
import { getFeaturedCafes } from '@/lib/api/search'
import { getLocation } from '@/lib/api/location'
import {
  seoHead,
  localizedPath,
  websiteJsonLd,
  organizationJsonLd,
} from '@/lib/seo'
import type { SeoMeta } from '@/lib/seo'
import { createI18n, normalizeLocale } from '@/i18n'

export const Route = createFileRoute('/{-$locale}/')({
  head: (ctx: any) => {
    const locale = normalizeLocale(ctx.params.locale)
    const i18n = createI18n(locale)
    const seo: SeoMeta = {
      title: i18n.t('seo.homeTitle'),
      description: i18n.t('seo.homeDesc'),
      canonicalPath: localizedPath(locale, '/'),
      jsonLd: [websiteJsonLd(locale), organizationJsonLd()],
    }
    return seoHead(seo)
  },
  loader: async ({ params }) => {
    const lang = normalizeLocale(params.locale)
    const [featuredCafes, districts] = await Promise.all([
      getFeaturedCafes(lang).catch(() => ({ cafes: [] })),
      getLocation(undefined, lang).catch(() => []),
    ])
    return { featuredCafes, districts }
  },
  component: HomePage,
})

function HomePage() {
  const { featuredCafes, districts } = Route.useLoaderData()
  if (!Array.isArray(districts)) {
    throw new Error('Expected districts to be an array')
  }
  return (
    <main className="flex flex-col min-h-screen gap-8 mb-8">
      <Hero />
      <FeaturedCafes cafes={featuredCafes.cafes} />
      <DistrictList districts={districts} />
    </main>
  )
}
