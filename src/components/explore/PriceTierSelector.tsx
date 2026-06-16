import { useState } from 'react'
import { Landmark, Leaf, ShoppingBag, Tag } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { PriceTier } from '@/lib/api/filters'
import SegmentedControl from '@/components/SegmentedControl'
import { DualRange } from '@/components/RangeSelector'

interface PriceTierSelectorProps {
  tiers: PriceTier[]
  valueMin?: number
  valueMax?: number
  onChange: (min: number | undefined, max: number | undefined) => void
}

const TIER_ICONS = [Leaf, ShoppingBag, Landmark]
const RANGE_MIN = 0
const RANGE_MAX = 100000
const RANGE_STEP = 1000

function formatPrice(n: number): number {
  // convert to thousands and round to avoid fractional display (e.g. 1.5k)
  return Math.round(n / 1000)
}
function tierSublabel(tier: PriceTier): string {
  if (tier.max == null) return `>${formatPrice(tier.min)}k`
  if (tier.min === 0) return `<${formatPrice(tier.max)}k`
  return `${formatPrice(tier.min)}k–${formatPrice(tier.max)}k`
}

// Price filter with a Tiers / Range mode toggle. Tiers is a single-select
// segmented control (each tier maps to fixed price_min/price_max bounds); Range
// is a dual-knob min/max slider. Both write price_min / price_max.
export default function PriceTierSelector({
  tiers,
  valueMin,
  valueMax,
  onChange,
}: PriceTierSelectorProps) {
  const { t } = useTranslation()

  const matchesTier = (tier: PriceTier) =>
    valueMin === tier.min && (tier.max ?? undefined) === valueMax
  const matchedTier = tiers.find(matchesTier)
  const noValue = valueMin == null && valueMax == null

  const [mode, setMode] = useState<'tiers' | 'range'>(
    noValue || matchedTier ? 'tiers' : 'range',
  )

  function handleMode(next: string) {
    if (next === mode) return
    if (next === 'tiers') {
      setMode('tiers')
      // A custom range can't map to a tier — clear it when switching back.
      if (!matchedTier) onChange(undefined, undefined)
    } else {
      setMode('range')
    }
  }

  const curMin = valueMin ?? RANGE_MIN
  const curMax = valueMax ?? RANGE_MAX

  return (
    <div className="flex flex-col gap-2">
      <SegmentedControl
        segments={[
          { value: 'tiers', label: t('explore.filters.priceTiers') },
          { value: 'range', label: t('explore.filters.priceRange') },
        ]}
        value={mode}
        onChange={handleMode}
      />

      {mode === 'tiers' ? (
        <div className="flex w-full gap-1 rounded-lg bg-white p-1">
          {tiers.map((tier, i) => {
            const Icon = TIER_ICONS[i] ?? Tag
            const active = matchesTier(tier)
            return (
              <button
                key={tier.label}
                type="button"
                aria-pressed={active}
                onClick={() =>
                  active
                    ? onChange(undefined, undefined)
                    : onChange(tier.min, tier.max ?? undefined)
                }
                className={`flex flex-1 cursor-pointer flex-col items-center gap-1 rounded-md px-2 py-2 text-center transition ${
                  active
                    ? 'shadow-sm bg-forest text-cream'
                    : 'bg-transparent text-forest hover:bg-grove-light'
                }`}
              >
                <Icon size={16} aria-hidden="true" />
                <span className={`text-sm font-semibold`}>{tier.label}</span>
                <span className="text-xs">{tierSublabel(tier)}</span>
              </button>
            )
          })}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-sm font-semibold text-moss-dark">
            <span>Rp {formatPrice(curMin)}k</span>
            <span>Rp {formatPrice(curMax)}k</span>
          </div>
          <DualRange
            min={RANGE_MIN}
            max={RANGE_MAX}
            step={RANGE_STEP}
            valueMin={curMin}
            valueMax={curMax}
            onChange={(min, max) => onChange(min, max)}
          />
        </div>
      )}
    </div>
  )
}
