import { useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { Star } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/cn'

const STARS = [1, 2, 3, 4, 5] as const

interface StarDisplayProps {
  score: number
  size?: number
  className?: string
}

// StarDisplay renders a read-only 0–5 score as five stars, filling fractional
// scores partially (e.g. 4.5 → four and a half stars).
export function StarDisplay({ score, size = 14, className }: StarDisplayProps) {
  const { t } = useTranslation()
  return (
    <span
      role="img"
      aria-label={t('reviews.starsLabel', { score: Number(score.toFixed(1)) })}
      className={cn('inline-flex items-center gap-0.5', className)}
    >
      {STARS.map((n) => {
        const fill = Math.max(0, Math.min(1, score - (n - 1)))
        return (
          <span
            key={n}
            className="relative inline-block"
            style={{ width: size, height: size }}
          >
            <Star
              size={size}
              aria-hidden="true"
              className="absolute inset-0 fill-[#E2E8DA] text-[#E2E8DA] dark:fill-grove-light dark:text-grove-light"
            />
            {fill > 0 && (
              <span
                className="absolute inset-y-0 left-0 overflow-hidden"
                style={{ width: `${fill * 100}%` }}
              >
                <Star
                  size={size}
                  aria-hidden="true"
                  className="fill-[#E3A53B] text-[#E3A53B]"
                />
              </span>
            )}
          </span>
        )
      })}
    </span>
  )
}

interface StarInputProps {
  value: number | null
  onChange: (value: number | null) => void
  // Accessible name of the radio group (or pass labelledBy).
  label?: string
  labelledBy?: string
  size?: number
  // Show the Worst…Great captions under the stars.
  showLabels?: boolean
  // Clicking the selected star again clears the value (optional ratings).
  clearable?: boolean
  className?: string
}

// StarInput is a 1–5 star picker exposed as a radio group: one tab stop,
// arrow keys / Home / End move the selection, and each star is labelled with
// its caption ("Good", 4 stars).
export function StarInput({
  value,
  onChange,
  label,
  labelledBy,
  size = 36,
  showLabels = false,
  clearable = false,
  className,
}: StarInputProps) {
  const { t } = useTranslation()
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const [hover, setHover] = useState<number | null>(null)
  const selected = value != null ? Math.round(value) : null
  const shown = hover ?? selected ?? 0
  const tabStop = selected ?? 1

  function select(n: number) {
    onChange(n)
    refs.current[n - 1]?.focus()
  }

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const current = selected ?? 0
    let next: number | null = null
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      next = Math.min(5, current + 1)
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      next = Math.max(1, current - 1)
    } else if (e.key === 'Home') {
      next = 1
    } else if (e.key === 'End') {
      next = 5
    }
    if (next == null) return
    e.preventDefault()
    select(next)
  }

  return (
    <div
      role="radiogroup"
      aria-label={label}
      aria-labelledby={labelledBy}
      onKeyDown={onKeyDown}
      onMouseLeave={() => setHover(null)}
      className={cn('flex items-start gap-1.5', className)}
    >
      {STARS.map((n) => {
        const caption = t(`reviews.scale.${n}`)
        return (
          <button
            key={n}
            ref={(el) => {
              refs.current[n - 1] = el
            }}
            type="button"
            role="radio"
            aria-checked={selected === n}
            aria-label={`${caption}, ${t('reviews.starsLabel', { score: n })}`}
            tabIndex={n === tabStop ? 0 : -1}
            onMouseEnter={() => setHover(n)}
            onClick={() =>
              clearable && selected === n ? onChange(null) : onChange(n)
            }
            className="flex w-13 cursor-pointer flex-col items-center gap-1.5 rounded-md border-none bg-transparent p-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss"
          >
            <Star
              size={size}
              aria-hidden="true"
              strokeWidth={1.5}
              className={cn(
                'transition-colors',
                n <= shown
                  ? 'fill-[#E3A53B] text-[#E3A53B]'
                  : 'fill-surface text-[#B9D2A3] dark:text-grove-light',
              )}
            />
            {showLabels && (
              <span
                className={cn(
                  'text-[11px] leading-none',
                  selected === n
                    ? 'font-bold text-[#A8741E] dark:text-amber-300'
                    : 'text-forest-light',
                )}
              >
                {caption}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
