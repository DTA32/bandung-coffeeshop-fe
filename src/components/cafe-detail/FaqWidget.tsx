import { useTranslation } from 'react-i18next'
import type { FaqItem } from '@/lib/seoTemplate'

// CDP FAQ (BCF-42): questions answered from the cafe's own data, built by
// buildCafeFaq in the route loader. Renders nothing when there are no items.
export default function FaqWidget({ items }: { items: FaqItem[] }) {
  const { t } = useTranslation()
  if (items.length === 0) {
    return null
  }
  return (
    <section className="bg-surface rounded-2xl p-5 flex flex-col gap-2 antialiased">
      <h2 className="m-0 text-base font-bold text-forest">
        {t('seo.cafe.faq.title')}
      </h2>
      <dl className="m-0 flex flex-col divide-y divide-forest-lighter">
        {items.map((item) => (
          <div key={item.question} className="flex flex-col gap-1.5 py-4">
            <dt className="text-sm font-semibold leading-normal text-forest">
              {item.question}
            </dt>
            <dd className="m-0 text-sm leading-[1.7] text-moss-dark">
              {item.answer}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
