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
    <div className="snap-start shrink-0 w-66 md:w-74 min-h-[236px] flex flex-col items-center justify-center gap-4 rounded-2xl border border-[#B9D2A3] bg-[#F1F6EB] p-5 text-center dark:border-grove-light dark:bg-forest-lighter">
      <MessageSquareHeart size={28} className="text-grove" aria-hidden="true" />
      <div className="flex flex-col gap-1">
        <h3 className="m-0 text-[15px] font-bold text-forest">
          {t('reviews.submitTitle', { cafe: cafeName })}
        </h3>
        <p className="m-0 text-[13px] text-[#7A8E70] dark:text-bark">
          {t('reviews.submitSub')}
        </p>
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
                  ? 'fill-[#E3A53B] text-[#E3A53B]'
                  : 'fill-surface text-[#B9D2A3] dark:text-grove-light',
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
