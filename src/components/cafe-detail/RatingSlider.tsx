import type { RatingEntry } from '@/lib/api/cafe'

interface RatingSliderProps {
  label: string
  rating: RatingEntry
}

export default function RatingSlider({ label, rating }: RatingSliderProps) {
  const { range, score, description } = rating

  const segmentWidth = 100 / range.length
  let activeCap = range.findIndex(
    (r) => score >= r.lower_bound && score <= r.upper_bound,
  )
  if (activeCap === -1) {
    activeCap = score < range[0].lower_bound ? 0 : range.length - 1
  }
  const activeRange = range[activeCap]
  const span = activeRange.upper_bound - activeRange.lower_bound
  const within = span > 0 ? (score - activeRange.lower_bound) / span : 0
  const clampedWithin = Math.min(Math.max(within, 0), 1)
  const fillPct = (activeCap + clampedWithin) * segmentWidth

  const formattedDescription = description
    ? description
    : range[activeCap].description
      ? range[activeCap].description
      : ''

  return (
    <div className="flex flex-col gap-2 flex-1 py-5">
      <h3 className="text-xs font-semibold text-moss">{label}</h3>

      {/* Track */}
      <div
        role="img"
        aria-label={`${label}: ${activeRange.name}`}
        className="relative h-5"
      >
        {/* Background line */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2 bg-grove-light rounded-full" />
        {/* Active line */}
        <div
          className="absolute top-1/2 left-0 h-0.5 -translate-y-1/2 bg-grove rounded-full"
          style={{ width: `${fillPct}%` }}
        />
        {/* Start dot */}
        <div className="absolute top-1/2 left-0 w-2.5 h-2.5 -translate-y-1/2 rounded-full bg-grove" />
        {/* Score dot */}
        <div
          className="absolute top-1/2 w-3.5 h-3.5 -translate-y-1/2 rounded-full bg-forest z-10"
          style={{ left: `calc(${fillPct}% - 12px)` }}
        />
        {/* End dot */}
        <div className="absolute top-1/2 right-0 w-2.5 h-2.5 -translate-y-1/2 rounded-full bg-grove-light" />
      </div>

      {/* Cap labels */}
      <div className="flex justify-between">
        {range.map((r, i) => (
          <span
            key={r.name}
            className={
              i === activeCap
                ? 'text-[10px] font-semibold text-forest'
                : 'text-[10px] text-forest-light'
            }
          >
            {r.name}
          </span>
        ))}
      </div>

      <p className="text-xs text-bark m-0">{formattedDescription}</p>
    </div>
  )
}
