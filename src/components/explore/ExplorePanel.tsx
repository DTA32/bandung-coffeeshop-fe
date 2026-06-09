import type { LocationData } from '@/lib/api/location'
import type { SearchCafesData } from '@/lib/api/search'
import ExploreMapView from '@/components/explore/ExploreMapView'
import LocationDetail from '@/components/explore/LocationDetail'
import { TriangleAlert } from 'lucide-react'

type MapMarker = { lat: number; lng: number }

type Props = {
  mapView: boolean
  isMobile: boolean
  location?: LocationData
  marker: MapMarker | null
  results: SearchCafesData
  onPlace: (lat: number, lng: number, opts?: { replace?: boolean }) => void
  onHideMap: () => void
}

export default function ExplorePanel({
  mapView,
  isMobile,
  location,
  marker,
  results,
  onPlace,
  onHideMap,
}: Props) {
  if (mapView) {
    const polygon = location?.polygon ? location.polygon : null
    return (
      <aside
        className={`${isMobile ? 'w-full h-80' : 'w-full max-w-2xl h-160'} ${polygon && 'flex flex-col gap-2'}`}
      >
        <ExploreMapView
          marker={marker}
          results={results}
          onPlace={onPlace}
          onHideMap={onHideMap}
          isMobile={isMobile}
          polygon={polygon}
        />
        {polygon && (
          <div className="flex gap-2 px-4 text-xs text-moss-dark">
            <div className="flex items-center">
              <TriangleAlert size={14} className="w-min" />
            </div>
            <p>
              Highlighted area is based on personal preference and not accurate.
              Please use it as a general guide, not an exact boundary.
            </p>
          </div>
        )}
      </aside>
    )
  }

  if (location && location.type !== 'poi') {
    return (
      <aside className={isMobile ? 'w-full h-fit' : 'w-full max-w-2xl h-fit'}>
        <LocationDetail location={location} isMobile={isMobile} />
      </aside>
    )
  }

  return null
}
