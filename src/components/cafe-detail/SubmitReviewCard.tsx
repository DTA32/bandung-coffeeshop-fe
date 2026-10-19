import { useState } from 'react'
import { MessageSquareHeart, Star } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/cn'

interface SubmitReviewCardProps {
  cafeName: string
  // Opens the review flow pre-filled with the tapped score.
  onPick: (score: number) => void
}

export default function SubmitReviewCard({
  cafeName,
  onPick,
}: SubmitReviewCardProps) {
  const { t } = useTranslation()
  const [hover, setHover] = useState(0)
  return (
    <div className="snap-start shrink-0 w-64 md:w-[calc((100%-2rem)/3)] min-h-60 flex flex-col items-center justify-center gap-4 rounded-2xl border border-grove-light bg-forest-lighter p-5 text-center">
      <MessageSquareHeart size={28} className="text-grove" aria-hidden="true" />
      <div className="flex flex-col gap-1">
        <h3 className="m-0 text-[15px] font-bold text-forest">
          {t('reviews.submitTitle', { cafe: cafeName })}
        </h3>
        <p className="m-0 text-[13px] text-bark">{t('reviews.submitSub')}</p>
      </div>
      <div className="flex gap-2" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onPick(n)}
            onMouseEnter={() => setHover(n)}
            onFocus={() => setHover(n)}
            onBlur={() => setHover(0)}
            aria-label={t('reviews.rateStars', { count: n })}
            className="cursor-pointer rounded-md border-none bg-transparent p-0"
          >
            <Star
              size={30}
              strokeWidth={1.5}
              aria-hidden="true"
              className={cn(
                'transition-colors',
                n <= hover
                  ? 'fill-amber-500 text-amber-500'
                  : 'fill-surface text-forest-light',
              )}
            />
          </button>
        ))}
      </div>
      <p className="m-0 text-[11px] text-forest-light">
        {t('reviews.submitHint')}
      </p>
    </div>
  )
}
