import { createFileRoute } from '@tanstack/react-router'
import Hero from '@/components/Hero'
import FeaturedCafes from '@/components/FeaturedCafes'

export const Route = createFileRoute('/')({ component: HomePage })

function HomePage() {
  return (
    <main className={"flex flex-col"}>
      <Hero />
      <FeaturedCafes />
    </main>
  )
}
