import { Link } from '@tanstack/react-router'
import type { CafeListing } from '@/lib/api/search'

export default function CafeListItem({
  cafe,
  smallVersion = false,
  withBorder = false,
  openNewTab = false,
}: {
  cafe: CafeListing
  smallVersion?: boolean
  withBorder?: boolean
  openNewTab?: boolean
}) {
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
  return (
    <Link
      to="/cafe/$cafeId"
      target={openNewTab ? '_blank' : undefined}
      params={{ cafeId: cafe.id }}
      className={`flex gap-4 rounded-xl ${smallVersion ? `h-20` : `h-25`} bg-white no-underline transition hover:bg-grove-light/20 ${withBorder ? 'border border-grove-light' : ''}`}
    >
      <div
        className={`${smallVersion ? `w-20 h-20` : `w-35`} shrink-0 overflow-hidden rounded-l-lg bg-grove-light`}
      >
        {cafe.thumbnail && (
          <img
            src={cafe.thumbnail}
            alt={cafe.name}
            className="h-full w-full object-cover"
          />
        )}
      </div>
      <div className="flex flex-col justify-center gap-1">
        <h3
          className={`font-semibold text-forest m-0 ${smallVersion ? `text-sm` : ''}`}
        >
          {cafe.name}
        </h3>
        {distanceStr && (
          <span
            className={`${smallVersion ? 'text-xs' : `text-sm`} text-grove`}
          >
            {distanceStr} away
          </span>
        )}
        {!distanceStr && description && (
          <span
            className={`${smallVersion ? 'text-xs' : `text-sm`} text-bark line-clamp-1`}
          >
            {description}
          </span>
        )}
        {formattedRemark && (
          <span
            className={`${smallVersion ? 'text-xs' : `text-sm`} text-bark line-clamp-1`}
          >
            {formattedRemark}
          </span>
        )}
      </div>
    </Link>
  )
}
