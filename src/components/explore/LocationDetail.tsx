import type { LocationData } from '@/lib/api/location'
import { Link } from '@tanstack/react-router'
import type { Location } from '@/lib/type'
import { exploreSplat } from '@/lib/explore'
import LocationHero from '@/components/explore/LocationHero'
import WelcomeHeading from '@/components/explore/WelcomeHeading'
import type { SearchCafesData } from '@/lib/api/search'

const locationTypeMapping: Record<string, string> = {
  area: 'Area',
  poi: 'Point of Interest',
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
  const descendantName =
    location.descendants &&
    location.descendants.length > 0 &&
    location.descendants[0].type in locationTypeMapping
      ? locationTypeMapping[location.descendants[0].type]
      : 'Related locations'
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
        <div className={`${isMobile && `px-6 bg-white text-sm py-4`}`}>
          <h2 className="text-base font-semibold mb-2">About</h2>
          <p className="text-gray-600 whitespace-pre-line">
            {location.description}
          </p>
        </div>
      )}
      {location.descendants && location.descendants.length > 0 && (
        <div
          className={`flex flex-col gap-5 p-6 bg-white ${!isMobile && `rounded-2xl`}`}
        >
          <h2 className="text-lg font-semibold">{descendantName}</h2>
          <div className="flex overflow-scroll md:grid md:grid-cols-3 gap-4 pb-1">
            {location.descendants.map((desc) => {
              const splats = [...refs, desc]
              return (
                <Link
                  key={desc.id}
                  className="flex flex-col h-fit min-w-40 border border-forest-lighter rounded-lg transition hover:shadow-md shrink-0"
                  to={`/explore/$`}
                  params={{ _splat: exploreSplat(splats) }}
                >
                  <div className="h-20 w-full bg-grove-light rounded-t-lg">
                    {desc.thumbnail && (
                      <img
                        src={desc.thumbnail}
                        alt={desc.name}
                        className="w-full h-full object-cover object-center rounded-t-lg"
                      />
                    )}
                  </div>
                  <h3 className="text-sm font-medium p-2">{desc.name}</h3>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
