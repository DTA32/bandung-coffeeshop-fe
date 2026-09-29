import { useTranslation } from 'react-i18next'
import {
  BookOpen,
  CloudSun,
  Dices,
  Heart,
  Laptop,
  LoaderCircle,
  Users,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import LocaleLink from '@/components/LocaleLink'
import { cn } from '@/lib/cn'
import { WEATHER_CURRENT } from '@/lib/explore'
import { useSurpriseCafe } from './useSurpriseCafe'

const MOOD_ROWS: { key: string; slug: string; icon: LucideIcon }[][] = [
  [
    { key: 'wfc', slug: 'wfc-friendly', icon: Laptop },
    { key: 'hangout', slug: 'hangout-vibe', icon: Users },
  ],
  [
    { key: 'date', slug: 'perfect-for-date', icon: Heart },
    { key: 'read', slug: 'reading', icon: BookOpen },
  ],
]

export const heroChip =
  'inline-flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-forest/25 bg-cream/80 px-3.5 py-2 text-[13px] md:text-sm font-medium text-forest no-underline backdrop-blur-sm transition hover:bg-cream dark:bg-surface/80 dark:hover:bg-surface'

export function MoodChips() {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col gap-2 md:items-center">
      <p className="m-0 text-[13px] md:text-[15px] font-medium text-forest/80 dark:text-bark">
        {t('home.moodKicker')}
      </p>
      <div className="inline-flex flex-col gap-2 self-start md:flex-row md:gap-2.5 md:self-center">
        {MOOD_ROWS.map((row, i) => (
          <div key={i} className="flex gap-2 md:gap-2.5">
            {row.map(({ key, slug, icon: Icon }) => (
              <LocaleLink
                key={key}
                to="/{-$locale}/explore/$"
                params={{ _splat: slug }}
                className={cn(heroChip, 'flex-1')}
              >
                <Icon size={14} aria-hidden="true" />
                {t(`home.moods.${key}`)}
              </LocaleLink>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export function OrDivider() {
  const { t } = useTranslation()
  return (
    <div className="flex w-full items-center gap-3 md:w-auto">
      <span className="h-px flex-1 bg-forest/25 md:w-12 md:flex-none" />
      <span className="text-xs md:text-[13px] text-forest/70">
        {t('common.or')}
      </span>
      <span className="h-px flex-1 bg-forest/25 md:w-12 md:flex-none" />
    </div>
  )
}

export function DiscoveryActions() {
  const { t } = useTranslation()
  const { surprise, pending } = useSurpriseCafe()
  return (
    <div className="flex items-center gap-2 md:gap-2.5">
      <LocaleLink
        to="/{-$locale}/explore"
        search={{ weather: WEATHER_CURRENT }}
        className={heroChip}
      >
        <CloudSun size={14} aria-hidden="true" />
        {t('home.matchWeather')}
      </LocaleLink>
      <button
        type="button"
        onClick={surprise}
        aria-busy={pending}
        className={heroChip}
      >
        {pending ? (
          <LoaderCircle size={14} className="animate-spin" aria-hidden="true" />
        ) : (
          <Dices size={14} aria-hidden="true" />
        )}
        {pending ? t('home.surpriseLoading') : t('home.surpriseMe')}
      </button>
    </div>
  )
}
