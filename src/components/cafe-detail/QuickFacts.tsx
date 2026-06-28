import { useTranslation } from 'react-i18next'
import type { CafeTags } from '@/lib/api/cafe'
import LocaleLink from '@/components/LocaleLink'
import { exploreSplat } from '@/lib/explore'
import type { Location } from '@/lib/type'

interface QuickFactsProps {
  instagram: string | null
  locations: Location[]
  tags: CafeTags[]
  openHour: string | null
  closeHour: string | null
}

// Renders the deepest location (district/area) as a link. Callers gate this on
// `hasLastLocation`, which owns the "only district + area for now" length rule.
function LastLocation({ locations }: { locations: Location[] }) {
  const { t } = useTranslation()
  const lastLocation = locations.at(-1)
  if (lastLocation === undefined) return null
  return (
    <div className="flex justify-between items-center">
      <dt className="text-xs text-bark">
        {t(`explore.locationTypes.${lastLocation.type}`)}
      </dt>
      <dd className="text-xs font-semibold text-forest m-0">
        <LocaleLink
          to="/{-$locale}/explore/$"
          params={{ _splat: exploreSplat(locations) }}
          className="hover:underline"
        >
          {lastLocation.name}
        </LocaleLink>
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
  const { t } = useTranslation()
  let hours = ''
  if (openHour !== null && closeHour !== null) {
    if (openHour === closeHour) {
      hours = t('cafe.open24Hours')
    } else {
      hours = `${openHour} - ${closeHour}`
    }
  } else if (openHour !== null) {
    hours = `${t('cafe.openFrom')} ${openHour}`
  } else if (closeHour !== null) {
    hours = `${t('cafe.closesAt')} ${closeHour}`
  }
  const hasLastLocation = locations.length >= 1 && locations.length <= 2

  return (
    <div className="bg-white rounded-2xl p-5 flex flex-col gap-3">
      <h2 className="text-base font-bold text-forest m-0">
        {t('cafe.quickFacts')}
      </h2>
      <dl className="flex flex-col gap-3 m-0">
        {instagram && (
          <div className="flex justify-between items-center">
            <dt className="text-xs text-bark">{t('cafe.instagram')}</dt>
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
        {hasLastLocation && <LastLocation locations={locations} />}
        {tags.length > 0 && (
          <div className="flex justify-between items-start gap-2">
            <dt className="text-xs text-bark">{t('cafe.tags')}</dt>
            <dd className="m-0 flex items-start flex-wrap justify-end">
              {tags.map((tag, index) => {
                let el: React.ReactNode
                if (tag.slug) {
                  el = (
                    <LocaleLink
                      key={`${tag.name}-link`}
                      to="/{-$locale}/explore/$"
                      params={{ _splat: tag.slug }}
                      className="text-xs font-semibold text-forest hover:underline"
                    >
                      {tag.name}
                    </LocaleLink>
                  )
                } else {
                  el = (
                    <span
                      key={`${tag.name}-name`}
                      className="text-xs font-semibold text-forest"
                    >
                      {tag.name}
                    </span>
                  )
                }
                return (
                  <>
                    {el}
                    {index < tags.length - 1 && (
                      <span
                        key={`tag-divider-${index}`}
                        className="text-xs text-forest font-semibold"
                      >
                        ,&nbsp;
                      </span>
                    )}
                  </>
                )
              })}
            </dd>
          </div>
        )}
        {hours !== '' && (
          <div className="flex justify-between items-center">
            <dt className="text-xs text-bark">{t('cafe.opens')}</dt>
            <dd className="text-xs font-semibold text-forest m-0">{hours}</dd>
          </div>
        )}
      </dl>
      {!instagram && !hasLastLocation && tags.length === 0 && hours === '' && (
        <div className="flex justify-center items-center h-16">
          <span className="text-xs text-bark">{t('cafe.noQuickFacts')}</span>
        </div>
      )}
    </div>
  )
}
