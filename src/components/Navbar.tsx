import { useRouteContext } from '@tanstack/react-router'
import { Compass, Home, MapPin } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import LocaleLink from '@/components/LocaleLink'
import LanguageToggle from '@/components/LanguageToggle'
import ThemeToggle from '@/components/ThemeToggle'

export default function Navbar() {
  const { ua } = useRouteContext({ from: '__root__' })
  const { t } = useTranslation()
  if (!ua.isMobile) return null
  return (
    <div className="sticky mb-5 w-full bottom-5 z-30 h-18">
      <nav className="flex bg-surface border h-full border-grove-light rounded-full mx-4 items-stretch font-medium text-xs text-bark no-underline text-center *:w-full *:flex *:flex-col *:items-center *:justify-center *:mx-1 *:my-1.5 *:rounded-full">
        <LocaleLink
          to="/{-$locale}"
          activeOptions={{ exact: true }}
          activeProps={{
            className: 'bg-forest text-cream justify-center',
          }}
          className={'px-2'}
        >
          <Home size={14} aria-hidden="true" />
          <span>{t('nav.home')}</span>
        </LocaleLink>
        <LocaleLink
          to="/{-$locale}/explore"
          activeProps={{
            className: 'bg-forest text-cream justify-center',
          }}
          className={'px-2'}
        >
          <Compass size={14} aria-hidden="true" />
          <span>{t('nav.explore')}</span>
        </LocaleLink>
        <LocaleLink
          to="/{-$locale}/meet-in-the-middle"
          activeProps={{
            className: 'bg-forest text-cream justify-center',
          }}
          className={'px-2'}
        >
          <MapPin size={14} aria-hidden="true" />
          <span className="truncate">{t('nav.meetInTheMiddleShort1')}</span>
          <span className="truncate">{t('nav.meetInTheMiddleShort2')}</span>
        </LocaleLink>
        <div className={'flex flex-col justify-between'}>
          <LanguageToggle className={'text-bark gap-0.5 h-full'} />
          <ThemeToggle className={'text-bark h-full'} />
        </div>
      </nav>
    </div>
  )
}
