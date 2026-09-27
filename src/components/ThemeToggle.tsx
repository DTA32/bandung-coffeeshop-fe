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

// Cycles the theme preference; the icon shows the current mode (device
// default, light, or dark) and the label announces what a click switches to.
export default function ThemeToggle({
  className = '',
}: {
  className?: string
}) {
  const { preference, next, setPreference } = useTheme()
  const { t } = useTranslation()
  const label = t(ACTION_LABEL_KEYS[next])
  const Icon = ICONS[preference]

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
