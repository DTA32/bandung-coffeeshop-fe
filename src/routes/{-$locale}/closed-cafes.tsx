import { createFileRoute, notFound } from '@tanstack/react-router'
import { z } from 'zod'
import { ClosedCafesPage } from '@/components/closed-cafes'
import { ExploreError, ExploreNotFound } from '@/components/explore'
import { searchCafes } from '@/lib/api/search'
import type { SearchCafesData } from '@/lib/api/search'
import { buildClosedCafesSeo } from '@/lib/seoTemplate'
import { seoHead } from '@/lib/seo'
import type { SeoMeta } from '@/lib/seo'
import { createI18n, normalizeLocale } from '@/i18n'

const PAGE_SIZE = 8

// Only ?page is URL-addressable here; invalid / page 1 values drop out.
const ClosedCafesSearchSchema = z.object({
  page: z.preprocess((v) => {
    const n = Number(v)
    return Number.isInteger(n) && n > 1 ? n : undefined
  }, z.number().optional()),
})

interface ClosedCafesLoaderData {
  searchData: SearchCafesData
  seo: SeoMeta
}

export const Route = createFileRoute('/{-$locale}/closed-cafes')({
  validateSearch: (search: Record<string, unknown>) =>
    ClosedCafesSearchSchema.parse(search),
  loaderDeps: ({ search }) => ({ page: search.page ?? 1 }),
  head: (ctx: any) => {
    const loaderData = ctx.loaderData as ClosedCafesLoaderData | undefined
    return loaderData ? seoHead(loaderData.seo) : {}
  },
  loader: async ({ deps, params }): Promise<ClosedCafesLoaderData> => {
    const lang = normalizeLocale(params.locale)
    const searchData = await searchCafes(
      { status: 'closed', page: deps.page, size: PAGE_SIZE },
      lang,
    )
    if (deps.page > 1 && searchData.cafes.length === 0) throw notFound()

    const i18n = createI18n(lang)
    const seo = buildClosedCafesSeo({
      cafes: searchData.cafes,
      page: deps.page,
      t: (k) => i18n.t(k),
      locale: lang,
    })
    return { searchData, seo }
  },
  errorComponent: ExploreError,
  notFoundComponent: ExploreNotFound,
  component: ClosedCafes,
})

function ClosedCafes() {
  const { searchData } = Route.useLoaderData()
  const { page } = Route.useLoaderDeps()
  return <ClosedCafesPage data={searchData} page={page} size={PAGE_SIZE} />
}
