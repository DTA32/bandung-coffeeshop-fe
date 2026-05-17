import { ClientOnly, createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import {
  Circle,
  MapContainer,
  Marker,
  TileLayer,
  Tooltip,
  useMapEvents,
  ZoomControl,
} from 'react-leaflet'
import L from 'leaflet'
import type { LatLngExpression, LatLngTuple } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { ArrowUpDown, Search, X } from 'lucide-react'
import CafeListItem from '@/components/explore/CafeListItem'
import { searchCafes } from '@/lib/api/search'
import type { SearchCafesData } from '@/lib/api/search'

type MarkerSearch = { m?: string[] }

export const Route = createFileRoute('/meet-in-the-middle')({
  validateSearch: (search: Record<string, unknown>): MarkerSearch => {
    const raw = search.m
    const arr = Array.isArray(raw) ? raw : raw != null ? [raw] : undefined
    return arr ? { m: arr.map(String) } : {}
  },
  component: () => {
    return (
      <ClientOnly
        fallback={
          <div className="flex h-128 items-center justify-center text-lg text-forest">
            Loading map...
          </div>
        }
      >
        <MeetInTheMiddle />
      </ClientOnly>
    )
  },
})

function encodeMarker(m: UserMarker) {
  return `${m.lat},${m.lng},${m.color.replace('#', '')},${encodeURIComponent(m.name)}`
}

function decodeMarker(entry: string, i: number): UserMarker | null {
  const parts = entry.split(',')
  const lat = parseFloat(parts[0])
  const lng = parseFloat(parts[1])
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
  const givenColor =
    parts[2] && parts[2].match(/^[0-9A-Fa-f]{6}$/) ? `#${parts[2]}` : null
  const color = `${givenColor ?? '#4A7038'}`
  const givenName =
    parts.length > 3 && parts.slice(3).join(',').trim()
      ? decodeURIComponent(parts.slice(3).join(','))
      : null
  const name = givenName ? givenName : `Marker ${i + 1}`
  return { id: `m-${i}`, lat, lng, color, name }
}

const COLOR_CHOICES = ['#4A7038', '#2A3D22', '#6B8E23', '#A05A10', '#8FBC8F']
const SORT_OPTIONS = [
  { value: 'distance', label: 'Distance' },
  { value: 'default', label: 'Best match' },
  { value: 'rating', label: 'Rating' },
  { value: 'price_range', label: 'Price' },
  { value: 'updated_at', label: 'Recently updated' },
]

type UserMarker = {
  id: string
  lat: number
  lng: number
  name: string
  color: string
}

function userIcon(color: string, name: string) {
  const safeName = name.replace(/</g, '&lt;').replace(/>/g, '&gt;')
  return L.divIcon({
    className: '',
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;transform:translate(-50%,-100%)">
        <span style="margin-top:2px;background:white;border:1px solid #D4E3C5;border-radius:6px;padding:2px 6px;font-size:11px;color:#2A3D22;white-space:nowrap;font-family:inherit">${safeName}</span>
        <div style="position:relative;width:16px;height:16px;border-radius:50%;background:${color}BF;box-shadow:0 1px 4px rgba(0,0,0,.3)">
            <span style="position:absolute;top:50%;left:50%;width:8px;height:8px;background:${color};border-radius:50%;transform:translate(-50%,-50%)"></span>
        </div>
      </div>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  })
}

const midpointIcon = L.divIcon({
  className: '',
  html: `<div style="width:16px;height:16px;border-radius:50%;background:#2A3D22;border:3px solid white;box-shadow:0 1px 4px rgba(0,0,0,.3);transform:translate(-50%,-50%)"></div>`,
  iconSize: [0, 0],
  iconAnchor: [0, 0],
})

const cafeIcon = L.divIcon({
  className: '',
  html: `<div style="width:24px;height:24px;border-radius:50%;background:#F7F5EE;border:2px solid #6A9E52;box-shadow:0 1px 4px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;color:white;font-size:13px;line-height:1">☕</div>`,
  iconSize: [26, 26],
  iconAnchor: [13, 13],
})

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

function MeetInTheMiddle() {
  const defaultPosition: LatLngExpression = [
    -6.901557664008111, 107.6177579567244,
  ]
  const search = Route.useSearch()
  const navigate = Route.useNavigate()

  const markers: UserMarker[] = useMemo(() => {
    if (!search.m) return []
    return search.m
      .map((entry, i) => decodeMarker(entry, i))
      .filter((m): m is UserMarker => m !== null)
  }, [search.m])

  const [radiusKm, setRadiusKm] = useState(1.0)
  const [sort, setSort] = useState<string>('distance')
  const [results, setResults] = useState<SearchCafesData | null>(null)
  const [resultsRadiusKm, setResultsRadiusKm] = useState(1.0)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState<string>('')

  const midpoint = useMemo(() => {
    if (markers.length < 2) return null
    const bounds = L.latLngBounds(
      markers.map((m) => [m.lat, m.lng] as LatLngTuple),
    )
    return bounds.getCenter()
  }, [markers])

  function commitMarkers(next: UserMarker[], opts: { replace?: boolean } = {}) {
    navigate({
      search: (prev) => ({
        ...prev,
        m: next.length ? next.map(encodeMarker) : undefined,
      }),
      replace: opts.replace ?? false,
    })
  }

  function addMarker(lat: number, lng: number) {
    setResults(null)
    commitMarkers([
      ...markers,
      {
        id: `m-${markers.length}`,
        lat,
        lng,
        name: `Marker ${markers.length + 1}`,
        color: COLOR_CHOICES[Math.floor(Math.random() * COLOR_CHOICES.length)],
      },
    ])
  }

  function removeMarker(id: string) {
    setEditingId(null)
    setResults(null)
    commitMarkers(markers.filter((m) => m.id !== id))
  }

  function renameMarker(id: string, name: string) {
    commitMarkers(markers.map((m) => (m.id === id ? { ...m, name } : m)))
  }

  function updateMarkerPosition(id: string, lat: number, lng: number) {
    setResults(null)
    commitMarkers(
      markers.map((m) => (m.id === id ? { ...m, lat, lng } : m)),
      { replace: true },
    )
  }

  async function runSearch(sortValue: string | undefined = sort) {
    if (!midpoint) return
    setLoading(true)
    try {
      const data = await searchCafes({
        sort: sortValue,
        size: 200,
        page: 1,
        query_coords: `${midpoint.lat},${midpoint.lng}`,
        radius_max: radiusKm * 1000,
      })
      setResults(data)
      setResultsRadiusKm(radiusKm)
    } catch (e) {
      console.log(e)
      setAlert('Failed to fetch cafes. Please try again.')
      setTimeout(() => setAlert(''), 3000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-screen h-[95vh] relative">
      {alert && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 bg-grove-light text-amber-800 text-sm font-semibold px-4 py-2 rounded-md shadow-md z-50 transition-opacity duration-300 z-1000">
          {alert}
        </div>
      )}
      <MapContainer
        style={{ width: '100%', height: '100%' }}
        center={defaultPosition}
        zoom={13}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ZoomControl position={'bottomleft'} />
        <ClickHandler onAdd={addMarker} />
        {markers.map((m) => (
          <Marker
            key={m.id}
            position={[m.lat, m.lng]}
            icon={userIcon(m.color, m.name)}
            draggable
            eventHandlers={{
              dragend: (e) => {
                const ll = e.target.getLatLng()
                updateMarkerPosition(m.id, ll.lat, ll.lng)
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
      <div className="absolute top-10 left-8 flex flex-col z-1000 max-w-sm">
        <div className="flex flex-col rounded-t-2xl border border-grove-light bg-white/90 shadow-lg p-5 w-full gap-4">
          <div className="flex flex-col pt-2 px-2 mb-4">
            <h1 className="text-2xl font-bold text-forest">
              Meet in the Middle
            </h1>
            <h2 className="text-moss-dark">
              Drop markers for each person, find the middle, discover cafes
              nearby.
            </h2>
          </div>
          <div className="flex flex-col">
            <p className="text-forest font-semibold">Your markers</p>
            <p className="text-bark text-sm">
              Click anywhere on the map to drop a pin
            </p>
          </div>
          <div className="flex flex-col gap-3 max-h-60 overflow-y-auto">
            {markers.map((m) => (
              <div
                key={m.id}
                className="flex w-full justify-between px-4 py-2 rounded-lg bg-forest-lighter"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: m.color }}
                  />
                  <div className="flex flex-col min-w-0">
                    {editingId === m.id ? (
                      <input
                        autoFocus
                        defaultValue={m.name}
                        onBlur={(e) => {
                          renameMarker(m.id, e.target.value.trim() || m.name)
                          setEditingId(null)
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            renameMarker(
                              m.id,
                              e.currentTarget.value.trim() || m.name,
                            )
                            setEditingId(null)
                          } else if (e.key === 'Escape') {
                            setEditingId(null)
                          }
                        }}
                        className="font-semibold text-forest bg-white border border-grove-light rounded px-1 py-0.5 text-sm outline-none focus:border-forest"
                      />
                    ) : (
                      <button
                        onClick={() => setEditingId(m.id)}
                        className="font-semibold text-forest text-left cursor-text hover:underline"
                      >
                        {m.name}
                      </button>
                    )}
                    <span className="text-xs text-bark truncate">
                      {m.lat.toFixed(4)}, {m.lng.toFixed(4)}
                    </span>
                  </div>
                </div>
                <button
                  className="cursor-pointer"
                  onClick={() => removeMarker(m.id)}
                >
                  <X
                    size={16}
                    className="text-bark hover:text-forest transition-colors"
                  />
                </button>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex w-full justify-between text-forest font-semibold">
              <p>Search Radius</p>
              <span>{radiusKm.toFixed(1)} km</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.5"
              value={radiusKm}
              onChange={(e) => {
                setRadiusKm(parseFloat(e.target.value))
                setResults(null)
              }}
              className="w-full h-2 bg-grove-light accent-forest rounded-lg appearance-none cursor-pointer mt-2"
            />
            <div className="flex justify-between">
              <span className="text-xs text-bark">0.5 km</span>
              <span className="text-xs text-bark">3.0 km</span>
            </div>
          </div>
          {midpoint && (
            <div className="flex w-full justify-between mt-4 rounded-lg">
              <div className="flex items-center gap-4">
                <span className="w-3 h-3 rounded-full shrink-0 bg-forest" />
                <div className="flex flex-col text-sm">
                  <span className="font-semibold text-forest">
                    Midpoint calculated
                  </span>
                  <span className="text-bark text-xs">
                    {midpoint.lat.toFixed(4)}, {midpoint.lng.toFixed(4)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
        <button
          disabled={!midpoint || loading}
          onClick={() => runSearch()}
          className="flex items-center justify-center gap-2 font-semibold w-full bg-forest text-cream py-3 rounded-b-lg hover:bg-moss cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Search size={16} />
          <span>{loading ? 'Searching...' : 'Find Meeting Spots'}</span>
        </button>
      </div>
      {results && (
        <div className="absolute top-10 right-8 flex flex-col z-1000 max-w-sm border border-grove-light rounded-2xl bg-white/90 shadow-lg w-sm">
          {results.total === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 h-48 p-4 text-center">
              <p className="text-forest font-semibold">No cafes found</p>
              <p className="text-sm text-moss-dark">
                Try increasing the search radius or adjusting the midpoint.
              </p>
            </div>
          ) : (
            <div className="flex flex-col p-5 w-full gap-4">
              <div className="flex flex-col">
                <p className="font-bold text-forest">
                  {results.total} Cafes found
                </p>
                <p className="text-sm text-moss-dark">
                  within {resultsRadiusKm.toFixed(1)}km of midpoint
                </p>
              </div>
              <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto">
                {results.cafes.map((cafe) => (
                  <CafeListItem
                    key={cafe.id}
                    cafe={cafe}
                    smallVersion={true}
                    openNewTab={true}
                  />
                ))}
              </div>
              <div className="flex gap-2 justify-center items-center w-full">
                <ArrowUpDown size={16} className="text-bark" />
                <div className="flex items-center gap-2">
                  <span className="text-sm text-bark">Sort by:</span>
                  <select
                    value={sort}
                    onChange={(e) => {
                      setSort(e.target.value)
                      runSearch(e.target.value)
                    }}
                    className="cursor-pointer rounded-md py-1.5 text-sm text-grove focus:outline-none"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
