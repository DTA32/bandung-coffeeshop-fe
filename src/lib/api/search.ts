import { notFound } from '@tanstack/react-router'
import { API_BASE, langHeaders } from '@/lib/api/index'
import type { LocationType, Location } from '@/lib/type'
import type { Locale } from '@/i18n'

export interface QuickSearchItem {
  id: string
  name: string
  type: LocationType | 'filter'
  // Ready-to-use navigation target, built by the backend:
  //   location → the canonical /explore splat (ancestor ids + self); absent when
  //              the chain can't be resolved → fall back to query_id/query_type.
  //   filter   → the SRP filter slug, reached at /explore/<slug>.
  //   cafe     → absent (routed by id to /cafe/<id>).
  slug?: string
}

export interface CafeListing {
  id: string
  name: string
  description: string
  thumbnail: string | null
  area: string | null
  price_range: string | null
  distance: number | null
  remark: string | null
  coordinates?: { lat: number; lng: number }
}

export interface SearchCafesData {
  total: number
  location_name: string
  formatted_location_name: string
  search_description: string
  page: number
  size: number
  cafes: CafeListing[]
  locations?: Location[]
}

export interface SearchCafesParams {
  // See ExploreSearch for documentation
  query_id?: string
  query_type?: string
  query_coords?: string
  radius_max?: number
  sort?: string
  page?: number
  size?: number
  open_hour?: string
  tags?: string
  price_min?: number
  price_max?: number
  ratings?: string
  is_featured?: boolean
  order?: string
}

// URL search state for the explore routes — all fields optional; absence = use default.
// The focused location normally lives in the PATH (/explore/<district>/<area>/<poi>); this
// carries filters + view state + coordinate search.
export interface ExploreSearch {
  // Fallback location focus for the base /explore route: used when a SEO path
  // can't be built (e.g. ancestors missing). The path is canonical; these are
  // the legacy/degraded form. Ignored by the splat route (path wins).
  query_id?: string
  query_type?: string
  query_coords?: string
  radius_max?: number
  // Filters — URL-addressable, set by the filter modal. See explore.ts for the
  // tags/ratings (de)serialization helpers.
  open_hour?: string // "now" or "HH:MM"
  tags?: string // comma-separated tag slugs
  price_min?: number
  price_max?: number
  ratings?: string // comma-separated rating_category bucket ids
  is_featured?: boolean
  // Sorting/pagination
  sort?: string // absent / undefined → 'default'
  page?: number // absent / undefined → 1
  size?: number // absent / undefined → 8
  order?: 'asc' | 'desc'
  // View state
  view?: 'grid' | 'list' // absent / undefined → 'grid'
  map_view?: boolean // absent / undefined → false
}

// Returns a copy with default-valued fields removed so they don't pollute the URL
export function cleanExploreSearch(s: ExploreSearch): ExploreSearch {
  return {
    ...(s.query_id !== undefined && { query_id: s.query_id }),
    ...(s.query_type !== undefined && { query_type: s.query_type }),
    ...(s.query_coords !== undefined && { query_coords: s.query_coords }),
    ...(s.radius_max !== undefined && { radius_max: s.radius_max }),
    ...(s.sort !== undefined && s.sort !== 'default' && { sort: s.sort }),
    ...(s.page !== undefined && s.page !== 1 && { page: s.page }),
    ...(s.size !== undefined && s.size !== 8 && { size: s.size }),
    ...(s.view !== undefined && s.view !== 'grid' && { view: s.view }),
    ...(s.map_view ? { map_view: true } : {}),
    ...(s.open_hour !== undefined &&
      s.open_hour !== '' && { open_hour: s.open_hour }),
    ...(s.tags !== undefined && s.tags !== '' && { tags: s.tags }),
    ...(s.price_min !== undefined && { price_min: s.price_min }),
    ...(s.price_max !== undefined && { price_max: s.price_max }),
    ...(s.ratings !== undefined && s.ratings !== '' && { ratings: s.ratings }),
    ...(s.is_featured ? { is_featured: true } : {}),
    ...(s.order !== undefined && { order: s.order }),
  }
}

