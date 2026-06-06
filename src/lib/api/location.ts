import {API_BASE} from '@/lib/api'
import type { ApiResponse, Location, LocationImage, LocationType } from "@/lib/type";

export interface LocationData {
  id: string
  name: string
  description: string
  type: LocationType
  ancestors: Location[]
  descendants: Location[]
  images: LocationImage[]
  show_welcome_text: boolean
  show_map: boolean
  polygon: any // eslint-disable-line @typescript-eslint/no-explicit-any
}

export async function getLocation(id?: string | null): Promise<LocationData | LocationData[]> {
  let url = `${API_BASE}/v1/location`
  if (id) {
    url += `/${id}`
  }
  const res = await fetch(url)
  if (res.status === 404) throw new Error('404')
  if (!res.ok) throw new Error('failed to fetch cafe')
  const json: ApiResponse<LocationData | LocationData[]> = await res.json()
  return json.data
}

