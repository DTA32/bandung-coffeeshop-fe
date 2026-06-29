import {
  createFileRoute,
  notFound,
  useRouteContext,
} from '@tanstack/react-router'
import { getCafe, getCafeReview } from '@/lib/api/cafe'
import { getNearbyCafes } from '@/lib/api/search'
import {
  CafeHero,
  CafeTitle,
  ReviewCard,
  RatingsCard,
  Disclaimer,
  QuickFacts,
  ScoreCard,
  PriceCard,
  UpdatedAt,
  NearbyCafe,
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
import { createI18n, normalizeLocale } from '@/i18n'

export const Route = createFileRoute('/{-$locale}/cafe/$cafeId')({
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
    const [review, nearbyCafes] = await Promise.all([
      getCafeReview(params.cafeId, lang),
      getNearbyCafes(params.cafeId, lang),
    ])

    // SEO: title/description fold in the cafe name + its locality; og:image is the first cafe photo when present
    const i18n = createI18n(lang)
    const locality = cafe.locations.at(-1)?.name
    const location = locality ? `${locality}, Bandung` : 'Bandung'
    const canonicalPath = localizedPath(lang, `/cafe/${params.cafeId}`)
    const seo: SeoMeta = {
      title: i18n.t('seo.cafeTitle', { name: cafe.name }),
      description: i18n.t('seo.cafeDesc', { name: cafe.name, location }),
      canonicalPath,
      locale: lang,
      ogImage: cafe.images[0]?.url,
      jsonLd: [
        cafeJsonLd(cafe, review, canonicalPath),
        breadcrumbJsonLd(cafeCrumbs(cafe, (k) => i18n.t(k), lang)),
      ],
    }
    return { cafe, review, nearbyCafes, seo }
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
  const { t } = useTranslation()
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
        aria-label={t('cafe.detailsRegion')}
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
            {t('cafe.statusBannerTitle', { status })}
          </p>
          <p className="text-sm">{t('cafe.statusBannerBody')}</p>
        </div>
      </div>
    </div>
  )
}

function CafeDetailPage() {
  const { cafe, review } = Route.useLoaderData()
  const { t } = useTranslation()
  const locale = useLocale()

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
      {cafe.status !== 'active' && <CafeStatusBanner status={cafe.status} />}
      <Widgets />
      <Breadcrumb
        items={cafeCrumbs(cafe, t, locale)}
        className="mx-6 md:mx-16 mb-4"
      />
    </main>
  )
}
