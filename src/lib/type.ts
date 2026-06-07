export type LocationType = 'cafe' | 'poi' | 'area' | 'district'

export interface Location {
  id: string
  name: string
  type: LocationType
  thumbnail: string | null
}

export interface LocationImage {
  url: string
  description: string
}

export interface ApiResponse<T> {
  success: boolean
  data: T
}
