import {
  useNavigate,
  useRouteContext,
  useRouterState,
} from '@tanstack/react-router'
import { LayoutGrid, List, Map } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import SearchBox from '@/components/SearchBox'
import CafeCard from '@/components/explore/CafeCard'
import CafeListItem from '@/components/explore/CafeListItem'
import ExplorePanel from '@/components/explore/ExplorePanel'
import ExploreContent from '@/components/explore/ExploreContent'
import Pagination from '@/components/explore/Pagination'
import type { SrpContent } from '@/lib/srp'
import type { FilterOptions } from '@/lib/api/filters'
import { buildExploreH1, srpLocationClause } from '@/lib/seoTemplate'
import LocaleLink from '@/components/LocaleLink'
import type { ExploreSearch, SearchCafesData } from '@/lib/api/search'
import { cleanExploreSearch } from '@/lib/api/search'
import { SORT_OPTIONS } from '@/lib/constants'
import { useLocale, localeParam } from '@/lib/locale'
import type { LocationData } from '@/lib/api/location'

// Shared error UI for both explore routes.
export function ExploreError() {
  const { t } = useTranslation()
  return (
    <main className="flex flex-1 flex-col items-center gap-4 justify-center text-xl text-moss-dark text-center">
      <p>{t('errors.exploreLoadFailedTitle')}</p>
      <p className="text-lg">{t('errors.exploreLoadFailedBody')}</p>
      <LocaleLink
        to="/{-$locale}"
        className="py-4 px-8 text-sm bg-forest text-cream rounded-lg"
      >
        {t('errors.backToHome')}
      </LocaleLink>
    </main>
  )
}

// Shown when the focused location doesn't exist (unknown slug, or an invalid
// path depth) — distinct from a generic fetch failure.
export function ExploreNotFound() {
  const { t } = useTranslation()
  return (
    <main className="flex flex-1 flex-col items-center gap-4 justify-center text-xl text-moss-dark text-center">
      <p>{t('errors.notFoundTitle')}</p>
      <p className="text-lg">{t('errors.notFoundBody')}</p>
      <LocaleLink
        to="/{-$locale}/explore"
        className="py-4 px-8 text-sm bg-forest text-cream rounded-lg"
      >
        {t('explore.browseAllCafes')}
      </LocaleLink>
    </main>
  )
}

