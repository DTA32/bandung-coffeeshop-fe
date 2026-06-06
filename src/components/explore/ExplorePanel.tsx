import type { LocationData } from '@/lib/api/location'
import type { SearchCafesData } from '@/lib/api/search'
import ExploreMapView from '@/components/explore/ExploreMapView'
import LocationDetail from '@/components/explore/LocationDetail'

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
    return (
      <aside className={isMobile ? 'w-full h-80' : 'w-full max-w-2xl h-160'}>
        <ExploreMapView
          marker={marker}
          results={results}
          onPlace={onPlace}
          onHideMap={onHideMap}
          isMobile={isMobile}
          polygon={isMobile ? null : location?.polygon}
        />
      </aside>
    )
  }

  if (location && location.type !== 'poi') {
    return (
      <aside
        className={
          isMobile ? 'w-full h-fit' : 'w-full max-w-2xl h-fit md:h-160'
        }
      >
        <LocationDetail location={location} isMobile={isMobile} />
      </aside>
    )
  }

  return null
}
