import { useCallback } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import ReviewsCard from './ReviewsCard'

const cafeRoute = getRouteApi('/{-$locale}/cafe/$cafeId')

interface ReviewWidgetProps {
  cafeId: string
  cafeName: string
  totalReviewCount: number
}

// ReviewWidget wires ReviewsCard to the cafe route's `review=open` search
// param (set by the login round-trip): the modal opens once signed in, then
// the param is dropped from the URL.
export default function ReviewWidget({
  cafeId,
  cafeName,
  totalReviewCount,
}: ReviewWidgetProps) {
  const { review: reviewParam } = cafeRoute.useSearch()
  const navigate = cafeRoute.useNavigate()
  const clearReviewParam = useCallback(() => {
    void navigate({
      search: (prev) => ({ ...prev, review: undefined }),
      replace: true,
      resetScroll: false,
    })
  }, [navigate])
  return (
    <ReviewsCard
      cafeId={cafeId}
      cafeName={cafeName}
      totalReviewCount={totalReviewCount}
      autoOpen={reviewParam === 'open'}
      onAutoOpenHandled={clearReviewParam}
    />
  )
}
