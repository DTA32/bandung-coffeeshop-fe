import { cn } from '@/lib/cn'
import LocaleLink from '@/components/LocaleLink'
import Image from '@/components/Image'
import type { CafeListing } from '@/lib/api/search'

// Matches grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
const GRID_SIZES =
  '(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw'

export default function CafeCard({
  cafe,
  showBorder = false,
  small = true,
  imageSizes,
}: {
  cafe: CafeListing
  showBorder?: boolean
  small?: boolean
  // Rendered slot width for the srcset; grid callers with different column
  // counts should pass their own. Defaults to the 1/2/3/4-column grid.
  imageSizes?: string
}) {
  let formattedRemark = cafe.remark
  if (cafe.price_range && cafe.remark) {
    formattedRemark = `${cafe.price_range} • ${cafe.remark}`
  } else if (cafe.price_range) {
    formattedRemark = cafe.price_range
  }
  let description = cafe.description
  if (cafe.area) {
    description = cafe.area + ', Bandung'
  }
  const linkTitle = `${cafe.name} • ${description} ${formattedRemark ? `• ${formattedRemark}` : ''}`
  return (
    <LocaleLink
      to="/{-$locale}/cafe/$cafeId"
      params={{ cafeId: cafe.id }}
      className={cn(
        'flex flex-col overflow-hidden rounded-xl bg-surface no-underline transition hover:shadow-md w-full shrink-0',
        showBorder && 'border-[0.5px] border-grove-light',
        small && 'max-w-xs'
      )}
      title={linkTitle}
    >
      <div className="aspect-video h-36 md:h-auto w-full overflow-hidden bg-grove-light">
        {cafe.thumbnail && (
          <Image
            src={cafe.thumbnail}
            alt={cafe.name}
            layout="constrained"
            width={small ? 320 : 640}
            aspectRatio={16 / 9}
            sizes={small ? undefined : (imageSizes ?? GRID_SIZES)}
            className="h-full w-full object-cover"
          />
        )}
      </div>
      <div className="flex flex-col gap-2 p-4 min-h-24">
        <div className="flex flex-col gap-1">
          <h3 className="font-semibold text-forest line-clamp-1 m-0">
            {cafe.name}
          </h3>
          <span className="text-sm text-bark line-clamp-1">{description}</span>
        </div>
        {formattedRemark && (
          <span className="text-xs text-bark line-clamp-1">
            {formattedRemark}
          </span>
        )}
      </div>
    </LocaleLink>
  )
}
