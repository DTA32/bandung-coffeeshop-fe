import { Info } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function Disclaimer() {
  const { t } = useTranslation()
  return (
    <div
      role="note"
      className="bg-cream rounded-xl flex flex-row items-start gap-1.5 px-4 py-3.5"
    >
      <Info size={18} className="text-bark shrink-0 pt-1" aria-hidden="true" />
      <p className="text-xs text-bark leading-relaxed m-0">
        {t('cafe.disclaimer')}
      </p>
    </div>
  )
}
