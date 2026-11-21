import { ArrowUpDown, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { LatLngExpression } from 'leaflet'
import Breadcrumb from '@/components/Breadcrumb'
import { CafeListItem, SkeletonCafeListItem } from '@/components/cafe'
import { MapView } from '@/components/map'
import type { UserMarker } from '@/components/map'
import MarkerListItem from './MarkerListItem'
import ResultsListFooter from './ResultsListFooter'
import SortSelect from './SortSelect'
import type { SearchCafesData, CafeMarker } from '@/lib/api/search'
import { useLocale } from '@/lib/locale'
import { mitmCrumbs } from '@/lib/seo'
import { cn } from '@/lib/cn'
import Toast from '@/components/shared/Toast'

const RADIUS_PRESETS = [
  { val: 0.5, label: '500m' },
  { val: 1.0, label: '1km' },
  { val: 2.0, label: '2km' },
]

// Placeholder rows shown on the first search, before any results exist.
const SKELETON_ROWS = [0, 1, 2, 3]

type Props = {
  markers: UserMarker[]
  midpoint: LatLngExpression | null
  radiusKm: number
  onChangeRadius: (km: number) => void
  results: SearchCafesData | null
  cafeMarkers: CafeMarker[]
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
  hasMore: boolean
  loadingMore: boolean
  loadMoreFailed: boolean
  onLoadMore: () => void
}

export default function MobileLayout({
  markers,
  midpoint,
  radiusKm,
  onChangeRadius,
  results,
  cafeMarkers,
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
  hasMore,
  loadingMore,
  loadMoreFailed,
  onLoadMore,
}: Props) {
  const { t } = useTranslation()
  const locale = useLocale()
  return (
    <main className="flex flex-col bg-cream min-h-screen mb-8">
      {alert && (
        <Toast tone="warning" className="fixed top-4 z-20">
          {alert}
        </Toast>
      )}
      <div className="bg-forest dark:bg-cream text-cream dark:text-moss px-5 py-4">
        <h1 className="text-lg font-bold">{t('mitm.title')}</h1>
        <p className="text-xs text-cream/80 dark:text-moss/80">
          {t('mitm.subtitle')}
        </p>
      </div>
      <div className="flex flex-col bg-surface border-b border-grove-light p-4 gap-3">
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
                  className={cn(
                    'px-3.5 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer',
                    active
                      ? 'bg-forest text-cream'
                      : 'bg-surface text-forest border border-grove-light',
                  )}
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
          cafes={cafeMarkers}
          resultsRadiusKm={resultsRadiusKm}
          showResultsCircle={results !== null}
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
      {/* One section from the first search on: it slides up once with the
          placeholder rows inside and stays mounted while they're swapped for
          results, so re-searches, sort changes and more pages don't replay it. */}
      {loading || results ? (
        <div
          aria-busy={!results || undefined}
          className={cn(
            'flex flex-col bg-cream px-4 py-4 motion-safe:animate-slide-up',
            results ? 'gap-3' : 'flex-1 gap-2',
          )}
        >
          {!results ? (
            SKELETON_ROWS.map((i) => <SkeletonCafeListItem key={i} />)
          ) : results.total === 0 ? (
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
              <div
                aria-busy={loading}
                className={cn(
                  'flex flex-col gap-2 transition-opacity',
                  loading && 'opacity-50',
                )}
              >
                {results.cafes.map((cafe) => (
                  <CafeListItem key={cafe.id} cafe={cafe} />
                ))}
                <ResultsListFooter
                  hasMore={hasMore}
                  loadingMore={loadingMore}
                  loadMoreFailed={loadMoreFailed}
                  onLoadMore={onLoadMore}
                />
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
