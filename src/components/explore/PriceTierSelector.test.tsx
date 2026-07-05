import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen, fireEvent, userEvent } from '@/test/utils'
import PriceTierSelector from '@/components/explore/PriceTierSelector'
import type { PriceTier } from '@/lib/api/filters'

// Three representative tiers exercising every tierSublabel branch:
//  - Budget:  min === 0           -> '<Yk'
//  - Mid:     min > 0 && max set  -> 'Xk–Yk'  (en-dash, U+2013)
//  - Premium: max === null        -> '>Xk'
const TIERS: PriceTier[] = [
  {
    label: 'Budget',
    slug: 'budget',
    long_description: 'b',
    min: 0,
    max: 25000,
  },
  { label: 'Mid', slug: 'mid', long_description: 'm', min: 25000, max: 50000 },
  {
    label: 'Premium',
    slug: 'premium',
    long_description: 'p',
    min: 50000,
    max: null,
  },
]

// Helper to grab a tier button by its label (accessible name also contains the
// sublabel + icon, so match on the label substring).
const tierButton = (label: string) =>
  screen.getByRole('button', { name: new RegExp(label) })

describe('PriceTierSelector', () => {
  describe('initial mode', () => {
    it('starts in Tiers mode when no value is set', () => {
      renderWithProviders(
        <PriceTierSelector tiers={TIERS} onChange={vi.fn()} />,
      )

      expect(screen.getByRole('button', { name: 'Tiers' })).toHaveAttribute(
        'aria-pressed',
        'true',
      )
      expect(screen.getByRole('button', { name: 'Range' })).toHaveAttribute(
        'aria-pressed',
        'false',
      )
      // Tier buttons render, no slider present.
      expect(tierButton('Budget')).toBeInTheDocument()
      expect(screen.queryAllByRole('slider')).toHaveLength(0)
      // Nothing selected initially.
      for (const tier of TIERS) {
        expect(tierButton(tier.label)).toHaveAttribute('aria-pressed', 'false')
      }
    })

    it('starts in Tiers mode when the value matches a tier, with that tier pressed', () => {
      renderWithProviders(
        <PriceTierSelector
          tiers={TIERS}
          valueMin={0}
          valueMax={25000}
          onChange={vi.fn()}
        />,
      )

      expect(screen.getByRole('button', { name: 'Tiers' })).toHaveAttribute(
        'aria-pressed',
        'true',
      )
      expect(tierButton('Budget')).toHaveAttribute('aria-pressed', 'true')
      expect(tierButton('Mid')).toHaveAttribute('aria-pressed', 'false')
      expect(tierButton('Premium')).toHaveAttribute('aria-pressed', 'false')
    })

    it('matches an open-ended tier (max === null) when only valueMin is set', () => {
      renderWithProviders(
        <PriceTierSelector tiers={TIERS} valueMin={50000} onChange={vi.fn()} />,
      )

      // Premium has max: null; matchesTier treats (null ?? undefined) === undefined.
      expect(tierButton('Premium')).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByRole('button', { name: 'Tiers' })).toHaveAttribute(
        'aria-pressed',
        'true',
      )
    })

    it('starts in Range mode for a custom value that matches no tier', () => {
      renderWithProviders(
        <PriceTierSelector
          tiers={TIERS}
          valueMin={10000}
          valueMax={30000}
          onChange={vi.fn()}
        />,
      )

      expect(screen.getByRole('button', { name: 'Range' })).toHaveAttribute(
        'aria-pressed',
        'true',
      )
      expect(screen.getByRole('button', { name: 'Tiers' })).toHaveAttribute(
        'aria-pressed',
        'false',
      )
      // Two range knobs render, tier buttons do not.
      expect(screen.getAllByRole('slider')).toHaveLength(2)
      expect(screen.queryByText('Budget')).not.toBeInTheDocument()
      // Range value readouts (formatPrice divides by 1000).
      expect(screen.getByText('Rp 10k')).toBeInTheDocument()
      expect(screen.getByText('Rp 30k')).toBeInTheDocument()
    })
  })

  describe('tierSublabel formatting', () => {
    it('formats each tier branch (<Yk, Xk–Yk, >Xk)', () => {
      renderWithProviders(
        <PriceTierSelector tiers={TIERS} onChange={vi.fn()} />,
      )

      expect(screen.getByText('<25k')).toBeInTheDocument()
      // En-dash (U+2013) between bounds.
      expect(screen.getByText('25k–50k')).toBeInTheDocument()
      expect(screen.getByText('>50k')).toBeInTheDocument()
    })

    it('rounds sub-thousand bounds to whole thousands (Math.round)', () => {
      const rounding: PriceTier[] = [
        { label: 'Tiny', slug: 't', long_description: '', min: 0, max: 1500 },
        {
          label: 'Huge',
          slug: 'h',
          long_description: '',
          min: 2500,
          max: null,
        },
      ]
      renderWithProviders(
        <PriceTierSelector tiers={rounding} onChange={vi.fn()} />,
      )

      // 1500/1000 -> round(1.5) = 2; 2500/1000 -> round(2.5) = 3
      expect(screen.getByText('<2k')).toBeInTheDocument()
      expect(screen.getByText('>3k')).toBeInTheDocument()
    })
  })

  describe('selecting a tier', () => {
    it('clicking a tier calls onChange with that tier bounds', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      renderWithProviders(
        <PriceTierSelector tiers={TIERS} onChange={onChange} />,
      )

      await user.click(tierButton('Mid'))

      expect(onChange).toHaveBeenCalledTimes(1)
      expect(onChange).toHaveBeenCalledWith(25000, 50000)
    })

    it('clicking an open-ended tier passes undefined for the max (null -> undefined)', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      renderWithProviders(
        <PriceTierSelector tiers={TIERS} onChange={onChange} />,
      )

      await user.click(tierButton('Premium'))

      expect(onChange).toHaveBeenCalledWith(50000, undefined)
    })

    it('clicking the already-active tier clears the selection', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      renderWithProviders(
        <PriceTierSelector
          tiers={TIERS}
          valueMin={0}
          valueMax={25000}
          onChange={onChange}
        />,
      )

      // Budget is active for this value.
      expect(tierButton('Budget')).toHaveAttribute('aria-pressed', 'true')
      await user.click(tierButton('Budget'))

      expect(onChange).toHaveBeenCalledTimes(1)
      expect(onChange).toHaveBeenCalledWith(undefined, undefined)
    })

    it('clicking a different (inactive) tier selects it rather than clearing', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      renderWithProviders(
        <PriceTierSelector
          tiers={TIERS}
          valueMin={0}
          valueMax={25000}
          onChange={onChange}
        />,
      )

      await user.click(tierButton('Mid'))

      expect(onChange).toHaveBeenCalledWith(25000, 50000)
    })
  })

  describe('switching modes', () => {
    it('switching Range -> Tiers clears a non-matching custom range', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      renderWithProviders(
        <PriceTierSelector
          tiers={TIERS}
          valueMin={10000}
          valueMax={30000}
          onChange={onChange}
        />,
      )

      // Starts in Range mode for a custom value.
      expect(screen.getByRole('button', { name: 'Range' })).toHaveAttribute(
        'aria-pressed',
        'true',
      )

      await user.click(screen.getByRole('button', { name: 'Tiers' }))

      // Custom range can't map to a tier, so it is cleared.
      expect(onChange).toHaveBeenCalledTimes(1)
      expect(onChange).toHaveBeenCalledWith(undefined, undefined)
      // Tier buttons now visible.
      expect(tierButton('Budget')).toBeInTheDocument()
    })

    it('switching Tiers -> Range does not clear a value that matches a tier', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      renderWithProviders(
        <PriceTierSelector
          tiers={TIERS}
          valueMin={0}
          valueMax={25000}
          onChange={onChange}
        />,
      )

      await user.click(screen.getByRole('button', { name: 'Range' }))

      // Only the mode changed; the value is preserved (no onChange).
      expect(onChange).not.toHaveBeenCalled()
      expect(screen.getAllByRole('slider')).toHaveLength(2)
      expect(screen.getByRole('button', { name: 'Range' })).toHaveAttribute(
        'aria-pressed',
        'true',
      )
    })

    it('switching Tiers -> Range from an empty value does not call onChange', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      renderWithProviders(
        <PriceTierSelector tiers={TIERS} onChange={onChange} />,
      )

      await user.click(screen.getByRole('button', { name: 'Range' }))

      expect(onChange).not.toHaveBeenCalled()
      // Range defaults span the full RANGE_MIN..RANGE_MAX (0..100000).
      expect(screen.getByText('Rp 0k')).toBeInTheDocument()
      expect(screen.getByText('Rp 100k')).toBeInTheDocument()
    })

    it('clicking the already-active mode is a no-op', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      renderWithProviders(
        <PriceTierSelector tiers={TIERS} onChange={onChange} />,
      )

      // Default mode is Tiers; clicking it again returns early.
      await user.click(screen.getByRole('button', { name: 'Tiers' }))

      expect(onChange).not.toHaveBeenCalled()
      expect(screen.queryAllByRole('slider')).toHaveLength(0)
    })
  })

  describe('range mode interaction', () => {
    it('moving the min knob calls onChange with the new min and current max', () => {
      const onChange = vi.fn()
      renderWithProviders(
        <PriceTierSelector
          tiers={TIERS}
          valueMin={10000}
          valueMax={30000}
          onChange={onChange}
        />,
      )

      const [minSlider] = screen.getAllByRole('slider')
      fireEvent.change(minSlider, { target: { value: '5000' } })

      // DualRange clamps min to <= current max.
      expect(onChange).toHaveBeenCalledWith(5000, 30000)
    })

    it('moving the max knob calls onChange with the current min and new max', () => {
      const onChange = vi.fn()
      renderWithProviders(
        <PriceTierSelector
          tiers={TIERS}
          valueMin={10000}
          valueMax={30000}
          onChange={onChange}
        />,
      )

      const [, maxSlider] = screen.getAllByRole('slider')
      fireEvent.change(maxSlider, { target: { value: '40000' } })

      expect(onChange).toHaveBeenCalledWith(10000, 40000)
    })
  })

  describe('aria-pressed reflects selection', () => {
    it('marks only the matching tier as pressed', () => {
      renderWithProviders(
        <PriceTierSelector
          tiers={TIERS}
          valueMin={25000}
          valueMax={50000}
          onChange={vi.fn()}
        />,
      )

      expect(
        screen.getByRole('button', { name: /Mid/, pressed: true }),
      ).toBeInTheDocument()
      expect(tierButton('Budget')).toHaveAttribute('aria-pressed', 'false')
      expect(tierButton('Premium')).toHaveAttribute('aria-pressed', 'false')
    })
  })
})
