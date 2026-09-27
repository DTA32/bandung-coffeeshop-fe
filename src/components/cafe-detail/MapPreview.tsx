import { Map } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const API_KEY = 'AIzaSyA5c3DX5h3qiGBOEF_kRaE05QN0kNCuQgA'

export default function MapPreview({
  cafeName,
  placeId,
  additionalClass,
  withAlternateButton = false,
}: {
  cafeName: string
  placeId: string
  additionalClass?: string
  withAlternateButton?: boolean
}) {
  const { t } = useTranslation()
  return (
    <>
      <iframe
        title={t('cafe.mapOf', { name: cafeName })}
        className={`bg-surface rounded-xl border border-grove-light overflow-hidden shadow-sm z-10
          ${additionalClass || ''}
          ${withAlternateButton ? 'invisible md:visible' : ''}
        `}
        height={180}
        src={`https://www.google.com/maps/embed/v1/place?key=${API_KEY}&q=place_id:${placeId}`}
      />
      {withAlternateButton && (
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cafeName)}&query_place_id=${placeId}`}
          className="md:invisible absolute right-6 top-4 w-fit bg-surface rounded-lg  overflow-hidden shadow-sm text-moss py-2 px-3 flex items-center gap-1 text-xs"
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t('cafe.openInGmaps', { name: cafeName })}
        >
          <Map size={12} aria-hidden="true" />
          <span>{t('cafe.openInMaps')}</span>
        </a>
      )}
    </>
  )
}
