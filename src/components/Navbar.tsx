import { useCallback, useId, useRef, useState } from 'react'
import { useRouteContext, useRouterState } from '@tanstack/react-router'
import {
  ChevronDown,
  ChevronUp,
  CircleUserRound,
  Compass,
  Home,
  LogOut,
  MapPin,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import LocaleLink from '@/components/LocaleLink'
import LanguageToggle from '@/components/LanguageToggle'
import ThemeToggle from '@/components/ThemeToggle'
import LoginButton from '@/components/auth/LoginButton'
import { cn } from '@/lib/cn'
import { useAuth } from '@/lib/hooks/useAuth'
import { useClickOutside } from '@/lib/hooks/useClickOutside'
import { useEscapeKey } from '@/lib/hooks/useEscapeKey'

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
        <NavMenu />
      </nav>
    </div>
  )
}

// The last navbar cell: an account + chevron button group that opens a menu
// above the pill with the language/theme switches and login or account info.
// The menu is positioned against the sticky navbar wrapper (its nearest
// positioned ancestor), so it spans above the pill's right edge.
function NavMenu() {
  const { t } = useTranslation()
  const { status, me, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const menuId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Close on navigation (e.g. the language row switches locale).
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const [prevPathname, setPrevPathname] = useState(pathname)
  if (pathname !== prevPathname) {
    setPrevPathname(pathname)
    setOpen(false)
  }

  const close = useCallback(() => setOpen(false), [])
  const closeAndRefocus = useCallback(() => {
    setOpen(false)
    buttonRef.current?.focus()
  }, [])
  useClickOutside(rootRef, close, open)
  useEscapeKey(closeAndRefocus, open)

  const Chevron = open ? ChevronDown : ChevronUp

  return (
    <div ref={rootRef}>
      <button
        ref={buttonRef}
        type="button"
        aria-label={t('nav.more')}
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'flex h-10 cursor-pointer items-stretch rounded-full border text-moss transition-colors',
          open
            ? 'border-moss bg-forest-lighter'
            : 'border-grove-light bg-surface',
        )}
      >
        <span className="flex items-center pr-1.5 pl-2.5">
          {status === 'user' && me ? (
            <span className="flex size-6 items-center justify-center rounded-full bg-moss text-[11px] font-bold text-cream uppercase">
              {me.name.charAt(0)}
            </span>
          ) : (
            <CircleUserRound size={18} aria-hidden="true" />
          )}
        </span>
        <span
          className={cn(
            'flex items-center border-l pr-2.5 pl-1.5',
            open ? 'border-moss' : 'border-grove-light',
          )}
        >
          <Chevron size={16} aria-hidden="true" />
        </span>
      </button>

      {open && (
        <div
          id={menuId}
          className="absolute right-4 bottom-full mb-2 flex w-55 flex-col gap-2 rounded-2xl border border-grove-light bg-surface p-3.5 text-left text-sm shadow-lg"
        >
          <LanguageToggle variant="menu" />
          <ThemeToggle variant="menu" />
          {status === 'user' && me ? (
            <>
              <div className="flex flex-col gap-0.5 px-1 pt-1">
                <span className="truncate font-bold text-forest">
                  {me.name}
                </span>
                <span className="truncate text-xs text-bark">{me.email}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setOpen(false)
                  void logout()
                }}
                className="flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-error-accent font-semibold text-error transition-colors hover:bg-error-bg"
              >
                <LogOut size={16} aria-hidden="true" />
                {t('auth.logout')}
              </button>
            </>
          ) : status === 'anon' ? (
            <LoginButton
              className="h-10 w-full"
              onClick={() => setOpen(false)}
            />
          ) : (
            <span
              aria-hidden="true"
              className="block h-10 w-full animate-pulse rounded-full bg-grove-light"
            />
          )}
        </div>
      )}
    </div>
  )
}
