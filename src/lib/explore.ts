import type {
  ExploreSearch,
  SearchCafesParams,
} from '@/lib/api/search'

import type { Location, LocationType } from '@/lib/type'

// Path depth → location type. Index 0 = first path segment.
//   /explore/<district>             → depth 1 → district
//   /explore/<district>/<area>      → depth 2 → area
//   /explore/<district>/<area>/<poi>→ depth 3 → poi
export const LOCATION_DEPTH = ['district', 'area', 'poi'] as const
type DepthType = (typeof LOCATION_DEPTH)[number]

// Parse the splat ("<district>/<area>/<poi>") into the leaf's API query.
// TODO support other type (tag, featured, etc.) once we have explore routes for those.
export function parseExploreSplat(
  splat: string | undefined,
): { query_id: string; query_type: DepthType } | null {
  const segments = (splat ?? '').split('/').filter(Boolean)
  if (segments.length < 1 || segments.length > LOCATION_DEPTH.length) return null
  return {
    query_id: segments[segments.length - 1],
    query_type: LOCATION_DEPTH[segments.length - 1],
  }
}

// Expected number of path segments for a location type (cafe → 0, not path-routed).
export function locationTypeDepth(type: LocationType): number {
  return LOCATION_DEPTH.indexOf(type as DepthType) + 1
}

// Build the splat ("<district>/<area>/<poi>") from a location's ancestor chain
// + itself. Used to navigate to the nested explore route.
export function exploreSplat(refs: Location[]): string {
  return refs.map((r) => r.id).join('/')
}

// Shared validateSearch for both explore routes (filters + view + coords only;
// the focused location is in the path, not here).
export function validateExploreSearch(
  search: Record<string, unknown>,
): ExploreSearch {
  return {
    query_id: search.query_id as string | undefined,
    query_type: search.query_type as string | undefined,
    query_coords: search.query_coords as string | undefined,
    radius_max: search.radius_max as number | undefined,
    sort: search.sort as string | undefined,
    page:
      search.page !== undefined
        ? Math.max(1, Number(search.page) || 1)
        : undefined,
    size:
      search.size !== undefined
        ? Math.max(1, Number(search.size) || 8)
        : undefined,
    view:
      search.view === 'list'
        ? 'list'
        : search.view === 'grid'
          ? 'grid'
          : undefined,
    map_view:
      search.map_view === true || search.map_view === 'true' ? true : undefined,
    tag: search.tag as string | undefined,
    rating_category_type: search.rating_category_type as string | undefined,
    rating_category_id: search.rating_category_id as string | undefined,
    is_featured:
      search.is_featured === true || search.is_featured === 'true'
        ? true
        : undefined,
    order:
      search.order === 'asc' ? 'asc' : search.order === 'desc' ? 'desc' : undefined,
  }
}

// Shared loaderDeps → searchCafes params. The base route uses query_id/query_type
// from search as a fallback location focus; the splat route overrides them with
// the path-derived focus ({ ...deps, ...parseExploreSplat(...) }).
export function exploreLoaderDeps(search: ExploreSearch): SearchCafesParams {
  return {
    query_id: search.query_id,
    query_type: search.query_type,
    query_coords: search.query_coords,
    radius_max: search.radius_max,
    sort: search.sort ?? 'default',
    page: search.page ?? 1,
    size: search.size ?? 8,
    tag: search.tag,
    rating_category_type: search.rating_category_type,
    rating_category_id: search.rating_category_id,
    is_featured: search.is_featured,
    order: search.order,
  }
}
