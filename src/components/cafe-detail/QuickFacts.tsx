import { Link } from '@tanstack/react-router'
import type { CafeTags } from '@/lib/api/cafe'
import { LOCATION_SHORT_LABELS } from '@/lib/constants'
import { exploreSplat } from '@/lib/explore'
import type { Location } from '@/lib/type'

interface QuickFactsProps {
  instagram: string | null
  locations: Location[]
  tags: CafeTags[]
  openHour: string | null
  closeHour: string | null
}

function getLastLocation(locations: Location[]) {
  // only supports district and area for now
  if (locations.length > 2 || locations.length < 1) {
    return null
  }
  const lastLocation = locations.at(-1)
  if (lastLocation === undefined) return null
  return (
    <div className="flex justify-between items-center">
      <dt className="text-xs text-bark">
        {LOCATION_SHORT_LABELS[lastLocation.type]}
      </dt>
      <dd className="text-xs font-semibold text-forest m-0">
        <Link
          to={`/explore/$`}
          params={{ _splat: exploreSplat(locations) }}
          className="hover:underline"
        >
          {lastLocation.name}
        </Link>
      </dd>
    </div>
  )
}

export default function QuickFacts({
  instagram,
  locations,
  tags,
  openHour,
  closeHour,
}: QuickFactsProps) {
  let hours = ''
  if (openHour !== null && closeHour !== null) {
    if (openHour === closeHour) {
      hours = '24 hours'
    } else {
      hours = `${openHour} - ${closeHour}`
    }
  } else if (openHour !== null) {
    hours = `Open from ${openHour}`
  } else if (closeHour !== null) {
    hours = `Closes at ${closeHour}`
  }
  const lastLocationEl = getLastLocation(locations)

  return (
    <div className="bg-white rounded-2xl p-5 flex flex-col gap-3">
      <h2 className="text-base font-bold text-forest m-0">Quick Facts</h2>
      <dl className="flex flex-col gap-3 m-0">
        {instagram && (
          <div className="flex justify-between items-center">
            <dt className="text-xs text-bark">Instagram</dt>
            <dd className="text-xs font-semibold text-forest m-0">
              <a
                href={`https://www.instagram.com/${instagram}`}
                className="hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                @{instagram}
              </a>
            </dd>
          </div>
        )}
        {lastLocationEl}
        {tags.length > 0 && (
          <div className="flex justify-between items-start gap-2">
            <dt className="text-xs text-bark">Tags</dt>
            <dd className="m-0 flex items-start flex-wrap justify-end">
              {tags.map((tag, index) =>
                tag.slug ? (
                  <Link
                    disabled={true}
                    key={index}
                    to={`/explore/$`}
                    // params={{ _splat: exploreSplat([{
                    //     id: tag.slug,
                    //     name: tag.name,
                    //     type: 'tag',
                    //   }]) }}
                    className="text-xs font-semibold text-forest hover:underline"
                  >
                    {tag.name}
                    {index < tags.length - 1 && (
                      <span className="text-xs text-forest font-semibold">
                        ,&nbsp;
                      </span>
                    )}
                  </Link>
                ) : (
                  <span
                    key={index}
                    className="text-xs font-semibold text-forest"
                  >
                    {tag.name}
                    {index < tags.length - 1 && (
                      <span className="text-xs text-forest font-semibold">
                        ,&nbsp;
                      </span>
                    )}
                  </span>
                ),
              )}
            </dd>
          </div>
        )}
        {hours !== '' && (
          <div className="flex justify-between items-center">
            <dt className="text-xs text-bark">Opens</dt>
            <dd className="text-xs font-semibold text-forest m-0">{hours}</dd>
          </div>
        )}
      </dl>
      {!instagram &&
        lastLocationEl === null &&
        tags.length === 0 &&
        hours === '' && (
          <div className="flex justify-center items-center h-16">
            <span className="text-xs text-bark">No quick facts available.</span>
          </div>
        )}
    </div>
  )
}
