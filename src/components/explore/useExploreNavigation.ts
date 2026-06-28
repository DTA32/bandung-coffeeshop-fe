import { useNavigate } from '@tanstack/react-router'
import { cleanExploreSearch } from '@/lib/api/search'
import type { ExploreSearch } from '@/lib/api/search'
import { SORT_OPTIONS } from '@/lib/constants'
import { useLocale, localeParam } from '@/lib/locale'

interface UseExploreNavigationOptions {
  search: ExploreSearch
  locationSplat: string | undefined
}

export interface UseExploreNavigationReturn {
  // Navigation handlers
  goTo: (update: ExploreSearch) => void
  applyFilters: (update: ExploreSearch) => void
  placeMarker: (lat: number, lng: number, opts?: { replace?: boolean }) => void
  // Derived values tightly coupled to the navigation logic
  marker: { lat: number; lng: number } | null
  sortOptions: { value: string; label: string }[]
  activeSort: string
}

// Centralises the three navigation actions used by ExplorePage so the
// component body only deals with rendering. Also derives `marker`,
// `sortOptions`, and `activeSort` which all depend on the same search object.
export function useExploreNavigation({
  search,
  locationSplat,
}: UseExploreNavigationOptions): UseExploreNavigationReturn {
  const navigate = useNavigate()
  const locale = useLocale()

  // Single map marker derived from query_coords ("lat,lng")
  const marker = (() => {
    if (!search.query_coords) return null
    const [lat, lng] = search.query_coords.split(',').map(Number)
    return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null
  })()

  const sort = search.sort ?? 'default'

  const sortOptions =
    search.query_coords !== undefined
      ? [...SORT_OPTIONS, { value: 'distance', label: 'distance' }]
      : SORT_OPTIONS

  const activeSort = sortOptions.some((o) => o.value === sort)
    ? sort
    : 'default'

  // Search-only update → stay on the current location path (relative nav).
  function goTo(update: ExploreSearch) {
    navigate({
      to: '.',
      search: cleanExploreSearch({ ...search, ...update }),
    })
  }

  // Applying filters lifts them OUT of the pretty path and into the query
  // string: navigate to the location-only path (or base /explore when
  // unfocused), never a /explore/<…filters> URL. The modal's update carries
  // the complete filter set, so the location stays pretty while the filters
  // live in the query. On the index/location routes (no filter path) this
  // resolves to the same destination as goTo.
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

  return { goTo, applyFilters, placeMarker, marker, sortOptions, activeSort }
}
