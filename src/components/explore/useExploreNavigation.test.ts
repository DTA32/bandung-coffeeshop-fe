import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook } from '@/test/utils'
import { SORT_OPTIONS } from '@/lib/constants'
import type { ExploreSearch } from '@/lib/api/search'
import { useExploreNavigation } from './useExploreNavigation'

// The hook only touches useNavigate + useRouterState (via useLocale). Stub both
// with a hoisted bag so the navigate spy and the mutable pathname are local to
// this file. Pathname '/en' → locale 'en' → localeParam('en') === 'en';
// pathname '/' → locale 'id' → localeParam('id') === undefined.
const h = vi.hoisted(() => ({ navigate: vi.fn(), state: { pathname: '/en' } }))

vi.mock('@tanstack/react-router', async (importActual) => ({
  ...(await importActual<typeof import('@tanstack/react-router')>()),
  useNavigate: () => h.navigate,
  useRouterState: ({ select }: any) =>
    select({ location: { pathname: h.state.pathname } }),
}))

beforeEach(() => {
  h.navigate.mockReset()
  h.state.pathname = '/en'
})

function setup(
  search: ExploreSearch = {},
  locationSplat: string | undefined = undefined,
) {
  return renderHook(() => useExploreNavigation({ search, locationSplat }))
}

describe('useExploreNavigation', () => {
  describe('marker', () => {
    it('parses query_coords "lat,lng" into a {lat,lng} object', () => {
      const { result } = setup({ query_coords: '-6.9,107.6' })
      expect(result.current.marker).toEqual({ lat: -6.9, lng: 107.6 })
    })

    it('returns null for non-numeric coords like "x,y"', () => {
      const { result } = setup({ query_coords: 'x,y' })
      expect(result.current.marker).toBeNull()
    })

    it('returns null when query_coords is absent', () => {
      const { result } = setup({})
      expect(result.current.marker).toBeNull()
    })
  })

  describe('sortOptions', () => {
    it('equals SORT_OPTIONS when query_coords is undefined', () => {
      const { result } = setup({})
      expect(result.current.sortOptions).toEqual(SORT_OPTIONS)
      expect(result.current.sortOptions).toHaveLength(SORT_OPTIONS.length)
    })

    it('appends a distance option only when query_coords is set', () => {
      const { result } = setup({ query_coords: '-6.9,107.6' })
      expect(result.current.sortOptions).toHaveLength(SORT_OPTIONS.length + 1)
      expect(result.current.sortOptions.at(-1)).toEqual({
        value: 'distance',
        label: 'distance',
      })
    })
  })

  describe('activeSort', () => {
    it("defaults to 'default' when sort is undefined", () => {
      const { result } = setup({})
      expect(result.current.activeSort).toBe('default')
    })

    it('returns the current sort when it is a known option', () => {
      const { result } = setup({ sort: 'rating' })
      expect(result.current.activeSort).toBe('rating')
    })

    it("falls back to 'default' when sort is not in options (distance without coords)", () => {
      const { result } = setup({ sort: 'distance' })
      expect(result.current.activeSort).toBe('default')
    })

    it("keeps 'distance' when coords make it a valid option", () => {
      const { result } = setup({ sort: 'distance', query_coords: '-6.9,107.6' })
      expect(result.current.activeSort).toBe('distance')
    })
  })

  describe('goTo', () => {
    it("navigates relatively (to: '.') with defaults stripped and page kept", () => {
      const { result } = setup({
        sort: 'default',
        page: 1,
        size: 8,
        view: 'grid',
      })
      result.current.goTo({ page: 3 })
      expect(h.navigate).toHaveBeenCalledWith({
        to: '.',
        search: { page: 3 },
      })
    })

    it('merges the update over the existing search before cleaning', () => {
      const { result } = setup({ tags: 'wifi' })
      result.current.goTo({ sort: 'rating' })
      expect(h.navigate).toHaveBeenCalledWith({
        to: '.',
        search: { sort: 'rating', tags: 'wifi' },
      })
    })
  })

  describe('applyFilters', () => {
    it('navigates to the splat route with locale + _splat params when locationSplat is set', () => {
      const { result } = setup({ tags: 'wifi' }, 'bandung/dago')
      result.current.applyFilters({ page: 3 })
      expect(h.navigate).toHaveBeenCalledWith({
        to: '/{-$locale}/explore/$',
        params: { locale: 'en', _splat: 'bandung/dago' },
        search: { page: 3, tags: 'wifi' },
      })
    })

    it('navigates to the base explore route (locale only) when locationSplat is absent', () => {
      const { result } = setup({ tags: 'wifi' }, undefined)
      result.current.applyFilters({ ratings: '1,2' })
      expect(h.navigate).toHaveBeenCalledWith({
        to: '/{-$locale}/explore',
        params: { locale: 'en' },
        search: { tags: 'wifi', ratings: '1,2' },
      })
    })

    it('passes locale: undefined for the id locale (bare pathname)', () => {
      h.state.pathname = '/'
      const { result } = setup({}, undefined)
      result.current.applyFilters({})
      const call = h.navigate.mock.calls[0][0]
      expect(call.to).toBe('/{-$locale}/explore')
      expect(call.params.locale).toBeUndefined()
    })

    it('passes locale: undefined for the id locale on the splat route', () => {
      h.state.pathname = '/'
      const { result } = setup({}, 'bandung')
      result.current.applyFilters({})
      const call = h.navigate.mock.calls[0][0]
      expect(call.to).toBe('/{-$locale}/explore/$')
      expect(call.params).toEqual({ locale: undefined, _splat: 'bandung' })
    })
  })

  describe('placeMarker', () => {
    it('switches to coordinate search on the base explore route and honors replace:true', () => {
      const { result } = setup({
        query_id: 'abc',
        query_type: 'area',
        sort: 'rating',
      })
      result.current.placeMarker(-6.9, 107.6, { replace: true })

      const call = h.navigate.mock.calls[0][0]
      expect(call.to).toBe('/{-$locale}/explore')
      expect(call.params).toEqual({ locale: 'en' })
      expect(call.replace).toBe(true)
      expect(call.search).toEqual(
        expect.objectContaining({
          query_coords: '-6.9,107.6',
          radius_max: 1500,
          sort: 'distance',
          map_view: true,
        }),
      )
      // query_id/query_type are cleared (overridden to undefined → dropped by
      // cleanExploreSearch).
      expect(call.search).not.toHaveProperty('query_id')
      expect(call.search).not.toHaveProperty('query_type')
      // NOTE: spec mentions page:1, but cleanExploreSearch strips page when it
      // equals the default (1), so page is absent from the emitted search.
      expect(call.search).not.toHaveProperty('page')
    })

    it('defaults replace to false when no options are given', () => {
      const { result } = setup({})
      result.current.placeMarker(1, 2)
      expect(h.navigate.mock.calls[0][0].replace).toBe(false)
    })

    it('uses locale: undefined params on the id locale', () => {
      h.state.pathname = '/'
      const { result } = setup({})
      result.current.placeMarker(1, 2, { replace: true })
      const call = h.navigate.mock.calls[0][0]
      expect(call.params.locale).toBeUndefined()
      expect(call.search.query_coords).toBe('1,2')
    })
  })
})
