import { useEffect, useId, useRef, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Coffee, MapPinned, Map, Search, SlidersHorizontal } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { QuickSearchItem } from '@/lib/api/search'
import { quickSearch } from '@/lib/api/search'
import { LOCATION_SHORT_LABELS } from '@/lib/constants'
import { exploreSplat, locationTypeDepth } from '@/lib/explore'
import { useLocale, localeParam } from '@/lib/locale'
import LocaleLink from '@/components/LocaleLink'
import type { Location } from '@/lib/type'

interface SearchBoxProps {
  variant?: 'hero' | 'srp'
  initialQuery?: string
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  cafe: <Coffee size={14} className="text-forest" />,
  poi: <MapPinned size={14} className="text-forest" />,
  area: <Map size={14} className="text-forest" />,
  district: <Map size={14} className="text-forest" />,
}

const RESULT_ITEM_CLASS =
  'flex gap-4 w-full cursor-pointer items-center border-none bg-transparent px-6 py-3 text-left hover:bg-cream'

// Renders a quicksearch result as a Link to its destination:
//   cafe → detail page; district / area / poi → SEO explore path built from the
//   item's ancestors + itself. When ancestors are missing/incomplete the depth
//   won't match, so we fall back to the base /explore route with the legacy
//   query_id/query_type search params (search still works, URL just isn't canonical).
function ResultLink({
  item,
  onSelect,
  children,
}: {
  item: QuickSearchItem
  onSelect: () => void
  children: React.ReactNode
}) {
  if (item.type === 'cafe') {
    return (
      <LocaleLink
        role="option"
        to="/{-$locale}/cafe/$cafeId"
        params={{ cafeId: item.id }}
        onClick={onSelect}
        className={RESULT_ITEM_CLASS}
      >
        {children}
      </LocaleLink>
    )
  }

  const itemLocation = item as Location
  const refs = [...(item.ancestors ?? []), itemLocation]
  if (refs.length === locationTypeDepth(item.type)) {
    return (
      <LocaleLink
        role="option"
        to="/{-$locale}/explore/$"
        params={{ _splat: exploreSplat(refs) }}
        onClick={onSelect}
        className={RESULT_ITEM_CLASS}
      >
        {children}
      </LocaleLink>
    )
  }

  return (
    <LocaleLink
      role="option"
      to="/{-$locale}/explore"
      search={{ query_id: item.id, query_type: item.type }}
      onClick={onSelect}
      className={RESULT_ITEM_CLASS}
    >
      {children}
    </LocaleLink>
  )
}

export default function SearchBox({
  variant = 'hero',
  initialQuery = '',
}: SearchBoxProps) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const locale = useLocale()
  const listboxId = useId()
  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<QuickSearchItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  // Start true: only user typing should enable searches, not external/initial sync
  const cancelledRef = useRef(true)

  function dismiss() {
    cancelledRef.current = true
    clearTimeout(timerRef.current)
    setIsOpen(false)
    setResults([])
  }

  function handleChange(value: string) {
    cancelledRef.current = false
    setQuery(value)
  }

  useEffect(() => {
    cancelledRef.current = true
    clearTimeout(timerRef.current)
    setQuery(initialQuery)
  }, [initialQuery])

  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      setIsOpen(false)
      return
    }
    if (query != initialQuery) {
      timerRef.current = setTimeout(async () => {
        const items = await quickSearch(query, locale)
        if (cancelledRef.current) return
        setResults(items)
        setIsOpen(items.length > 0)
      }, 300)
    }
    return () => clearTimeout(timerRef.current)
  }, [query])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        dismiss()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function handleSearch() {
    dismiss()
    navigate({
      to: '/{-$locale}/explore',
      params: { locale: localeParam(locale) },
      search: {},
    })
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSearch()
    if (e.key === 'Escape') setIsOpen(false)
  }

  const grouped = results.reduce<Record<string, QuickSearchItem[]>>(
    (acc, item) => {
      ;(acc[item.type] ??= []).push(item)
      return acc
    },
    {},
  )
  const groupOrder = Object.keys(LOCATION_SHORT_LABELS)

  const dropdown = isOpen && results.length > 0 && (
    <div
      id={listboxId}
      role="listbox"
      className="absolute left-0 right-0 top-full z-2000 mt-1 overflow-hidden rounded-lg border border-grove-light bg-white shadow-lg"
    >
      {groupOrder.map(
        (type) =>
          grouped[type] && (
            <div key={type}>
              <div className="px-4 py-1.5 text-sm font-semibold uppercase tracking-wide text-bark">
                {t(`explore.locationTypes.${type}`)}
              </div>
              {grouped[type].map((item) => (
                <ResultLink key={item.id} item={item} onSelect={dismiss}>
                  {TYPE_ICONS[item.type]}
                  <span className="text-sm font-medium text-forest">
                    {item.name}
                  </span>
                </ResultLink>
              ))}
            </div>
          ),
      )}
    </div>
  )

  if (variant === 'srp') {
    return (
      <div className="flex items-center justify-between gap-4 border-b border-grove-light/50 bg-white px-6 md:px-16 py-5">
        <div
          ref={containerRef}
          className="relative flex gap-3 border border-grove-light bg-cream w-full px-4 items-center rounded-lg"
        >
          <Search size={18} className="shrink-0 text-bark" aria-hidden="true" />
          <input
            type="text"
            value={query}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={handleKeyDown}
            role="combobox"
            aria-label={t('search.placeholder')}
            aria-expanded={isOpen}
            aria-controls={listboxId}
            aria-autocomplete="list"
            className="flex-1 bg-transparent text-sm text-forest focus:outline-none py-3"
            placeholder={t('search.placeholderShort')}
          />
          {dropdown}
        </div>
        <button
          disabled
          className="flex shrink-0 cursor-not-allowed items-center gap-1.5 rounded-md bg-forest px-4 py-2 text-sm font-medium text-cream opacity-40"
        >
          <SlidersHorizontal size={14} aria-hidden="true" />
          {t('search.filters')}
        </button>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="relative flex w-full max-w-150 items-center gap-2 rounded-lg bg-white p-2"
    >
      <input
        type="text"
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={handleKeyDown}
        role="combobox"
        aria-label={t('search.placeholder')}
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-autocomplete="list"
        className="flex-1 rounded-lg p-2 text-sm text-forest focus:outline-none"
        placeholder={t('search.placeholderShort')}
      />
      <button
        onClick={handleSearch}
        className="shrink-0 cursor-pointer rounded-lg border-none bg-forest px-4 py-2 text-sm font-semibold text-cream"
      >
        {t('search.search')}
      </button>
      {dropdown}
    </div>
  )
}
