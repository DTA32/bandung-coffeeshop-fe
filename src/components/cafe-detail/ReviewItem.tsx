import { useState } from 'react'
import { ExternalLink, Pencil } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { StarDisplay } from './StarRating'
import { useLocale, dateLocale } from '@/lib/locale'
import { cn } from '@/lib/cn'
import type { CafeReviewItem, MyReviewStatus } from '@/lib/api/cafe'

// Content longer than this (or with many line breaks) gets the more/less toggle.
const LONG_CONTENT_CHARS = 140
const LONG_CONTENT_LINES = 4

export const REVIEW_CARD_CLASS =
  'snap-start shrink-0 w-64 md:w-[calc((100%-2rem)/3)] min-h-60 rounded-2xl border border-grove-light bg-surface'

interface ReviewItemProps {
  review: CafeReviewItem
  // Set on the signed-in user's own review.
  own?: { status: MyReviewStatus; onEdit: () => void }
}

// "2026-10" → "Oct-26" ("Okt-26" in id): the visit is a month and year, so it
// is shown as one rather than as a relative date.
function formatVisit(visitedAt: string, locale: string): string | null {
  const [year, month] = visitedAt.split('-').map(Number)
  if (!year || !month) return null
  const name = new Date(Date.UTC(year, month - 1, 1)).toLocaleString(locale, {
    month: 'short',
    timeZone: 'UTC',
  })
  return `${name.replace('.', '')}-${String(year % 100).padStart(2, '0')}`
}

function linkHost(link: string): string {
  try {
    return new URL(link).hostname.replace(/^www\./, '')
  } catch {
    return link
  }
}

export default function ReviewItem({ review, own }: ReviewItemProps) {
  const { t } = useTranslation()
  const locale = useLocale()
  const [expanded, setExpanded] = useState(false)
  const content = review.content ?? ''
  const isLong =
    content.length > LONG_CONTENT_CHARS ||
    content.split('\n').length > LONG_CONTENT_LINES
  const visited = review.visited_at
    ? formatVisit(review.visited_at, dateLocale(locale))
    : null
  const pending = own && own.status !== 'approved'
  const meta = [
    visited && t('reviews.visited', { date: visited }),
    pending && t('reviews.pending'),
  ].filter(Boolean)

  return (
    <article className={cn(REVIEW_CARD_CLASS, 'flex flex-col gap-2.5 p-4')}>
      <div className="flex items-start justify-between gap-2">
        <h3 className="m-0 text-sm font-bold text-forest break-words">
          {own
            ? t('reviews.you', { name: review.reviewer_name })
            : review.reviewer_name}
        </h3>
        {own && (
          <button
            type="button"
            onClick={own.onEdit}
            aria-label={t('reviews.edit')}
            title={t('reviews.edit')}
            className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full border border-grove-light bg-transparent text-moss hover:bg-forest-lighter"
          >
            <Pencil size={14} aria-hidden="true" />
          </button>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {review.overall_score != null && (
          <StarDisplay score={review.overall_score} />
        )}
        {meta.length > 0 && (
          <span className="text-xs text-bark">{meta.join(' · ')}</span>
        )}
      </div>
      {content && (
        <p
          className={cn(
            'm-0 whitespace-pre-line text-[13px] leading-[1.6] text-moss-dark',
            !expanded && 'line-clamp-4',
          )}
        >
          {content}
        </p>
      )}
      {(isLong || review.external_url_link) && (
        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          {isLong ? (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
              className="cursor-pointer border-none bg-transparent p-0 text-xs font-semibold text-moss hover:underline"
            >
              {expanded ? t('reviews.seeLess') : t('reviews.seeMore')}
            </button>
          ) : (
            <span />
          )}
          {review.external_url_link && (
            <a
              href={review.external_url_link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-w-0 items-center gap-1 text-xs font-semibold text-moss hover:underline"
            >
              <span className="truncate">
                {review.external_url_title
                  ? t('reviews.readOn', { title: review.external_url_title })
                  : linkHost(review.external_url_link)}
              </span>
              <ExternalLink size={12} aria-hidden="true" className="shrink-0" />
            </a>
          )}
        </div>
      )}
    </article>
  )
}
