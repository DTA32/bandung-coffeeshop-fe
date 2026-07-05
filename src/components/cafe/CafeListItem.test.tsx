import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderWithProviders, screen } from '@/test/utils'
import { resetRouter } from '@/test/router'
import type { CafeListing } from '@/lib/api/search'

// CafeListItem renders LocaleLink (→ useLocale → useRouterState) so the router
// mock surface is required.
vi.mock('@tanstack/react-router', async (importActual) => {
  const actual = await importActual<typeof import('@tanstack/react-router')>()
  const { routerOverrides } = await import('@/test/router')
  return { ...actual, ...routerOverrides }
})

// The real Image wraps @unpic/react, which expects URL-shaped src and does extra
// work that complicates jsdom rendering. Swap it for a plain <img>.
vi.mock('@/components/Image', () => ({
  default: (p: { alt?: string; src?: string }) => (
    <img alt={p.alt} src={p.src} />
  ),
}))

// Import after the mocks above so the component picks up the stubbed modules.
const { default: CafeListItem } = await import('./CafeListItem')

beforeEach(resetRouter)

const baseCafe: CafeListing = {
  id: 'kopi-toko-djawa',
  name: 'Kopi Toko Djawa',
  description: 'A cozy little spot',
  thumbnail: null,
  area: null,
  price_range: null,
  distance: null,
  remark: null,
}

function makeCafe(overrides: Partial<CafeListing> = {}): CafeListing {
  return { ...baseCafe, ...overrides }
}

