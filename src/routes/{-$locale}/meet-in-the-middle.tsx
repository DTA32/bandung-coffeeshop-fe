import {
  ClientOnly,
  createFileRoute,
  useRouteContext,
} from '@tanstack/react-router'
import L from 'leaflet'
import type { LatLngTuple } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { decodeMarker, encodeMarker, randomGreenHex } from '@/components/map'
import type { UserMarker } from '@/components/map'
import { DesktopLayout, MobileLayout } from '@/components/meet-in-the-middle'
import { searchCafes, searchCafeMarkers } from '@/lib/api/search'
import type { SearchCafesData, CafeMarker } from '@/lib/api/search'
import { useLocale } from '@/lib/locale'
import {
  seoHead,
  localizedPath,
  mitmCrumbs,
  breadcrumbJsonLd,
  webApplicationJsonLd,
} from '@/lib/seo'
import type { SeoMeta } from '@/lib/seo'
import { createI18n, normalizeLocale } from '@/i18n'

// `m` accepts a single value or a repeated param; normalize to string[].
const MarkerSearchSchema = z.object({
  m: z
    .preprocess(
      (v) => (v == null ? undefined : (Array.isArray(v) ? v : [v]).map(String)),
      z.array(z.string()).optional(),
    )
    .optional(),
})
type MarkerSearch = z.infer<typeof MarkerSearchSchema>

export const Route = createFileRoute('/{-$locale}/meet-in-the-middle')({
  validateSearch: (search: Record<string, unknown>): MarkerSearch =>
    MarkerSearchSchema.parse(search),
  head: (ctx: any) => {
    const locale = normalizeLocale(ctx.params.locale)
    const i18n = createI18n(locale)
    const path = localizedPath(locale, '/meet-in-the-middle')
    const seo: SeoMeta = {
      title: i18n.t('seo.mitmTitle'),
      description: i18n.t('seo.mitmDesc'),
      canonicalPath: path,
      locale,
      jsonLd: [
        breadcrumbJsonLd(mitmCrumbs((k) => i18n.t(k), locale)),
        webApplicationJsonLd(i18n.t('mitm.title'), path),
      ],
    }
    return seoHead(seo)
  },
  component: MeetInTheMiddleRoute,
})

function MeetInTheMiddleRoute() {
  const { t } = useTranslation()
  return (
    <ClientOnly
      fallback={
        <div className="flex flex-1 items-center justify-center text-lg text-forest">
          {t('mitm.loadingMap')}
        </div>
      }
    >
      <MeetInTheMiddle />
    </ClientOnly>
  )
}

// Encapsulates all Meet-in-the-Middle state and navigation logic, leaving the
// component responsible only for choosing between the mobile and desktop layouts.
function useMeetInTheMiddle() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const { t } = useTranslation()
  const locale = useLocale()

  const markers: UserMarker[] = useMemo(() => {
    if (!search.m) return []
    return search.m
      .map((entry, i) =>
        decodeMarker(entry, i, t('mitm.marker', { number: i + 1 })),
      )
      .filter((m): m is UserMarker => m !== null)
  }, [search.m, t])

  const [radiusKm, setRadiusKm] = useState(1.0)
  const [sort, setSort] = useState<string>('distance')
  const [results, setResults] = useState<SearchCafesData | null>(null)
  const [cafeMarkers, setCafeMarkers] = useState<CafeMarker[]>([])
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

  // Clearing the previous search drops both its list and its pins, so a stale
  // marker set never lingers after the markers/radius change that invalidated
  // it.
  function clearResults() {
    setResults(null)
    setCafeMarkers([])
  }

  function addMarker(lat: number, lng: number) {
    clearResults()
    commitMarkers([
      ...markers,
      {
        id: `m-${markers.length}`,
        lat,
        lng,
        name: t('mitm.marker', { number: markers.length + 1 }),
        color: randomGreenHex(),
      },
    ])
  }

  function removeMarker(id: string) {
    setEditingId(null)
    clearResults()
    commitMarkers(markers.filter((m) => m.id !== id))
  }

  function renameMarker(id: string, name: string) {
    commitMarkers(markers.map((m) => (m.id === id ? { ...m, name } : m)))
  }

  function updateMarkerPosition(id: string, lat: number, lng: number) {
    clearResults()
    commitMarkers(
      markers.map((m) => (m.id === id ? { ...m, lat, lng } : m)),
      { replace: true },
    )
  }

  function changeRadius(km: number) {
    setRadiusKm(km)
    clearResults()
  }

  // runSearch fetches the paginated list. On the initial search (and any
  // filter/radius change) it also refetches the map pins from the markers
  // endpoint; a sort change passes refetchMarkers=false since sort order is
  // irrelevant to pins.
  async function runSearch(
    sortValue: string | undefined = sort,
    refetchMarkers = true,
  ) {
    if (!midpoint) return
    setLoading(true)
    const coords = `${midpoint.lat},${midpoint.lng}`
    const radiusM = radiusKm * 1000
    try {
      const [data, markerData] = await Promise.all([
        searchCafes(
          {
            sort: sortValue,
            size: 200,
            page: 1,
            query_coords: coords,
            radius_max: radiusM,
          },
          locale,
        ),
        refetchMarkers
          ? searchCafeMarkers(
              { query_coords: coords, radius_max: radiusM },
              locale,
            )
          : Promise.resolve<CafeMarker[] | null>(null),
      ])
      setResults(data)
      if (markerData) setCafeMarkers(markerData)
      setResultsRadiusKm(radiusKm)
    } catch (e) {
      console.log(e)
      setAlert(t('mitm.fetchFailed'))
      setTimeout(() => setAlert(''), 3000)
    } finally {
      setLoading(false)
    }
  }

  function handleChangeSort(next: string) {
    setSort(next)
    runSearch(next, false)
  }

  const sharedProps = {
    markers,
    radiusKm,
    onChangeRadius: changeRadius,
    results,
    cafeMarkers,
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

  return { sharedProps, midpoint }
}

function MeetInTheMiddle() {
  const { ua } = useRouteContext({ from: '__root__' })
  const { sharedProps, midpoint } = useMeetInTheMiddle()

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
