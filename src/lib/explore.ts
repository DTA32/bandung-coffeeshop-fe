import { z } from 'zod'
import type { ExploreSearch, SearchCafesParams } from '@/lib/api/search'

import type { Location } from '@/lib/type'

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

// Build the splat ("<district>/<area>/<poi>") from a location's ancestor chain
// + itself. Used to navigate to the nested explore route.
export function exploreSplat(refs: Location[]): string {
  return refs.map((r) => r.id).join('/')
}

// --- Search-param coercion helpers -------------------------------------------
// Each helper degrades invalid input to `undefined` instead of throwing, so
// validateSearch never rejects (matching the previous hand-rolled behaviour).

// String pass-through; non-strings (e.g. repeated array params) → undefined.
const looseString = z.preprocess(
  (v) => (typeof v === 'string' ? v : undefined),
  z.string().optional(),
)

// Finite number or undefined; drops NaN/Infinity/'' /absent.
const finiteNumber = z.preprocess((v) => {
  if (v === undefined || v === null || v === '') return undefined
  const n = Number(v)
  return Number.isFinite(n) ? n : undefined
}, z.number().optional())

// Positive int; present-but-invalid falls back to `fallback`, absent → undefined.
const boundedInt = (fallback: number) =>
  z.preprocess(
    (v) => (v === undefined ? undefined : Math.max(1, Number(v) || fallback)),
    z.number().optional(),
  )

// `true` only when the raw value is the boolean true or the string 'true',
// otherwise undefined (never `false` — keeps these out of the URL).
const flag = z.preprocess(
  (v) => (v === true || v === 'true' ? true : undefined),
  z.literal(true).optional(),
)

const oneOf = <const T extends string>(...values: T[]) =>
  z.preprocess(
    (v) => (values.includes(v as T) ? (v as T) : undefined),
    z.enum(values as [T, ...T[]]).optional(),
  )

// Shared validateSearch for both explore routes (filters + view + coords only;
// the focused location is in the path, not here).
export const ExploreSearchSchema = z.object({
  query_id: looseString,
  query_type: looseString,
  query_coords: looseString,
  radius_max: finiteNumber,
  sort: looseString,
  page: boundedInt(1),
  size: boundedInt(8),
  view: oneOf('grid', 'list'),
  map_view: flag,
  open_hour: looseString,
  tags: looseString,
  price_min: finiteNumber,
  price_max: finiteNumber,
  ratings: looseString,
  is_featured: flag,
  order: oneOf('asc', 'desc'),
})

// The `: ExploreSearch` return type makes TypeScript verify the schema's output
// stays in sync with the ExploreSearch interface (the source of truth).
export function validateExploreSearch(
  search: Record<string, unknown>,
): ExploreSearch {
  return ExploreSearchSchema.parse(search)
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
