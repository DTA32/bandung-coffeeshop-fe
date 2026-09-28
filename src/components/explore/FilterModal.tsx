import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { ClientOnly } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  Clock3,
  Cloud,
  CloudRain,
  CloudSun,
  SlidersHorizontal,
  Sun,
  X,
} from 'lucide-react'
import type { ExploreSearch, WeatherCondition } from '@/lib/api/search'
import { getFilterOptions } from '@/lib/api/filters'
import type { FilterOptions } from '@/lib/api/filters'
import {
  parseRatingIds,
  parseTags,
  parseWeather,
  serializeRatingIds,
  serializeTags,
  serializeWeather,
  WEATHER_CURRENT,
  weatherPhrase,
} from '@/lib/explore'
import { useLocale } from '@/lib/locale'
import { cn } from '@/lib/cn'
import FilterChip from '@/components/FilterChip'
import OpenHoursControl from './OpenHoursControl'
import PriceTierSelector from './PriceTierSelector'
import RatingCategoryGroup from './RatingCategoryGroup'

const WEATHER_ICONS: Record<WeatherCondition, typeof Sun> = {
  clear: Sun,
  cloudy: Cloud,
  rain: CloudRain,
}

// "Now" (the live Bandung condition, resolved server-side) is mutually
// exclusive with the explicit conditions; the explicit ones combine freely.
function toggleWeather(prev: string[], slug: string): string[] {
  if (slug === WEATHER_CURRENT) {
    return prev.includes(WEATHER_CURRENT) ? [] : [WEATHER_CURRENT]
  }
  const explicit = prev.filter((s) => s !== WEATHER_CURRENT)
  return explicit.includes(slug)
    ? explicit.filter((s) => s !== slug)
    : [...explicit, slug]
}

interface FilterModalProps {
  search: ExploreSearch
  onApply: (update: ExploreSearch) => void
  onClose: () => void
  filterOptions?: FilterOptions
}

