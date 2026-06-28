import { useTranslation } from 'react-i18next'
import LocaleLink from '@/components/LocaleLink'
import Image from '@/components/Image'
import type { LocationData } from '@/lib/api/location'
import { exploreSplat } from '@/lib/explore'
import type { Location } from '@/lib/type'

export default function DistrictList({
  districts,
}: {
  districts: LocationData[]
}) {
  const { t } = useTranslation()
  return (
    <section className="flex flex-1 flex-col gap-6 bg-cream px-6 md:px-20 w-full h-fit">
      <h2 className="text-2xl font-bold text-forest">
        {t('home.exploreByDistrict')}
      </h2>
      <div className="flex gap-4 overflow-scroll w-full pb-1 h-full items-stretch">
        {districts.map((district) => {
          const districtLocation: Location = {
            id: district.id,
            name: district.name,
            type: district.type,
            thumbnail: null,
          }
          const linkTitle = `${district.name} ${
            district.descendants &&
            `${t('home.districtLinkTitleDescriber')} ${district.descendants
              .map((d) => d.name)
              .join(', ')}`
          }`
          return (
            <LocaleLink
              key={district.id}
              className="flex flex-col w-full max-w-60 border border-forest-lighter rounded-lg transition hover:shadow-md shrink-0 bg-white"
              to="/{-$locale}/explore/$"
              params={{ _splat: exploreSplat([districtLocation]) }}
              title={linkTitle}
            >
              <div className="h-24 w-full bg-grove-light rounded-t-lg">
                {district.images && district.images.length > 0 && (
                  <Image
                    src={district.images[0].url}
                    alt={district.name}
                    layout="constrained"
                    width={240}
                    aspectRatio={240 / 96}
                    className="w-full h-full object-cover object-center rounded-t-lg"
                  />
                )}
              </div>
              <div className="flex flex-col gap-1 pt-2 pb-4 px-4">
                <h3 className="font-medium">{district.name}</h3>
                <div className="flex gap-y-1 flex-wrap">
                  {district.descendants &&
                    district.descendants.length > 0 &&
                    district.descendants.map((desc) => (
                      <span
                        key={desc.id}
                        className="text-xs text-bark after:content-['•'] after:mx-1 last:after:content-none"
                      >
                        {desc.name}
                      </span>
                    ))}
                </div>
              </div>
            </LocaleLink>
          )
        })}
        {districts.length === 0 && (
          <div className="flex justify-center items-center h-48 w-full">
            <p className="text-md leading-[1.7] m-0 text-bark">
              {t('home.districtUnavailable')}
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
