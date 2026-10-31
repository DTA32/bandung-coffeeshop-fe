import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/cn'
import LocaleLink from '@/components/LocaleLink'
import Image from '@/components/Image'
import type { CafeListing } from '@/lib/api/search'

export default function CafeListItem({
  cafe,
  withBorder = false,
  openNewTab = false,
}: {
  cafe: CafeListing
  withBorder?: boolean
  openNewTab?: boolean
}) {
  const { t } = useTranslation()
  let formattedRemark = cafe.remark
  let distanceStr = ''
  if (cafe.distance) {
    const distanceKm = cafe.distance / 1000
    distanceStr =
      distanceKm < 1
        ? `${Math.round(cafe.distance)} m`
        : `${distanceKm.toFixed(1)} km`
    formattedRemark = cafe.price_range
      ? `${cafe.area} • ${cafe.price_range}`
      : cafe.area
  } else if (cafe.price_range && cafe.remark) {
    formattedRemark = `${cafe.price_range} • ${cafe.remark}`
  } else if (cafe.price_range) {
    formattedRemark = cafe.price_range
  }
  let description = cafe.description
  if (cafe.area) {
    description = cafe.area + ', Bandung'
  }
  const linkTitle = `${cafe.name} • ${distanceStr ? distanceStr : description} ${formattedRemark ? `• ${formattedRemark}` : ''}`
  return (
    <LocaleLink
      to="/{-$locale}/cafe/$cafeId"
      target={openNewTab ? '_blank' : undefined}
      params={{ cafeId: cafe.id }}
      className={cn(
        'flex gap-4 rounded-xl bg-surface no-underline transition hover:bg-grove-light/20 h-20 md:h-25',
        withBorder && 'border border-grove-light',
      )}
      title={linkTitle}
    >
      <div
        className={'w-20 h-20 md:w-35 md:h-auto shrink-0 overflow-hidden rounded-l-lg bg-grove-light'}
      >
        {cafe.thumbnail && (
          <Image
            src={cafe.thumbnail}
            alt={cafe.name}
            layout="fixed"
            width={140}
            height={100}
            className="h-20 w-20 md:h-25 md:w-35 object-cover"
          />
        )}
      </div>
      <div className="flex flex-col justify-center gap-1">
        <h3
          className={cn(
            'font-semibold text-forest m-0 text-sm md:text-base line-clamp-1 mr-1',
          )}
        >
          {cafe.name}
        </h3>
        {distanceStr && (
          <span
            className={cn('text-xs md:text-sm text-moss')}
          >
            {t('explore.distanceAway', { distance: distanceStr })}
          </span>
        )}
        {!distanceStr && description && (
          <span
            className={cn(
              'text-xs md:text-sm text-bark line-clamp-1',
            )}
          >
            {description}
          </span>
        )}
        {formattedRemark && (
          <span
            className={cn(
              'text-xs md:text-sm text-bark line-clamp-1',
            )}
          >
            {formattedRemark}
          </span>
        )}
      </div>
    </LocaleLink>
  )
}
