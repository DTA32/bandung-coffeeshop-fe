import { notFound } from '@tanstack/react-router'
import { API_BASE, langHeaders } from '@/lib/api'
import type {
  ApiResponse,
  Location,
  LocationImage,
  LocationType,
} from '@/lib/type'
import type { Locale } from '@/i18n'

export interface LocationData {
  id: string
  name: string
  description: string
  type: LocationType
  ancestors: Location[]
  descendants: Location[] | null
  images: LocationImage[] | null
  show_welcome_text: boolean
  show_map: boolean
  polygon: any
}

export async function getLocation(
  id?: string | null,
  lang?: Locale,
): Promise<LocationData | LocationData[]> {
  let url = `${API_BASE}/v1/location`
  if (id) {
    url += `/${id}`
  }
  const res = await fetch(url, { headers: langHeaders(lang) })
  if (res.status === 404) throw notFound()
  if (!res.ok) throw new Error('failed to fetch location')
  const json: ApiResponse<LocationData | LocationData[]> = await res.json()
  return json.data
}
