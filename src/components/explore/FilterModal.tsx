import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { ClientOnly } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { SlidersHorizontal, X } from 'lucide-react'
import type { ExploreSearch } from '@/lib/api/search'
import { getFilterOptions } from '@/lib/api/filters'
import type { FilterOptions } from '@/lib/api/filters'
import {
  parseRatingIds,
  parseTags,
  serializeRatingIds,
  serializeTags,
} from '@/lib/explore'
import { useLocale } from '@/lib/locale'
import FilterChip from '@/components/FilterChip'
import OpenHoursControl from './OpenHoursControl'
import PriceTierSelector from './PriceTierSelector'
import RatingCategoryGroup from './RatingCategoryGroup'

interface FilterModalProps {
  search: ExploreSearch
  onApply: (update: ExploreSearch) => void
  onClose: () => void
}

function FilterModalInternal({ search, onApply, onClose }: FilterModalProps) {
  const { t } = useTranslation()
  const locale = useLocale()

  const [options, setOptions] = useState<FilterOptions | null>(null)
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

  // Filters lazy-loaded first time the modal mounts (and on locale
  // change / retry). getFilterOptions memoizes per locale, so reopening hits
  // the cache rather than the network.
  useEffect(() => {
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
  }, [locale, reloadKey])

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
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('explore.filters.dialogLabel')}
      className="fixed inset-0 z-[3000] flex items-end justify-center bg-black/50 sm:items-center shadow-md"
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
