import { Tag } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import type { CafePrice } from '@/lib/api/cafe'

function fmtPrice(
  t: TFunction,
  min: number | null,
  max: number | null,
): string | null {
  if (min !== null && max !== null) {
    return `Rp ${Math.floor(min / 1000)}k – ${Math.floor(max / 1000)}k`
  } else if (min !== null) {
    return `${t('price.startingFrom')} Rp ${Math.floor(min / 1000)}k`
  } else if (max !== null) {
    return `${t('price.upTo')} Rp ${Math.floor(max / 1000)}k`
  } else {
    return null
  }
}

interface PriceCardProps {
  price: CafePrice
}

export default function PriceCard({ price }: PriceCardProps) {
  const { t } = useTranslation()
  const rows = [
    {
      label: t('price.coffee'),
      value: fmtPrice(t, price.coffee_price_min, price.coffee_price_max),
    },
    {
      label: t('price.snacks'),
      value: fmtPrice(t, price.snack_price_min, price.snack_price_max),
    },
    {
      label: t('price.food'),
      value: fmtPrice(t, price.food_price_min, price.food_price_max),
    },
  ]
  const PRICE_RANK_COLORS: Record<number, string> = {
    0: 'bg-grove-light text-moss',
    1: 'bg-orange-100 text-orange-400',
    2: 'bg-red-100 text-red-400',
  }

  return (
    <div className="bg-surface rounded-2xl p-5 flex flex-col gap-3.5">
      <div className="flex justify-between items-end">
        <div className="flex flex-col lg:flex-row justify-center lg:items-end gap-1">
          <h2 className="text-base font-bold text-forest m-0">
            {t('price.priceRange')}
          </h2>
          {price.price_range_min || price.price_range_max ? (
            <span className="text-xs text-bark">{t('price.excFood')}</span>
          ) : null}
        </div>
        {price.price_range_min || price.price_range_max ? (
          <span className="text-sm font-bold text-forest">
            {fmtPrice(t, price.price_range_min, price.price_range_max)}
          </span>
        ) : null}
      </div>
      {rows.every(({ value }) => value !== null) && (
        <hr className="border-t border-grove-light m-0" />
      )}
      <dl className="flex flex-col gap-3.5 m-0">
        {rows.map(
          ({ label, value }) =>
            value !== null && (
              <div key={label} className="flex justify-between items-center">
                <dt className="text-xs text-bark">{label}</dt>
                <dd className="text-xs font-semibold text-forest m-0">
                  {value}
                </dd>
              </div>
            ),
        )}
      </dl>
      {!price.price_range_min && !price.price_range_max && (
        <div className="flex justify-center items-center h-16 w-full">
          <p className="text-sm leading-[1.7] m-0 text-bark">
            {t('price.noPriceInfo')}
          </p>
        </div>
      )}
      {price.rank && (
        <div
          className={`flex items-center gap-1.5 bg-grove-light rounded-lg px-3 py-1.5 self-start ${PRICE_RANK_COLORS[price.rank.type] || 'bg-gray-100 text-gray-600 dark:bg-grove-light dark:text-bark'}`}
        >
          <Tag size={12} aria-hidden="true" />
          <span className="text-xs font-semibold">{price.rank.label}</span>
        </div>
      )}
    </div>
  )
}
