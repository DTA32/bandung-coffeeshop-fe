import type { CSSProperties, ReactNode } from 'react'

interface RangeBounds {
  min: number
  max: number
  step: number
}

interface SingleRangeProps extends RangeBounds {
  value: number
  onChange: (value: number) => void
  ariaLabel?: string
}

interface DualRangeProps extends RangeBounds {
  valueMin: number
  valueMax: number
  onChange: (min: number, max: number) => void
  ariaLabelMin?: string
  ariaLabelMax?: string
}

const THUMB =
  '[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 ' +
  '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 ' +
  '[&::-webkit-slider-thumb]:border-moss [&::-webkit-slider-thumb]:bg-white [&::-moz-range-thumb]:pointer-events-auto ' +
  '[&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 ' +
  '[&::-moz-range-thumb]:border-solid [&::-moz-range-thumb]:border-moss [&::-moz-range-thumb]:bg-white'

const SLIDER_BASE =
  'absolute inset-0 h-6 w-full cursor-pointer appearance-none bg-transparent'

const pctOf = (v: number, min: number, max: number) =>
  ((v - min) / (max - min)) * 100

function Track({
  fill,
  children,
}: {
  fill: CSSProperties
  children: ReactNode
}) {
  return (
    <div className="relative h-6 w-full">
      <div className="absolute top-1/2 h-1 w-full -translate-y-1/2 rounded bg-grove-light" />
      <div
        className="absolute top-1/2 h-1 -translate-y-1/2 rounded bg-moss"
        style={fill}
      />
      {children}
    </div>
  )
}

// One-knob slider; active fill runs from the start to the value.
export function SingleRange({
  min,
  max,
  step,
  value,
  onChange,
  ariaLabel,
}: SingleRangeProps) {
  return (
    <Track fill={{ width: `${pctOf(value, min, max)}%` }}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={ariaLabel}
        className={`${SLIDER_BASE} ${THUMB}`}
      />
    </Track>
  )
}

// Two-knob slider; active fill spans between the knobs. The inputs are
// pointer-events-none so only their thumbs respond, letting both overlap.
export function DualRange({
  min,
  max,
  step,
  valueMin,
  valueMax,
  onChange,
  ariaLabelMin,
  ariaLabelMax,
}: DualRangeProps) {
  const cls = `pointer-events-none ${SLIDER_BASE} ${THUMB}`
  return (
    <Track
      fill={{
        left: `${pctOf(valueMin, min, max)}%`,
        right: `${100 - pctOf(valueMax, min, max)}%`,
      }}
    >
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={valueMin}
        onChange={(e) =>
          onChange(Math.min(Number(e.target.value), valueMax), valueMax)
        }
        aria-label={ariaLabelMin}
        className={cls}
      />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={valueMax}
        onChange={(e) =>
          onChange(valueMin, Math.max(Number(e.target.value), valueMin))
        }
        aria-label={ariaLabelMax}
        className={cls}
      />
    </Track>
  )
}
