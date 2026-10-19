import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/cn'

interface ScoreCardProps {
  overallScore: number | null
  wfcScore: number | null
  overallReviewCount: number
  wfcReviewCount: number
}

function fmt(n: number) {
  return n.toFixed(1)
}

export default function ScoreCard({
  overallScore,
  wfcScore,
  overallReviewCount,
  wfcReviewCount,
}: ScoreCardProps) {
  const { t } = useTranslation()
  const hasOverall = overallScore != null
  const hasWfc = wfcScore != null
  return (
    <div className="bg-surface rounded-2xl p-5 flex flex-col gap-4">
      <h2 className="text-base font-bold text-forest m-0">
        {t('cafe.scores')}
      </h2>
      <div className="flex justify-between gap-4">
        {hasOverall && (
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-bark">
              {t('cafe.overallScore')}
            </span>
            <span className="text-[28px] font-bold text-forest leading-none">
              {fmt(overallScore)} {t('cafe.outOfFive')}
            </span>
            {overallReviewCount > 1 && (
              <span className="text-xs text-bark">
                {t('cafe.fromReviews', { count: overallReviewCount })}
              </span>
            )}
          </div>
        )}
        {hasWfc && (
          <div
            className={cn(
              'flex flex-col gap-2',
              hasOverall ? 'items-end' : 'items-start',
            )}
          >
            <span className="text-xs font-semibold text-bark">
              {t('cafe.wfcScore')}
            </span>
            <span className="text-[28px] font-bold text-grove leading-none">
              {fmt(wfcScore)} {t('cafe.outOfFive')}
            </span>
            {wfcReviewCount > 1 && (
              <span className="text-xs text-bark">
                {t('cafe.fromReviews', { count: wfcReviewCount })}
              </span>
            )}
          </div>
        )}
        {!hasOverall && !hasWfc && (
          <div className="flex justify-center items-center h-16 w-full">
            <p className="text-sm leading-[1.7] m-0 text-bark">
              {t('cafe.noScores')}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
