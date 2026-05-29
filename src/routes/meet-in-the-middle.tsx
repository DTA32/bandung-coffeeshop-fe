import {
  ClientOnly,
  createFileRoute,
  useRouteContext,
} from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import L from 'leaflet'
import type { LatLngTuple } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import DesktopLayout from '@/components/meet-in-the-middle/DesktopLayout'
import MobileLayout from '@/components/meet-in-the-middle/MobileLayout'
import {
  decodeMarker,
  encodeMarker,
  randomGreenHex,
} from '@/components/meet-in-the-middle/markers'
import type { UserMarker } from '@/components/meet-in-the-middle/markers'
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
          <div className="flex h-screen md:h-128 items-center justify-center text-lg text-forest">
            Loading map...
          </div>
        }
      >
        <MeetInTheMiddle />
      </ClientOnly>
    )
  },
})

function MeetInTheMiddle() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const { ua } = useRouteContext({ from: '__root__' })

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
        color: randomGreenHex(),
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

  function changeRadius(km: number) {
    setRadiusKm(km)
    setResults(null)
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

  function handleChangeSort(next: string) {
    setSort(next)
    runSearch(next)
  }

  const sharedProps = {
    markers,
    radiusKm,
    onChangeRadius: changeRadius,
    results,
    resultsRadiusKm,
    sort,
    onChangeSort: handleChangeSort,
    editingId,
    onStartEdit: setEditingId,
    onCancelEdit: () => setEditingId(null),
    onRenameMarker: renameMarker,
    onRemoveMarker: removeMarker,
    onAddMarker: addMarker,
    onMoveMarker: updateMarkerPosition,
    loading,
    alert,
    onSearch: () => runSearch(),
  }

  if (ua.isMobile) {
    return <MobileLayout {...sharedProps} midpoint={midpoint} />
  }

  return (
    <DesktopLayout
      {...sharedProps}
      midpoint={midpoint}
      midpointPosition={midpoint}
    />
  )
}
