import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@/test/utils'
import { DualRange, SingleRange } from './RangeSelector'

// RangeSelector is pure presentational React (no router, no i18n), so plain
// render is enough. Both knobs are native <input type="range"> elements, which
// expose role="slider" and are reachable by their aria-label.

describe('SingleRange', () => {
  it('renders a slider seeded with the controlled value', () => {
    const onChange = vi.fn()
    render(
      <SingleRange
        min={0}
        max={100}
        step={1}
        value={42}
        onChange={onChange}
        ariaLabel="Single"
      />,
    )
    const slider = screen.getByRole('slider')
    expect(slider).toHaveValue('42')
    expect(slider).toHaveAttribute('min', '0')
    expect(slider).toHaveAttribute('max', '100')
    expect(slider).toHaveAttribute('step', '1')
  })

  it('fires onChange with the numeric value when the input changes', () => {
    const onChange = vi.fn()
    render(
      <SingleRange
        min={0}
        max={100}
        step={1}
        value={42}
        onChange={onChange}
        ariaLabel="Single"
      />,
    )
    const slider = screen.getByLabelText('Single')
    fireEvent.change(slider, { target: { value: '73' } })
    expect(onChange).toHaveBeenCalledTimes(1)
    // Payload is coerced to a Number, not the raw string.
    expect(onChange).toHaveBeenCalledWith(73)
  })

  it('coerces an empty/non-numeric step boundary into a Number', () => {
    const onChange = vi.fn()
    render(
      <SingleRange
        min={0}
        max={10}
        step={1}
        value={5}
        onChange={onChange}
        ariaLabel="Single"
      />,
    )
    const slider = screen.getByLabelText('Single')
    fireEvent.change(slider, { target: { value: '0' } })
    expect(onChange).toHaveBeenLastCalledWith(0)
    // Number('0') is 0, never the string '0'.
    expect(typeof onChange.mock.calls[0][0]).toBe('number')
  })
})

describe('DualRange', () => {
  const renderDual = (
    overrides: Partial<{
      valueMin: number
      valueMax: number
      onChange: (min: number, max: number) => void
    }> = {},
  ) => {
    const onChange = overrides.onChange ?? vi.fn()
    render(
      <DualRange
        min={0}
        max={100}
        step={1}
        valueMin={overrides.valueMin ?? 20}
        valueMax={overrides.valueMax ?? 60}
        onChange={onChange}
        ariaLabelMin="Minimum"
        ariaLabelMax="Maximum"
      />,
    )
    return { onChange }
  }

  it('renders two sliders seeded with valueMin and valueMax', () => {
    renderDual()
    const sliders = screen.getAllByRole('slider')
    expect(sliders).toHaveLength(2)
    expect(screen.getByLabelText('Minimum')).toHaveValue('20')
    expect(screen.getByLabelText('Maximum')).toHaveValue('60')
  })

  it('moving the min knob below the max passes the new min through unchanged', () => {
    const { onChange } = renderDual({ valueMin: 20, valueMax: 60 })
    fireEvent.change(screen.getByLabelText('Minimum'), {
      target: { value: '35' },
    })
    // 35 < valueMax (60) so no clamp; max stays put.
    expect(onChange).toHaveBeenCalledWith(35, 60)
  })

  it('clamps the min knob so it never exceeds valueMax', () => {
    const { onChange } = renderDual({ valueMin: 20, valueMax: 60 })
    // Drag the min knob past the max knob (80 > 60).
    fireEvent.change(screen.getByLabelText('Minimum'), {
      target: { value: '80' },
    })
    // Math.min(80, 60) === 60, so min is clamped to valueMax.
    expect(onChange).toHaveBeenCalledWith(60, 60)
  })

  it('moving the max knob above the min passes the new max through unchanged', () => {
    const { onChange } = renderDual({ valueMin: 20, valueMax: 60 })
    fireEvent.change(screen.getByLabelText('Maximum'), {
      target: { value: '85' },
    })
    // 85 > valueMin (20) so no clamp; min stays put.
    expect(onChange).toHaveBeenCalledWith(20, 85)
  })

  it('clamps the max knob so it never drops below valueMin', () => {
    const { onChange } = renderDual({ valueMin: 20, valueMax: 60 })
    // Drag the max knob below the min knob (10 < 20).
    fireEvent.change(screen.getByLabelText('Maximum'), {
      target: { value: '10' },
    })
    // Math.max(10, 20) === 20, so max is clamped up to valueMin.
    expect(onChange).toHaveBeenCalledWith(20, 20)
  })

  it('lets the knobs meet exactly at the same value without clamping past it', () => {
    const { onChange } = renderDual({ valueMin: 20, valueMax: 60 })
    fireEvent.change(screen.getByLabelText('Minimum'), {
      target: { value: '60' },
    })
    // Math.min(60, 60) === 60 — equality is allowed, both knobs coincide.
    expect(onChange).toHaveBeenCalledWith(60, 60)
  })
})
