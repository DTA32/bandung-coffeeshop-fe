import { createFileRoute } from '@tanstack/react-router'
import { getFeaturedCafes } from '@/lib/api/search'
import Hero from '@/components/Hero'
import FeaturedCafes from '@/components/FeaturedCafes'

export const Route = createFileRoute('/')({
  loader: async () => {
    try {
      return await getFeaturedCafes()
    } catch {
      return { cafes: [] }
    }
  },
  component: HomePage,
})
function HomePage() {
  const data = Route.useLoaderData()
  return (
    <main className="flex flex-col">
      <Hero />
      <FeaturedCafes cafes={data.cafes} />
    </main>
  )
}
