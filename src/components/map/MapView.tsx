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
import { useLocale, localeParam } from '@/lib/locale'
import { COLORS } from '@/lib/colors'
import { useIsDark } from '@/lib/hooks/theme'
import type { SearchCafesData } from '@/lib/api/search'
import type { UserMarker } from './markers'
import { cafeIcon, midpointIcon, userIcon } from './mapIcons'
import { GeoJSON } from 'react-leaflet/GeoJSON'
import type { GeoJsonObject } from 'geojson'

const DEFAULT_CENTER: LatLngExpression = [-6.901557664008111, 107.6177579567244]

const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'

const TILES = {
  light: {
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: OSM_ATTRIBUTION,
  },
  // CARTO Dark Matter basemap for dark mode.
  dark: {
    url: 'https://basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png?key=cb1_3zjf_1_b5600f19acb4d43b7276376b',
    attribution: `${OSM_ATTRIBUTION} &copy; <a href="https://carto.com/attributions">CARTO</a>`,
  },
} as const

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
  onAddMarker?: (lat: number, lng: number) => void
  onMoveMarker?: (id: string, lat: number, lng: number) => void
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
  polygon?: GeoJsonObject
  // When false, disables all map interactions (pan/zoom/click) — used to render
  // a static preview that an overlay turns into a single click target.
  interactive?: boolean
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
  polygon,
  interactive = true,
}: Props) {
  const navigate = useNavigate()
  const router = useRouter()
  const locale = useLocale()
  const isDark = useIsDark()
  const tiles = isDark ? TILES.dark : TILES.light
  // Forest-green overlays disappear on the dark basemap; switch to grove.
  const overlayColor = isDark ? COLORS.grove : COLORS.forest
  const circleAt =
    circleCenter !== undefined
      ? circleCenter
      : midpoint && results
        ? midpoint
        : null
  const circleR = circleRadiusM ?? resultsRadiusKm * 1000
  return (
    <MapContainer
      style={{ width: '100%', height: '100%', isolation: 'isolate' }}
      center={center}
      zoom={zoom}
      zoomControl={false}
      dragging={interactive}
      scrollWheelZoom={interactive}
      doubleClickZoom={interactive}
      touchZoom={interactive}
      boxZoom={interactive}
      keyboard={interactive}
    >
      {/* Keyed so switching themes remounts the layer (attribution isn't
          updated in place). */}
      <TileLayer
        key={isDark ? 'dark' : 'light'}
        className={'dark:contrast-80'}
        {...tiles}
      />
      {zoomControlPosition && <ZoomControl position={zoomControlPosition} />}
      {interactive && onAddMarker && <ClickHandler onAdd={onAddMarker} />}
      <MapController center={focusCenter} />
      {onMoveMarker &&
        markers.map((m) => (
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
        <>
          <Circle
            center={circleAt}
            radius={circleR}
            pathOptions={{
              color: overlayColor,
              fillColor: overlayColor,
              fillOpacity: 0.05,
              weight: 1,
            }}
          />
          <Marker position={circleAt} icon={midpointIcon} />
        </>
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
                  to: '/{-$locale}/cafe/$cafeId',
                  params: { cafeId: c.id, locale: localeParam(locale) },
                }),
              click: () =>
                navigate({
                  to: '/{-$locale}/cafe/$cafeId',
                  params: { cafeId: c.id, locale: localeParam(locale) },
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
            color: overlayColor,
            fillColor: overlayColor,
            fillOpacity: 0.1,
            weight: 0.5,
          }}
        />
      )}
    </MapContainer>
  )
}
