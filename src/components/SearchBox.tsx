import { useState } from 'react'
import {
  Coffee,
  MapPinned,
  Map,
  Search,
  SlidersHorizontal,
  Tag,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/cn'
// Imported directly, NOT via @/components/explore: SearchBox also renders on the
// home page, so going through the explore barrel would pull the explore/Leaflet
// graph into the home bundle. See components/explore/index.ts.
import FilterModal from '@/components/explore/FilterModal'
import LocaleLink from '@/components/LocaleLink'
import { useQuickSearch, optionKey } from '@/components/search/useQuickSearch'
import type { FilterOptions } from '@/lib/api/filters'
import type { ExploreSearch, QuickSearchItem } from '@/lib/api/search'
import { parseRatingIds, parseTags } from '@/lib/explore'

interface SearchBoxProps {
  variant?: 'hero' | 'srp'
  initialQuery?: string
  search?: ExploreSearch
  onApplyFilters?: (update: ExploreSearch) => void
  filterOptions?: FilterOptions
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  cafe: <Coffee size={14} className="text-forest" />,
  poi: <MapPinned size={14} className="text-forest" />,
  area: <Map size={14} className="text-forest" />,
  district: <Map size={14} className="text-forest" />,
  filter: <Tag size={14} className="text-forest" />,
}

// Renders a quicksearch result as a Link to its destination. The backend hands
// us a ready-made `slug` navigation target:
//   cafe       → detail page (by id).
//   has slug   → the canonical SEO explore path /explore/<slug>: locations use
//                their ancestor-chain splat, filters use their SRP filter slug.
//   otherwise  → a location whose canonical path couldn't be resolved; fall back
//                to the base /explore route with the legacy query_id/query_type
//                params (search still works, the URL just isn't canonical).
function ResultLink({
  item,
  id,
  isActive,
  optionRef,
  onSelect,
  children,
  search,
}: {
  item: QuickSearchItem
  id: string
  isActive: boolean
  optionRef: (el: HTMLAnchorElement | null) => void
  onSelect: () => void
  children: React.ReactNode
  search?: ExploreSearch
}) {
  const className = cn(
    'flex gap-4 w-full cursor-pointer items-center border-none px-6 py-3 text-left hover:bg-cream',
    isActive ? 'bg-cream' : 'bg-transparent',
  )

  if (item.type === 'cafe') {
    return (
      <LocaleLink
        ref={optionRef}
        id={id}
        role="option"
        aria-selected={isActive}
        to="/{-$locale}/cafe/$cafeId"
        params={{ cafeId: item.id }}
        onClick={onSelect}
        className={className}
      >
        {children}
      </LocaleLink>
    )
  }

  if (item.slug) {
    return (
      <LocaleLink
        ref={optionRef}
        id={id}
        role="option"
        aria-selected={isActive}
        to="/{-$locale}/explore/$"
        params={{ _splat: item.slug }}
        search={{ ...search }}
        onClick={onSelect}
        className={className}
      >
        {children}
      </LocaleLink>
    )
  }

  return (
    <LocaleLink
      ref={optionRef}
      id={id}
      role="option"
      aria-selected={isActive}
      to="/{-$locale}/explore"
      search={{ query_id: item.id, query_type: item.type }}
      onClick={onSelect}
      className={className}
    >
      {children}
    </LocaleLink>
  )
}

export default function SearchBox({
  variant = 'hero',
  initialQuery = '',
  search,
  onApplyFilters,
  filterOptions,
}: SearchBoxProps) {
  const { t } = useTranslation()
  const [filtersOpen, setFiltersOpen] = useState(false)

  const activeFilterCount = search
    ? parseTags(search.tags).length +
      parseRatingIds(search.ratings).length +
      (search.open_hour ? 1 : 0) +
      (search.price_min != null || search.price_max != null ? 1 : 0)
    : 0

  const {
    query,
    results,
    isOpen,
    activeIndex,
    activeOptionId,
    listboxId,
    containerRef,
    itemRefs,
    grouped,
    groupOrder,
    optionIndexByKey,
    handleChange,
    handleKeyDown,
    handleSearch,
    dismiss,
  } = useQuickSearch(initialQuery)

  const dropdown = isOpen && results.length > 0 && (
    <div
      id={listboxId}
      role="listbox"
      className="absolute left-0 right-0 top-full z-40 mt-1 overflow-hidden rounded-lg border border-grove-light bg-white shadow-lg"
    >
      {groupOrder.map((type) => {
        const items = grouped[type]
        if (!items) return null
        return (
          <div key={type}>
            <div className="px-4 py-1.5 text-sm font-semibold uppercase tracking-wide text-bark">
              {t(`explore.locationTypes.${type}`)}
            </div>
            {items.map((item) => {
              const index = optionIndexByKey[optionKey(item)]
              return (
                <ResultLink
                  key={optionKey(item)}
                  item={item}
                  id={`${listboxId}-option-${optionKey(item)}`}
                  isActive={index === activeIndex}
                  optionRef={(el) => {
                    itemRefs.current[index] = el
                  }}
                  onSelect={dismiss}
                  search={search}
                >
                  {TYPE_ICONS[item.type]}
                  <span className="text-sm font-medium text-forest">
                    {item.name}
                  </span>
                </ResultLink>
              )
            })}
          </div>
        )
      })}
    </div>
  )

  if (variant === 'srp') {
    return (
      <>
        <div className="flex items-center justify-between gap-4 border-b border-grove-light/50 bg-white px-6 md:px-16 py-5">
          <div
            ref={containerRef}
            className="relative flex gap-3 border border-grove-light bg-cream w-full px-4 items-center rounded-lg"
          >
            <Search
              size={18}
              className="shrink-0 text-bark"
              aria-hidden="true"
            />
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
              aria-activedescendant={activeOptionId}
              className="flex-1 bg-transparent text-sm text-forest focus:outline-none py-3"
              placeholder={t('search.placeholderShort')}
            />
            {dropdown}
          </div>
          <div className="relative h-full">
            <button
              type="button"
              onClick={() => setFiltersOpen(true)}
              className="relative flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg bg-forest px-3 py-2 text-sm text-cream"
            >
              <SlidersHorizontal size={14} />
              {t('explore.filters.button')}
            </button>
            {activeFilterCount > 0 && (
              <span className="absolute -top-2 -right-2 px-1.5 py-0.5 items-center justify-center rounded-full bg-moss text-[10px] font-semibold text-cream">
                {activeFilterCount}
              </span>
            )}
          </div>
        </div>
        {filtersOpen && search && onApplyFilters && (
          <FilterModal
            search={search}
            onApply={onApplyFilters}
            onClose={() => setFiltersOpen(false)}
            filterOptions={filterOptions}
          />
        )}
      </>
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
        aria-activedescendant={activeOptionId}
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
