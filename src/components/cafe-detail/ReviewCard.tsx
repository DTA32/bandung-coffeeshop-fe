import { CalendarDays } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useLocale, dateLocale } from '@/lib/locale'

interface ReviewCardProps {
  content: string | null
  visited_at: string | null
}

export default function ReviewCard({ content, visited_at }: ReviewCardProps) {
  const { t } = useTranslation()
  const locale = useLocale()
  const paragraphs = content !== null ? content.split('\n') : []
  const visited_at_formatted = visited_at
    ? new Date(visited_at).toLocaleString(dateLocale(locale), {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null

  return (
    <div className="bg-white rounded-2xl p-5 flex flex-col gap-3 text-moss-dark antialiased">
      <div className="flex justify-between">
        <h2 className="text-base font-bold  m-0">{t('cafe.review')}</h2>
        {visited_at_formatted && (
          <div className="flex flex-row items-center gap-1 text-bark">
            <CalendarDays size={14} className="shrink-0" aria-hidden="true" />
            <p className="text-xs leading-relaxed m-0">
              {t('cafe.visited')}{' '}
              <time dateTime={visited_at ?? undefined}>
                {visited_at_formatted}
              </time>
            </p>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-3 text-moss-dark antialiased">
        {paragraphs.length > 0 ? (
          paragraphs.map((para, i) => (
            <p key={i} className="text-sm leading-[1.7] m-0">
              {para}
            </p>
          ))
        ) : (
          <div className="flex justify-center items-center h-24">
            <p className="text-sm leading-[1.7] m-0 text-bark">
              {t('cafe.noReview')}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
