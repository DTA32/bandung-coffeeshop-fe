import { useEffect, useId, useRef, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import type { QuickSearchItem } from '@/lib/api/search'
import { quickSearch } from '@/lib/api/search'
import { LOCATION_SHORT_LABELS } from '@/lib/constants'
import { localeParam, useLocale } from '@/lib/locale'

// A result's stable key, namespaced by type so a filter slug can't collide
// with a location id (both spaces are flat).
export const optionKey = (item: QuickSearchItem) => `${item.type}-${item.id}`

export interface UseQuickSearchReturn {
  query: string
  results: QuickSearchItem[]
  isOpen: boolean
  activeIndex: number
  activeOptionId: string | undefined
  listboxId: string
  containerRef: React.RefObject<HTMLDivElement | null>
  itemRefs: React.MutableRefObject<Array<HTMLAnchorElement | null>>
  grouped: Partial<Record<string, QuickSearchItem[]>>
  groupOrder: string[]
  optionIndexByKey: Record<string, number>
  handleChange: (value: string) => void
  handleKeyDown: (e: React.KeyboardEvent) => void
  handleSearch: () => void
  dismiss: () => void
}

export function useQuickSearch(initialQuery: string): UseQuickSearchReturn {
  const navigate = useNavigate()
  const locale = useLocale()
  const listboxId = useId()

  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<QuickSearchItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  const containerRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const itemRefs = useRef<Array<HTMLAnchorElement | null>>([])
  // Start true: only user typing should enable searches, not external/initial sync
  const cancelledRef = useRef(true)

  function dismiss() {
    cancelledRef.current = true
    clearTimeout(timerRef.current)
    setIsOpen(false)
    setResults([])
    setActiveIndex(-1)
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
      setActiveIndex(-1)
      return
    }
    if (query != initialQuery) {
      timerRef.current = setTimeout(async () => {
        const items = await quickSearch(query, locale)
        if (cancelledRef.current) return
        setResults(items)
        setIsOpen(items.length > 0)
        setActiveIndex(-1)
      }, 300)
    }
    return () => clearTimeout(timerRef.current)
  }, [query])

  useEffect(() => {
    if (activeIndex >= 0) {
      itemRefs.current[activeIndex]?.scrollIntoView({ block: 'nearest' })
    }
  }, [activeIndex])

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

  // Partial: a group key only exists once a result of that type shows up, so
  // indexing yields `undefined` for the (common) absent groups.
  const grouped = results.reduce<Partial<Record<string, QuickSearchItem[]>>>(
    (acc, item) => {
      ;(acc[item.type] ??= []).push(item)
      return acc
    },
    {},
  )
  // Location groups first, then the filter group.
  const groupOrder = [...Object.keys(LOCATION_SHORT_LABELS), 'filter']
  const flatResults = groupOrder.flatMap((type) => grouped[type] ?? [])
  const optionIndexByKey = flatResults.reduce<Record<string, number>>(
    (acc, item, index) => {
      acc[optionKey(item)] = index
      return acc
    },
    {},
  )
  const activeItem = activeIndex >= 0 ? flatResults[activeIndex] : undefined
  const activeOptionId = activeItem
    ? `${listboxId}-option-${optionKey(activeItem)}`
    : undefined

  function handleKeyDown(e: React.KeyboardEvent) {
    const hasOptions = isOpen && flatResults.length > 0

    if (hasOptions && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      e.preventDefault()
      const lastIndex = flatResults.length - 1
      setActiveIndex((prev) => {
        if (e.key === 'ArrowDown') return prev >= lastIndex ? 0 : prev + 1
        return prev <= 0 ? lastIndex : prev - 1
      })
      return
    }
    if (e.key === 'Enter') {
      if (hasOptions && activeIndex >= 0) {
        e.preventDefault()
        itemRefs.current[activeIndex]?.click()
        return
      }
      handleSearch()
      return
    }
    if (e.key === 'Escape') {
      setIsOpen(false)
      setActiveIndex(-1)
    }
  }

  // Reset on every render so the dropdown's ref callbacks correctly repopulate
  // it as items re-render. This must run during the render phase (not in an
  // effect) before the component assigns into it via optionRef callbacks.
  itemRefs.current = []

  return {
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
  }
}
