import {
  Circle,
  MapContainer,
  Marker,
  TileLayer,
  Tooltip,
  useMapEvents,
  ZoomControl,
} from 'react-leaflet'
import type { ControlPosition, LatLngExpression } from 'leaflet'
import type { SearchCafesData } from '@/lib/api/search'
import type { UserMarker } from './markers'
import { cafeIcon, midpointIcon, userIcon } from './mapIcons'

const DEFAULT_CENTER: LatLngExpression = [
  -6.901557664008111, 107.6177579567244,
]

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

type Props = {
  markers: UserMarker[]
  midpoint: LatLngExpression | null
  results: SearchCafesData | null
  resultsRadiusKm: number
  onAddMarker: (lat: number, lng: number) => void
  onMoveMarker: (id: string, lat: number, lng: number) => void
  zoomControlPosition: ControlPosition
}

export default function MapView({
  markers,
  midpoint,
  results,
  resultsRadiusKm,
  onAddMarker,
  onMoveMarker,
  zoomControlPosition,
}: Props) {
  return (
    <MapContainer
      style={{ width: '100%', height: '100%' }}
      center={DEFAULT_CENTER}
      zoom={13}
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ZoomControl position={zoomControlPosition} />
      <ClickHandler onAdd={onAddMarker} />
      {markers.map((m) => (
        <Marker
          key={m.id}
          position={[m.lat, m.lng]}
          icon={userIcon(m.color, m.name)}
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
      {midpoint && results && (
        <Circle
          center={midpoint}
          radius={resultsRadiusKm * 1000}
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
              click: () => window.open(`/cafe/${c.id}`, '_blank'),
            }}
          >
            <Tooltip direction="top" offset={[0, -12]} opacity={1}>
              {c.name}
            </Tooltip>
          </Marker>
        ))}
    </MapContainer>
  )
}
