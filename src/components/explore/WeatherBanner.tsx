import { Cloud, CloudRain, Sun } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { CurrentWeather, WeatherCondition } from '@/lib/api/search'

const ICONS: Record<WeatherCondition, typeof Sun> = {
  clear: Sun,
  cloudy: Cloud,
  rain: CloudRain,
}

function formatWib(iso: string): string | null {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Jakarta',
  }).format(date)
}

export default function WeatherBanner({
  weather,
}: {
  weather: CurrentWeather
}) {
  const { t } = useTranslation()
  const Icon = ICONS[weather.condition]
  const time = formatWib(weather.observed_at)

  return (
    <div className="mb-6 flex items-center gap-3.5 rounded-xl border border-grove-light bg-forest-lighter px-4 py-3.5 md:px-5">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface">
        <Icon size={20} className="text-moss" aria-hidden="true" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="m-0 text-[15px] font-bold text-forest">
          {t(`explore.weather.title.${weather.condition}`, {
            temp: Math.round(weather.temp_c),
          })}
        </p>
        <p className="m-0 text-sm text-bark">
          {t(`explore.weather.subtitle.${weather.condition}`)}
        </p>
        <p className="m-0 text-xs text-forest-light md:hidden">
          {time && `${t('explore.weather.updated', { time })} · `}
          <WeatherCredit />
        </p>
      </div>
      <div className="hidden shrink-0 flex-col items-end gap-0.5 md:flex">
        {time && (
          <span className="text-xs text-bark">
            {t('explore.weather.updated', { time })}
          </span>
        )}
        <span className="text-[11px] text-forest-light">
          <WeatherCredit />
        </span>
      </div>
    </div>
  )
}

function WeatherCredit() {
  const { t } = useTranslation()
  return (
    <a
      href="https://www.weatherapi.com/"
      target="_blank"
      rel="noopener noreferrer"
      className="text-inherit no-underline hover:underline"
    >
      {t('explore.weather.poweredBy')}
    </a>
  )
}
