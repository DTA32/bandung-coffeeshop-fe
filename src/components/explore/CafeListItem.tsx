import { Link } from '@tanstack/react-router'
import type { CafeListing } from '@/lib/api/search'

export default function CafeListItem({ cafe }: { cafe: CafeListing }) {
  let formattedRemark = cafe.remark
  if (cafe.price_range && cafe.remark) {
    formattedRemark = `${cafe.price_range} • ${cafe.remark}`
  } else if (cafe.price_range) {
    formattedRemark = cafe.price_range
  }
  return (
    <Link
      to="/cafe/$cafeId"
      params={{ cafeId: cafe.id }}
      className="flex gap-4 rounded-xl h-25 bg-white no-underline transition hover:bg-grove-light/20"
    >
      <div className="w-35 shrink-0 overflow-hidden rounded-l-lg bg-grove-light">
        {cafe.thumbnail && (
          <img
            src={cafe.thumbnail}
            alt={cafe.name}
            className="h-full w-full object-cover"
          />
        )}
      </div>
      <div className="flex flex-col justify-center gap-1">
        <span className="font-semibold text-forest">{cafe.name}</span>
        {cafe.area && (
          <span className="text-sm text-bark">{cafe.area}, Bandung</span>
        )}
        {formattedRemark && (
          <span className="text-xs text-bark line-clamp-1">
            {formattedRemark}
          </span>
        )}
      </div>
    </Link>
  )
}
