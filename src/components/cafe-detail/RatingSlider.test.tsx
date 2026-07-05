import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderWithProviders, screen } from '@/test/utils'
import { resetRouter } from '@/test/router'
import RatingSlider from '@/components/cafe-detail/RatingSlider'
import type { RatingEntry } from '@/lib/api/cafe'

vi.mock('@tanstack/react-router', async (importActual) => {
  const actual = await importActual<typeof import('@tanstack/react-router')>()
  const { routerOverrides } = await import('@/test/router')
  return { ...actual, ...routerOverrides }
})

beforeEach(resetRouter)

const range: RatingEntry['range'] = [
  {
    name: 'Quiet',
    description: 'calm',
    lower_bound: 0,
    upper_bound: 2,
    slug: 'quiet-noise',
  },
  // no slug → renders as a plain span
  { name: 'Lively', description: 'buzzy', lower_bound: 2, upper_bound: 5 },
]

function makeRating(overrides: Partial<RatingEntry> = {}): RatingEntry {
  return {
    display_name: 'Noise',
    range,
    score: 1,
    description: '',
    ...overrides,
  }
}

describe('RatingSlider', () => {
  it('labels the track with the active range name', () => {
    renderWithProviders(<RatingSlider label="Noise" rating={makeRating()} />)
    expect(screen.getByRole('img')).toHaveAttribute(
      'aria-label',
      'Noise: Quiet',
    )
  })

  it('renders a link for a cap with a slug and a span otherwise', () => {
    renderWithProviders(<RatingSlider label="Noise" rating={makeRating()} />)
    const link = screen.getByRole('link', { name: 'Quiet' })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('title', expect.stringContaining('Quiet'))
    expect(
      screen.queryByRole('link', { name: 'Lively' }),
    ).not.toBeInTheDocument()
    expect(screen.getByText('Lively').tagName).toBe('SPAN')
  })

  it('clamps activeCap to the first bucket when the score is below range', () => {
    renderWithProviders(
      <RatingSlider label="Noise" rating={makeRating({ score: -5 })} />,
    )
    expect(screen.getByRole('img')).toHaveAttribute(
      'aria-label',
      'Noise: Quiet',
    )
  })

  it('clamps activeCap to the last bucket when the score is above range', () => {
    renderWithProviders(
      <RatingSlider label="Noise" rating={makeRating({ score: 10 })} />,
    )
    expect(screen.getByRole('img')).toHaveAttribute(
      'aria-label',
      'Noise: Lively',
    )
  })

  it('prefers the entry description over the cap description', () => {
    renderWithProviders(
      <RatingSlider
        label="Noise"
        rating={makeRating({ description: 'custom' })}
      />,
    )
    expect(screen.getByText('custom')).toBeInTheDocument()
  })

  it('falls back to the active cap description when the entry has none', () => {
    renderWithProviders(<RatingSlider label="Noise" rating={makeRating()} />)
    expect(screen.getByText('calm')).toBeInTheDocument()
  })
})
