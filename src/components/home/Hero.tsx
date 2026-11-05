import { useRouteContext } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import BrandLockup from '@/components/BrandLockup'
import SearchBox from '@/components/SearchBox'
import { DiscoveryActions, MoodChips, OrDivider } from './HeroShortcuts'

export default function Hero() {
  const { t } = useTranslation()
  const { ua } = useRouteContext({ from: '__root__' })
  return (
    <section
      className="
        relative flex min-h-140 w-full justify-center bg-cover bg-center bg-bark
        bg-[url(https://image.bdgcafe.com/homepage.jpg)]
      "
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 hidden bg-cream/65 dark:block"
      />
      <div className="relative flex w-full flex-1 flex-col justify-between text-forest md:items-center md:justify-center">
        {ua.isMobile && (
          <BrandLockup
            label={t('brand')}
            className="gap-2 self-start px-5 pt-8 text-forest"
            markClassName="size-8"
            wordmarkClassName="h-5"
            creaseClassName="fill-forest-lighter"
          />
        )}
        <div
          className="
            flex flex-col h-full md:h-fit w-full max-w-240 justify-end md:justify-center
            gap-3 px-5 pt-16 pb-8
            bg-linear-to-b from-cream/0 via-cream/50 via-35% to-cream/95
            md:items-center md:gap-5 md:bg-none md:p-6
          "
        >
          <h1 className="m-0 md:text-center text-3xl md:text-5xl font-bold leading-[1.15]">
            {t('home.heroTitle')}
          </h1>
          <p className="m-0 md:text-center text-sm md:text-lg text-forest/80 md:text-forest">
            {t('home.heroSubtitle')}
          </p>
          <MoodChips />
          <OrDivider />
          <SearchBox />
          <DiscoveryActions />
        </div>
      </div>
    </section>
  )
}
