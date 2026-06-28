import { ClientOnly } from '@tanstack/react-router'
import type { GeoJsonObject } from 'geojson'
import L from 'leaflet'
import type { LatLngExpression } from 'leaflet'
import { Info, Locate, Map } from 'lucide-react'
import 'leaflet/dist/leaflet.css'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MapView, queryMarkerIcon } from '@/components/map'
import type { SearchCafesData } from '@/lib/api/search'

type MapMarker = { lat: number; lng: number }

type Props = {
  marker: MapMarker | null
  results: SearchCafesData
  onPlace: (lat: number, lng: number, opts?: { replace?: boolean }) => void
  onHideMap: () => void
  isMobile: boolean
  polygon?: GeoJsonObject | null
  // When the location renders a minimized map preview, hiding returns to that
  // preview rather than removing the map — so the control reads "Minimize Map".
  showMap?: boolean
}

export default function ExploreMapView({
  marker,
  results,
  onPlace,
  onHideMap,
  isMobile,
  polygon = null,
  showMap = false,
}: Props) {
  const { t } = useTranslation()
  const [focusCenter, setFocusCenter] = useState<LatLngExpression | null>(null)
  const [alert, setAlert] = useState<string>('')

  function findNearby() {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        onPlace(latitude, longitude)
        setFocusCenter([latitude, longitude])
      },
      (err) => {
        console.error('Geolocation error:', err)
        setAlert(t('explore.geolocationError'))
        setTimeout(() => setAlert(''), 3000)
      },
    )
  }

  // A POI search returns a Point geometry; an area search returns a polygon.
  const isPointPolygon = polygon?.type === 'Point'

  const geoCenter = polygon ? L.geoJson(polygon).getBounds().getCenter() : null
  const polygonCenter: LatLngExpression | null = geoCenter
    ? [geoCenter.lat, geoCenter.lng]
    : null

  const position: LatLngExpression | null = marker
    ? [marker.lat, marker.lng]
    : isPointPolygon
      ? polygonCenter
      : null

  const radiusM = marker ? 1500 : position ? 2000 : 0

  return (
    <div
      className={`relative h-full w-full overflow-hidden ${!isMobile && `rounded-2xl`}`}
    >
      <ClientOnly
        fallback={
          <div className="flex h-full items-center justify-center bg-grove-light/30 text-lg text-forest">
            {t('mitm.loadingMap')}
          </div>
        }
      >
        {alert && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-grove-light text-amber-600 text-sm font-semibold px-4 py-2 rounded-md shadow-md z-1500 transition-opacity duration-300 text-center">
            {alert}
          </div>
        )}
        <MapView
          markers={
            marker
              ? [
                  {
                    id: 'query',
                    lat: marker.lat,
                    lng: marker.lng,
                    name: '',
                    color: '',
                  },
                ]
              : []
          }
          midpoint={null}
          results={results}
          resultsRadiusKm={0}
          onAddMarker={(lat, lng) => onPlace(lat, lng)}
          onMoveMarker={(_id, lat, lng) => onPlace(lat, lng, { replace: true })}
          zoomControlPosition="topright"
          zoom={14}
          center={polygonCenter ?? position ?? undefined}
          markerIcon={() => queryMarkerIcon}
          circleCenter={position}
          circleRadiusM={radiusM}
          focusCenter={focusCenter}
          polygon={polygon && !isPointPolygon ? polygon : undefined}
        />
      </ClientOnly>
      <div className="flex flex-col absolute left-4 top-4 z-1000 gap-2">
        {!isMobile && (
          <button
            onClick={onHideMap}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-forest px-3.5 py-2 text-sm text-cream shadow-md transition-colors hover:bg-moss w-fit"
          >
            <Map size={14} />
            {showMap ? t('explore.minimize') : t('explore.hideMap')}
          </button>
        )}

        <button
          onClick={findNearby}
          className="flex cursor-pointer items-center gap-2 rounded-lg bg-white px-2 py-2 text-sm text-bark shadow-md transition-colors hover:bg-white/80 w-fit"
        >
          <Locate size={14} />
          {t('explore.findNearby')}
        </button>
      </div>
      {!marker && (
        <div className="absolute bottom-2 left-2 z-1000 flex items-center gap-1.5 rounded-xl bg-white/80 px-2 py-1 text-[11px] text-moss-dark shadow-sm">
          <Info size={12} />
          {t('explore.clickToFindNearby')}
        </div>
      )}
    </div>
  )
}
