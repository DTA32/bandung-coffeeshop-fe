import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'
import { ChevronsRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface LoadMoreCardProps {
  onLoadMore: () => void
  // The horizontal scroller: reaching its end (the card scrolling into view)
  // loads the next page too.
  scrollerRef: RefObject<HTMLElement | null>
}

export default function LoadMoreCard({
  onLoadMore,
  scrollerRef,
}: LoadMoreCardProps) {
  const { t } = useTranslation()
  const ref = useRef<HTMLButtonElement>(null)
  const onLoadMoreRef = useRef(onLoadMore)
  useEffect(() => {
    onLoadMoreRef.current = onLoadMore
  }, [onLoadMore])

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) onLoadMoreRef.current()
      },
      { root: scrollerRef.current, threshold: 0.6 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [scrollerRef])

  return (
    <button
      ref={ref}
      type="button"
      onClick={onLoadMore}
      className="snap-start shrink-0 w-30 md:w-35 min-h-59 flex cursor-pointer flex-col items-center justify-center gap-2.5 rounded-2xl border border-grove-light bg-surface p-4 text-center hover:bg-forest-lighter"
    >
      <span className="flex size-10 items-center justify-center rounded-full bg-forest-lighter text-moss">
        <ChevronsRight size={18} aria-hidden="true" />
      </span>
      <span className="text-[13px] leading-[1.4] font-semibold text-moss">
        {t('reviews.loadMore')}
      </span>
    </button>
  )
}
