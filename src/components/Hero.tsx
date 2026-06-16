import { useTranslation } from 'react-i18next'
import SearchBox from '@/components/search/SearchBox'

export default function Hero() {
  const { t } = useTranslation()
  return (
    <section
      className="
        flex h-90 md:h-120 w-full items-end md:items-center justify-center bg-cover bg-center bg-bark
        bg-[url(https://bdgcafe-dev-assets.dta32.my.id/homepage.jpg)]
      "
    >
      <div className="flex w-full max-w-240 flex-col items-center gap-5 p-6 rounded-lg text-cream">
        <h1 className="m-0 md:text-center text-3xl md:text-5xl font-bold leading-[1.15]">
          {t('home.heroTitle')}
        </h1>
        <p className="m-0 md:text-center text-sm md:text-lg">
          {t('home.heroSubtitle')}
        </p>
        <SearchBox />
      </div>
    </section>
  )
}
