import type { LocationData } from '@/lib/api/location'
import { useTranslation } from 'react-i18next'
import LocaleLink from '@/components/LocaleLink'
import Image from '@/components/Image'
import LocationHero from '@/components/explore/LocationHero'
import WelcomeHeading from '@/components/explore/WelcomeHeading'
import type { SearchCafesData } from '@/lib/api/search'
import { exploreSplat } from '@/lib/explore'
import type { Location } from '@/lib/type'
import { cn } from '@/lib/cn'

const locationTypeHeadingKeys: Record<string, string> = {
  area: 'explore.areaHeading',
  poi: 'explore.poiHeading',
}

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
  const descendantName =
    location.descendants &&
    location.descendants.length > 0 &&
    location.descendants[0].type in locationTypeHeadingKeys
      ? t(locationTypeHeadingKeys[location.descendants[0].type])
      : t('explore.relatedLocations')
  const currentLocation: Location = {
    id: location.id,
    name: location.name,
    type: location.type,
    thumbnail: null,
  }
  const refs = [...location.ancestors, currentLocation]
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
      {location.descendants && location.descendants.length > 0 && (
        <div
          className={cn(
            'flex flex-col gap-5 p-6 bg-white',
            !isMobile && 'rounded-2xl',
          )}
        >
          <h2 className="text-lg font-semibold">{descendantName}</h2>
          <div className="flex overflow-scroll lg:grid lg:grid-cols-2 xl:grid-cols-3 gap-4 pb-1">
            {location.descendants.map((desc) => {
              const splats = [...refs, desc]
              return (
                <LocaleLink
                  key={desc.id}
                  className="flex flex-col h-fit w-full min-w-40 max-w-50 border border-forest-lighter rounded-lg transition hover:shadow-md shrink-0"
                  to="/{-$locale}/explore/$"
                  params={{ _splat: exploreSplat(splats) }}
                >
                  <div className="h-20 w-full bg-grove-light rounded-t-lg">
                    {desc.thumbnail && (
                      <Image
                        src={desc.thumbnail}
                        alt={desc.name}
                        layout="constrained"
                        width={200}
                        aspectRatio={200 / 80}
                        className="w-full h-full object-cover object-center rounded-t-lg"
                      />
                    )}
                  </div>
                  <h3 className="text-sm font-medium p-2">{desc.name}</h3>
                </LocaleLink>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