export async function quickSearch(
  q: string,
  lang?: Locale,
): Promise<QuickSearchItem[]> {
  const res = await fetch(
    `${API_BASE}/v1/quicksearch?q=${encodeURIComponent(q)}`,
    { headers: langHeaders(lang) },
  )
  if (!res.ok) return []
  const json: { success: boolean; data?: QuickSearchItem[] } = await res.json()
  return json.data ?? []
}

// Translates the subset of SearchCafesParams that are simple URL query params.
// searchCafes keeps its own special 404→notFound handling, so it does not use
// the generic fetchSearchData helper below.
function buildSearchParams(params: SearchCafesParams): URLSearchParams {
  const sp = new URLSearchParams()
  if (params.query_id) sp.set('query_id', params.query_id)
  if (params.query_type) sp.set('query_type', params.query_type)
  if (params.sort) sp.set('sort', params.sort)
  if (params.query_coords) sp.set('query_coords', params.query_coords)
  if (params.radius_max != null) sp.set('radius_max', String(params.radius_max))
  if (params.page != null) sp.set('page', String(params.page))
  if (params.size != null) sp.set('size', String(params.size))
  if (params.open_hour) sp.set('open_hour', params.open_hour)
  if (params.tags) sp.set('tags', params.tags)
  if (params.price_min != null) sp.set('price_min', String(params.price_min))
  if (params.price_max != null) sp.set('price_max', String(params.price_max))
  if (params.ratings) sp.set('ratings', params.ratings)
  if (params.is_featured != null)
    sp.set('is_featured', String(params.is_featured))
  if (params.order) sp.set('order', params.order)
  return sp
}

// Shared fetch-and-parse for simple cafes-endpoint calls that throw on any
// non-ok response. Not used by searchCafes, which has special 404→notFound
// handling that must be preserved exactly.
async function fetchSearchData(
  url: URL,
  lang: Locale | undefined,
  errorMessage: string,
): Promise<SearchCafesData> {
  const res = await fetch(url, { headers: langHeaders(lang) })
  if (!res.ok) throw new Error(errorMessage)
  const json: { success: boolean; data: SearchCafesData } = await res.json()
  return json.data
}

export async function searchCafes(
  params: SearchCafesParams,
  lang?: Locale,
): Promise<SearchCafesData> {
  const url = new URL(`${API_BASE}/v1/search/cafes`)
  url.search = buildSearchParams(params).toString()
  const res = await fetch(url.toString(), { headers: langHeaders(lang) })
  // 404 = specified location or filters doesn't exist →
  // render the route's notFoundComponent. Other failures → errorComponent.
  if (res.status === 404) throw notFound()
  if (!res.ok) throw new Error('Failed to fetch cafes')
  const json: { success: boolean; data: SearchCafesData } = await res.json()
  return json.data
}

export async function getFeaturedCafes(
  lang?: Locale,
): Promise<SearchCafesData> {
  const url = new URL(`${API_BASE}/v1/search/cafes`)
  url.searchParams.set('is_featured', 'true')
  url.searchParams.set('size', '5')
  return fetchSearchData(url, lang, 'Failed to fetch featured cafes')
}

export async function getNearbyCafes(
  id: string,
  lang?: Locale,
): Promise<SearchCafesData> {
  const url = new URL(`${API_BASE}/v1/search/cafes`)
  url.searchParams.set('query_id', id)
  url.searchParams.set('query_type', 'cafe')
  url.searchParams.set('sort', 'distance')
  url.searchParams.set('size', '4')
  url.searchParams.set('radius_max', '2000')
  return fetchSearchData(url, lang, 'Failed to fetch nearby cafes')
}
