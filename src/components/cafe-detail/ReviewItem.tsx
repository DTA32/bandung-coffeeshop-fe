import { useState } from 'react'
import { ExternalLink, Pencil } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { StarDisplay } from './StarRating'
import { useLocale, dateLocale } from '@/lib/locale'
import { cn } from '@/lib/cn'
import type {
  CafeReviewItem,
  MyReviewStatus,
  RatingType,
  RatingsResponse,
} from '@/lib/api/cafe'

// Content longer than this (or with many line breaks) gets the more/less toggle.
const LONG_CONTENT_CHARS = 140
const LONG_CONTENT_LINES = 4

export const REVIEW_CARD_CLASS =
  'snap-start shrink-0 w-64 md:w-[calc((100%-2rem)/3)] min-h-60 rounded-2xl border border-grove-light bg-surface'

interface ReviewItemProps {
  review: CafeReviewItem
  // Bucket names for the rating chips (the cafe's aggregate ratings).
  ratingNames: RatingsResponse
  // Set on the signed-in user's own review.
  own?: { status: MyReviewStatus; onEdit: () => void }
}

// "2024-11" → "November 2024" in the active locale.
function formatVisit(visitedAt: string, locale: string): string | null {
  const [year, month] = visitedAt.split('-').map(Number)
  if (!year || !month) return null
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleString(locale, {
    year: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  })
}

function ratingChips(
  ratings: CafeReviewItem['ratings'],
  names: RatingsResponse,
): string[] {
  const chips: string[] = []
  for (const [type, score] of Object.entries(ratings)) {
    const entry = names[type as RatingType]
    if (!entry) continue
    const bucket =
      entry.range.find(
        (r) => score >= r.lower_bound && score <= r.upper_bound,
      ) ?? [...entry.range].reverse().find((r) => score >= r.lower_bound)
    if (bucket) chips.push(`${entry.display_name}: ${bucket.name}`)
  }
  return chips
}

function linkHost(link: string): string {
  try {
    return new URL(link).hostname.replace(/^www\./, '')
  } catch {
    return link
  }
}

export default function ReviewItem({
  review,
  ratingNames,
  own,
}: ReviewItemProps) {
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
  const chips = ratingChips(review.ratings, ratingNames)

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
        {review.wfc_score != null && (
          <span className="rounded-full bg-forest-lighter px-2 py-0.5 text-[11px] font-semibold text-moss">
            {t('reviews.wfc', { score: review.wfc_score.toFixed(1) })}
          </span>
        )}
      </div>
      {meta.length > 0 && (
        <p className="m-0 text-xs text-bark">{meta.join(' · ')}</p>
      )}
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
      {chips.length > 0 && (
        <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0">
          {chips.map((chip) => (
            <li
              key={chip}
              className="rounded-full border border-grove-light px-2 py-0.5 text-[11px] text-moss-dark"
            >
              {chip}
            </li>
          ))}
        </ul>
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
