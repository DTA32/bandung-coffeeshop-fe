import { Moon, Sun } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/lib/hooks/theme'

export default function ThemeToggle({ className = '' }: { className?: string }) {
  const { isDark, toggle } = useTheme()
  const { t } = useTranslation()
  const label = isDark ? t('nav.lightMode') : t('nav.darkMode')

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      aria-pressed={isDark}
      className={`flex cursor-pointer items-center text-moss ${className}`}
    >
      {isDark ? (
        <Sun size={18} aria-hidden="true" />
      ) : (
        <Moon size={18} aria-hidden="true" />
      )}
    </button>
  )
}
