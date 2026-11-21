import { useTranslation } from 'react-i18next'
import LocationDescendants, {
  hasPoiDescendants,
} from '@/components/explore/LocationDescendants'
import LocationHero from '@/components/explore/LocationHero'
import WelcomeHeading from '@/components/explore/WelcomeHeading'
import type { LocationData } from '@/lib/api/location'
import type { CafeMarker } from '@/lib/api/search'
import { cn } from '@/lib/cn'
import { useExpandableText } from '@/lib/hooks/useExpandableText'

export default function LocationDetail({
  location,
  isMobile,
  cafes,
  onExpandMap,
}: {
  location: LocationData
  isMobile: boolean
  cafes: CafeMarker[]
  onExpandMap: () => void
}) {
  const { t } = useTranslation()
  const clampClass = isMobile ? 'line-clamp-3' : 'line-clamp-5'
  // Collapses again, instantly, when navigating to another location.
  const {
    ref: textRef,
    expanded,
    clamp,
    isLong,
    toggle,
  } = useExpandableText<HTMLParagraphElement>(location.description, clampClass)
  return (
    <div className="flex flex-col gap-4">
      <LocationHero
        location={location}
        isMobile={isMobile}
        cafes={cafes}
        onExpandMap={onExpandMap}
      />
      {!isMobile && (
        <WelcomeHeading location={location} className="text-2xl font-bold" />
      )}
      {location.description && (
        <div className={cn(isMobile && 'px-6 bg-surface text-sm py-4')}>
          <h2 className="text-base font-semibold mb-2">{t('explore.about')}</h2>
          <p
            ref={textRef}
            className={cn(
              'text-muted whitespace-pre-line',
              clamp && clampClass,
            )}
          >
            {location.description}
          </p>
          {isLong && (
            <button
              type="button"
              onClick={toggle}
              aria-expanded={expanded}
              className="mt-1 cursor-pointer border-none bg-transparent p-0 text-xs font-semibold text-moss hover:underline"
            >
              {expanded ? t('common.seeLess') : t('common.seeMore')}
            </button>
          )}
        </div>
      )}
      {(!isMobile || !hasPoiDescendants(location)) && (
        <LocationDescendants
          location={location}
          className={cn(!isMobile && 'rounded-2xl')}
        />
      )}
    </div>
  )
}
