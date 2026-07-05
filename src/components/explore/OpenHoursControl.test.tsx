import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders, screen, fireEvent, userEvent } from '@/test/utils'
import OpenHoursControl from './OpenHoursControl'

// English copy (src/i18n/locales/en/common.json -> explore.filters.*)
const COPY = {
  openNow: 'Open now',
  atTime: 'At a time',
  openNowCaption: 'Showing cafes that open right now',
  openAt: 'Open at',
}
const DEFAULT_TIME = '12:00'

// Mirror the source helpers to ground round-trip assertions.
const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

function setup(value?: string) {
  const onChange = vi.fn()
  const utils = renderWithProviders(
    <OpenHoursControl value={value} onChange={onChange} />,
  )
  return { onChange, ...utils }
}

const nowButton = () => screen.getByRole('button', { name: COPY.openNow })
const timeButton = () => screen.getByRole('button', { name: COPY.atTime })

describe('OpenHoursControl', () => {
  let onChange: ReturnType<typeof vi.fn>

  beforeEach(() => {
    onChange = vi.fn()
  })

  describe('mode derivation from value', () => {
    it('renders neither mode active for empty (undefined) value', () => {
      setup(undefined)

      expect(nowButton()).toHaveAttribute('aria-pressed', 'false')
      expect(timeButton()).toHaveAttribute('aria-pressed', 'false')
      // No "now" caption and no time slider in the empty state.
      expect(screen.queryByText(COPY.openNowCaption)).not.toBeInTheDocument()
      expect(screen.queryByRole('slider')).not.toBeInTheDocument()
    })

    it("derives 'now' mode and shows the caption when value is 'now'", () => {
      setup('now')

      expect(nowButton()).toHaveAttribute('aria-pressed', 'true')
      expect(timeButton()).toHaveAttribute('aria-pressed', 'false')
      expect(screen.getByText(COPY.openNowCaption)).toBeInTheDocument()
      // 'now' mode never renders the slider.
      expect(screen.queryByRole('slider')).not.toBeInTheDocument()
    })

    it("derives 'time' mode and shows the slider when value is a HH:MM time", () => {
      setup('08:30')

      expect(timeButton()).toHaveAttribute('aria-pressed', 'true')
      expect(nowButton()).toHaveAttribute('aria-pressed', 'false')
      // The chosen time is surfaced as text (08:30 is not a tick, so unique).
      expect(screen.getByText('08:30')).toBeInTheDocument()
      // The 'now' caption is hidden in time mode.
      expect(screen.queryByText(COPY.openNowCaption)).not.toBeInTheDocument()

      const slider = screen.getByRole('slider', {
        name: COPY.openAt,
      })
      expect(slider).toBeInTheDocument()
      // toMinutes('08:30') === 510 drives the slider position.
      expect(slider.value).toBe(String(toMinutes('08:30')))
    })

    it('exposes the slider bounds and step from the source constants', () => {
      setup('08:30')
      const slider = screen.getByRole('slider', { name: COPY.openAt })

      expect(slider).toHaveAttribute('min', '0')
      expect(slider).toHaveAttribute('max', '1410') // SLIDER_MAX (23:30)
      expect(slider).toHaveAttribute('step', '30') // SLIDER_STEP
    })

    it("treats midnight '00:00' as a valid time mode (not empty)", () => {
      setup('00:00')

      expect(timeButton()).toHaveAttribute('aria-pressed', 'true')
      const slider = screen.getByRole('slider', {
        name: COPY.openAt,
      })
      expect(slider.value).toBe('0')
    })

    it('renders the fixed tick labels in time mode', () => {
      setup('08:30')

      expect(screen.getByText('00:00')).toBeInTheDocument()
      expect(screen.getByText('12:00')).toBeInTheDocument()
      expect(screen.getByText('24:00')).toBeInTheDocument()
    })
  })

  describe("'Open now' control toggles 'now' <-> undefined", () => {
    it("emits 'now' when clicked from the empty state", async () => {
      const user = userEvent.setup()
      renderWithProviders(
        <OpenHoursControl value={undefined} onChange={onChange} />,
      )

      await user.click(nowButton())

      expect(onChange).toHaveBeenCalledTimes(1)
      expect(onChange).toHaveBeenCalledWith('now')
    })

    it("emits undefined when clicked while already 'now'", async () => {
      const user = userEvent.setup()
      renderWithProviders(<OpenHoursControl value="now" onChange={onChange} />)

      await user.click(nowButton())

      expect(onChange).toHaveBeenCalledTimes(1)
      expect(onChange).toHaveBeenCalledWith(undefined)
    })
  })

  describe('switching to the time mode emits the default time', () => {
    it('emits DEFAULT_TIME when switching from empty to time', async () => {
      const user = userEvent.setup()
      renderWithProviders(
        <OpenHoursControl value={undefined} onChange={onChange} />,
      )

      await user.click(timeButton())

      expect(onChange).toHaveBeenCalledTimes(1)
      expect(onChange).toHaveBeenCalledWith(DEFAULT_TIME)
    })

    it("emits DEFAULT_TIME when switching from 'now' to time", async () => {
      const user = userEvent.setup()
      renderWithProviders(<OpenHoursControl value="now" onChange={onChange} />)

      await user.click(timeButton())

      expect(onChange).toHaveBeenCalledTimes(1)
      expect(onChange).toHaveBeenCalledWith(DEFAULT_TIME)
    })

    it('toggles time mode off (undefined) when already in time mode', async () => {
      const user = userEvent.setup()
      renderWithProviders(
        <OpenHoursControl value="08:30" onChange={onChange} />,
      )

      await user.click(timeButton())

      expect(onChange).toHaveBeenCalledTimes(1)
      expect(onChange).toHaveBeenCalledWith(undefined)
    })
  })

  describe('moving the slider emits onChange(toHHMM(minutes))', () => {
    it("converts a moved value back to HH:MM (510 -> '08:30')", () => {
      const { onChange: spy } = setup(DEFAULT_TIME)
      const slider = screen.getByRole('slider', { name: COPY.openAt })

      fireEvent.change(slider, { target: { value: '510' } })

      expect(spy).toHaveBeenCalledTimes(1)
      expect(spy).toHaveBeenCalledWith('08:30')
    })

    it.each([
      ['0', '00:00'],
      ['510', '08:30'],
      ['720', '12:00'],
      ['1410', '23:30'],
    ])('slider value %s emits onChange(%s)', (sliderValue, expected) => {
      // Base value '06:00' (360 min) differs from every target above, so the
      // controlled <input> actually changes and React fires onChange. (A no-op
      // change to the already-rendered value would be swallowed by React.)
      const { onChange: spy } = setup('06:00')
      const slider = screen.getByRole('slider', { name: COPY.openAt })

      fireEvent.change(slider, { target: { value: sliderValue } })

      expect(spy).toHaveBeenCalledWith(expected)
    })

    it('round-trips toMinutes/toHHMM through the slider', () => {
      // Rendered value drives the position via toMinutes('23:30') === 1410...
      const { onChange: spy } = setup('23:30')
      const slider = screen.getByRole('slider', {
        name: COPY.openAt,
      })
      expect(slider.value).toBe('1410')

      // ...and moving it (to a different position) maps minutes back via toHHMM.
      fireEvent.change(slider, { target: { value: '0' } })
      expect(spy).toHaveBeenCalledWith('00:00')
    })
  })
})
