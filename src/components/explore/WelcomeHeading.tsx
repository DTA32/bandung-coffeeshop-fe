import { useTranslation } from 'react-i18next'
import type { LocationData } from '@/lib/api/location'

// A location's heading: "Welcome to <name>" when the location opts in, otherwise
// just the name. The caller controls the <h1> styling via `className`.
export default function WelcomeHeading({
  location,
  className,
}: {
  location: LocationData
  className?: string
}) {
  const { t } = useTranslation()
  return (
    <h1 className={className}>
      {location.show_welcome_text && (
        <span className="font-normal">{t('explore.welcomeTo')}&nbsp;</span>
      )}
      {location.name}
    </h1>
  )
}
