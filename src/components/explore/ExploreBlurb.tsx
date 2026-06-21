import type { SrpBlurb } from '@/lib/srp'
import { useTranslation } from 'react-i18next'

export default function ExploreBlurb({ items }: { items: SrpBlurb[] }) {
  const { t } = useTranslation()
  if (items.length === 0) return null

  return (
    <section className="flex md:w-1/2 flex-col gap-4">
      <h2 className="text-sm font-semibold text-forest">
        {t('explore.funFacts')}
      </h2>
      {items.map((item, i) => (
        <article key={`${item.type}-${i}`} className="flex flex-col gap-1">
          <p className="m-0 text-sm leading-relaxed text-bark">{item.body}</p>
        </article>
      ))}
    </section>
  )
}
