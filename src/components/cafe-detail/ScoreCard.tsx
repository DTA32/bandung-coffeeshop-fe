import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/cn'

interface ScoreCardProps {
  overallScore: number | null
  wfcScore: number | null
}

function fmt(n: number) {
  return n.toFixed(1)
}

export default function ScoreCard({ overallScore, wfcScore }: ScoreCardProps) {
  const { t } = useTranslation()
  return (
    <div className="bg-white rounded-2xl p-5 flex flex-col gap-4">
      <h2 className="text-base font-bold text-forest m-0">
        {t('cafe.scores')}
      </h2>
      <div className="flex justify-between gap-4">
        {overallScore && (
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-bark">
              {t('cafe.overallScore')}
            </span>
            <span className="text-[28px] font-bold text-forest leading-none">
              {fmt(overallScore)} {t('cafe.outOfFive')}
            </span>
          </div>
        )}
        {wfcScore && (
          <div
            className={cn(
              'flex flex-col gap-2',
              overallScore ? 'items-end' : 'items-start',
            )}
          >
            <span className="text-xs font-semibold text-bark">
              {t('cafe.wfcScore')}
            </span>
            <span className="text-[28px] font-bold text-grove leading-none">
              {fmt(wfcScore)} {t('cafe.outOfFive')}
            </span>
          </div>
        )}
        {!overallScore && !wfcScore && (
          <div className="flex justify-center items-center h-16 w-full">
            <p className="text-sm leading-[1.7] m-0 text-bark">
              {t('cafe.noScores')}
            </p>
          </div>
        )}
      </div>
      {overallScore || wfcScore ? (
        <span className="text-xs text-forest-light">
          {t('cafe.personalNote')}
        </span>
      ) : null}
    </div>
  )
}
