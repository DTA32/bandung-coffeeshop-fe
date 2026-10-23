import { LogIn } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/cn'
import { useAuth } from '@/lib/hooks/useAuth'

// Opens the login modal. `onClick` runs first, e.g. to close a parent menu.
export default function LoginButton({
  className,
  onClick,
}: {
  className?: string
  onClick?: () => void
}) {
  const { t } = useTranslation()
  const { openLogin } = useAuth()
  return (
    <button
      type="button"
      onClick={() => {
        onClick?.()
        openLogin()
      }}
      className={cn(
        'flex h-8 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-full bg-moss px-4 text-[13px] font-semibold text-cream transition-colors hover:bg-moss-dark',
        className,
      )}
    >
      <LogIn size={14} aria-hidden="true" />
      {t('auth.login')}
    </button>
  )
}
