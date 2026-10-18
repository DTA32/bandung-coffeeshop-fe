import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { ChevronDown, LogOut } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/cn'
import { useAuth } from '@/lib/hooks/useAuth'
import { useClickOutside } from '@/lib/hooks/useClickOutside'
import { useEscapeKey } from '@/lib/hooks/useEscapeKey'

// Desktop account pill: shows the user's initial (as the mobile navbar does)
// and name, and opens a small menu with
// their email and a log out action.
export default function AccountMenu() {
  const { t } = useTranslation()
  const { me, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const menuId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const itemRef = useRef<HTMLButtonElement>(null)

  const close = useCallback(() => setOpen(false), [])
  const closeAndRefocus = useCallback(() => {
    setOpen(false)
    buttonRef.current?.focus()
  }, [])
  useClickOutside(rootRef, close, open)
  useEscapeKey(closeAndRefocus, open)

  // Menu-button pattern: opening moves focus onto the first item.
  useEffect(() => {
    if (open) itemRef.current?.focus()
  }, [open])

  if (!me) return null

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        title={t('auth.accountMenu')}
        onClick={() => setOpen((o) => !o)}
        className="flex h-8 cursor-pointer items-center gap-1.5 rounded-full border border-grove-light bg-surface pr-3 pl-1.5 text-[13px] font-semibold text-forest transition-colors hover:bg-forest-lighter"
      >
        <span
          aria-hidden="true"
          className="flex size-5 items-center justify-center rounded-full bg-moss text-[10px] font-bold text-cream uppercase"
        >
          {me.name.charAt(0)}
        </span>
        <span className="max-w-36 truncate">{me.name}</span>
        <ChevronDown
          size={14}
          aria-hidden="true"
          className={cn('text-bark transition-transform', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label={t('auth.accountMenu')}
          className="absolute top-full right-0 z-40 mt-2 flex w-60 flex-col rounded-xl border border-grove-light bg-surface p-1.5 shadow-lg"
        >
          <div className="flex flex-col gap-0.5 px-3 py-2">
            <span className="truncate text-sm font-bold text-forest">
              {me.name}
            </span>
            <span className="truncate text-xs text-bark">{me.email}</span>
          </div>
          <hr className="my-1 border-grove-light" />
          <button
            ref={itemRef}
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false)
              void logout()
            }}
            className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-error transition-colors hover:bg-error-bg focus-visible:bg-error-bg"
          >
            <LogOut size={16} aria-hidden="true" />
            {t('auth.logout')}
          </button>
        </div>
      )}
    </div>
  )
}
