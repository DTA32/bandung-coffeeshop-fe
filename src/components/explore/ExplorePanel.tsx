import type { LocationData } from '@/lib/api/location'
import type { SearchCafesData } from '@/lib/api/search'
import ExploreMapView from '@/components/explore/ExploreMapView'
import LocationDetail from '@/components/explore/LocationDetail'
import { TriangleAlert } from 'lucide-react'
import { useTranslation } from 'react-i18next'

type MapMarker = { lat: number; lng: number }

type Props = {
  mapView: boolean
  isMobile: boolean
  location?: LocationData
  marker: MapMarker | null
  results: SearchCafesData
  onPlace: (lat: number, lng: number, opts?: { replace?: boolean }) => void
  onHideMap: () => void
  onExpandMap: () => void
}

export default function ExplorePanel({
  mapView,
  isMobile,
  location,
  marker,
  results,
  onPlace,
  onHideMap,
  onExpandMap,
}: Props) {
  const { t } = useTranslation()
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
          showMap={location?.show_map ?? false}
        />
        {polygon && (
          <div className="flex gap-2 px-4 text-xs text-moss-dark">
            <div className="flex items-center">
              <TriangleAlert size={14} className="w-min" />
            </div>
            <p>{t('explore.mapPolygonDisclaimer')}</p>
          </div>
        )}
      </aside>
    )
  }

  if (location && location.type !== 'poi') {
    return (
      <aside className={isMobile ? 'w-full h-fit' : 'w-full max-w-2xl h-fit'}>
        <LocationDetail
          location={location}
          isMobile={isMobile}
          searchResult={results}
          onExpandMap={onExpandMap}
        />
      </aside>
    )
  }

  return null
}
