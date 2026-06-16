import {
  createFileRoute,
  notFound,
  useRouteContext,
} from '@tanstack/react-router'
import { getCafe, getCafeReview } from '@/lib/api/cafe'
import { getNearbyCafes } from '@/lib/api/search'
import CafeHero from '@/components/cafe-detail/CafeHero'
import CafeTitle from '@/components/cafe-detail/CafeTitle'
import ReviewCard from '@/components/cafe-detail/ReviewCard'
import RatingsCard from '@/components/cafe-detail/RatingsCard'
import Disclaimer from '@/components/cafe-detail/Disclaimer'
import QuickFacts from '@/components/cafe-detail/QuickFacts'
import ScoreCard from '@/components/cafe-detail/ScoreCard'
import PriceCard from '@/components/cafe-detail/PriceCard'
import UpdatedAt from '@/components/cafe-detail/UpdatedAt'
import NearbyCafe from '@/components/cafe-detail/NearbyCafe'
import LocaleLink from '@/components/LocaleLink'
import { TriangleAlert } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { JSX } from 'react'
import { normalizeLocale } from '@/i18n'

export const Route = createFileRoute('/{-$locale}/cafe/$cafeId')({
  loader: async ({ params }) => {
    const lang = normalizeLocale(params.locale)
    let cafe: Awaited<ReturnType<typeof getCafe>>
    try {
      cafe = await getCafe(params.cafeId, lang)
    } catch (e: any) {
      if (e.message === '404') throw notFound()
      throw e
    }
    const [review, nearbyCafes] = await Promise.all([
      getCafeReview(params.cafeId, lang),
      getNearbyCafes(params.cafeId, lang),
    ])
    return { cafe, review, nearbyCafes }
  },
  errorComponent: CafeErrorComponent,
  notFoundComponent: CafeNotFoundComponent,
  component: CafeDetailPage,
})

function CafeErrorComponent() {
  const { t } = useTranslation()
  return (
    <main className="flex flex-1 flex-col items-center gap-4 justify-center text-xl text-moss-dark text-center">
      <p>{t('errors.cafeLoadFailedTitle')}</p>
      <p className="text-lg">{t('errors.cafeLoadFailedBody')}</p>
      <LocaleLink
        to="/{-$locale}"
        className="py-4 px-8 text-sm bg-forest text-cream rounded-lg"
      >
        {t('errors.backToHome')}
      </LocaleLink>
    </main>
  )
}

function CafeNotFoundComponent() {
  const { t } = useTranslation()
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 py-32 text-forest">
      <p className="text-2xl font-semibold">{t('errors.cafeNotFoundTitle')}</p>
      <p className="mt-2 text-bark">{t('errors.cafeNotFoundBody')}</p>
      <LocaleLink
        to="/{-$locale}"
        className="py-4 px-8 text-sm bg-forest text-cream rounded-lg"
      >
        {t('errors.backToHome')}
      </LocaleLink>
    </main>
  )
}

function Widgets(): JSX.Element {
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
    <div className="flex flex-col md:flex-row gap-x-8 gap-y-4 mx-6 md:mx-16 py-8">
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
      <aside
        aria-label="Cafe details"
        className="flex flex-col gap-6 w-full md:w-80 lg:w-100 shrink-0"
      >
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
      </aside>
    </div>
  )
}

function CafeDetailPage() {
  const { cafe, review } = Route.useLoaderData()
  const { t } = useTranslation()

  return (
    <main className="flex flex-col bg-cream min-h-screen">
      <CafeHero
        id={cafe.id}
        name={cafe.name}
        address={cafe.description}
        image={cafe.images}
        isSubjective={review.is_subjective}
        gmapsId={cafe.gmaps_id}
      />
      {cafe.status !== 'active' && (
        <div className="rounded-2xl bg-red-50 p-4 mx-6 md:mx-16 mt-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TriangleAlert
                size={20}
                className="text-red-400"
                aria-hidden="true"
              />
            </div>
            <div className="flex flex-col ml-3 text-red-800">
              <p className="font-medium">
                {t('cafe.statusBannerTitle', { status: cafe.status })}
              </p>
              <p className="text-sm">{t('cafe.statusBannerBody')}</p>
            </div>
          </div>
        </div>
      )}
      <Widgets />
    </main>
  )
}
