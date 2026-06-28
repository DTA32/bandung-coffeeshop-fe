import LocaleLink from '@/components/LocaleLink'
import Image from '@/components/Image'
import type { CafeListing } from '@/lib/api/search'

export default function CafeCard({
  cafe,
  showBorder = false,
  small = true,
}: {
  cafe: CafeListing
  showBorder?: boolean
  small?: boolean
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
      className={`flex flex-col overflow-hidden rounded-xl bg-surface no-underline transition hover:shadow-md w-full shrink-0
      ${showBorder && `border-[0.5px] border-grove-light`}
      ${small && `max-w-xs`}
      `}
      title={linkTitle}
    >
      <div className="aspect-video w-full overflow-hidden bg-grove-light">
        {cafe.thumbnail && (
          <Image
            src={cafe.thumbnail}
            alt={cafe.name}
            layout="constrained"
            width={320}
            aspectRatio={16 / 9}
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
