import { useTranslation } from 'react-i18next'
import LocationDescendants, {
  hasPoiDescendants,
} from '@/components/explore/LocationDescendants'
import LocationHero from '@/components/explore/LocationHero'
import WelcomeHeading from '@/components/explore/WelcomeHeading'
import type { LocationData } from '@/lib/api/location'
import type { SearchCafesData } from '@/lib/api/search'
import { cn } from '@/lib/cn'

export default function LocationDetail({
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
  return (
    <div className="flex flex-col gap-4">
      <LocationHero
        location={location}
        isMobile={isMobile}
        searchResult={searchResult}
        onExpandMap={onExpandMap}
      />
      {!isMobile && (
        <WelcomeHeading location={location} className="text-2xl font-bold" />
      )}
      {location.description && (
        <div className={cn(isMobile && 'px-6 bg-white text-sm py-4')}>
          <h2 className="text-base font-semibold mb-2">{t('explore.about')}</h2>
          <p className="text-muted whitespace-pre-line">
            {location.description}
          </p>
        </div>
      )}
      {(!isMobile || !hasPoiDescendants(location)) && (
        <LocationDescendants location={location} className={cn(!isMobile && "rounded-2xl")} />
      )}
    </div>
  )
}
