import {
  createFileRoute,
  Link,
  notFound,
  useRouteContext,
} from '@tanstack/react-router'
import { getCafe, getCafeReview } from '@/lib/api/cafe'
import { getNearbyCafes } from '@/lib/api/search'
import CafeHero from '@/components/cafe-detail/CafeHero'
import CafeHeroNoImage from '@/components/cafe-detail/CafeHeroNoImage'
import CafeTitle from '@/components/cafe-detail/CafeTitle'
import ReviewCard from '@/components/cafe-detail/ReviewCard'
import RatingsCard from '@/components/cafe-detail/RatingsCard'
import Disclaimer from '@/components/cafe-detail/Disclaimer'
import QuickFacts from '@/components/cafe-detail/QuickFacts'
import ScoreCard from '@/components/cafe-detail/ScoreCard'
import PriceCard from '@/components/cafe-detail/PriceCard'
import UpdatedAt from '@/components/cafe-detail/UpdatedAt'
import NearbyCafe from '@/components/cafe-detail/NearbyCafe'
import { TriangleAlert } from 'lucide-react'

export const Route = createFileRoute('/cafe/$cafeId')({
  loader: async ({ params }) => {
    let cafe: Awaited<ReturnType<typeof getCafe>>
    try {
      cafe = await getCafe(params.cafeId)
    } catch (e: any) {
      if (e.message === '404') throw notFound()
      throw e
    }
    const review = await getCafeReview(params.cafeId)
    const nearbyCafes = await getNearbyCafes(params.cafeId)
    return { cafe, review, nearbyCafes }
  },
  errorComponent: () => (
    <div className="flex flex-col h-screen md:h-128 items-center gap-4 justify-center text-xl text-moss-dark text-center">
      <p>Failed to load cafe detail.</p>
      <p className="text-lg">
        Uh oh, something went wrong. Please try again later.
      </p>
      <Link
        to="/"
        className="py-4 px-8 text-sm bg-forest text-cream rounded-lg"
      >
        Back to home
      </Link>
    </div>
  ),
  notFoundComponent: () => (
    <div className="flex flex-col items-center justify-center gap-4 py-32 text-forest">
      <p className="text-2xl font-semibold">Cafe not found</p>
      <p className="mt-2 text-bark">
        This cafe doesn't exist or already deleted.
      </p>
      <Link
        to="/"
        className="py-4 px-8 text-sm bg-forest text-cream rounded-lg"
      >
        Back to home
      </Link>
    </div>
  ),
  component: CafeDetailPage,
})

function Widgets(): React.JSX.Element {
  const { cafe, review, nearbyCafes } = Route.useLoaderData()
  const { ua } = useRouteContext({ from: '__root__' })
  if (ua.isMobile) {
    return (
      <div className="flex flex-col gap-y-4 mx-6 my-9 flex-1 min-w-0 shrink-0">
        {cafe.images.length > 0 && (
          <CafeTitle
            id={cafe.id}
            name={cafe.name}
            address={cafe.description}
            isSubjective={review.is_subjective}
          />
        )}
        <QuickFacts
          instagram={cafe.instagram}
          locations={cafe.locations}
          tags={review.tags}
          openHour={cafe.open_hour}
          closeHour={cafe.close_hour}
        />
        <PriceCard price={cafe.price} />
        <ReviewCard content={review.content} visited_at={review.visited_at} />
        <ScoreCard
          overallScore={review.overall_score}
          wfcScore={review.wfc_score}
        />
        <RatingsCard ratings={review.ratings} />
        <NearbyCafe cafes={nearbyCafes.cafes} />
        <div className="flex flex-col">
          <Disclaimer />
          <UpdatedAt updated_at={review.updated_at} />
        </div>
      </div>
    )
  }
  return (
    <div className="flex flex-col md:flex-row gap-x-8 gap-y-4 mx-6 md:mx-16 py-9">
      <div className="flex flex-col gap-6 flex-1 min-w-0">
        {cafe.images.length > 0 && (
          <CafeTitle
            id={cafe.id}
            name={cafe.name}
            address={cafe.description}
            isSubjective={review.is_subjective}
          />
        )}
        <ReviewCard content={review.content} visited_at={review.visited_at} />
        <RatingsCard ratings={review.ratings} />
        <NearbyCafe cafes={nearbyCafes.cafes} />
      </div>
      <div className="flex flex-col gap-6 w-full md:w-80 lg:w-100 shrink-0">
        <QuickFacts
          instagram={cafe.instagram}
          locations={cafe.locations}
          tags={review.tags}
          openHour={cafe.open_hour}
          closeHour={cafe.close_hour}
        />
        <ScoreCard
          overallScore={review.overall_score}
          wfcScore={review.wfc_score}
        />
        <PriceCard price={cafe.price} />
        <div className="flex flex-col">
          <Disclaimer />
          <UpdatedAt updated_at={review.updated_at} />
        </div>
      </div>
    </div>
  )
}

function CafeDetailPage() {
  const { cafe, review } = Route.useLoaderData()

  return (
    <main className="flex flex-col bg-cream min-h-screen">
      {cafe.images.length > 0 ? (
        <CafeHero
          image={cafe.images}
          cafeName={cafe.name}
          gmapsId={cafe.gmaps_id}
        />
      ) : (
        <CafeHeroNoImage
          id={cafe.id}
          name={cafe.name}
          address={cafe.description}
          isSubjective={review.is_subjective}
          gmapsId={cafe.gmaps_id}
        />
      )}
      {cafe.status !== 'active' && (
        <div className="rounded-2xl bg-red-50 p-4 mx-6 md:mx-16 mt-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TriangleAlert size={20} className="text-red-400" />
            </div>
            <div className="flex flex-col ml-3 text-red-800">
              <p className="font-medium">This cafe is {cafe.status}.</p>
              <p className="text-sm">Explore other cafes nearby below</p>
            </div>
          </div>
        </div>
      )}
      <Widgets />
    </main>
  )
}
