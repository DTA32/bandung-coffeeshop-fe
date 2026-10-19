import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import ReviewItem from './ReviewItem'
import ReviewModal from './ReviewModal'
import SubmitReviewCard from './SubmitReviewCard'
import LoadMoreCard from './LoadMoreCard'
import SkeletonReview from './SkeletonReview'
import { useAuth } from '@/lib/hooks/useAuth'
import { getCafeReviews, getMyReview } from '@/lib/api/cafe'
import type { CafeReviewItem, MyReview, RatingsResponse } from '@/lib/api/cafe'

interface ReviewsCardProps {
  cafeId: string
  cafeName: string
  totalReviewCount: number
  // The cafe's aggregate ratings, used to name the rating chips.
  ratings: RatingsResponse
  // True when the page was opened with `review=open` (back from login with
  // the review intent): open the modal once signed in, then call
  // onAutoOpenHandled to drop the param.
  autoOpen: boolean
  onAutoOpenHandled: () => void
}

type ListStatus = 'loading' | 'idle' | 'loadingMore' | 'error'
// `loaded` is false until the session and the user's review are both known.
interface MineState {
  loaded: boolean
  review: MyReview | null
}

// ReviewsCard is the user-reviews carousel. Pages are prerendered, so the
// list and the user's own review are fetched in the browser after hydration.
export default function ReviewsCard({
  cafeId,
  cafeName,
  totalReviewCount,
  ratings,
  autoOpen,
  onAutoOpenHandled,
}: ReviewsCardProps) {
  const { t } = useTranslation()
  const { status: authStatus, openLogin } = useAuth()
  const scrollerRef = useRef<HTMLDivElement>(null)

  const [items, setItems] = useState<CafeReviewItem[]>([])
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [listStatus, setListStatus] = useState<ListStatus>('loading')
  const [listVersion, setListVersion] = useState(0)
  const [mine, setMine] = useState<MineState>({
    loaded: false,
    review: null,
  })
  const [mineVersion, setMineVersion] = useState(0)
  const [modal, setModal] = useState<{
    nonce: number
    initialScore: number | null
  } | null>(null)

  // First page; listVersion bumps reset the list after a save/removal.
  useEffect(() => {
    let cancelled = false
    setListStatus('loading')
    getCafeReviews(cafeId)
      .then((page) => {
        if (cancelled) return
        setItems(page.items)
        setNextCursor(page.next_cursor)
        setListStatus('idle')
      })
      .catch(() => {
        if (!cancelled) setListStatus('error')
      })
    return () => {
      cancelled = true
    }
  }, [cafeId, listVersion])

  useEffect(() => {
    if (authStatus !== 'user') {
      setMine({ loaded: authStatus === 'anon', review: null })
      return
    }
    let cancelled = false
    // Keep showing the previous review while it reloads after an edit.
    setMine((cur) => ({ loaded: false, review: cur.review }))
    getMyReview(cafeId)
      .then((review) => {
        if (!cancelled) setMine({ loaded: true, review })
      })
      .catch(() => {
        if (!cancelled) setMine({ loaded: true, review: null })
      })
    return () => {
      cancelled = true
    }
  }, [cafeId, authStatus, mineVersion])

  // Guards a next-page response against a list reset that happened meanwhile.
  const listVersionRef = useRef(listVersion)
  useEffect(() => {
    listVersionRef.current = listVersion
  }, [listVersion])
  const loadingMore = useRef(false)
  const loadMore = useCallback(() => {
    if (!nextCursor || loadingMore.current) return
    loadingMore.current = true
    setListStatus('loadingMore')
    const version = listVersion
    getCafeReviews(cafeId, nextCursor)
      .then((page) => {
        if (version !== listVersionRef.current) return
        setItems((cur) => {
          const seen = new Set(cur.map((r) => r.id))
          return [...cur, ...page.items.filter((r) => !seen.has(r.id))]
        })
        setNextCursor(page.next_cursor)
        setListStatus('idle')
      })
      .catch(() => {
        if (version === listVersionRef.current) setListStatus('idle')
      })
      .finally(() => {
        loadingMore.current = false
      })
  }, [cafeId, nextCursor, listVersion])
  const myReview = mine.review
  const mineReady = mine.loaded

  const openReview = useCallback(
    (initialScore: number | null) => {
      if (authStatus === 'anon') {
        openLogin({ cafeName, intent: 'review' })
        return
      }
      if (authStatus === 'user' && mineReady) {
        setModal((cur) => ({ nonce: (cur?.nonce ?? 0) + 1, initialScore }))
      }
    },
    [authStatus, mineReady, openLogin, cafeName],
  )

  // Back from login with the review intent: open the modal once the session
  // and the user's own review are known (so an existing review opens in edit
  // mode), then drop the param. Signed out → just drop it.
  useEffect(() => {
    if (!autoOpen) return
    if (authStatus === 'anon') {
      onAutoOpenHandled()
    } else if (authStatus === 'user' && mineReady) {
      setModal((cur) => ({ nonce: (cur?.nonce ?? 0) + 1, initialScore: null }))
      onAutoOpenHandled()
    }
  }, [autoOpen, authStatus, mineReady, onAutoOpenHandled])

  const onChanged = useCallback(() => {
    setMineVersion((v) => v + 1)
    setListVersion((v) => v + 1)
  }, [])

  const visible = myReview ? items.filter((r) => r.id !== myReview.id) : items

  return (
    <section
      aria-labelledby="reviews-heading"
      className="bg-surface rounded-2xl p-5 flex flex-col gap-4 antialiased"
    >
      <h2
        id="reviews-heading"
        className="m-0 flex items-baseline gap-2 text-base font-bold text-forest"
      >
        {t('reviews.title')}
        {totalReviewCount > 0 && (
          <>
            <span
              aria-hidden="true"
              className="text-sm font-normal text-forest-light"
            >
              ·
            </span>
            <span className="text-xs font-normal text-bark">
              {t('reviews.count', { count: totalReviewCount })}
            </span>
          </>
        )}
      </h2>
      <div
        ref={scrollerRef}
        aria-busy={listStatus === 'loading' || listStatus === 'loadingMore'}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory"
      >
        {myReview ? (
          <ReviewItem
            review={myReview}
            ratingNames={ratings}
            own={{ status: myReview.status, onEdit: () => openReview(null) }}
          />
        ) : (
          <SubmitReviewCard cafeName={cafeName} onPick={openReview} />
        )}
        {listStatus === 'loading' ? (
          <>
            <SkeletonReview />
            <SkeletonReview />
            <span className="sr-only">{t('reviews.loading')}</span>
          </>
        ) : (
          visible.map((review) => (
            <ReviewItem key={review.id} review={review} ratingNames={ratings} />
          ))
        )}
        {listStatus === 'loadingMore' && (
          <>
            <SkeletonReview />
            <SkeletonReview />
            <span className="sr-only">{t('reviews.loading')}</span>
          </>
        )}
        {listStatus === 'idle' && nextCursor && (
          <LoadMoreCard onLoadMore={loadMore} scrollerRef={scrollerRef} />
        )}
        {listStatus === 'error' && (
          <div className="snap-start shrink-0 w-64 min-h-60 flex flex-col items-center justify-center gap-3 rounded-2xl border border-grove-light p-4 text-center">
            <p className="m-0 text-sm text-bark">{t('reviews.loadFailed')}</p>
            <button
              type="button"
              onClick={() => setListVersion((v) => v + 1)}
              className="cursor-pointer rounded-full border border-grove-light bg-surface px-4 py-2 text-xs font-semibold text-moss hover:bg-forest-lighter"
            >
              {t('reviews.retry')}
            </button>
          </div>
        )}
      </div>
      {modal && (
        <ReviewModal
          key={modal.nonce}
          cafeId={cafeId}
          cafeName={cafeName}
          mine={myReview}
          initialScore={modal.initialScore}
          onClose={() => setModal(null)}
          onChanged={onChanged}
        />
      )}
    </section>
  )
}
