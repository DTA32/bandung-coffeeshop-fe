import { useTranslation } from 'react-i18next'
import SegmentedControl from '@/components/SegmentedControl'
import { SingleRange } from '@/components/RangeSelector'

interface OpenHoursControlProps {
  value?: string // "now" or "HH:MM" string
  onChange: (next: string | undefined) => void
}

const SLIDER_MAX = 1410 // 23:30
const SLIDER_STEP = 30
const DEFAULT_TIME = '12:00'
const TICKS = ['00:00', '12:00', '24:00']

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}
function toHHMM(min: number): string {
  const h = Math.floor(min / 60)
  const m = min % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export default function OpenHoursControl({
  value,
  onChange,
}: OpenHoursControlProps) {
  const { t } = useTranslation()
  const isNow = value === 'now'
  const isTime = value != null && value !== 'now'
  const mode = isNow ? 'now' : isTime ? 'time' : ''
  const minutes = isTime ? toMinutes(value) : 0

  function handleMode(next: string) {
    if (next === 'now') onChange(isNow ? undefined : 'now')
    else onChange(isTime ? undefined : DEFAULT_TIME)
  }

  return (
    <div className="flex flex-col gap-3">
      <SegmentedControl
        segments={[
          { value: 'now', label: t('explore.filters.openNow') },
          { value: 'time', label: t('explore.filters.atTime') },
        ]}
        value={mode}
        onChange={handleMode}
      />

      {isNow && (
        <p className="text-xs text-bark">
          {t('explore.filters.openNowCaption')}
        </p>
      )}

      {isTime && (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-bark">
            {t('explore.filters.openAt')}{' '}
            <span className="font-semibold text-moss-dark">{value}</span>
          </p>
          <SingleRange
            min={0}
            max={SLIDER_MAX}
            step={SLIDER_STEP}
            value={minutes}
            onChange={(m) => onChange(toHHMM(m))}
            ariaLabel={t('explore.filters.openAt')}
          />
          <div className="flex justify-between text-[10px] text-bark">
            {TICKS.map((tick) => (
              <span key={tick}>{tick}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
