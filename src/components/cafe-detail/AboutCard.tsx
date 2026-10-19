import { useTranslation } from 'react-i18next'

interface AboutCardProps {
  about: string | null
}

export default function AboutCard({ about }: AboutCardProps) {
  const { t } = useTranslation()
  const paragraphs = about
    ? about.split('\n').filter((para) => para.trim() !== '')
    : []

  return (
    <div className="bg-surface rounded-2xl p-5 flex flex-col gap-3 text-moss-dark antialiased">
      <h2 className="text-base font-bold m-0 dark:text-forest">
        {t('cafe.about')}
      </h2>
      <div className="flex flex-col gap-3 antialiased dark:text-bark">
        {paragraphs.length > 0 ? (
          paragraphs.map((para, i) => (
            <p key={i} className="text-sm leading-[1.7] m-0">
              {para}
            </p>
          ))
        ) : (
          <div className="flex justify-center items-center h-24">
            <p className="text-sm leading-[1.7] m-0 text-bark">
              {t('cafe.noAbout')}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
