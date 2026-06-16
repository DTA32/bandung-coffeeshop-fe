import { useTranslation } from 'react-i18next'
import type { RatingsResponse } from '@/lib/api/cafe'
import RatingSlider from './RatingSlider'

interface RatingsCardProps {
  ratings: RatingsResponse
}

export default function RatingsCard({ ratings }: RatingsCardProps) {
  const { t } = useTranslation()
  return (
    <div className="bg-white rounded-2xl p-5 flex flex-col gap-2">
      <h2 className="text-base font-bold text-forest m-0">
        {t('cafe.ratings')}
      </h2>
      {Object.keys(ratings).length === 0 && (
        <div className="flex justify-center items-center h-24">
          <p className="text-sm leading-[1.7] m-0 text-bark">
            {t('cafe.noRatings')}
          </p>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 xl:gap-x-16 divide-y-[0.5px] divide-grove-light">
        {Object.entries(ratings).map(([key, entry]) => (
          <div key={key} className="flex flex-col">
            <RatingSlider
              label={t(`cafe.ratingLabels.${key}`, key)}
              rating={entry}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