function FilterModalInternal({
  search,
  onApply,
  onClose,
  filterOptions,
}: FilterModalProps) {
  const { t } = useTranslation()
  const locale = useLocale()

  const [options, setOptions] = useState<FilterOptions | null>(
    filterOptions ?? null,
  )
  const [error, setError] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  // Draft state — edits stay local until Apply pressed.
  const [draftTags, setDraftTags] = useState<string[]>(() =>
    parseTags(search.tags),
  )
  const [draftRatingIds, setDraftRatingIds] = useState<number[]>(() =>
    parseRatingIds(search.ratings),
  )
  const [draftPriceMin, setDraftPriceMin] = useState<number | undefined>(
    search.price_min,
  )
  const [draftPriceMax, setDraftPriceMax] = useState<number | undefined>(
    search.price_max,
  )
  const [draftOpenHour, setDraftOpenHour] = useState<string | undefined>(
    search.open_hour,
  )
  const [draftWeather, setDraftWeather] = useState<string[]>(() =>
    parseWeather(search.weather),
  )

  // Prefer the options the route already loaded; otherwise lazy-load them the
  // first time the modal mounts (and on locale change / retry). getFilterOptions
  // memoizes per locale, so a fallback fetch still hits the cache when warm.
  useEffect(() => {
    if (filterOptions) {
      setOptions(filterOptions)
      setError(false)
      return
    }
    let cancelled = false
    setError(false)
    setOptions(null)
    getFilterOptions(locale)
      .then((opts) => {
        if (!cancelled) setOptions(opts)
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })
    return () => {
      cancelled = true
    }
  }, [locale, reloadKey, filterOptions])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [])

  function handleApply() {
    onApply({
      tags: serializeTags(draftTags),
      ratings: serializeRatingIds(draftRatingIds),
      price_min: draftPriceMin,
      price_max: draftPriceMax,
      open_hour: draftOpenHour,
      weather: serializeWeather(draftWeather),
      page: 1, // filter change resets pagination
    })
    onClose()
  }

  function handleReset() {
    setDraftTags([])
    setDraftRatingIds([])
    setDraftPriceMin(undefined)
    setDraftPriceMax(undefined)
    setDraftOpenHour(undefined)
    setDraftWeather([])
  }

  const weatherOptions = options?.weather ?? []
  const weatherCaption = draftWeather.includes(WEATHER_CURRENT)
    ? t('explore.filters.weatherNowCaption')
    : draftWeather.length > 0
      ? t('explore.filters.weatherPickedCaption', {
          weather: weatherPhrase(draftWeather, t),
        })
      : t('explore.filters.weatherHint')

  // Rendered in two places (after open hours on mobile, atop the right column
  // on desktop) to match the design's per-breakpoint placement.
  const weatherSection = (className: string) =>
    weatherOptions.length > 0 && (
      <section className={cn('flex flex-col gap-2', className)}>
        <h3 className="flex items-center gap-1.5 text-xs font-semibold text-forest uppercase">
          <CloudSun size={14} aria-hidden="true" />
          {t('explore.filters.weatherTitle')}
        </h3>
        <div className="flex flex-wrap gap-2">
          <FilterChip
            label={t('explore.filters.weatherNow')}
            icon={<Clock3 size={14} aria-hidden="true" />}
            selected={draftWeather.includes(WEATHER_CURRENT)}
            onToggle={() =>
              setDraftWeather((prev) => toggleWeather(prev, WEATHER_CURRENT))
            }
          />
          {weatherOptions.map((w) => {
            const Icon = WEATHER_ICONS[w.slug]
            return (
              <FilterChip
                key={w.slug}
                label={w.name}
                icon={<Icon size={14} aria-hidden="true" />}
                selected={draftWeather.includes(w.slug)}
                onToggle={() =>
                  setDraftWeather((prev) => toggleWeather(prev, w.slug))
                }
              />
            )
          })}
        </div>
        <p className="text-xs text-bark">{weatherCaption}</p>
      </section>
    )

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('explore.filters.dialogLabel')}
      className="fixed inset-0 z-60 flex items-end justify-center bg-black/50 sm:items-center shadow-md"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-lg md:max-w-4xl flex-col rounded-t-2xl bg-cream shadow-xl sm:rounded-2xl md:mx-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-grove-light px-5 py-4">
          <div className="flex items-center gap-4">
            <SlidersHorizontal size={14} aria-hidden="true" />
            <h2 className="text-base font-semibold text-forest">
              {t('explore.filters.dialogLabel')}
            </h2>
          </div>
          <button
            type="button"
            aria-label={t('explore.filters.close')}
            onClick={onClose}
            className="cursor-pointer rounded-full p-1 text-forest hover:bg-grove-light"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {error ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center text-bark">
              <p>{t('explore.filters.loadError')}</p>
              <button
                type="button"
                onClick={() => setReloadKey((k) => k + 1)}
                className="cursor-pointer rounded-lg bg-forest px-4 py-2 text-sm text-cream"
              >
                {t('explore.filters.retry')}
              </button>
            </div>
          ) : !options ? (
            <div className="py-10 text-center text-bark">
              {t('explore.filters.loading')}
            </div>
          ) : (
            <div className="flex flex-col md:flex-row gap-x-6">
              <div className="flex flex-1 flex-col divide divide-y-[0.5px] divide-forest-light">
                <section className="flex flex-col gap-2 pb-4">
                  <h3 className="text-xs font-semibold text-forest uppercase">
                    {t('explore.filters.openTitle')}
                  </h3>
                  <OpenHoursControl
                    value={draftOpenHour}
                    onChange={setDraftOpenHour}
                  />
                </section>

                {weatherSection('py-4 md:hidden')}

                {options.tags.length > 0 && (
                  <section className="flex flex-col gap-2 py-4">
                    <h3 className="text-xs font-semibold text-forest uppercase">
                      {t('explore.filters.tagsTitle')}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {options.tags.map((tag) => {
                        const selected = draftTags.includes(tag.slug)
                        return (
                          <FilterChip
                            key={tag.slug}
                            label={tag.name}
                            selected={selected}
                            onToggle={() =>
                              setDraftTags((prev) =>
                                selected
                                  ? prev.filter((s) => s !== tag.slug)
                                  : [...prev, tag.slug],
                              )
                            }
                          />
                        )
                      })}
                    </div>
                  </section>
                )}

                {options.price_tiers.length > 0 && (
                  <section className="flex flex-col gap-2 py-4">
                    <h3 className="text-xs font-semibold text-forest uppercase">
                      {t('explore.filters.priceTitle')}
                    </h3>
                    <PriceTierSelector
                      tiers={options.price_tiers}
                      valueMin={draftPriceMin}
                      valueMax={draftPriceMax}
                      onChange={(min, max) => {
                        setDraftPriceMin(min)
                        setDraftPriceMax(max)
                      }}
                    />
                  </section>
                )}
              </div>
              <div className="flex flex-1 flex-col">
                {weatherSection(
                  'hidden md:flex pb-4 mb-4 border-b-[0.5px] border-forest-light',
                )}
                {options.rating_categories.length > 0 && (
                  <>
                    <hr className="block md:hidden border-[0.5px] h-[0.5px] border-forest-light" />
                    <section className="flex flex-1 flex-col gap-4 py-4 md:py-0 md:pb-4">
                      {options.rating_categories.map((cat) => {
                        const optionIds = cat.options.map((o) => o.id)
                        const selectedId = draftRatingIds.find((id) =>
                          optionIds.includes(id),
                        )
                        return (
                          <RatingCategoryGroup
                            key={cat.type}
                            category={cat}
                            selectedId={selectedId}
                            onSelect={(id) =>
                              setDraftRatingIds((prev) => {
                                // one bucket per category: drop siblings first
                                const without = prev.filter(
                                  (x) => !optionIds.includes(x),
                                )
                                return id === undefined
                                  ? without
                                  : [...without, id]
                              })
                            }
                          />
                        )
                      })}
                    </section>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-grove-light px-5 py-4">
          <button
            type="button"
            onClick={handleReset}
            className="cursor-pointer rounded-lg px-4 py-2 text-sm text-moss-dark hover:bg-grove-light"
          >
            {t('explore.filters.reset')}
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="cursor-pointer rounded-lg bg-forest px-6 py-2 text-sm font-semibold text-cream"
          >
            {t('explore.filters.apply')}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

export default function FilterModal(props: FilterModalProps) {
  return (
    <ClientOnly>
      <FilterModalInternal {...props} />
    </ClientOnly>
  )
}
