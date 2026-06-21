import {
  createFileRoute,
  notFound,
  
  redirect
} from '@tanstack/react-router'
import type {NotFoundRouteProps} from '@tanstack/react-router';
import ExplorePage, {
  ExploreError,
  ExploreNotFound,
} from '@/components/explore/ExplorePage'
import { searchCafes } from '@/lib/api/search'
import type { ExploreSearch, SearchCafesData } from '@/lib/api/search'
import {
  exploreLoaderDeps,
  validateExploreSearch,
  LOCATION_DEPTH,
} from '@/lib/explore'
import { getLocation } from '@/lib/api/location'
import type { LocationData } from '@/lib/api/location'
import { getFilterOptions } from '@/lib/api/filters'
import type { FilterOptions } from '@/lib/api/filters'
import { buildSrpRegistry, resolveSrp, buildSrpContent } from '@/lib/srp'
import type { SrpContent } from '@/lib/srp'
import { buildExploreSeo } from '@/lib/seoTemplate'
import { seoHead, localizedPath } from '@/lib/seo'
import type { SeoMeta } from '@/lib/seo'
import { createI18n, normalizeLocale } from '@/i18n'

interface SplatLoaderData {
  searchData: SearchCafesData
  locationData: LocationData | undefined
  appliedFilters: Partial<ExploreSearch>
  srpContent: SrpContent
  seo: SeoMeta
  locationSplat: string | undefined
  filterOptions: FilterOptions
}

// SRP pretty URLs. The splat is a sequence of slugs that pre-fill filters at one
// canonical URL — any mix of location, tag, price, and rating segments:
//   /explore/dago                           location
//   /explore/wfc-friendly                   tag (no location)
//   /explore/dago/wfc-friendly              location × tag
//   /explore/dago/wfc-friendly/quiet-noise  location × tag × rating
// resolveSrp() classifies each segment (see src/lib/srp.ts); the leaf location
// segment is the API query_id and its depth gives the type.
export const Route = createFileRoute('/{-$locale}/explore/$')({
  validateSearch: validateExploreSearch,
  loaderDeps: ({ search }) => exploreLoaderDeps(search),
  head: (ctx: any) => {
    const loaderData = ctx.loaderData as SplatLoaderData | undefined
    return loaderData ? seoHead(loaderData.seo) : {}
  },
  loader: async ({ params, deps, location }) => {
    const lang = normalizeLocale(params.locale)
    const segments = (params._splat ?? '').split('/').filter(Boolean)

    // The tag/price/rating slug registry comes from /v1/filters (cached per
    // locale); location is the fallback axis, resolved against the location
    // service below. enrich=true so the SRP page also gets the filter blurbs.
    const options = await getFilterOptions(lang, true)
    const resolved = resolveSrp(segments, buildSrpRegistry(options))
    if (!resolved) throw notFound()

    // One canonical URL per page: if the request used a different segment order
    // (e.g. /explore/wfc-friendly/dago), 301 to the canonical ordering.
    if (resolved.canonical !== segments.join('/')) {
      throw redirect({
        to: '/{-$locale}/explore/$',
        params: { locale: params.locale, _splat: resolved.canonical },
        search: location.search,
      })
    }

    // Optional location focus: the leaf location segment is the query_id and its
    // depth in the chain (1/2/3) maps to district/area/poi.
    let focus: { query_id: string; query_type: string } | undefined
    const depth = resolved.locationIds.length
    if (depth > 0) {
      focus = {
        query_id: resolved.locationIds[depth - 1],
        query_type: LOCATION_DEPTH[depth - 1],
      }
    }

    // A filter variant (filters in the path, e.g. /explore/dago/wfc-friendly) is
    // a filtered search, not a location landing — so we DON'T load locationData.
    // ExplorePage then renders no location detail and ignores show_map, exactly
    // like a filter-only or coordinate search. A pure location SRP still loads
    // it. (locationSplat below keeps the focus available for applyFilters.)
    const hasPathFilters = Object.keys(resolved.params).length > 0

    const [locationData, searchData] = await Promise.all([
      focus && !hasPathFilters
        ? getLocation(focus.query_id, lang)
        : Promise.resolve(undefined as LocationData | undefined),
      searchCafes({ ...deps, ...focus, ...resolved.params }, lang),
    ])

    if (Array.isArray(locationData)) {
      throw new Error('Expected single location, got array')
    }

    // The location's ancestor chain must match the path prefix exactly, so a
    // location can't be reached under the wrong parents. (Only checked for a
    // pure location SRP, where locationData is loaded.)
    if (locationData) {
      const expected = [
        ...locationData.ancestors.map((a) => a.id),
        locationData.id,
      ]
      if (
        expected.length !== resolved.locationIds.length ||
        expected.some((id, i) => id !== resolved.locationIds[i])
      ) {
        throw notFound()
      }
    }

    // Pre-formatted variant links + breadcrumb for ExploreContent. The splat is
    // canonical here (the redirect above already ran).
    const srpContent = buildSrpContent(segments, options)

    // SEO: canonical keeps only ?page (the one param worth indexing per page).
    const page = deps.page ?? 1
    const canonicalPath =
      localizedPath(
        lang,
        resolved.canonical ? `/explore/${resolved.canonical}` : '/explore',
      ) + (page > 1 ? `?page=${page}` : '')
    const i18n = createI18n(lang)
    const seo = buildExploreSeo({
      crumbs: srpContent.crumbs,
      cafes: searchData.cafes,
      formattedLocationName: searchData.formatted_location_name,
      canonicalPath,
      t: (k) => i18n.t(k),
      locale: lang,
    })

    const toReturn = {
      searchData,
      locationData,
      // appliedFilters: the filters this pretty URL encodes in its PATH (not the
      // query string), so the filter button's count + modal pre-selection match.
      appliedFilters: resolved.params,
      srpContent,
      seo,
      // The location-only path (no filter slugs), kept so applyFilters can lift
      // filters into the query string instead of building a pretty filter URL.
      locationSplat: resolved.locationIds.join('/') || undefined,
      // Already fetched above for the registry — hand it to the filter modal so
      // it doesn't refetch /v1/filters on open.
      filterOptions: options,
    }

    if (searchData.cafes.length === 0) {
      throw notFound({ data: toReturn })
    }

    return toReturn
  },
  errorComponent: ExploreError,
  notFoundComponent: (props: NotFoundRouteProps) => {
    const data = props.data as SplatLoaderData | undefined
    if (data) {
      return <ExplorePage data={data.searchData} search={Route.useSearch()} />
    }
    return <ExploreNotFound />
  },
  component: ExploreSplat,
})

function ExploreSplat() {
  const {
    searchData,
    locationData,
    appliedFilters,
    srpContent,
    locationSplat,
    filterOptions,
  } = Route.useLoaderData()
  const search = Route.useSearch()
  return (
    <ExplorePage
      data={searchData}
      search={search}
      location={locationData}
      appliedFilters={appliedFilters}
      srpContent={srpContent}
      locationSplat={locationSplat}
      filterOptions={filterOptions}
    />
  )
}
