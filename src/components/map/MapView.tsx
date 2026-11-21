import { useEffect } from 'react'
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
import { useNavigate, useRouteContext, useRouter } from '@tanstack/react-router'
import type { ControlPosition, DivIcon, LatLngExpression } from 'leaflet'
import { useLocale, localeParam } from '@/lib/locale'
import { COLORS } from '@/lib/colors'
import { useIsDark } from '@/lib/hooks/theme'
import type { CafeMarker } from '@/lib/api/search'
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

// Mobile shows cafe names permanently, but only from this zoom in; at city
// zoom the labels would cover the map.
const PIN_LABEL_MIN_ZOOM = 15
const PIN_LABELS_OFF_CLASS = 'cafe-pin-labels-off'

// Toggles a class on the map container that hides the permanent pin labels
// (see `.cafe-pin-label` in styles.css) while zoomed out past the threshold.
function PinLabelZoomGate() {
  const map = useMap()
  const sync = () => {
    map
      .getContainer()
      .classList.toggle(
        PIN_LABELS_OFF_CLASS,
        map.getZoom() < PIN_LABEL_MIN_ZOOM,
      )
  }
  useMapEvents({ zoomend: sync })
  useEffect(sync, [map])
  return null
}

type Props = {
  markers: UserMarker[]
  midpoint: LatLngExpression | null
  // Cafe pins to draw on the map.
  cafes: CafeMarker[]
  resultsRadiusKm: number
  // Draw the results radius circle around the midpoint (Meet in the Middle
  // sets it once a search has results). Independent of the pins.
  showResultsCircle?: boolean
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
  cafes,
  resultsRadiusKm,
  showResultsCircle = false,
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
  const { ua } = useRouteContext({ from: '__root__' })
  // Touch users can't hover, so mobile keeps cafe names visible. Not on the
  // non-interactive preview, which is a single click target.
  const showPinLabels = ua.isMobile && interactive
  const tiles = isDark ? TILES.dark : TILES.light
  // Forest-green overlays disappear on the dark basemap; switch to grove.
  const overlayColor = isDark ? COLORS.grove : COLORS.forest
  const circleAt =
    circleCenter !== undefined
      ? circleCenter
      : showResultsCircle && midpoint
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
      {showPinLabels && <PinLabelZoomGate />}
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
      {cafes.map((c) => (
        <Marker
          key={c.id}
          position={[c.coordinates.lat, c.coordinates.lng]}
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
          <Tooltip
            direction="top"
            offset={[0, -12]}
            opacity={1}
            permanent={showPinLabels}
            className={showPinLabels ? 'cafe-pin-label' : undefined}
          >
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
