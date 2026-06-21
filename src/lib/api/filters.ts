import { API_BASE, langHeaders } from '@/lib/api/index'
import type { ApiResponse } from '@/lib/type'
import { DEFAULT_LOCALE } from '@/i18n'
import type { Locale } from '@/i18n'

export interface FilterTag {
  name: string
  slug: string
  description?: string // present only when enrich_content=true
}

export interface RatingCategoryOption {
  id: number
  slug: string // '' when not SRP-eligible (no pretty URL)
  name: string
  description: string
  long_description?: string // present only when enrich_content=true
  lower_bound: number
  upper_bound: number
}

export interface RatingCategory {
  type: string
  display_name: string
  options: RatingCategoryOption[]
}

export interface PriceTier {
  label: string
  slug: string // '' when not SRP-eligible (no pretty URL)
  long_description: string
  min: number
  max: number | null
}

export interface FilterOptions {
  tags: FilterTag[]
  rating_categories: RatingCategory[]
  price_tiers: PriceTier[]
}

// Memoized fetch keyed by locale + enrich. The filter modal calls this with
// enrich=false (light payload); the SRP splat loader calls it with enrich=true
// to also get the tag/rating blurbs. Display names are localized, so the cache
// is keyed by locale, and a failed request evicts its key so a later call can
// retry. There is no global query cache in this app yet, so this is the cache.
const cache = new Map<string, Promise<FilterOptions>>()

export function getFilterOptions(
  lang?: Locale,
  enrich = false,
): Promise<FilterOptions> {
  const locale: Locale = lang ?? DEFAULT_LOCALE
  const key = `${locale}:${enrich}`
  const cached = cache.get(key)
  if (cached) return cached

  const promise = (async () => {
    const url = `${API_BASE}/v1/filters${enrich ? '?enrich_content=true' : ''}`
    const res = await fetch(url, { headers: langHeaders(lang) })
    if (!res.ok) throw new Error('Failed to fetch filter options')
    const json: ApiResponse<FilterOptions> = await res.json()
    return json.data
  })().catch((err) => {
    cache.delete(key)
    throw err
  })

  cache.set(key, promise)
  return promise
}
