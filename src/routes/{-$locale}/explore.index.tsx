import { createFileRoute } from '@tanstack/react-router'
import ExplorePage, {
  ExploreError,
  ExploreNotFound,
} from '@/components/explore/ExplorePage'
import { searchCafes } from '@/lib/api/search'
import type { SearchCafesData } from '@/lib/api/search'
import { getFilterOptions } from '@/lib/api/filters'
import type { FilterOptions } from '@/lib/api/filters'
import { buildSrpContent } from '@/lib/srp'
import type { SrpContent } from '@/lib/srp'
import { buildExploreSeo } from '@/lib/seoTemplate'
import { seoHead, localizedPath } from '@/lib/seo'
import type { SeoMeta } from '@/lib/seo'
import { exploreLoaderDeps, validateExploreSearch } from '@/lib/explore'
import { createI18n, normalizeLocale } from '@/i18n'

interface IndexLoaderData {
  searchData: SearchCafesData
  srpContent: SrpContent
  seo: SeoMeta
  filterOptions: FilterOptions | undefined
}

export const Route = createFileRoute('/{-$locale}/explore/')({
  validateSearch: validateExploreSearch,
  loaderDeps: ({ search }) => exploreLoaderDeps(search),
  head: (ctx: any) => {
    const loaderData = ctx.loaderData as IndexLoaderData | undefined
    return loaderData ? seoHead(loaderData.seo) : {}
  },
  loader: async ({ deps, params }) => {
    const lang = normalizeLocale(params.locale)
    const [searchData, filterOptions] = await Promise.all([
      searchCafes(deps, lang),
      getFilterOptions(lang).catch(() => undefined),
    ])
    const srpContent = buildSrpContent([], filterOptions)

    const page = deps.page ?? 1
    const canonicalPath =
      localizedPath(lang, '/explore') + (page > 1 ? `?page=${page}` : '')
    const i18n = createI18n(lang)
    const seo = buildExploreSeo({
      crumbs: srpContent.crumbs,
      cafes: searchData.cafes,
      formattedLocationName: searchData.formatted_location_name,
      canonicalPath,
      t: (k) => i18n.t(k),
      locale: lang,
    })
    return { searchData, srpContent, seo, filterOptions }
  },
  errorComponent: ExploreError,
  notFoundComponent: ExploreNotFound,
  component: ExploreIndex,
})

function ExploreIndex() {
  const { searchData, srpContent, filterOptions } = Route.useLoaderData()
  const search = Route.useSearch()
  return (
    <ExplorePage
      data={searchData}
      search={search}
      srpContent={srpContent}
      filterOptions={filterOptions}
    />
  )
}
