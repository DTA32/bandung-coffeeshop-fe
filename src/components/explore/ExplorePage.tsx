import {
  Link,
  useNavigate,
  useRouteContext,
  useRouterState,
} from '@tanstack/react-router'
import { LayoutGrid, List, Map } from 'lucide-react'
import SearchBox from '@/components/search/SearchBox'
import CafeCard from '@/components/explore/CafeCard'
import CafeListItem from '@/components/explore/CafeListItem'
import ExplorePanel from '@/components/explore/ExplorePanel'
import Pagination from '@/components/explore/Pagination'
import type { ExploreSearch, SearchCafesData } from '@/lib/api/search'
import { cleanExploreSearch } from '@/lib/api/search'
import { SORT_OPTIONS } from '@/lib/constants'
import type { LocationData } from '@/lib/api/location'

// Shared error UI for both explore routes.
export function ExploreError() {
  return (
    <div className="flex flex-col h-screen md:h-128 items-center gap-4 justify-center text-xl text-moss-dark text-center">
      <p>Failed to load cafes.</p>
      <p className="text-lg">
        Uh oh, something went wrong while fetching the cafes. Please try again
        later.
      </p>
      <Link
        to="/"
        className="py-4 px-8 text-sm bg-forest text-cream rounded-lg"
      >
        Back to home
      </Link>
    </div>
  )
}

// Shown when the focused location doesn't exist (unknown slug, or an invalid
// path depth) — distinct from a generic fetch failure.
export function ExploreNotFound() {
  return (
    <div className="flex flex-col h-screen md:h-128 items-center gap-4 justify-center text-xl text-moss-dark text-center">
      <p>Not found.</p>
      <p className="text-lg">
        We couldn&apos;t find what you've requested. Try searching for a cafe,
        area, or district.
      </p>
      <Link
        to="/explore"
        className="py-4 px-8 text-sm bg-forest text-cream rounded-lg"
      >
        Browse all cafes
      </Link>
    </div>
  )
}

export default function ExplorePage({
  data,
  search,
  location,
}: {
  data: SearchCafesData
  search: ExploreSearch
  location?: LocationData
}) {
  const navigate = useNavigate()
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

  // Search-only update → stay on the current location path (relative nav).
  function goTo(update: ExploreSearch) {
    navigate({
      to: '.',
      search: cleanExploreSearch({ ...search, ...update }),
    })
  }

  // Placing a marker switches to coordinate search → the base /explore route
  // (drops any location path; coordinate search has no natural path).
  function placeMarker(lat: number, lng: number, opts?: { replace?: boolean }) {
    navigate({
      to: '/explore',
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
      ? [...SORT_OPTIONS, { value: 'distance', label: 'Distance' }]
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

    return (
      <div
        className={
          mobile
            ? 'flex items-center gap-2 w-full bg-white justify-between flex-row-reverse px-4 py-2 border-b border-grove-light/50'
            : 'flex items-center gap-2'
        }
      >
        {(mobile || !mapView) && (
          <button
            onClick={() =>
              goTo({
                map_view: mapView ? undefined : true,
                view: mapView ? undefined : 'list',
              })
            }
            className={`flex cursor-pointer items-center gap-1.5 text-sm rounded-lg transition ${
              mobile
                ? `px-3 py-1.5 border border-grove-light ${mapView ? 'bg-forest text-cream' : 'bg-white text-forest hover:bg-grove-light'}`
                : 'px-4 py-2.5 bg-white text-forest hover:bg-grove-light'
            }`}
          >
            <Map size={14} />
            {mobile ? 'Map' : 'Show Map'}
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
            className={toggleBtnClass(view === 'grid')}
          >
            <LayoutGrid size={14} />
            Grid
          </button>
          <button
            onClick={() => goTo({ view: 'list' })}
            className={toggleBtnClass(view === 'list')}
          >
            <List size={14} />
            List
          </button>
        </div>
      </div>
    )
  }

  return (
    <main className="flex flex-col bg-cream">
      <SearchBox variant="srp" initialQuery={data.location_name ?? ''} />
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
        />
      )}

      <div className="mx-auto w-full px-6 md:px-16 py-6 h-full flex gap-6 md:justify-center flex-col lg:flex-row min-h-screen md:min-h-0">
        {!isMobile && (
          <ExplorePanel
            mapView={mapView}
            isMobile={isMobile}
            location={location}
            marker={marker}
            results={data}
            onPlace={placeMarker}
            onHideMap={() => goTo({ map_view: undefined, view: undefined })}
          />
        )}
        <div className="flex flex-col w-full max-w-screen-2xl">
          <div className="mb-6 flex items-center justify-between gap-2 md:text-center">
            {!isMobile && viewControls(isMobile)}

            <span className="text-sm text-bark">
              {data.total} {data.total === 1 ? 'cafe' : 'cafes'} found
              <span className="font-bold">
                {data.formatted_location_name
                  ? ` ${data.formatted_location_name}`
                  : ''}
              </span>
            </span>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-sm text-bark">Sort by:</span>
              <select
                value={activeSort}
                onChange={(e) => goTo({ sort: e.target.value, page: 1 })}
                className="cursor-pointer rounded-md py-1.5 text-sm text-grove focus:outline-none w-fit field-sizing-content pe-2"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div
            className={`transition-opacity ${isLoading ? 'opacity-50' : 'opacity-100'}`}
          >
            {data.cafes.length === 0 ? (
              <div className="flex h-128 items-center justify-center text-lg text-bark">
                No cafes found.
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
    </main>
  )
}
