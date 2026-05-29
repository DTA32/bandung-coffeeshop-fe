import { API_BASE } from '@/lib/api/index'

export type LocationType = 'cafe' | 'poi' | 'area' | 'district'

export interface QuickSearchItem {
  id: string
  name: string
  type: LocationType
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
}

export interface SearchCafesParams {
  query_id?: string
  query_type?: string
  query_coords?: string
  radius_max?: number
  sort?: string
  page?: number
  size?: number
}

// URL search state for /explore — all fields optional; absence = use default
export interface ExploreSearch {
  q?: string
  query_id?: string
  query_type?: string
  query_coords?: string
  radius_max?: number
  sort?: string // absent / undefined → 'default'
  page?: number // absent / undefined → 1
  size?: number // absent / undefined → 8
  view?: 'grid' | 'list' // absent / undefined → 'grid'
  map_view?: boolean // absent / undefined → false
}

// Returns a copy with default-valued fields removed so they don't pollute the URL
export function cleanExploreSearch(s: ExploreSearch): ExploreSearch {
  return {
    ...(s.q !== undefined && { q: s.q }),
    ...(s.query_id !== undefined && { query_id: s.query_id }),
    ...(s.query_type !== undefined && { query_type: s.query_type }),
    ...(s.query_coords !== undefined && { query_coords: s.query_coords }),
    ...(s.radius_max !== undefined && { radius_max: s.radius_max }),
    ...(s.sort !== undefined && s.sort !== 'default' && { sort: s.sort }),
    ...(s.page !== undefined && s.page !== 1 && { page: s.page }),
    ...(s.size !== undefined && s.size !== 8 && { size: s.size }),
    ...(s.view !== undefined && s.view !== 'grid' && { view: s.view }),
    ...(s.map_view ? { map_view: true } : { map_view: false }),
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
  const res = await fetch(url.toString())
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
