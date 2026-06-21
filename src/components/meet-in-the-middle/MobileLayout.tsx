import { ArrowUpDown, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { LatLngExpression } from 'leaflet'
import Breadcrumb from '@/components/Breadcrumb'
import { useLocale } from '@/lib/locale'
import { mitmCrumbs } from '@/lib/seo'
import CafeListItem from '@/components/explore/CafeListItem'
import type { SearchCafesData } from '@/lib/api/search'
import type { UserMarker } from './markers'
import MapView from './MapView'
import MarkerListItem from './MarkerListItem'
import SortSelect from './SortSelect'

const RADIUS_PRESETS = [
  { val: 0.5, label: '500m' },
  { val: 1.0, label: '1km' },
  { val: 2.0, label: '2km' },
]

type Props = {
  markers: UserMarker[]
  midpoint: LatLngExpression | null
  radiusKm: number
  onChangeRadius: (km: number) => void
  results: SearchCafesData | null
  resultsRadiusKm: number
  sort: string
  onChangeSort: (sort: string) => void
  editingId: string | null
  onStartEdit: (id: string) => void
  onCancelEdit: () => void
  onRenameMarker: (id: string, name: string) => void
  onRemoveMarker: (id: string) => void
  onAddMarker: (lat: number, lng: number) => void
  onMoveMarker: (id: string, lat: number, lng: number) => void
  loading: boolean
  alert: string
  onSearch: () => void
}

export default function MobileLayout({
  markers,
  midpoint,
  radiusKm,
  onChangeRadius,
  results,
  resultsRadiusKm,
  sort,
  onChangeSort,
  editingId,
  onStartEdit,
  onCancelEdit,
  onRenameMarker,
  onRemoveMarker,
  onAddMarker,
  onMoveMarker,
  loading,
  alert,
  onSearch,
}: Props) {
  const { t } = useTranslation()
  const locale = useLocale()
  return (
    <main className="flex flex-col bg-cream min-h-screen mb-8">
      {alert && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-grove-light text-amber-800 text-sm font-semibold px-4 py-2 rounded-md shadow-md z-1000 transition-opacity duration-300 text-center">
          {alert}
        </div>
      )}
      <div className="bg-forest text-cream px-5 py-4">
        <h1 className="text-lg font-bold">{t('mitm.title')}</h1>
        <p className="text-xs text-cream/80">{t('mitm.subtitle')}</p>
      </div>
      <div className="flex flex-col bg-white border-b border-grove-light p-4 gap-3">
        <div className="flex flex-col">
          <p className="text-forest font-semibold text-sm">
            {t('mitm.yourMarkers')}
          </p>
          <p className="text-bark text-xs">{t('mitm.dropHintMobile')}</p>
        </div>
        {markers.length > 0 && (
          <div className="flex flex-col gap-2 max-h-40 overflow-y-auto">
            {markers.map((m) => (
              <MarkerListItem
                key={m.id}
                marker={m}
                isEditing={editingId === m.id}
                onStartEdit={() => onStartEdit(m.id)}
                onCancelEdit={onCancelEdit}
                onRename={(name) => onRenameMarker(m.id, name)}
                onRemove={() => onRemoveMarker(m.id)}
                compact
              />
            ))}
          </div>
        )}
        <div className="flex items-center justify-between gap-3">
          <p className="text-forest font-semibold text-sm">
            {t('mitm.searchRadius')}
          </p>
          <div className="flex items-center gap-1.5">
            {RADIUS_PRESETS.map((opt) => {
              const active = radiusKm === opt.val
              return (
                <button
                  key={opt.val}
                  onClick={() => onChangeRadius(opt.val)}
                  className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                    active
                      ? 'bg-forest text-cream'
                      : 'bg-white text-forest border border-grove-light'
                  }`}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>
      <div className="h-80 w-full">
        <MapView
          markers={markers}
          midpoint={midpoint}
          results={results}
          resultsRadiusKm={resultsRadiusKm}
          onAddMarker={onAddMarker}
          onMoveMarker={onMoveMarker}
        />
      </div>
      <button
        disabled={!midpoint || loading}
        onClick={onSearch}
        className="flex items-center justify-center gap-2 font-semibold w-full bg-forest text-cream py-4 cursor-pointer hover:bg-moss transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Search size={16} />
        <span>
          {loading ? t('mitm.searching') : t('mitm.findMeetingSpots')}
        </span>
      </button>
      {results ? (
        <div className="flex flex-col bg-cream px-4 py-4 gap-3">
          {results.total === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
              <p className="text-forest font-semibold">
                {t('mitm.noCafesFound')}
              </p>
              <p className="text-sm text-moss-dark">{t('mitm.tryAdjust')}</p>
            </div>
          ) : (
            <>
              <div className="flex w-full items-center justify-between">
                <div className="flex flex-col">
                  <p className="font-bold text-forest">
                    {t('mitm.cafesFound', { count: results.total })}
                  </p>
                  <p className="text-xs text-moss-dark">
                    {t('mitm.withinMidpoint', {
                      km: resultsRadiusKm.toFixed(1),
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <ArrowUpDown size={14} className="text-bark" />
                  <SortSelect value={sort} onChange={onChangeSort} />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {results.cafes.map((cafe) => (
                  <CafeListItem key={cafe.id} cafe={cafe} smallVersion={true} />
                ))}
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="flex-1" />
      )}
      <Breadcrumb
        items={mitmCrumbs(t, locale)}
        className="px-5 pt-4 justify-self-end"
      />
    </main>
  )
}
