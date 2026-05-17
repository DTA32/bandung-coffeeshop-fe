import CafeCard from '@/components/explore/CafeCard'
import type { CafeListing } from '@/lib/api/search'

export default function FeaturedCafes({ cafes }: { cafes: CafeListing[] }) {
  return (
    <section className="flex flex-1 flex-col gap-6 bg-cream px-6 md:px-20 py-8 w-full">
      <h2 className="m-0 text-2xl md:text-3xl font-bold text-forest">
        Featured Cafes
      </h2>
      <div className="flex overflow-scroll gap-5 pb-2">
        {cafes.map((cafe) => (
          <CafeCard key={cafe.id} cafe={cafe} />
        ))}
        {cafes.length === 0 && (
          <div className="flex justify-center items-center h-48 w-full">
            <p className="text-md leading-[1.7] m-0 text-bark">
              {' '}
              No featured cafes at the moment.{' '}
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