export default function ExplorePage({
  data,
  search,
  location,
  appliedFilters,
  srpContent,
  locationSplat,
  filterOptions,
}: {
  data: SearchCafesData
  search: ExploreSearch
  location?: LocationData
  appliedFilters?: Partial<ExploreSearch>
  srpContent?: SrpContent
  locationSplat?: string
  filterOptions?: FilterOptions
}) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const locale = useLocale()
  const isLoading = useRouterState({ select: (s) => s.isLoading })
  const { ua } = useRouteContext({ from: '__root__' })
  const isMobile = ua.isMobile

  // Resolved values with defaults applied
  const page = search.page ?? 1
  const sort = search.sort ?? 'default'
  const view = search.view ?? 'grid'
  const mapView = search.map_view === true
  const totalPages = Math.ceil(data.total / (search.size ?? 8))

  // Single map marker derived from query_coords ("lat,lng")
  const marker = (() => {
    if (!search.query_coords) return null
    const [lat, lng] = search.query_coords.split(',').map(Number)
    return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null
  })()

  // Path-encoded filters (pretty URL) merged onto the query-string search. Used
  // ONLY for display: the filter button's count and the modal's pre-selection.
  // Relative navigation (goTo/Pagination) must keep using the raw `search`, or
  // path filters would double up as query params under the unchanged path.
  const effectiveSearch: ExploreSearch = { ...search, ...appliedFilters }

  const locationClause = srpLocationClause(data.formatted_location_name, t)
  const h1 = buildExploreH1(srpContent?.crumbs ?? [], locationClause, t, locale)

  // Search-only update → stay on the current location path (relative nav).
  function goTo(update: ExploreSearch) {
    navigate({
      to: '.',
      search: cleanExploreSearch({ ...search, ...update }),
    })
  }

  // Applying filters lifts them OUT of the pretty path and into the query
  // string: navigate to the location-only path (or base /explore when
  // unfocused), never a /explore/<…filters> URL. The modal's update carries the
  // complete filter set, so the location stays pretty while the filters live in
  // the query. On the index/location routes (no filter path) this resolves to
  // the same destination as goTo.
  function applyFilters(update: ExploreSearch) {
    const next = cleanExploreSearch({ ...search, ...update })
    if (locationSplat) {
      navigate({
        to: '/{-$locale}/explore/$',
        params: { locale: localeParam(locale), _splat: locationSplat },
        search: next,
      })
    } else {
      navigate({
        to: '/{-$locale}/explore',
        params: { locale: localeParam(locale) },
        search: next,
      })
    }
  }

  // Placing a marker switches to coordinate search → the base /explore route
  // (drops any location path; coordinate search has no natural path).
  function placeMarker(lat: number, lng: number, opts?: { replace?: boolean }) {
    navigate({
      to: '/{-$locale}/explore',
      params: { locale: localeParam(locale) },
      search: cleanExploreSearch({
        ...search,
        // Coordinate search is mutually exclusive with a location focus.
        query_id: undefined,
        query_type: undefined,
        map_view: true,
        query_coords: `${lat},${lng}`,
        radius_max: 1500,
        page: 1,
        sort: 'distance',
      }),
      replace: opts?.replace ?? false,
    })
  }

  const sortOptions =
    search.query_coords !== undefined
      ? [...SORT_OPTIONS, { value: 'distance', label: 'distance' }]
      : SORT_OPTIONS

  const activeSort = sortOptions.some((o) => o.value === sort)
    ? sort
    : 'default'

  // Grid / List / Show-Map controls, shared between the mobile bar and the desktop header.
  function viewControls(mobile: boolean) {
    const toggleBtnBase = mobile
      ? 'flex rounded-lg cursor-pointer items-center gap-1.5 px-3 py-1.5 text-sm transition border border-grove-light'
      : 'flex rounded-lg cursor-pointer items-center gap-1.5 border-none px-3 py-1.5 text-sm transition'
    const toggleBtnClass = (active: boolean) =>
      `${toggleBtnBase} ${active ? 'bg-forest text-cream' : 'bg-transparent text-forest hover:bg-grove-light'}`

    const showMapToggle = location?.show_map
      ? mobile && mapView
      : mobile || !mapView

    return (
      <div
        className={
          mobile
            ? `flex items-center gap-2 w-full bg-white justify-between ${showMapToggle && 'flex-row-reverse'} px-4 py-2 border-b border-grove-light/50`
            : 'flex items-center gap-2'
        }
      >
        {showMapToggle && (
          <button
            onClick={() =>
              goTo({
                map_view: mapView ? undefined : true,
                view: mapView ? undefined : 'list',
              })
            }
            aria-pressed={mapView}
            className={`flex cursor-pointer items-center gap-1.5 text-sm rounded-lg transition ${
              mobile
                ? `px-3 py-1.5 border border-grove-light ${mapView ? 'bg-forest text-cream' : 'bg-white text-forest hover:bg-grove-light'}`
                : 'px-4 py-2.5 bg-white text-forest hover:bg-grove-light'
            }`}
          >
            <Map size={14} aria-hidden="true" />
            {mobile ? t('explore.map') : t('explore.showMap')}
          </button>
        )}
        <div
          className={
            mobile
              ? 'flex overflow-hidden rounded-lg bg-white gap-2'
              : 'flex overflow-hidden rounded-lg border border-white bg-white p-1 '
          }
        >
          <button
            onClick={() => goTo({ view: 'grid' })}
            aria-pressed={view === 'grid'}
            className={toggleBtnClass(view === 'grid')}
          >
            <LayoutGrid size={14} aria-hidden="true" />
            {t('explore.grid')}
          </button>
          <button
            onClick={() => goTo({ view: 'list' })}
            aria-pressed={view === 'list'}
            className={toggleBtnClass(view === 'list')}
          >
            <List size={14} aria-hidden="true" />
            {t('explore.list')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <main
      className={`flex flex-col bg-cream flex-1 transition-opacity ${isLoading ? 'opacity-50' : 'opacity-100'}`}
    >
      <SearchBox
        variant="srp"
        initialQuery={data.location_name ?? ''}
        search={effectiveSearch}
        onApplyFilters={applyFilters}
        filterOptions={filterOptions}
      />
      {isMobile && viewControls(isMobile)}
      {isMobile && (
        <ExplorePanel
          mapView={mapView}
          isMobile={isMobile}
          location={location}
          marker={marker}
          results={data}
          onPlace={placeMarker}
          onHideMap={() => goTo({ map_view: undefined, view: undefined })}
          onExpandMap={() => goTo({ map_view: true, view: 'list' })}
        />
      )}

      <div className="mx-auto flex-1 w-full px-6 md:px-16 py-6 flex gap-6 md:justify-center flex-col md:flex-row min-h-[85vh]">
        {!isMobile && (
          <ExplorePanel
            mapView={mapView}
            isMobile={isMobile}
            location={location}
            marker={marker}
            results={data}
            onPlace={placeMarker}
            onHideMap={() => goTo({ map_view: undefined, view: undefined })}
            onExpandMap={() => goTo({ map_view: true, view: 'list' })}
          />
        )}
        <div className="flex flex-col w-full max-w-screen-2xl">
          <h1 className="text-bark mb-4 font-medium">{h1}</h1>
          <div className="mb-6 flex items-center justify-between gap-2 md:text-center">
            {!isMobile && viewControls(isMobile)}

            <h2 className="text-sm text-bark">
              {t('explore.cafesFound', { count: data.total })}
            </h2>

            <div className="flex items-center gap-2 shrink-0">
              <label htmlFor="sort-select" className="text-sm text-bark">
                {t('explore.sortBy')}
              </label>
              <select
                id="sort-select"
                value={activeSort}
                onChange={(e) => goTo({ sort: e.target.value, page: 1 })}
                className="cursor-pointer rounded-md py-1.5 text-sm text-grove focus:outline-none w-fit field-sizing-content pe-2"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {t(`explore.sortOptions.${opt.value}`)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            {data.cafes.length === 0 ? (
              <div className="flex h-128 items-center justify-center text-lg text-bark">
                {t('explore.noCafesFound')}
              </div>
            ) : view === 'grid' ? (
              <div
                className={`grid gap-6
                grid-cols-2 md:grid-cols-3
                ${mapView ? `xl:grid-cols-4` : `lg:grid-cols-4`}
              `}
              >
                {data.cafes.map((cafe) => (
                  <CafeCard key={cafe.id} cafe={cafe} small={false} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {data.cafes.map((cafe) => (
                  <CafeListItem key={cafe.id} cafe={cafe} />
                ))}
              </div>
            )}

            <Pagination
              page={page}
              totalPages={totalPages}
              searchForPage={(p) => cleanExploreSearch({ ...search, page: p })}
            />
          </div>
        </div>
      </div>

      {srpContent && <ExploreContent content={srpContent} locale={locale} />}
    </main>
  )
}
