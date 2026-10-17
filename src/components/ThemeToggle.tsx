import { Monitor, Moon, Sun } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/cn'
import { useTheme } from '@/lib/hooks/theme'

const ICONS = { system: Monitor, light: Sun, dark: Moon } as const

const ACTION_LABEL_KEYS = {
  system: 'nav.systemMode',
  light: 'nav.lightMode',
  dark: 'nav.darkMode',
} as const

const VALUE_LABEL_KEYS = {
  system: 'theme.auto',
  light: 'theme.light',
  dark: 'theme.dark',
} as const

// Cycles the theme preference; the icon shows the current mode (device
// default, light, or dark) and the label announces what a click switches to.
// The `menu` variant renders it as a full-width row for the mobile nav menu,
// showing the current mode as text.
export default function ThemeToggle({
  className = '',
  variant = 'default',
}: {
  className?: string
  variant?: 'default' | 'menu'
}) {
  const { preference, next, setPreference } = useTheme()
  const { t } = useTranslation()
  const label = t(ACTION_LABEL_KEYS[next])
  const Icon = ICONS[preference]

  if (variant === 'menu') {
    return (
      <button
        type="button"
        onClick={() => setPreference(next)}
        title={label}
        className={cn(
          'flex h-11 w-full cursor-pointer items-center gap-2.5 rounded-xl bg-forest-lighter px-3 text-sm text-forest',
          className,
        )}
      >
        <Icon size={18} aria-hidden="true" className="text-moss" />
        <span className="font-bold">{t('nav.theme')}</span>
        <span className="ml-auto text-xs font-medium text-bark">
          {t(VALUE_LABEL_KEYS[preference])}
        </span>
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setPreference(next)}
      aria-label={label}
      title={label}
      className={cn('flex cursor-pointer items-center text-moss', className)}
    >
      <Icon size={18} aria-hidden="true" />
    </button>
  )
}
