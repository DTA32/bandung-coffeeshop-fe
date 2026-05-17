import { Link } from '@tanstack/react-router'
import type { CafeLocation, CafeTags } from '@/lib/api/cafe'

interface QuickFactsProps {
  instagram: string | null
  area: CafeLocation | null
  tags: CafeTags[]
  openHour: string | null
  closeHour: string | null
}

export default function QuickFacts({
  instagram,
  area,
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

  return (
    <div className="bg-white rounded-2xl p-5 flex flex-col gap-3">
      <h3 className="text-base font-bold text-forest m-0">Quick Facts</h3>
      {instagram && (
        <span className="flex justify-between items-center">
          <span className="text-xs text-bark">Instagram</span>
          <a
            href={`https://www.instagram.com/${instagram}`}
            className="text-xs font-semibold text-forest hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            @{instagram}
          </a>
        </span>
      )}
      {area && (
        <span className="flex justify-between items-center">
          <span className="text-xs text-bark">Area</span>
          <Link
            disabled={true}
            to={`/explore/area/${area.id}`}
            className="text-xs font-semibold text-forest hover:underline"
          >
            {area.name}
          </Link>
        </span>
      )}
      {tags.length > 0 && (
        <span className="flex justify-between items-start gap-2">
          <span className="text-xs text-bark">Tags</span>
          <div className="flex items-start flex-wrap justify-end">
            {tags.map((tag, index) =>
              tag.slug ? (
                <Link
                  disabled={true}
                  key={index}
                  to={`/explore/tags/${tag.slug}`}
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
                <span key={index} className="text-xs font-semibold text-forest">
                  {tag.name}
                  {index < tags.length - 1 && (
                    <span className="text-xs text-forest font-semibold">
                      ,&nbsp;
                    </span>
                  )}
                </span>
              ),
            )}
          </div>
        </span>
      )}
      {hours !== '' && (
        <div className="flex justify-between items-center">
          <span className="text-xs text-bark">Opens</span>
          <span className="text-xs font-semibold text-forest">{hours}</span>
        </div>
      )}
      {!instagram && !area && tags.length === 0 && hours === '' && (
        <div className="flex justify-center items-center h-16">
          <span className="text-xs text-bark">No quick facts available.</span>
        </div>
      )}
    </div>
  )
}
