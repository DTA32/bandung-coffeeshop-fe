import { describe, it, expect } from 'vitest'
import { renderWithProviders, screen } from '@/test/utils'
import PriceCard from '@/components/cafe-detail/PriceCard'
import type { CafePrice } from '@/lib/api/cafe'

const emptyPrice: CafePrice = {
  price_range_min: null,
  price_range_max: null,
  coffee_price_min: null,
  coffee_price_max: null,
  snack_price_min: null,
  snack_price_max: null,
  food_price_min: null,
  food_price_max: null,
  rank: null,
}

function makePrice(overrides: Partial<CafePrice> = {}): CafePrice {
  return { ...emptyPrice, ...overrides }
}

describe('PriceCard', () => {
  it('always renders the Price Range header', () => {
    renderWithProviders(<PriceCard price={emptyPrice} />)
    expect(screen.getByText('Price Range')).toBeInTheDocument()
  })

  describe('fmtPrice formatting (via rendered rows)', () => {
    it('formats both min and max as "Rp Xk – Yk" using Math.floor on /1000', () => {
      // 25900 -> 25k, 45800 -> 45k (floored, not rounded)
      renderWithProviders(
        <PriceCard
          price={makePrice({
            coffee_price_min: 25900,
            coffee_price_max: 45800,
          })}
        />,
      )
      expect(screen.getByText('Coffee')).toBeInTheDocument()
      expect(screen.getByText('Rp 25k – 45k')).toBeInTheDocument()
    })

    it('formats min-only as "Starting from Rp Xk"', () => {
      renderWithProviders(
        <PriceCard price={makePrice({ snack_price_min: 10000 })} />,
      )
      expect(screen.getByText('Snacks')).toBeInTheDocument()
      expect(screen.getByText('Starting from Rp 10k')).toBeInTheDocument()
    })

    it('formats max-only as "Up to Rp Yk"', () => {
      renderWithProviders(
        <PriceCard price={makePrice({ food_price_max: 30000 })} />,
      )
      expect(screen.getByText('Food')).toBeInTheDocument()
      expect(screen.getByText('Up to Rp 30k')).toBeInTheDocument()
    })

    it('hides a row when both its min and max are null', () => {
      renderWithProviders(<PriceCard price={emptyPrice} />)
      expect(screen.queryByText('Coffee')).not.toBeInTheDocument()
      expect(screen.queryByText('Snacks')).not.toBeInTheDocument()
      expect(screen.queryByText('Food')).not.toBeInTheDocument()
    })
  })

  describe('rows + divider', () => {
    it('renders all three labels and the <hr> when every row is non-null', () => {
      const { container } = renderWithProviders(
        <PriceCard
          price={makePrice({
            coffee_price_min: 20000,
            coffee_price_max: 35000,
            snack_price_min: 15000,
            snack_price_max: 25000,
            food_price_min: 30000,
            food_price_max: 60000,
          })}
        />,
      )
      expect(screen.getByText('Coffee')).toBeInTheDocument()
      expect(screen.getByText('Snacks')).toBeInTheDocument()
      expect(screen.getByText('Food')).toBeInTheDocument()
      expect(container.querySelector('hr')).not.toBeNull()
    })

    it('omits the <hr> when at least one row is null', () => {
      const { container } = renderWithProviders(
        <PriceCard
          price={makePrice({
            coffee_price_min: 20000,
            coffee_price_max: 35000,
            snack_price_min: 15000,
            snack_price_max: 25000,
            // food row left null
          })}
        />,
      )
      expect(screen.getByText('Coffee')).toBeInTheDocument()
      expect(screen.getByText('Snacks')).toBeInTheDocument()
      expect(screen.queryByText('Food')).not.toBeInTheDocument()
      expect(container.querySelector('hr')).toBeNull()
    })

    it('shows only the rows that have values', () => {
      renderWithProviders(
        <PriceCard
          price={makePrice({
            coffee_price_min: 22000,
            coffee_price_max: 40000,
          })}
        />,
      )
      expect(screen.getByText('Coffee')).toBeInTheDocument()
      expect(screen.queryByText('Snacks')).not.toBeInTheDocument()
      expect(screen.queryByText('Food')).not.toBeInTheDocument()
    })
  })

  describe('price-range header value', () => {
    it('shows the range value and "(exc. Food)" caption when both bounds are set', () => {
      renderWithProviders(
        <PriceCard
          price={makePrice({
            price_range_min: 20000,
            price_range_max: 60000,
          })}
        />,
      )
      expect(screen.getByText('Rp 20k – 60k')).toBeInTheDocument()
      expect(screen.getByText('(exc. Food)')).toBeInTheDocument()
    })

    it('shows a "Starting from" value when only price_range_min is set', () => {
      renderWithProviders(
        <PriceCard price={makePrice({ price_range_min: 15000 })} />,
      )
      expect(screen.getByText('Starting from Rp 15k')).toBeInTheDocument()
      expect(screen.getByText('(exc. Food)')).toBeInTheDocument()
    })

    it('shows an "Up to" value when only price_range_max is set', () => {
      renderWithProviders(
        <PriceCard price={makePrice({ price_range_max: 55000 })} />,
      )
      expect(screen.getByText('Up to Rp 55k')).toBeInTheDocument()
      expect(screen.getByText('(exc. Food)')).toBeInTheDocument()
    })
  })

  describe('empty state', () => {
    it('shows the empty-state copy when both price_range bounds are falsy', () => {
      renderWithProviders(<PriceCard price={emptyPrice} />)
      expect(
        screen.getByText('No price information available yet.'),
      ).toBeInTheDocument()
      expect(screen.queryByText('(exc. Food)')).not.toBeInTheDocument()
    })

    it('hides the empty state when a price_range bound is set', () => {
      renderWithProviders(
        <PriceCard price={makePrice({ price_range_min: 20000 })} />,
      )
      expect(
        screen.queryByText('No price information available yet.'),
      ).not.toBeInTheDocument()
    })

    // NOTE: the empty-state condition only checks price_range_min/max, NOT the
    // coffee/snack/food rows. So when the price range is empty but a row has a
    // value, the row AND the empty-state copy render at the same time.
    it('still shows the empty state even when a row has a value (range-only condition)', () => {
      renderWithProviders(
        <PriceCard
          price={makePrice({
            coffee_price_min: 25000,
            coffee_price_max: 40000,
          })}
        />,
      )
      expect(screen.getByText('Coffee')).toBeInTheDocument()
      expect(
        screen.getByText('No price information available yet.'),
      ).toBeInTheDocument()
    })
  })

  describe('rank chip', () => {
    it('does not render a chip when rank is null', () => {
      renderWithProviders(<PriceCard price={emptyPrice} />)
      expect(screen.queryByText('Budget-friendly')).not.toBeInTheDocument()
    })

    it('renders the rank label with type 0 colors', () => {
      renderWithProviders(
        <PriceCard
          price={makePrice({ rank: { type: 0, label: 'Budget-friendly' } })}
        />,
      )
      const chip = screen.getByText('Budget-friendly').parentElement
      expect(chip).not.toBeNull()
      expect(chip).toHaveClass('text-moss')
      expect(chip).toHaveClass('bg-grove-light')
    })

    it('renders the rank label with type 1 colors', () => {
      renderWithProviders(
        <PriceCard
          price={makePrice({ rank: { type: 1, label: 'Mid-range' } })}
        />,
      )
      const chip = screen.getByText('Mid-range').parentElement
      expect(chip).not.toBeNull()
      expect(chip).toHaveClass('text-price-mid')
      expect(chip).toHaveClass('bg-price-mid-bg')
    })

    it('renders the rank label with type 2 colors', () => {
      renderWithProviders(
        <PriceCard
          price={makePrice({ rank: { type: 2, label: 'Premium' } })}
        />,
      )
      const chip = screen.getByText('Premium').parentElement
      expect(chip).not.toBeNull()
      expect(chip).toHaveClass('text-price-high')
      expect(chip).toHaveClass('bg-price-high-bg')
    })

    it('falls back to muted colors for an unknown rank type', () => {
      renderWithProviders(
        <PriceCard
          price={makePrice({ rank: { type: 99, label: 'Unknown tier' } })}
        />,
      )
      const chip = screen.getByText('Unknown tier').parentElement
      expect(chip).not.toBeNull()
      expect(chip).toHaveClass('text-muted')
      expect(chip).toHaveClass('bg-muted-bg')
    })
  })
})
