import { createFileRoute } from '@tanstack/react-router'
import { getFeaturedCafes } from '@/lib/api/search'
import Hero from '@/components/Hero'
import FeaturedCafes from '@/components/FeaturedCafes'
import DistrictList from '@/components/DistrictList'
import { getLocation } from '@/lib/api/location'
import { normalizeLocale } from '@/i18n'

export const Route = createFileRoute('/{-$locale}/')({
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
