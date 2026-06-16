import { useRouteContext } from '@tanstack/react-router'
import { Compass, Home, MapPin } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import LocaleLink from '@/components/LocaleLink'

export default function Navbar() {
  const { ua } = useRouteContext({ from: '__root__' })
  const { t } = useTranslation()
  if (!ua.isMobile) return null
  return (
    <div className="fixed w-full bottom-5 z-1000 h-16">
      <nav className="flex bg-white border h-full border-grove-light rounded-full mx-6 items-stretch font-medium text-xs text-bark no-underline text-center *:px-4 *:w-full *:flex *:flex-col *:items-center *:justify-center *:mx-2 *:my-1.5 *:rounded-full">
        <LocaleLink
          to="/{-$locale}"
          activeProps={{
            className: 'bg-forest text-cream justify-center',
          }}
        >
          <Home size={14} aria-hidden="true" />
          <span>{t('nav.home')}</span>
        </LocaleLink>
        <LocaleLink
          to="/{-$locale}/explore"
          activeProps={{
            className: 'bg-forest text-cream justify-center',
          }}
        >
          <Compass size={14} aria-hidden="true" />
          <span>{t('nav.explore')}</span>
        </LocaleLink>
        <LocaleLink
          to="/{-$locale}/meet-in-the-middle"
          activeProps={{
            className: 'bg-forest text-cream justify-center',
          }}
        >
          <MapPin size={14} aria-hidden="true" />
          <span className="truncate">{t('nav.meetInTheMiddleShort1')}</span>
          <span className="truncate">{t('nav.meetInTheMiddleShort2')}</span>
        </LocaleLink>
      </nav>
    </div>
  )
}