describe('CafeListItem', () => {
  it('renders the cafe name as a heading inside a link', () => {
    renderWithProviders(<CafeListItem cafe={makeCafe()} />)
    expect(
      screen.getByRole('heading', { name: 'Kopi Toko Djawa' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link')).toBeInTheDocument()
  })

  describe('distance formatting', () => {
    // distance < 1000m → '<round(m)> m'; distance >= 1000m → '<km.toFixed(1)> km'.
    // The value is surfaced via the explore.distanceAway copy ('{{distance}} away').
    it.each([
      [500, '500 m away'],
      [950, '950 m away'],
      [999, '999 m away'],
      [1000, '1.0 km away'],
      [1500, '1.5 km away'],
      [2345, '2.3 km away'],
      [12000, '12.0 km away'],
    ])('distance %dm renders "%s"', (distance, expected) => {
      renderWithProviders(<CafeListItem cafe={makeCafe({ distance })} />)
      expect(screen.getByText(expected)).toBeInTheDocument()
    })

    it('rounds fractional metres with Math.round', () => {
      renderWithProviders(<CafeListItem cafe={makeCafe({ distance: 123.6 })} />)
      expect(screen.getByText('124 m away')).toBeInTheDocument()
    })

    it('treats distance 0 as "no distance" (falsy) → no distanceAway copy', () => {
      // distance 0 is falsy, so the distance branch is skipped entirely.
      renderWithProviders(
        <CafeListItem cafe={makeCafe({ distance: 0, area: 'Dago' })} />,
      )
      expect(screen.queryByText(/away/)).not.toBeInTheDocument()
      // Falls back to the description span instead.
      expect(screen.getByText('Dago, Bandung')).toBeInTheDocument()
    })
  })

  describe('formattedRemark branches', () => {
    it('distance + price_range → "<area> • <price_range>"', () => {
      renderWithProviders(
        <CafeListItem
          cafe={makeCafe({ distance: 500, area: 'Dago', price_range: '$$' })}
        />,
      )
      expect(screen.getByText('Dago • $$')).toBeInTheDocument()
    })

    it('distance + no price_range → area only', () => {
      renderWithProviders(
        <CafeListItem
          cafe={makeCafe({ distance: 500, area: 'Dago', price_range: null })}
        />,
      )
      expect(screen.getByText('Dago')).toBeInTheDocument()
    })

    it('no distance + price_range + remark → "<price_range> • <remark>"', () => {
      renderWithProviders(
        <CafeListItem
          cafe={makeCafe({ price_range: '$$', remark: 'Cozy and quiet' })}
        />,
      )
      expect(screen.getByText('$$ • Cozy and quiet')).toBeInTheDocument()
    })

    it('no distance + price_range only → price_range', () => {
      renderWithProviders(
        <CafeListItem cafe={makeCafe({ price_range: '$$', remark: null })} />,
      )
      expect(screen.getByText('$$')).toBeInTheDocument()
    })

    it('no distance + no price_range → falls back to raw remark', () => {
      renderWithProviders(
        <CafeListItem
          cafe={makeCafe({ price_range: null, remark: 'Hidden gem' })}
        />,
      )
      expect(screen.getByText('Hidden gem')).toBeInTheDocument()
    })

    it('no distance, no price_range, no remark → no remark span', () => {
      renderWithProviders(
        <CafeListItem
          cafe={makeCafe({
            price_range: null,
            remark: null,
            area: null,
            description: 'A cozy little spot',
          })}
        />,
      )
      // Only the description span remains.
      expect(screen.getByText('A cozy little spot')).toBeInTheDocument()
    })
  })

  describe('description', () => {
    it('becomes "<area>, Bandung" when area is present and no distance', () => {
      renderWithProviders(
        <CafeListItem cafe={makeCafe({ area: 'Riau', distance: null })} />,
      )
      expect(screen.getByText('Riau, Bandung')).toBeInTheDocument()
    })

    it('uses cafe.description when area is null', () => {
      renderWithProviders(
        <CafeListItem
          cafe={makeCafe({ area: null, description: 'A cozy little spot' })}
        />,
      )
      expect(screen.getByText('A cozy little spot')).toBeInTheDocument()
    })

    it('is hidden when a distance is set (distanceAway shown instead)', () => {
      renderWithProviders(
        <CafeListItem cafe={makeCafe({ distance: 500, area: 'Dago' })} />,
      )
      // description "Dago, Bandung" computed but not rendered because distance wins.
      expect(screen.queryByText('Dago, Bandung')).not.toBeInTheDocument()
      expect(screen.getByText('500 m away')).toBeInTheDocument()
    })
  })

  describe('link title', () => {
    it('combines name, distance and formattedRemark', () => {
      renderWithProviders(
        <CafeListItem
          cafe={makeCafe({
            name: 'Kopi Toko Djawa',
            distance: 500,
            area: 'Dago',
            price_range: '$$',
          })}
        />,
      )
      expect(screen.getByRole('link')).toHaveAttribute(
        'title',
        'Kopi Toko Djawa • 500 m • Dago • $$',
      )
    })

    it('falls back to description when no distance, and has a trailing space when remark is empty', () => {
      renderWithProviders(
        <CafeListItem
          cafe={makeCafe({
            name: 'Solo Cafe',
            area: null,
            description: 'Quiet place',
            distance: null,
            price_range: null,
            remark: null,
          })}
        />,
      )
      // NOTE: current behavior leaves a trailing space when formattedRemark is
      // empty (the template literal always inserts the separator space).
      expect(screen.getByRole('link')).toHaveAttribute(
        'title',
        'Solo Cafe • Quiet place ',
      )
    })
  })

  describe('openNewTab', () => {
    it('sets target="_blank" when openNewTab is true', () => {
      renderWithProviders(<CafeListItem cafe={makeCafe()} openNewTab />)
      expect(screen.getByRole('link')).toHaveAttribute('target', '_blank')
    })

    it('omits target by default', () => {
      renderWithProviders(<CafeListItem cafe={makeCafe()} />)
      expect(screen.getByRole('link')).not.toHaveAttribute('target')
    })
  })

  describe('thumbnail', () => {
    it('renders no image when thumbnail is null', () => {
      renderWithProviders(<CafeListItem cafe={makeCafe({ thumbnail: null })} />)
      expect(screen.queryByRole('img')).not.toBeInTheDocument()
    })

    it('renders an image with the cafe name as alt when thumbnail is set', () => {
      const src = 'https://image.bdgcafe.com/kopi.jpg'
      renderWithProviders(
        <CafeListItem
          cafe={makeCafe({ thumbnail: src, name: 'Kopi Toko Djawa' })}
        />,
      )
      const img = screen.getByRole('img')
      expect(img).toHaveAttribute('src', src)
      expect(img).toHaveAttribute('alt', 'Kopi Toko Djawa')
    })
  })
})
