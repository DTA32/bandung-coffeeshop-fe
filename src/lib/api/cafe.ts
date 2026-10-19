import { apiFetch } from '@/lib/api'
import type { Location, LocationImage, ApiResponse } from '@/lib/type'
import type { Locale } from '@/i18n'

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

export interface CafeData {
  id: string
  name: string
  description: string | null
  about: string | null
  status: string
  images: LocationImage[]
  instagram: string | null
  open_hour: string | null
  close_hour: string | null
  gmaps_id: string | null
  locations: Location[]
  price: CafePrice
  menu?: string | null
  updated_at: string
}

export interface RatingRange {
  name: string
  description: string
  lower_bound: number
  upper_bound: number
  slug?: string | null
}

export interface RatingEntry {
  display_name: string
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

// Aggregates over the cafe's visible reviews (zero counts / null scores when
// it has none). The reviews themselves come from getCafeReviews.
export interface CafeReview {
  overall_score: number | null
  total_review_count: number
  overall_review_count: number
  wfc_score: number | null
  wfc_review_count: number
  tags: CafeTags[]
  ratings: RatingsResponse
}

export async function getCafe(id: string, lang?: Locale): Promise<CafeData> {
  const res = await apiFetch(`/v1/cafe/${id}`, { lang })
  if (res.status === 404) throw new Error('404')
  if (!res.ok) throw new Error('failed to fetch cafe')
  const json: ApiResponse<CafeData> = await res.json()
  return json.data
}

export async function getCafeReview(
  id: string,
  lang?: Locale,
): Promise<CafeReview> {
  const res = await apiFetch(`/v1/cafe/${id}/review`, { lang })
  if (!res.ok) throw new Error('failed to fetch review')
  const json: ApiResponse<CafeReview> = await res.json()
  return json.data
}

export interface CafeFeedItem {
  id: number
  content: string
  images: string[]
  author: string
  link: string | null
  published_at: string
}

export async function getCafeFeed(id: string): Promise<CafeFeedItem[]> {
  const res = await apiFetch(`/v1/cafe/${id}/feed`)
  if (!res.ok) throw new Error('failed to fetch feed')
  const json: ApiResponse<CafeFeedItem[]> = await res.json()
  return json.data
}

export interface RandomCafe {
  id: string
  name: string
}

export async function getRandomCafe(lang?: Locale): Promise<RandomCafe> {
  const res = await apiFetch('/v1/cafe/random', { lang })
  if (!res.ok) throw new Error('Failed to fetch a random cafe')
  const json: ApiResponse<RandomCafe> = await res.json()
  return json.data
}

// ---- User reviews (BCF-30) ----
// Browser-only: these are fetched after hydration, never in a loader, so the
// prerendered page stays anonymous and the session cookie is sent.

export interface CafeReviewItem {
  id: number
  reviewer_name: string
  overall_score: number | null
  wfc_score: number | null
  content: string | null
  visited_at: string | null // "YYYY-MM"
  created_at: string
  updated_at: string
  external_url_title: string | null
  external_url_link: string | null
  ratings: Partial<Record<RatingType, number>>
}

export interface CafeReviewPage {
  items: CafeReviewItem[]
  next_cursor: string | null
}

export type MyReviewStatus = 'pending' | 'approved' | 'rejected'

export interface MyReview extends CafeReviewItem {
  status: MyReviewStatus
}

export interface ReviewPayload {
  overall_score: number
  wfc_score: number | null
  reviewer_name: string
  visited_at: string | null // "YYYY-MM"
  content: string | null
  ratings: Partial<Record<RatingType, number>>
}

// ApiError carries the backend's status and `error` message so the failure
// dialog can say what went wrong.
export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function apiError(res: Response, fallback: string): Promise<ApiError> {
  let message = fallback
  try {
    const body: { error?: unknown } = await res.json()
    if (typeof body.error === 'string' && body.error) message = body.error
  } catch {
    // Non-JSON error body: keep the fallback.
  }
  return new ApiError(res.status, message)
}

export async function getCafeReviews(
  id: string,
  cursor?: string,
): Promise<CafeReviewPage> {
  const params = cursor ? new URLSearchParams({ cursor }) : undefined
  const res = await apiFetch(`/v1/cafe/${id}/reviews`, { params })
  if (!res.ok) throw await apiError(res, 'failed to fetch reviews')
  const json: ApiResponse<CafeReviewPage> = await res.json()
  return json.data
}

// getMyReview returns the signed-in user's review of the cafe, or null when
// they have none.
export async function getMyReview(id: string): Promise<MyReview | null> {
  const res = await apiFetch(`/v1/cafe/${id}/reviews/mine`, {
    cache: 'no-store',
  })
  if (res.status === 404) return null
  if (!res.ok) throw await apiError(res, 'failed to fetch review')
  const json: ApiResponse<MyReview> = await res.json()
  return json.data
}

async function saveReview(
  id: string,
  method: 'POST' | 'PUT',
  payload: ReviewPayload,
): Promise<MyReview> {
  const res = await apiFetch(`/v1/cafe/${id}/reviews/mine`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw await apiError(res, 'failed to save review')
  const json: ApiResponse<MyReview> = await res.json()
  return json.data
}

export function createReview(
  id: string,
  payload: ReviewPayload,
): Promise<MyReview> {
  return saveReview(id, 'POST', payload)
}

export function updateReview(
  id: string,
  payload: ReviewPayload,
): Promise<MyReview> {
  return saveReview(id, 'PUT', payload)
}

export async function deleteReview(id: string): Promise<void> {
  const res = await apiFetch(`/v1/cafe/${id}/reviews/mine`, {
    method: 'DELETE',
  })
  if (!res.ok) throw await apiError(res, 'failed to delete review')
}
