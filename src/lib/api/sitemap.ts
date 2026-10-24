import { apiFetch } from '@/lib/api/index'
import type { ApiResponse } from '@/lib/type'

export interface SitemapCafe {
  id: string
  status: 'active' | 'closed'
  updated_at: string
}

export interface SitemapSrp {
  locations: string[] // [district, area?, poi?]; [] for a filter-only SRP
  filter: { type: 'tag' | 'price' | 'rating'; slug: string } | null
  count: number // equals the SRP's search total
  last_modified: string
}

export interface SitemapData {
  cafes: SitemapCafe[]
  srps: SitemapSrp[]
}

// Server-only: the raw facts behind /sitemap.xml (see src/lib/sitemap.ts).
export async function getSitemapData(): Promise<SitemapData> {
  const res = await apiFetch('/v1/sitemap')
  if (!res.ok) throw new Error(`Failed to fetch sitemap data (${res.status})`)
  const json: ApiResponse<SitemapData> = await res.json()
  return json.data
}
