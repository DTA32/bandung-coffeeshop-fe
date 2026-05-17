import {Tag} from 'lucide-react'
import type { CafePrice } from '@/lib/api/cafe'

function fmtPrice(min: number | null, max: number | null): string | null {
  if (min !== null && max !== null) {
    return `Rp ${Math.floor(min / 1000)}k – ${Math.floor(max / 1000)}k`
  } else if (min !== null) {
    return `Starting from Rp ${Math.floor(min / 1000)}k`
  } else if (max !== null) {
    return `Up to Rp ${Math.floor(max / 1000)}k`
  } else {
    return null
  }
}

interface PriceCardProps {
  price: CafePrice
}

export default function PriceCard({price}: PriceCardProps) {
  const rows = [
    {
      label: 'Coffee',
      value: fmtPrice(price.coffee_price_min, price.coffee_price_max),
    },
    {
      label: 'Snacks',
      value: fmtPrice(price.snack_price_min, price.snack_price_max),
    },
    {
      label: 'Food',
      value: fmtPrice(price.food_price_min, price.food_price_max),
    },
  ]
  const PRICE_RANK_COLORS: Record<number, string> = {
    0: 'bg-grove-light text-moss',
    1: 'bg-orange-100 text-orange-400',
    2: 'bg-red-100 text-red-400',
  }

  return (
    <div className="bg-white rounded-2xl p-5 flex flex-col gap-3.5">
      <div className="flex justify-between items-end">
        <div className="flex items-end gap-1">
          <span className="text-base font-bold text-forest">Price Range</span>
          {price.price_range_min || price.price_range_max ? (
            <span className="text-xs text-bark">(exc. Food)</span>
          ) : null
          }
        </div>
        {price.price_range_min || price.price_range_max ? (
          <span className="text-sm font-bold text-forest">
              {fmtPrice(price.price_range_min, price.price_range_max)}
            </span>
        ) : null
        }
      </div>
      <hr className="border-t border-grove-light m-0"/>
      {rows.map(({label, value}) => (
        value !== null && (
          <div key={label} className="flex justify-between items-center">
            <span className="text-xs text-bark">{label}</span>
            <span className="text-xs font-semibold text-forest">{value}</span>
          </div>
        )
      ))}
      {rows.every(({value}) => value === null) && (
        <div className="flex justify-center items-center h-16 w-full">
          <p className="text-sm leading-[1.7] m-0 text-bark"> No price information available yet. </p>
        </div>
      )}
      {price.rank && (
        <div
          className={`flex items-center gap-1.5 bg-grove-light rounded-lg px-3 py-1.5 self-start ${PRICE_RANK_COLORS[price.rank.type] || 'bg-gray-100 text-gray-600'}`}>
          <Tag size={12}/>
          <span className="text-xs font-semibold">
            {price.rank.label}
          </span>
        </div>
      )}
    </div>
  )
}
