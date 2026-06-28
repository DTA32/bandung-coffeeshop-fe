import { useTranslation } from 'react-i18next'
import LocaleLink from '@/components/LocaleLink'
import Breadcrumb from '@/components/Breadcrumb'
import ExploreBlurb from '@/components/explore/ExploreBlurb'
import type { SrpContent, SrpItem } from '@/lib/srp'
import { formatSrpLabel, exploreCrumbs } from '@/lib/seoTemplate'
import type { Locale } from '@/i18n'

function VariantLinks({ items, locale }: { items: SrpItem[]; locale: string }) {
  const { t } = useTranslation()
  if (items.length === 0) return null

  return (
    <nav
      aria-label={t('explore.exploreMore')}
      className="flex flex-col gap-2 md:w-1/2"
    >
      <h2 className="text-sm font-semibold text-forest">
        {t('explore.exploreMore')}
      </h2>
      <ul className="flex flex-wrap gap-2 p-0 m-0 list-none">
        {items.map((v) => (
          <li key={v.url}>
            <LocaleLink
              to="/{-$locale}/explore/$"
              params={{ _splat: v.url }}
              className="inline-block rounded-full bg-surface px-3 py-1.5 text-sm text-forest no-underline transition hover:bg-grove-light"
            >
              {formatSrpLabel(v, t, locale)}
            </LocaleLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

// Bottom-of-page SEO block: variant links + breadcrumb. Direct child of
// ExplorePage, below the results/pagination, aligned to the end. Receives the
// pre-selected {name, type, url} lists from the loader — never the full filter
// metadata. The breadcrumb reuses the generic <Breadcrumb>, fed by exploreCrumbs
// (the same crumb data as the breadcrumb JSON-LD).
export default function ExploreContent({
  content,
  locale,
}: {
  content: SrpContent
  locale: Locale
}) {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col self-end gap-12 px-6 md:px-16 pb-8 w-full">
      <div className="flex flex-col md:flex-row gap-8">
        <ExploreBlurb items={content.blurb} />
        <VariantLinks items={content.variants} locale={locale} />
      </div>
      <Breadcrumb items={exploreCrumbs(content.crumbs, t, locale)} />
    </div>
  )
}
