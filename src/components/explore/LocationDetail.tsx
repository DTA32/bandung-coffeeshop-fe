import { useEffect, useRef, useState } from 'react'
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
  const [expanded, setExpanded] = useState(false)
  const [clamped, setClamped] = useState(false)
  const textRef = useRef<HTMLParagraphElement>(null)
  // Collapse again when navigating to another location.
  useEffect(() => setExpanded(false), [location.description])
  // "See more" shows only when the clamped text actually overflows; it is
  // re-measured on resize and once web fonts have loaded.
  useEffect(() => {
    const el = textRef.current
    if (!el || expanded) return
    let active = true
    const measure = () => {
      if (active) setClamped(el.scrollHeight > el.clientHeight + 1)
    }
    measure()
    void document.fonts.ready.then(measure)
    const observer =
      typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure)
    observer?.observe(el)
    return () => {
      active = false
      observer?.disconnect()
    }
  }, [location.description, expanded, isMobile])
  const isLong = expanded || clamped
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
        <div className={cn(isMobile && 'px-6 bg-surface text-sm py-4')}>
          <h2 className="text-base font-semibold mb-2">{t('explore.about')}</h2>
          <p
            ref={textRef}
            className={cn(
              'text-muted whitespace-pre-line',
              !expanded && (isMobile ? 'line-clamp-3' : 'line-clamp-5'),
            )}
          >
            {location.description}
          </p>
          {isLong && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
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
