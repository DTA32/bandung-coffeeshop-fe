import { ArrowUpDown, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { LatLng, LatLngExpression } from 'leaflet'
import Breadcrumb from '@/components/Breadcrumb'
import { useLocale } from '@/lib/locale'
import { mitmCrumbs } from '@/lib/seo'
import CafeListItem from '@/components/explore/CafeListItem'
import type { SearchCafesData } from '@/lib/api/search'
import type { UserMarker } from './markers'
import MapView from './MapView'
import MarkerListItem from './MarkerListItem'
import SortSelect from './SortSelect'

type Props = {
  markers: UserMarker[]
  midpoint: LatLng | null
  midpointPosition: LatLngExpression | null
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

export default function DesktopLayout({
  markers,
  midpoint,
  midpointPosition,
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
    <main className="w-screen h-[95vh] relative">
      {alert && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 bg-grove-light text-amber-800 text-sm font-semibold px-4 py-2 rounded-md shadow-md z-50 transition-opacity duration-300 z-1000 text-center">
          {alert}
        </div>
      )}
      <MapView
        markers={markers}
        midpoint={midpointPosition}
        results={results}
        resultsRadiusKm={resultsRadiusKm}
        onAddMarker={onAddMarker}
        onMoveMarker={onMoveMarker}
        zoomControlPosition="bottomleft"
      />
      <div className="absolute top-10 left-8 flex flex-col z-1000 max-w-sm">
        <div className="flex flex-col rounded-t-2xl border border-grove-light bg-white/90 shadow-lg p-5 w-full gap-4">
          <div className="flex flex-col pt-2 px-2 mb-4">
            <Breadcrumb items={mitmCrumbs(t, locale)} className="mb-1" />
            <h1 className="text-2xl font-bold text-forest">
              {t('mitm.title')}
            </h1>
            <h2 className="text-moss-dark">{t('mitm.subtitle')}</h2>
          </div>
          <div className="flex flex-col">
            <p className="text-forest font-semibold">{t('mitm.yourMarkers')}</p>
            <p className="text-bark text-sm">{t('mitm.dropHint')}</p>
          </div>
          <div className="flex flex-col gap-3 max-h-60 overflow-y-auto">
            {markers.map((m) => (
              <MarkerListItem
                key={m.id}
                marker={m}
                isEditing={editingId === m.id}
                onStartEdit={() => onStartEdit(m.id)}
                onCancelEdit={onCancelEdit}
                onRename={(name) => onRenameMarker(m.id, name)}
                onRemove={() => onRemoveMarker(m.id)}
              />
            ))}
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex w-full justify-between text-forest font-semibold">
              <p>{t('mitm.searchRadius')}</p>
              <span>{radiusKm.toFixed(1)} km</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.5"
              value={radiusKm}
              onChange={(e) => onChangeRadius(parseFloat(e.target.value))}
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
                    {t('mitm.midpointCalculated')}
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
          onClick={onSearch}
          className="flex items-center justify-center gap-2 font-semibold w-full bg-forest text-cream py-3 rounded-b-lg hover:bg-moss cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Search size={16} />
          <span>
            {loading ? t('mitm.searching') : t('mitm.findMeetingSpots')}
          </span>
        </button>
      </div>
      {results && (
        <div className="absolute top-10 right-8 flex flex-col z-1000 max-w-sm border border-grove-light rounded-2xl bg-white/90 shadow-lg w-sm">
          {results.total === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 h-48 p-4 text-center">
              <p className="text-forest font-semibold">
                {t('mitm.noCafesFound')}
              </p>
              <p className="text-sm text-moss-dark">{t('mitm.tryAdjust')}</p>
            </div>
          ) : (
            <div className="flex flex-col p-5 w-full gap-4">
              <div className="flex flex-col">
                <p className="font-bold text-forest">
                  {t('mitm.cafesFound', { count: results.total })}
                </p>
                <p className="text-sm text-moss-dark">
                  {t('mitm.withinMidpoint', {
                    km: resultsRadiusKm.toFixed(1),
                  })}
                </p>
              </div>
              <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto">
                {results.cafes.map((cafe) => (
                  <CafeListItem key={cafe.id} cafe={cafe} smallVersion={true} />
                ))}
              </div>
              <div className="flex gap-2 justify-center items-center w-full">
                <ArrowUpDown size={16} className="text-bark" />
                <div className="flex items-center gap-2">
                  <span className="text-sm text-bark">{t('mitm.sortBy')}</span>
                  <SortSelect
                    value={sort}
                    onChange={onChangeSort}
                    className="cursor-pointer rounded-md py-1.5 text-sm text-grove focus:outline-none w-fit field-sizing-content pe-2"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  )
}
