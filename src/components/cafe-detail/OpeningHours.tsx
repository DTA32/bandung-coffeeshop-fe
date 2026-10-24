import { useCallback, useId, useRef, useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import type { DayHours } from '@/lib/api/cafe'
import { cn } from '@/lib/cn'
import { formatRanges, isAllDay } from '@/lib/hours'
import { dateLocale, useLocale } from '@/lib/locale'
import { useClickOutside } from '@/lib/hooks/useClickOutside'
import { useEscapeKey } from '@/lib/hooks/useEscapeKey'

// A day's hours as text: "Closed", "Open 24 hours" or the ranges joined with
// ", ". Empty when the hours are unknown.
export function dayHoursText(day: DayHours, t: TFunction): string {
  if (day.closed) return t('cafe.closed')
  if (day.ranges.length === 1 && isAllDay(day.ranges[0]))
    return t('cafe.open24Hours')
  return formatRanges(day.ranges)
}

// "Sat 25 Oct" / "Sab 25 Okt". The date is a plain YYYY-MM-DD (Jakarta), so it
// is read and formatted in UTC to keep the calendar day as is.
function useDayLabel() {
  const { t } = useTranslation()
  const locale = useLocale()
  const fmt = new Intl.DateTimeFormat(dateLocale(locale), {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  })
  return (day: DayHours) =>
    `${t(`cafe.weekdays.${day.day}`)} ${fmt.format(new Date(`${day.date}T00:00:00Z`))}`
}

interface OpeningHoursProps {
  hours: DayHours[] // hours[0] is today; callers hide the row when unknown
  todayText: string
}

// The QuickFacts value for "Opening hours": today's hours plus a chevron
// button that toggles a popover with the next 7 days (disclosure pattern:
// focus stays on the button; Esc and outside clicks close it).
export default function OpeningHours({ hours, todayText }: OpeningHoursProps) {
  const { t } = useTranslation()
  const dayLabel = useDayLabel()
  const [open, setOpen] = useState(false)
  const popoverId = useId()
  const rootRef = useRef<HTMLElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const close = useCallback(() => setOpen(false), [])
  const closeAndRefocus = useCallback(() => {
    setOpen(false)
    buttonRef.current?.focus()
  }, [])
  useClickOutside(rootRef, close, open)
  useEscapeKey(closeAndRefocus, open)

  const Chevron = open ? ChevronUp : ChevronDown

  return (
    <dd ref={rootRef} className="m-0 flex justify-end">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={open ? popoverId : undefined}
        aria-label={`${t('cafe.openingHours')}: ${todayText}`}
        onClick={() => setOpen((o) => !o)}
        className="flex cursor-pointer items-center gap-1 text-right text-xs font-semibold text-forest"
      >
        {todayText}
        <Chevron size={14} aria-hidden="true" className="shrink-0 text-bark" />
      </button>

      {open && (
        <ul
          id={popoverId}
          aria-label={t('cafe.openingHours')}
          className="absolute top-full right-0 z-40 mt-2 flex w-full flex-col gap-0.5 rounded-xl border border-grove-light bg-surface p-1.5 text-left shadow-lg md:w-75"
        >
          {hours.map((day, i) => {
            const today = i === 0
            return (
              <li
                key={day.date}
                aria-current={today ? 'date' : undefined}
                className={cn(
                  'flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.75 text-xs',
                  today && 'bg-forest-lighter',
                )}
              >
                <span className="flex items-center gap-1.5">
                  <span
                    className={
                      today ? 'font-bold text-forest' : 'text-moss-dark'
                    }
                  >
                    {dayLabel(day)}
                  </span>
                  {day.special && (
                    <span className="rounded-full bg-warning-bg px-1.5 py-0.5 text-[10px] font-semibold text-warning">
                      {t('cafe.specialHours')}
                    </span>
                  )}
                </span>
                <span
                  className={cn(
                    'text-right',
                    today ? 'font-bold' : 'font-semibold',
                    day.closed ? 'text-error-accent' : 'text-forest',
                  )}
                >
                  {dayHoursText(day, t)}
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </dd>
  )
}
