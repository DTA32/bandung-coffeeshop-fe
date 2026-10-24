import { cn } from '@/lib/cn'
import { REVIEW_CARD_CLASS } from './ReviewCard'

// SkeletonReview is a placeholder review card shown while reviews load.
export default function SkeletonReview() {
  return (
    <div
      aria-hidden="true"
      className={cn(REVIEW_CARD_CLASS, 'flex flex-col gap-3 p-4')}
    >
      <span className="block h-4 w-28 animate-pulse rounded-full bg-grove-light" />
      <span className="block h-3 w-20 animate-pulse rounded-full bg-grove-light" />
      <span className="mt-1 block h-3 w-full animate-pulse rounded-full bg-grove-light" />
      <span className="block h-3 w-full animate-pulse rounded-full bg-grove-light" />
      <span className="block h-3 w-2/3 animate-pulse rounded-full bg-grove-light" />
    </div>
  )
}
