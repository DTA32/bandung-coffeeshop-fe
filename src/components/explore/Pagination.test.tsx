import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderWithProviders, screen, within } from '@/test/utils'
import { resetRouter } from '@/test/router'
import Pagination from '@/components/explore/Pagination'

// Pagination renders <Link> (from @tanstack/react-router) and uses i18n via
// useTranslation. Mock the router so <Link> becomes a plain <a> (MockLink) and
// render through renderWithProviders so copy resolves in English.
vi.mock('@tanstack/react-router', async (importActual) => {
  const actual = await importActual<typeof import('@tanstack/react-router')>()
  const { routerOverrides } = await import('@/test/router')
  return { ...actual, ...routerOverrides }
})

// The single ellipsis glyph (U+2026) the component renders for collapsed ranges.
const ELLIPSIS = '…'

// vi.fn spy that mimics searchForPage: returns an ExploreSearch-shaped object so
// the value handed to <Link search> is realistic. The DOM-safe MockLink drops the
// `search` prop, so we assert the algorithm via the spy's call args instead.
function setup(page: number, totalPages: number) {
  const searchForPage = vi.fn((p: number) => ({ page: p }))
  const result = renderWithProviders(
    <Pagination
      page={page}
      totalPages={totalPages}
      searchForPage={searchForPage}
    />,
  )
  return { searchForPage, ...result }
}

// The <nav> wrapper, found by its aria-label (t('explore.pagination') === 'Pagination').
const getNav = () => screen.getByRole('navigation', { name: 'Pagination' })

// nav children are always [prev, ...pageTokens, next]. Slice off the prev/next
// controls to read the ordered page-token list (numbers and ellipses).
const pageTokens = () =>
  Array.from(getNav().children)
    .slice(1, -1)
    .map((c) => c.textContent?.trim())

const prevEl = () => getNav().firstElementChild as HTMLElement
const nextEl = () => getNav().lastElementChild as HTMLElement

beforeEach(resetRouter)

