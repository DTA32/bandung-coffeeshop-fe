import {
  Circle,
  MapContainer,
  Marker,
  TileLayer,
  Tooltip,
  useMap,
  useMapEvents,
  ZoomControl,
} from 'react-leaflet'
import { useNavigate, useRouter } from '@tanstack/react-router'
import type { ControlPosition, DivIcon, LatLngExpression } from 'leaflet'
import type { SearchCafesData } from '@/lib/api/search'
import type { UserMarker } from './markers'
import { cafeIcon, midpointIcon, userIcon } from './mapIcons'
import { GeoJSON } from 'react-leaflet/GeoJSON'

const DEFAULT_CENTER: LatLngExpression = [-6.901557664008111, 107.6177579567244]

function ClickHandler({
  onAdd,
}: {
  onAdd: (lat: number, lng: number) => void
}) {
  useMapEvents({
    click: (e) => onAdd(e.latlng.lat, e.latlng.lng),
  })
  return null
}

// Recenters the map whenever `center` changes (e.g. geolocation).
function MapController({ center }: { center: LatLngExpression | null }) {
  const map = useMap()
  if (center) map.setView(center, 15)
  return null
}

type Props = {
  markers: UserMarker[]
  midpoint: LatLngExpression | null
  results: SearchCafesData | null
  resultsRadiusKm: number
  onAddMarker: (lat: number, lng: number) => void
  onMoveMarker: (id: string, lat: number, lng: number) => void
  zoomControlPosition?: ControlPosition
  center?: LatLngExpression
  zoom?: number
  // Override the per-marker icon (default: labeled userIcon).
  markerIcon?: (m: UserMarker) => DivIcon
  // When provided, draws the radius circle here instead of around the midpoint.
  circleCenter?: LatLngExpression | null
  circleRadiusM?: number
  // Imperatively recenters the map when this changes.
  focusCenter?: LatLngExpression | null
  polygon?: any | null
}

export default function MapView({
  markers,
  midpoint,
  results,
  resultsRadiusKm,
  onAddMarker,
  onMoveMarker,
  zoomControlPosition,
  center = DEFAULT_CENTER,
  zoom = 13,
  markerIcon,
  circleCenter,
  circleRadiusM,
  focusCenter = null,
  polygon = null,
}: Props) {
  const navigate = useNavigate()
  const router = useRouter()
  const circleAt =
    circleCenter !== undefined
      ? circleCenter
      : midpoint && results
        ? midpoint
        : null
  const circleR = circleRadiusM ?? resultsRadiusKm * 1000
  return (
    <MapContainer
      style={{ width: '100%', height: '100%' }}
      center={center}
      zoom={zoom}
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {zoomControlPosition && <ZoomControl position={zoomControlPosition} />}
      <ClickHandler onAdd={onAddMarker} />
      <MapController center={focusCenter} />
      {markers.map((m) => (
        <Marker
          key={m.id}
          position={[m.lat, m.lng]}
          icon={markerIcon ? markerIcon(m) : userIcon(m.color, m.name)}
          draggable
          eventHandlers={{
            dragend: (e) => {
              const ll = e.target.getLatLng()
              onMoveMarker(m.id, ll.lat, ll.lng)
            },
          }}
        />
      ))}
      {midpoint && <Marker position={midpoint} icon={midpointIcon} />}
      {circleAt && (
        <Circle
          center={circleAt}
          radius={circleR}
          pathOptions={{
            color: '#2A3D22',
            fillColor: '#2A3D22',
            fillOpacity: 0.05,
            weight: 1,
          }}
        />
      )}
      {results?.cafes
        .filter((c) => c.coordinates)
        .map((c) => (
          <Marker
            key={c.id}
            position={[c.coordinates!.lat, c.coordinates!.lng]}
            icon={cafeIcon}
            eventHandlers={{
              mouseover: () =>
                router.preloadRoute({
                  to: '/cafe/$cafeId',
                  params: { cafeId: c.id },
                }),
              click: () =>
                navigate({
                  to: '/cafe/$cafeId',
                  params: { cafeId: c.id },
                }),
            }}
          >
            <Tooltip direction="top" offset={[0, -12]} opacity={1}>
              {c.name}
            </Tooltip>
          </Marker>
        ))}
      {polygon && (
        <GeoJSON
          key={JSON.stringify(polygon)}
          data={polygon}
          style={{
            color: '#2A3D22',
            fillColor: '#2A3D22',
            fillOpacity: 0.1,
            weight: 0.5,
          }}
        />
      )}
    </MapContainer>
  )
}
