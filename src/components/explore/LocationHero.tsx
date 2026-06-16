import type { LocationData } from '@/lib/api/location'
import { ClientOnly } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { LatLngExpression } from 'leaflet'
import type { SearchCafesData } from '@/lib/api/search'
import MapView from '@/components/meet-in-the-middle/MapView'
import WelcomeHeading from '@/components/explore/WelcomeHeading'

export default function LocationHero({
  location,
  isMobile,
  searchResult,
  onExpandMap,
}: {
  location: LocationData
  isMobile: boolean
  searchResult: SearchCafesData | null
  onExpandMap: () => void
}) {
  const { t } = useTranslation()
  const polygonCenterLatLng = location.polygon
    ? L.geoJson(location.polygon).getBounds().getCenter()
    : null
  const polygonCenter: LatLngExpression | null = polygonCenterLatLng
    ? [polygonCenterLatLng.lat, polygonCenterLatLng.lng]
    : null

  return (
    <div
      className={`${isMobile ? `h-50` : `h-60`} ${location.show_map ? `overflow-hidden` : `overflow-scroll`} flex gap-2 w-full bg-grove-light relative`}
    >
      {location.show_map ? (
        <>
          <ClientOnly
            fallback={
              <div className="flex h-full w-full items-center justify-center bg-grove-light/30 text-forest">
                {t('mitm.loadingMap')}
              </div>
            }
          >
            <MapView
              markers={[]}
              midpoint={null}
              results={searchResult}
              resultsRadiusKm={0}
              polygon={location.polygon}
              center={polygonCenter ?? undefined}
              zoom={13}
              interactive={false}
            />
          </ClientOnly>
          <button
            type="button"
            onClick={onExpandMap}
            aria-label={t('explore.expandMapOf', { name: location.name })}
            className="absolute inset-0 z-1000 cursor-pointer"
          />
        </>
      ) : (
        location.images?.map((img, index) => (
          <figure key={index} className={`flex-shrink-0 relative w-full`}>
            <img
              src={img.url}
              alt={img.description}
              className="w-full h-full object-cover"
            />
            {img.description && (
              <figcaption className="absolute bottom-0 left-0 py-1 m-2 z-5 bg-black/50 text-white text-xs px-1 rounded select-none">
                {img.description}
              </figcaption>
            )}
          </figure>
        ))
      )}
      {isMobile && (
        <div className="absolute z-1500 left-0 bottom-0 w-full min-h-32 flex items-end px-6 py-3 text-xl font-bold text-white bg-linear-to-t from-black/70 to-transparent pointer-events-none">
          <WelcomeHeading location={location} />
        </div>
      )}
    </div>
  )
}
