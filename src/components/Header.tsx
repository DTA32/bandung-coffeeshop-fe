import { useRouteContext } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import LocaleLink from '@/components/LocaleLink'
import LanguageToggle from '@/components/LanguageToggle'

export default function Header() {
  const { ua } = useRouteContext({ from: '__root__' })
  const { t } = useTranslation()
  if (ua.isMobile) return null
  return (
    <header className="sticky top-0 z-30 flex h-12 items-center justify-between border-b border-grove-light bg-cream px-6 md:px-16">
      <LocaleLink to="/{-$locale}" className="no-underline">
        <span className="text-xl font-bold text-forest">{t('brand')}</span>
      </LocaleLink>

      <nav
        aria-label={t('nav.primary')}
        className="flex items-center gap-4 md:gap-8 font-medium"
      >
        <LocaleLink
          to="/{-$locale}/explore"
          className="text-sm text-moss no-underline"
        >
          {t('nav.explore')}
        </LocaleLink>
        <LocaleLink
          to="/{-$locale}/meet-in-the-middle"
          className="text-sm text-moss no-underline"
        >
          {t('nav.meetInTheMiddle')}
        </LocaleLink>
        <LocaleLink
          to="/{-$locale}/about"
          className="text-sm text-moss no-underline"
        >
          {t('nav.about')}
        </LocaleLink>
        <LanguageToggle languageHintClassName={'text-moss absolute -top-2 -right-3'} />
        {/* <Sun size={20} color="#4A7038" /> */}
      </nav>
    </header>
  )
}
