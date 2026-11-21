import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'
import { useTranslation } from 'react-i18next'
import { SkeletonCafeListItem } from '@/components/cafe'

type Props = {
  hasMore: boolean
  loadingMore: boolean
  loadMoreFailed: boolean
  onLoadMore: () => void
  // The element the list scrolls in: the results panel on desktop. Omit it
  // when the list scrolls with the page (mobile) so the viewport is the root.
  rootRef?: RefObject<HTMLElement | null>
}

// ResultsListFooter sits at the end of the MITM results list. While more
// pages remain it renders an invisible sentinel that loads the next page when
// scrolled into view; while that page loads it shows placeholder rows; if the
// load fails it shows a retry button.
export default function ResultsListFooter({
  hasMore,
  loadingMore,
  loadMoreFailed,
  onLoadMore,
  rootRef,
}: Props) {
  const { t } = useTranslation()

  if (loadingMore) {
    return (
      <>
        <SkeletonCafeListItem />
        <SkeletonCafeListItem />
      </>
    )
  }

  if (loadMoreFailed) {
    return (
      <div className="flex flex-col items-center gap-2 py-3 text-center">
        <p className="m-0 text-sm text-bark">{t('mitm.loadMoreFailed')}</p>
        <button
          type="button"
          onClick={onLoadMore}
          className="cursor-pointer rounded-full border border-grove-light bg-surface px-4 py-2 text-xs font-semibold text-moss hover:bg-forest-lighter"
        >
          {t('mitm.retry')}
        </button>
      </div>
    )
  }

  if (!hasMore) return null
  return <Sentinel onVisible={onLoadMore} rootRef={rootRef} />
}

// Sentinel unmounts while a page loads and remounts after, so each mount
// gets a fresh observer. That re-fires the callback when the sentinel is
// still on screen after a page is appended (e.g. a tall viewport), which a
// single long-lived observer would not.
function Sentinel({
  onVisible,
  rootRef,
}: {
  onVisible: () => void
  rootRef?: RefObject<HTMLElement | null>
}) {
  const ref = useRef<HTMLDivElement>(null)
  const onVisibleRef = useRef(onVisible)
  useEffect(() => {
    onVisibleRef.current = onVisible
  }, [onVisible])

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) onVisibleRef.current()
      },
      { root: rootRef?.current ?? null, rootMargin: '0px 0px 200px 0px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [rootRef])

  return <div ref={ref} aria-hidden="true" className="h-px w-full shrink-0" />
}