describe('Pagination', () => {
  describe('visibility', () => {
    it('renders nothing when totalPages is 1', () => {
      const { container } = setup(1, 1)
      expect(container).toBeEmptyDOMElement()
      expect(screen.queryByRole('navigation')).toBeNull()
    })

    it('renders nothing when totalPages is 0', () => {
      const { container } = setup(1, 0)
      expect(container).toBeEmptyDOMElement()
    })

    it('renders the pagination nav when there is more than one page', () => {
      setup(1, 2)
      expect(getNav()).toBeInTheDocument()
    })
  })

  describe('small page counts (totalPages <= 5): every page shown, no ellipsis', () => {
    it('lists all page numbers in order with no ellipsis', () => {
      setup(3, 5)
      expect(pageTokens()).toEqual(['1', '2', '3', '4', '5'])
      expect(screen.queryAllByText(ELLIPSIS)).toHaveLength(0)
    })

    it('renders the smallest multi-page case (totalPages = 2)', () => {
      setup(1, 2)
      expect(pageTokens()).toEqual(['1', '2'])
      expect(screen.queryByText(ELLIPSIS)).toBeNull()
    })
  })

  describe('large page counts (totalPages > 5): ellipsis window algorithm', () => {
    it('first page: trailing ellipsis only', () => {
      setup(1, 10)
      expect(pageTokens()).toEqual(['1', '2', ELLIPSIS, '10'])
      expect(screen.queryAllByText(ELLIPSIS)).toHaveLength(1)
    })

    it('middle page: both leading and trailing ellipses around the neighbors', () => {
      setup(5, 10)
      expect(pageTokens()).toEqual([
        '1',
        ELLIPSIS,
        '4',
        '5',
        '6',
        ELLIPSIS,
        '10',
      ])
      expect(screen.queryAllByText(ELLIPSIS)).toHaveLength(2)
    })

    it('last page: leading ellipsis only', () => {
      setup(10, 10)
      expect(pageTokens()).toEqual(['1', ELLIPSIS, '9', '10'])
      expect(screen.queryAllByText(ELLIPSIS)).toHaveLength(1)
    })

    it('page 3 has no leading ellipsis (threshold is page > 3)', () => {
      setup(3, 10)
      expect(pageTokens()).toEqual(['1', '2', '3', '4', ELLIPSIS, '10'])
      expect(screen.queryAllByText(ELLIPSIS)).toHaveLength(1)
    })

    it('page 4 introduces the leading ellipsis', () => {
      setup(4, 10)
      expect(pageTokens()).toEqual([
        '1',
        ELLIPSIS,
        '3',
        '4',
        '5',
        ELLIPSIS,
        '10',
      ])
    })

    it('trailing ellipsis threshold: page 8 has none, only the leading one', () => {
      setup(8, 10)
      expect(pageTokens()).toEqual(['1', ELLIPSIS, '7', '8', '9', '10'])
      expect(screen.queryAllByText(ELLIPSIS)).toHaveLength(1)
    })

    it('page 7 still shows the trailing ellipsis (page < totalPages - 2)', () => {
      setup(7, 10)
      expect(pageTokens()).toEqual([
        '1',
        ELLIPSIS,
        '6',
        '7',
        '8',
        ELLIPSIS,
        '10',
      ])
      expect(screen.queryAllByText(ELLIPSIS)).toHaveLength(2)
    })
  })

  describe('active page (aria-current)', () => {
    it('marks the current page link with aria-current="page"', () => {
      setup(5, 10)
      const active = within(getNav()).getByRole('link', { name: '5' })
      expect(active).toHaveAttribute('aria-current', 'page')
      // Active link carries the active style.
      expect(active).toHaveClass('bg-forest')
    })

    it('does not set aria-current on non-active page links', () => {
      setup(5, 10)
      const other = within(getNav()).getByRole('link', { name: '1' })
      expect(other).not.toHaveAttribute('aria-current')
    })

    it('marks page 1 as current when on the first page', () => {
      setup(1, 5)
      expect(within(getNav()).getByRole('link', { name: '1' })).toHaveAttribute(
        'aria-current',
        'page',
      )
    })
  })

  describe('prev / next controls', () => {
    it('disables prev (renders a span, not a link) on the first page', () => {
      setup(1, 10)
      const prev = prevEl()
      expect(prev.tagName).toBe('SPAN')
      expect(prev).toHaveTextContent('Prev')
      expect(prev).toHaveClass('opacity-40')
      expect(within(getNav()).queryByRole('link', { name: /prev/i })).toBeNull()
    })

    it('disables next (renders a span, not a link) on the last page', () => {
      setup(10, 10)
      const next = nextEl()
      expect(next.tagName).toBe('SPAN')
      expect(next).toHaveTextContent('Next')
      expect(next).toHaveClass('opacity-40')
      expect(within(getNav()).queryByRole('link', { name: /next/i })).toBeNull()
    })

    it('renders prev and next as links on a middle page', () => {
      setup(5, 10)
      expect(prevEl().tagName).toBe('A')
      expect(nextEl().tagName).toBe('A')
      expect(
        within(getNav()).getByRole('link', { name: /prev/i }),
      ).toBeInTheDocument()
      expect(
        within(getNav()).getByRole('link', { name: /next/i }),
      ).toBeInTheDocument()
    })
  })

  describe('searchForPage wiring', () => {
    it('builds each page link by calling searchForPage with that page number', () => {
      const { searchForPage } = setup(5, 10)
      // Page-number links shown: 1, 4, 5, 6, 10 (+ prev=4, next=6).
      for (const n of [1, 4, 5, 6, 10]) {
        expect(searchForPage).toHaveBeenCalledWith(n)
      }
      // Collapsed pages are never requested.
      for (const n of [2, 3, 7, 8, 9]) {
        expect(searchForPage).not.toHaveBeenCalledWith(n)
      }
    })

    it('calls searchForPage(page - 1) for the prev link and (page + 1) for next', () => {
      const { searchForPage } = setup(5, 10)
      expect(searchForPage).toHaveBeenCalledWith(4) // prev
      expect(searchForPage).toHaveBeenCalledWith(6) // next
    })

    it('on a middle page: one call per rendered link (prev + 5 tokens + next = 7)', () => {
      const { searchForPage } = setup(5, 10)
      expect(searchForPage).toHaveBeenCalledTimes(7)
    })

    it('on the first page: prev is disabled so it is not requested', () => {
      const { searchForPage } = setup(1, 10)
      // Tokens 1, 2, 10 + next(2); prev (page 0) never built.
      expect(searchForPage).not.toHaveBeenCalledWith(0)
      expect(searchForPage).toHaveBeenCalledWith(2) // next link
      expect(searchForPage).toHaveBeenCalledTimes(4)
    })

    it('on the last page: next is disabled so it is not requested', () => {
      const { searchForPage } = setup(10, 10)
      // Tokens 1, 9, 10 + prev(9); next (page 11) never built.
      expect(searchForPage).not.toHaveBeenCalledWith(11)
      expect(searchForPage).toHaveBeenCalledWith(9) // prev link
      expect(searchForPage).toHaveBeenCalledTimes(4)
    })
  })
})
