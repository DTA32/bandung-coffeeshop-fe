import { createFileRoute } from '@tanstack/react-router'
import { getFeaturedCafes } from '@/lib/api/search'
import Hero from '@/components/Hero'
import FeaturedCafes from '@/components/FeaturedCafes'
import DistrictList from '@/components/DistrictList'
import { getLocation } from '@/lib/api/location'

export const Route = createFileRoute('/')({
  loader: async () => {
    const [featuredCafes, districts] = await Promise.all([
      getFeaturedCafes().catch(() => ({ cafes: [] })),
      getLocation().catch(() => []),
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
    <main className="flex flex-col min-h-screen gap-8">
      <Hero />
      <FeaturedCafes cafes={featuredCafes.cafes} />
      <DistrictList districts={districts} />
    </main>
  )
}
