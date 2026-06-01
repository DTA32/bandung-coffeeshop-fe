import { API_BASE } from '@/lib/api'
import type { Location } from "@/lib/api/search";

export interface CafePrice {
  price_range_min: number | null
  price_range_max: number | null
  coffee_price_min: number | null
  coffee_price_max: number | null
  snack_price_min: number | null
  snack_price_max: number | null
  food_price_min: number | null
  food_price_max: number | null
  rank: CafeRank | null
}

export interface CafeRank {
  type: number
  label: string
}

export interface CafeImage {
  url: string
  alt: string
}

export interface CafeData {
  id: string
  name: string
  description: string | null
  status: string
  images: CafeImage[]
  instagram: string | null
  open_hour: string | null
  close_hour: string | null
  gmaps_id: string | null
  locations: Location[]
  price: CafePrice
}

export interface RatingRange {
  name: string
  description: string
  lower_bound: number
  upper_bound: number
}

export interface RatingEntry {
  range: RatingRange[]
  score: number
  description: string
}

export type RatingType =
  | 'price-rank'
  | 'vibe'
  | 'noise'
  | 'wifi'
  | 'meals'
  | 'atmosphere'
  | 'parking'

export type RatingsResponse = Partial<Record<RatingType, RatingEntry>>

export interface CafeTags {
  name: string
  slug: string | null
}

export interface CafeReview {
  is_subjective: boolean
  overall_score: number | null
  wfc_score: number | null
  tags: CafeTags[]
  content: string | null
  visited_at: string | null
  updated_at: string
  ratings: RatingsResponse
}

interface ApiResponse<T> {
  success: boolean
  data: T
}

export async function getCafe(id: string): Promise<CafeData> {
  const res = await fetch(`${API_BASE}/v1/cafe/${id}`)
  if (res.status === 404) throw new Error('404')
  if (!res.ok) throw new Error('failed to fetch cafe')
  const json: ApiResponse<CafeData> = await res.json()
  return json.data
}

export async function getCafeReview(id: string): Promise<CafeReview> {
  const res = await fetch(`${API_BASE}/v1/cafe/${id}/review`)
  if (!res.ok) throw new Error('failed to fetch review')
  const json: ApiResponse<CafeReview> = await res.json()
  return json.data
}
