import type { ExploreSearch, SearchCafesParams } from '@/lib/api/search'

import type { Location, LocationType } from '@/lib/type'

// --- Filter (de)serialization ------------------------------------------------
// Single source of truth for the tags/ratings wire formats. If the backend
// param shape ever changes, only these helpers and searchCafes need updating;
// the components always speak string[] / number[].

export function parseTags(raw: string | undefined): string[] {
  if (!raw) return []
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

export function serializeTags(tags: string[]): string | undefined {
  const cleaned = tags.map((s) => s.trim()).filter(Boolean)
  return cleaned.length > 0 ? cleaned.join(',') : undefined
}

export function parseRatingIds(raw: string | undefined): number[] {
  if (!raw) return []
  return raw
    .split(',')
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isInteger(n))
}

export function serializeRatingIds(ids: number[]): string | undefined {
  const cleaned = ids.filter((n) => Number.isInteger(n))
  return cleaned.length > 0 ? cleaned.join(',') : undefined
}

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
  if (segments.length < 1 || segments.length > LOCATION_DEPTH.length)
    return null
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
    open_hour: search.open_hour as string | undefined,
    tags: search.tags as string | undefined,
    price_min:
      search.price_min !== undefined &&
      Number.isFinite(Number(search.price_min))
        ? Number(search.price_min)
        : undefined,
    price_max:
      search.price_max !== undefined &&
      Number.isFinite(Number(search.price_max))
        ? Number(search.price_max)
        : undefined,
    ratings: search.ratings as string | undefined,
    is_featured:
      search.is_featured === true || search.is_featured === 'true'
        ? true
        : undefined,
    order:
      search.order === 'asc'
        ? 'asc'
        : search.order === 'desc'
          ? 'desc'
          : undefined,
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
    open_hour: search.open_hour,
    tags: search.tags,
    price_min: search.price_min,
    price_max: search.price_max,
    ratings: search.ratings,
    is_featured: search.is_featured,
    order: search.order,
  }
}
