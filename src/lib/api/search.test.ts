import { describe, it, expect } from 'vitest'
import { cleanExploreSearch } from '@/lib/api/search'
import type { ExploreSearch } from '@/lib/api/search'

describe('cleanExploreSearch', () => {
  describe('default-valued fields are stripped', () => {
    it('strips sort:"default"', () => {
      expect(cleanExploreSearch({ sort: 'default' })).toEqual({})
    })

    it('strips page:1', () => {
      expect(cleanExploreSearch({ page: 1 })).toEqual({})
    })

    it('strips size:8', () => {
      expect(cleanExploreSearch({ size: 8 })).toEqual({})
    })

    it('strips view:"grid"', () => {
      expect(cleanExploreSearch({ view: 'grid' })).toEqual({})
    })

    it('strips empty-string open_hour', () => {
      expect(cleanExploreSearch({ open_hour: '' })).toEqual({})
    })

    it('strips empty-string tags', () => {
      expect(cleanExploreSearch({ tags: '' })).toEqual({})
    })

    it('strips empty-string ratings', () => {
      expect(cleanExploreSearch({ ratings: '' })).toEqual({})
    })

    it('strips all default-valued fields at once', () => {
      expect(
        cleanExploreSearch({
          sort: 'default',
          page: 1,
          size: 8,
          view: 'grid',
          open_hour: '',
          tags: '',
          ratings: '',
        }),
      ).toEqual({})
    })
  })

  describe('map_view and is_featured only appear when truthy', () => {
    it('strips map_view:false', () => {
      expect(cleanExploreSearch({ map_view: false })).toEqual({})
    })

    it('keeps map_view as literal true when true', () => {
      expect(cleanExploreSearch({ map_view: true })).toEqual({ map_view: true })
    })

    it('strips is_featured:false', () => {
      expect(cleanExploreSearch({ is_featured: false })).toEqual({})
    })

    it('keeps is_featured as literal true when true', () => {
      expect(cleanExploreSearch({ is_featured: true })).toEqual({
        is_featured: true,
      })
    })
  })

  describe('explicit non-default values are preserved', () => {
    it('keeps sort:"rating"', () => {
      expect(cleanExploreSearch({ sort: 'rating' })).toEqual({ sort: 'rating' })
    })

    it('keeps page:3', () => {
      expect(cleanExploreSearch({ page: 3 })).toEqual({ page: 3 })
    })

    it('keeps size:12', () => {
      expect(cleanExploreSearch({ size: 12 })).toEqual({ size: 12 })
    })

    it('keeps view:"list"', () => {
      expect(cleanExploreSearch({ view: 'list' })).toEqual({ view: 'list' })
    })

    it('keeps non-empty open_hour', () => {
      expect(cleanExploreSearch({ open_hour: 'now' })).toEqual({
        open_hour: 'now',
      })
    })

    it('keeps non-empty tags', () => {
      expect(cleanExploreSearch({ tags: 'wifi,quiet' })).toEqual({
        tags: 'wifi,quiet',
      })
    })

    it('keeps non-empty ratings', () => {
      expect(cleanExploreSearch({ ratings: 'price-low,comfort-high' })).toEqual(
        { ratings: 'price-low,comfort-high' },
      )
    })

    it('keeps query_id / query_type / query_coords / radius_max / order', () => {
      expect(
        cleanExploreSearch({
          query_id: 'abc',
          query_type: 'area',
          query_coords: '1.23,4.56',
          radius_max: 2000,
          order: 'desc',
        }),
      ).toEqual({
        query_id: 'abc',
        query_type: 'area',
        query_coords: '1.23,4.56',
        radius_max: 2000,
        order: 'desc',
      })
    })

    it('preserves a fully-populated non-default object', () => {
      const input: ExploreSearch = {
        query_id: 'q1',
        query_type: 'district',
        query_coords: '-6.9,107.6',
        radius_max: 1500,
        open_hour: '08:00',
        tags: 'outdoor',
        price_min: 10,
        price_max: 50,
        ratings: 'wifi-high',
        is_featured: true,
        sort: 'rating',
        page: 2,
        size: 16,
        order: 'asc',
        view: 'list',
        map_view: true,
      }
      expect(cleanExploreSearch(input)).toEqual({
        query_id: 'q1',
        query_type: 'district',
        query_coords: '-6.9,107.6',
        radius_max: 1500,
        open_hour: '08:00',
        tags: 'outdoor',
        price_min: 10,
        price_max: 50,
        ratings: 'wifi-high',
        is_featured: true,
        sort: 'rating',
        page: 2,
        size: 16,
        order: 'asc',
        view: 'list',
        map_view: true,
      })
    })
  })

  describe('price_min / price_max use a !== undefined check (0 is kept)', () => {
    it('keeps price_min:0', () => {
      expect(cleanExploreSearch({ price_min: 0 })).toEqual({ price_min: 0 })
    })

    it('keeps price_max:0', () => {
      expect(cleanExploreSearch({ price_max: 0 })).toEqual({ price_max: 0 })
    })

    it('keeps positive price_min / price_max', () => {
      expect(cleanExploreSearch({ price_min: 5, price_max: 25 })).toEqual({
        price_min: 5,
        price_max: 25,
      })
    })

    it('strips price_min / price_max when undefined', () => {
      expect(
        cleanExploreSearch({ price_min: undefined, price_max: undefined }),
      ).toEqual({})
    })
  })

  describe('empty / all-default input', () => {
    it('returns {} for an empty object', () => {
      expect(cleanExploreSearch({})).toEqual({})
    })

    it('returns {} when every field is its default value', () => {
      const input: ExploreSearch = {
        query_id: undefined,
        query_type: undefined,
        query_coords: undefined,
        radius_max: undefined,
        open_hour: '',
        tags: '',
        price_min: undefined,
        price_max: undefined,
        ratings: '',
        is_featured: false,
        sort: 'default',
        page: 1,
        size: 8,
        order: undefined,
        view: 'grid',
        map_view: false,
      }
      expect(cleanExploreSearch(input)).toEqual({})
    })
  })
})
