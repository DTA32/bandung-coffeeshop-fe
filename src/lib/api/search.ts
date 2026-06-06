import { notFound } from '@tanstack/react-router'
import { API_BASE } from '@/lib/api/index'
import type { LocationType, Location } from "@/lib/type";

export interface QuickSearchItem {
  id: string
  name: string
  type: LocationType
  // Outermost → innermost ancestors, excluding the item itself.
  // area → [district]; poi → [district, area]; district/cafe → [].
  // Populated by the backend; may be absent until that ships.
  ancestors?: Location[]
}

export interface CafeListing {
  id: string
  name: string
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
  query_id?: string
  query_type?: string
  query_coords?: string
  radius_max?: number
  sort?: string
  page?: number
  size?: number
  // Filters (backend-supported) — forwarded as query params when present.
  tag?: string
  rating_category_type?: string
  rating_category_id?: string
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
  sort?: string // absent / undefined → 'default'
  page?: number // absent / undefined → 1
  size?: number // absent / undefined → 8
  view?: 'grid' | 'list' // absent / undefined → 'grid'
  map_view?: boolean // absent / undefined → false
  // Reserved filters — URL-addressable now, UI to follow. See exploreLoaderDeps/searchCafes.
  tag?: string
  rating_category_type?: string
  rating_category_id?: string
  is_featured?: boolean
  order?: 'asc' | 'desc'
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
    ...(s.tag !== undefined && { tag: s.tag }),
    ...(s.rating_category_type !== undefined && {
      rating_category_type: s.rating_category_type,
    }),
    ...(s.rating_category_id !== undefined && {
      rating_category_id: s.rating_category_id,
    }),
    ...(s.is_featured ? { is_featured: true } : {}),
    ...(s.order !== undefined && { order: s.order }),
  }
}

export async function quickSearch(q: string): Promise<QuickSearchItem[]> {
  const res = await fetch(
    `${API_BASE}/v1/quicksearch?q=${encodeURIComponent(q)}`,
  )
  if (!res.ok) return []
  const json: { success: boolean; data?: QuickSearchItem[] } = await res.json()
  return json.data ?? []
}

export async function searchCafes(
  params: SearchCafesParams,
): Promise<SearchCafesData> {
  const url = new URL(`${API_BASE}/v1/search/cafes`)
  if (params.query_id) url.searchParams.set('query_id', params.query_id)
  if (params.query_type) url.searchParams.set('query_type', params.query_type)
  if (params.sort) url.searchParams.set('sort', params.sort)
  if (params.query_coords)
    url.searchParams.set('query_coords', params.query_coords)
  if (params.radius_max != null)
    url.searchParams.set('radius_max', String(params.radius_max))
  if (params.page != null) url.searchParams.set('page', String(params.page))
  if (params.size != null) url.searchParams.set('size', String(params.size))
  if (params.tag) url.searchParams.set('tag', params.tag)
  if (params.rating_category_type)
    url.searchParams.set('rating_category_type', params.rating_category_type)
  if (params.rating_category_id)
    url.searchParams.set('rating_category_id', params.rating_category_id)
  if (params.is_featured != null)
    url.searchParams.set('is_featured', String(params.is_featured))
  if (params.order) url.searchParams.set('order', params.order)
  const res = await fetch(url.toString())
  // 404 = the focused location (district/area/poi slug) doesn't exist →
  // render the route's notFoundComponent. Other failures → errorComponent.
  if (res.status === 404) throw notFound()
  if (!res.ok) throw new Error('Failed to fetch cafes')
  const json: { success: boolean; data: SearchCafesData } = await res.json()
  return json.data
}

export async function getFeaturedCafes(): Promise<SearchCafesData> {
  const url = new URL(`${API_BASE}/v1/search/cafes`)
  url.searchParams.set('is_featured', 'true')
  url.searchParams.set('size', '5')
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch featured cafes')
  const json: { success: boolean; data: SearchCafesData } = await res.json()
  return json.data
}

export async function getNearbyCafes(id: string): Promise<SearchCafesData> {
  const url = new URL(`${API_BASE}/v1/search/cafes`)
  url.searchParams.set('query_id', id)
  url.searchParams.set('query_type', 'cafe')
  url.searchParams.set('sort', 'distance')
  url.searchParams.set('size', '4')
  url.searchParams.set('radius_max', '2000')
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch nearby cafes')
  const json: { success: boolean; data: SearchCafesData } = await res.json()
  return json.data
}
