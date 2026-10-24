import {
  createFileRoute,
  notFound,
  useRouteContext,
} from '@tanstack/react-router'
import { getCafe, getCafeReview, getCafeFeed } from '@/lib/api/cafe'
import { getNearbyCafes } from '@/lib/api/search'
import {
  CafeHero,
  CafeTitle,
  AboutCard,
  LatestUpdatesWidget,
  RatingsCard,
  QuickFacts,
  ScoreCard,
  PriceCard,
  UpdatedAt,
  NearbyCafe,
  ReviewWidget,
} from '@/components/cafe-detail'
import LocaleLink from '@/components/LocaleLink'
import Breadcrumb from '@/components/Breadcrumb'
import { TriangleAlert } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { JSX } from 'react'
import { useLocale } from '@/lib/locale'
import {
  seoHead,
  localizedPath,
  cafeJsonLd,
  cafeCrumbs,
  breadcrumbJsonLd,
} from '@/lib/seo'
import type { SeoMeta } from '@/lib/seo'
import { buildCafeMeta } from '@/lib/seoTemplate'
import { createI18n, normalizeLocale } from '@/i18n'

interface CafeSearch {
  // `open` reopens the review modal after the login round-trip (LoginModal's
  // review intent). Client-only: never part of the canonical URL.
  review?: 'open'
}

export const Route = createFileRoute('/{-$locale}/cafe/$cafeId')({
  validateSearch: (search: Record<string, unknown>): CafeSearch =>
    search.review === 'open' ? { review: 'open' } : {},
  // ctx typed `any`: see explore.$ for the head↔loader inference caveat.
  head: (ctx: any) => {
    const loaderData = ctx.loaderData as { seo?: SeoMeta } | undefined
    return loaderData?.seo ? seoHead(loaderData.seo) : {}
  },
  loader: async ({ params }) => {
    const lang = normalizeLocale(params.locale)
    let cafe: Awaited<ReturnType<typeof getCafe>>
    try {
      cafe = await getCafe(params.cafeId, lang)
    } catch (e: any) {
      if (e.message === '404') throw notFound()
      throw e
    }
    const [review, nearbyCafes, feed] = await Promise.all([
      getCafeReview(params.cafeId, lang),
      getNearbyCafes(params.cafeId, lang),
      getCafeFeed(params.cafeId).catch(() => []),
    ])

    // SEO: query-driven title/description built from the cafe's own data (see buildCafeMeta); og:image is the first cafe photo when present
    const i18n = createI18n(lang)
    const t = (k: string, o?: Record<string, unknown>) => i18n.t(k, o)
    const { title, description } = buildCafeMeta({
      cafe,
      review,
      t,
      locale: lang,
    })
    const canonicalPath = localizedPath(lang, `/cafe/${params.cafeId}`)
    const seo: SeoMeta = {
      title,
      description,
      canonicalPath,
      locale: lang,
      ogImage: cafe.images[0]?.url,
      jsonLd: [
        cafeJsonLd(cafe, review, canonicalPath),
        breadcrumbJsonLd(cafeCrumbs(cafe, (k) => i18n.t(k), lang)),
      ],
    }
    return { cafe, review, nearbyCafes, feed, seo }
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
  const { cafe, review, nearbyCafes, feed } = Route.useLoaderData()
  const { ua } = useRouteContext({ from: '__root__' })
  const { t } = useTranslation()
  if (ua.isMobile) {
    return (
      <div className="flex flex-col gap-y-4 mx-6 my-9 flex-1 min-w-0 shrink-0">
        {cafe.images.length > 0 && (
          <CafeTitle id={cafe.id} name={cafe.name} address={cafe.description} />
        )}
        <QuickFacts
          instagram={cafe.instagram}
          menu={cafe.menu ?? null}
          locations={cafe.locations}
          tags={review.tags}
          openHour={cafe.open_hour}
          closeHour={cafe.close_hour}
        />
        <PriceCard price={cafe.price} />
        <AboutCard about={cafe.about} />
        <LatestUpdatesWidget items={feed} />
        <ScoreCard
          overallScore={review.overall_score}
          wfcScore={review.wfc_score}
          overallReviewCount={review.overall_review_count}
          wfcReviewCount={review.wfc_review_count}
        />
        <ReviewWidget
          cafeId={cafe.id}
          cafeName={cafe.name}
          totalReviewCount={review.total_review_count}
        />
        <RatingsCard ratings={review.ratings} />
        <NearbyCafe cafes={nearbyCafes.cafes} />
        <UpdatedAt updated_at={cafe.updated_at} />
      </div>
    )
  }
  return (
    <div className="flex flex-col md:flex-row gap-x-8 gap-y-4 mx-6 md:mx-16 py-8">
      <div className="flex flex-col gap-6 flex-1 min-w-0">
        {cafe.images.length > 0 && (
          <CafeTitle id={cafe.id} name={cafe.name} address={cafe.description} />
        )}
        <AboutCard about={cafe.about} />
        <LatestUpdatesWidget items={feed} />
        <ReviewWidget
          cafeId={cafe.id}
          cafeName={cafe.name}
          totalReviewCount={review.total_review_count}
        />
        <RatingsCard ratings={review.ratings} />
        <NearbyCafe cafes={nearbyCafes.cafes} />
      </div>
      <aside
        aria-label={t('cafe.detailsRegion')}
        className="flex flex-col gap-6 w-full md:w-80 lg:w-100 shrink-0"
      >
        <QuickFacts
          instagram={cafe.instagram}
          menu={cafe.menu ?? null}
          locations={cafe.locations}
          tags={review.tags}
          openHour={cafe.open_hour}
          closeHour={cafe.close_hour}
        />
        <ScoreCard
          overallScore={review.overall_score}
          wfcScore={review.wfc_score}
          overallReviewCount={review.overall_review_count}
          wfcReviewCount={review.wfc_review_count}
        />
        <PriceCard price={cafe.price} />
        <UpdatedAt updated_at={cafe.updated_at} />
      </aside>
    </div>
  )
}

function CafeStatusBanner({ status }: { status: string }) {
  const { t } = useTranslation()
  return (
    <div className="rounded-2xl bg-error-bg p-4 mx-6 md:mx-16 mt-4">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <TriangleAlert
            size={20}
            className="text-error-accent"
            aria-hidden="true"
          />
        </div>
        <div className="flex flex-col ml-3 text-error">
          <p className="font-medium">
            {t('cafe.statusBannerTitle', {
              status: t(`cafe.statusLabel.${status}`, {
                defaultValue: status,
              }),
            })}
          </p>
          <p className="text-sm">{t('cafe.statusBannerBody')}</p>
        </div>
      </div>
    </div>
  )
}

function CafeDetailPage() {
  const { cafe } = Route.useLoaderData()
  const { t } = useTranslation()
  const locale = useLocale()

  return (
    <main className="flex flex-col bg-cream min-h-screen">
      <CafeHero
        id={cafe.id}
        name={cafe.name}
        address={cafe.description}
        image={cafe.images}
        gmapsId={cafe.gmaps_id}
      />
      {cafe.status !== 'active' && <CafeStatusBanner status={cafe.status} />}
      <Widgets />
      <Breadcrumb
        items={cafeCrumbs(cafe, t, locale)}
        className="mx-6 md:mx-16 mb-4"
      />
    </main>
  )
}
