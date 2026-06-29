import type { LocationData } from '@/lib/api/location'
import { ClientOnly } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { LatLngExpression } from 'leaflet'
import { MapView } from '@/components/map'
import WelcomeHeading from '@/components/explore/WelcomeHeading'
import Image from '@/components/Image'
import type { SearchCafesData } from '@/lib/api/search'
import { cn } from '@/lib/cn'

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
      className={cn(
        isMobile ? 'h-50' : 'h-60',
        location.show_map ? 'overflow-hidden' : 'overflow-scroll',
        'flex gap-2 w-full bg-grove-light relative',
      )}
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
            className="absolute inset-0 z-10 cursor-pointer"
          />
        </>
      ) : (
        location.images?.map((img, index) => (
          <figure key={index} className={`flex-shrink-0 relative w-full`}>
            <Image
              src={img.url}
              alt={img.description}
              layout="fullWidth"
              priority={index < 3}
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
        <div className="absolute z-20 left-0 bottom-0 w-full min-h-32 flex items-end px-6 py-3 text-xl font-bold text-white bg-linear-to-t from-black/70 to-transparent pointer-events-none">
          <WelcomeHeading location={location} />
        </div>
      )}
    </div>
  )
}
