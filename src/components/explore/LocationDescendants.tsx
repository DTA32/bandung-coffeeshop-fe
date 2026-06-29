import { useTranslation } from 'react-i18next'
import Image from '@/components/Image'
import LocaleLink from '@/components/LocaleLink'
import type { LocationData } from '@/lib/api/location'
import { cn } from '@/lib/cn'
import { exploreSplat } from '@/lib/explore'
import type { Location } from '@/lib/type'

const locationTypeHeadingKeys: Record<string, string> = {
  area: 'explore.areaHeading',
  poi: 'explore.poiHeading',
}

export function hasPoiDescendants(location: LocationData): boolean {
  return (
    (location.descendants?.length ?? 0) > 0 &&
    location.descendants![0].type === 'poi'
  )
}

export default function LocationDescendants({
  location,
  className,
}: {
  location: LocationData
  className?: string
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
  if (!location.descendants || location.descendants.length === 0) return null
  return (
    <div className={cn('flex flex-col gap-5 p-6 bg-white', className)}>
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
  )
}
