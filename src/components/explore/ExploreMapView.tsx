import { useState } from 'react'
import {ClientOnly, useRouteContext} from '@tanstack/react-router'
import type { LatLngExpression } from 'leaflet'
import {Locate, Map, MapPin} from 'lucide-react'
import 'leaflet/dist/leaflet.css'
import type { SearchCafesData } from '@/lib/api/search'
import MapView from '@/components/meet-in-the-middle/MapView'
import { queryMarkerIcon } from '@/components/meet-in-the-middle/mapIcons'

const RADIUS_M = 1500

type MapMarker = { lat: number; lng: number }

type Props = {
  marker: MapMarker | null
  results: SearchCafesData
  onPlace: (lat: number, lng: number, opts?: { replace?: boolean }) => void
  onHideMap: () => void
}

export default function ExploreMapView({
  marker,
  results,
  onPlace,
  onHideMap,
}: Props) {
  const [focusCenter, setFocusCenter] = useState<LatLngExpression | null>(null)
  const [alert, setAlert] = useState<string>('')
  const { ua } = useRouteContext({ from: '__root__' })
  const isMobile = ua.isMobile

  function findNearby() {
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords
      onPlace(latitude, longitude)
      setFocusCenter([latitude, longitude])
    },
    (err) => {
      console.error('Geolocation error:', err)
      setAlert('Unable to access your location. Please allow location access and try again.')
      setTimeout(() => setAlert(''), 3000)
    })
  }

  const position: LatLngExpression | null = marker
    ? [marker.lat, marker.lng]
    : null

  return (
    <div className={`relative h-full w-full overflow-hidden ${!isMobile && `rounded-2xl`}`}>
      <ClientOnly
        fallback={
          <div className="flex h-full items-center justify-center bg-grove-light/30 text-lg text-forest">
            Loading map...
          </div>
        }
      >
        {alert && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-grove-light text-amber-600 text-sm font-semibold px-4 py-2 rounded-md shadow-md z-1000 transition-opacity duration-300 text-center">
            {alert}
          </div>
        )}
        <MapView
          markers={
            marker
              ? [{ id: 'query', lat: marker.lat, lng: marker.lng, name: '', color: '' }]
              : []
          }
          midpoint={null}
          results={results}
          resultsRadiusKm={0}
          onAddMarker={(lat, lng) => onPlace(lat, lng)}
          onMoveMarker={(_id, lat, lng) => onPlace(lat, lng, { replace: true })}
          zoomControlPosition="topright"
          zoom={14}
          center={position ?? undefined}
          markerIcon={() => queryMarkerIcon}
          circleCenter={position}
          circleRadiusM={RADIUS_M}
          focusCenter={focusCenter}
        />
      </ClientOnly>
      <div className="flex flex-col absolute left-4 top-4 z-1000 gap-2">
        {!isMobile && (
          <button
            onClick={onHideMap}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-forest px-3.5 py-2 text-sm text-cream shadow-md transition-colors hover:bg-moss"
          >
            <Map size={14} />
            Hide Map
          </button>
        )}
  
        <button
          onClick={findNearby}
          className="flex cursor-pointer items-center gap-2 rounded-lg bg-white px-2 py-2 text-sm text-bark shadow-md transition-colors hover:bg-white/80"
        >
          <Locate size={14} />
          Find Nearby
        </button>
      </div>
      {!marker && (
        <div className="absolute bottom-2 left-2 z-1000 flex items-center gap-1.5 rounded-xl bg-white/80 px-2 py-1 text-[11px] text-moss-dark shadow-sm">
          <MapPin size={12} />
          Click anywhere to find cafe near that spot
        </div>
      )}
    </div>
  )
}
