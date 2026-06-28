import { useTranslation } from 'react-i18next'
import { CafeCard } from '@/components/cafe'
import type { CafeListing } from '@/lib/api/search'

export default function NearbyCafe({ cafes }: { cafes: CafeListing[] }) {
  const { t } = useTranslation()
  if (cafes.length === 0) {
    return null
  }
  return (
    <section className="bg-white rounded-2xl p-5 flex flex-col gap-4">
      <h2 className="m-0 text-base font-bold text-forest">
        {t('cafe.otherCafesNearby')}
      </h2>
      <div className="flex overflow-scroll gap-5 pb-2">
        {cafes.map((cafe) => (
          <CafeCard key={cafe.id} cafe={cafe} showBorder={true} />
        ))}
      </div>
    </section>
  )
}
