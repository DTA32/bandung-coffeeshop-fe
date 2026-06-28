import { Link, useRouterState } from '@tanstack/react-router'
import type { ReactElement } from 'react'
import { Languages } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toggleLocalePath } from '@/lib/locale'

// Link's `to` is typed to the static route tree, but the toggle target is a
// computed runtime path (the current URL with the `/en` prefix flipped), so we
// forward through a loosely-typed alias. Rendering a real <Link>/<a> keeps the
// switch crawlable and right-click / open-in-new-tab friendly.
const RawLink = Link as (props: Record<string, unknown>) => ReactElement

// LanguageToggle links to the current page in the other language: Indonesian
// (bare path) ⇄ English (`/en`), preserving the path and search params.
export default function LanguageToggle({
  className = '',
}: {
  className?: string
}) {
  const { t } = useTranslation()
  const { pathname, search } = useRouterState({ select: (s) => s.location })
  return (
    <RawLink
      to={toggleLocalePath(pathname)}
      search={search}
      aria-label={t('nav.language')}
      title={t('nav.language')}
      className={`flex flex-col items-center text-moss ${className} cursor-pointer`}
    >
      <Languages size={18} aria-hidden="true" />
      <span className="text-xs font-medium">{t('nav.currentLanguage')}</span>
    </RawLink>
  )
}
