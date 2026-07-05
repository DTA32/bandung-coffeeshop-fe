import { describe, it, expect } from 'vitest'
import {
  parseTags,
  serializeTags,
  parseRatingIds,
  serializeRatingIds,
  exploreSplat,
  validateExploreSearch,
  exploreLoaderDeps,
} from '@/lib/explore'
import type { Location } from '@/lib/type'
import type { ExploreSearch } from '@/lib/api/search'

// Pure-logic util tests — no React, no router.
// Behavioural facts grounded in the source (src/lib/explore.ts):
//  - parse* helpers split on ',', trim, drop empties.
//  - validateExploreSearch uses zod preprocess helpers that degrade invalid
//    input to undefined. A key ABSENT from the input is omitted entirely; a key
//    PRESENT but invalid stays in the output with value `undefined`. Vitest's
//    toEqual ignores undefined-valued properties, so both read as "absent".

describe('parseTags', () => {
  it('returns [] for undefined', () => {
    expect(parseTags(undefined)).toEqual([])
  })

  it('returns [] for empty string', () => {
    expect(parseTags('')).toEqual([])
  })

  it('splits comma-separated values', () => {
    expect(parseTags('wifi,quiet,outdoor')).toEqual([
      'wifi',
      'quiet',
      'outdoor',
    ])
  })

  it('trims surrounding whitespace on each tag', () => {
    expect(parseTags(' wifi , quiet ,outdoor ')).toEqual([
      'wifi',
      'quiet',
      'outdoor',
    ])
  })

  it('drops empty segments from doubled/trailing commas', () => {
    expect(parseTags('wifi,,quiet,')).toEqual(['wifi', 'quiet'])
  })

  it('drops whitespace-only segments', () => {
    expect(parseTags('wifi,   ,quiet')).toEqual(['wifi', 'quiet'])
  })

  it('returns [] when input is only separators/whitespace', () => {
    expect(parseTags(' , , ')).toEqual([])
  })
})

describe('serializeTags', () => {
  it('returns undefined for an empty array', () => {
    expect(serializeTags([])).toBeUndefined()
  })

  it('joins tags with commas', () => {
    expect(serializeTags(['wifi', 'quiet'])).toBe('wifi,quiet')
  })

  it('trims each tag before joining', () => {
    expect(serializeTags([' wifi ', ' quiet '])).toBe('wifi,quiet')
  })

  it('drops empty / whitespace-only entries', () => {
    expect(serializeTags(['wifi', '', '  ', 'quiet'])).toBe('wifi,quiet')
  })

  it('returns undefined when every entry is empty after trimming', () => {
    expect(serializeTags(['', '   '])).toBeUndefined()
  })
})

describe('tags round-trip', () => {
  it('parseTags(serializeTags(x)) preserves the original tags', () => {
    const tags = ['wifi', 'quiet', 'outdoor']
    expect(parseTags(serializeTags(tags))).toEqual(tags)
  })

  it('serializeTags(parseTags(x)) yields the canonical string', () => {
    expect(serializeTags(parseTags(' wifi , quiet '))).toBe('wifi,quiet')
  })
})

describe('parseRatingIds', () => {
  it('returns [] for undefined', () => {
    expect(parseRatingIds(undefined)).toEqual([])
  })

  it('returns [] for empty string', () => {
    expect(parseRatingIds('')).toEqual([])
  })

  it('parses comma-separated integers', () => {
    expect(parseRatingIds('1,2,3')).toEqual([1, 2, 3])
  })

  it('trims whitespace around each id', () => {
    expect(parseRatingIds(' 1 , 2 , 3 ')).toEqual([1, 2, 3])
  })

  it('keeps only integers, dropping non-numeric tokens like "x"', () => {
    expect(parseRatingIds('1,x,3')).toEqual([1, 3])
  })

  it('drops non-integer numbers like 2.5', () => {
    expect(parseRatingIds('1,2.5,3')).toEqual([1, 3])
  })

  it('returns [] when no token is an integer', () => {
    expect(parseRatingIds('x,2.5,foo')).toEqual([])
  })
})

describe('serializeRatingIds', () => {
  it('returns undefined for an empty array', () => {
    expect(serializeRatingIds([])).toBeUndefined()
  })

  it('joins integer ids with commas', () => {
    expect(serializeRatingIds([1, 2, 3])).toBe('1,2,3')
  })

  it('drops non-integer values before joining', () => {
    expect(serializeRatingIds([1, 2.5, 3])).toBe('1,3')
  })

  it('returns undefined when no value is an integer', () => {
    expect(serializeRatingIds([2.5, 0.1])).toBeUndefined()
  })
})

describe('ratingIds round-trip', () => {
  it('parseRatingIds(serializeRatingIds(x)) preserves integer ids', () => {
    const ids = [1, 4, 7]
    expect(parseRatingIds(serializeRatingIds(ids))).toEqual(ids)
  })
})

describe('exploreSplat', () => {
  // Only `.id` matters here — cast minimal objects with `as any`.
  const loc = (id: string) => ({ id }) as any as Location

  it('joins ref ids with "/"', () => {
    expect(exploreSplat([loc('bandung'), loc('dago'), loc('cihampelas')])).toBe(
      'bandung/dago/cihampelas',
    )
  })

  it('returns a single id for a one-element chain', () => {
    expect(exploreSplat([loc('bandung')])).toBe('bandung')
  })

  it('returns an empty string for an empty chain', () => {
    expect(exploreSplat([])).toBe('')
  })
})

describe('validateExploreSearch — finiteNumber fields', () => {
  it('keeps finite numbers (string and number inputs)', () => {
    const r = validateExploreSearch({
      radius_max: '2000',
      price_min: 15,
      price_max: '50.5',
    })
    expect(r).toMatchObject({
      radius_max: 2000,
      price_min: 15,
      price_max: 50.5,
    })
  })

  it('treats "0" as a valid finite value (not dropped)', () => {
    expect(validateExploreSearch({ radius_max: '0' }).radius_max).toBe(0)
  })

  it('drops empty-string input', () => {
    expect(validateExploreSearch({ radius_max: '' }).radius_max).toBeUndefined()
  })

  it('drops NaN-producing input', () => {
    expect(
      validateExploreSearch({ price_min: 'abc' }).price_min,
    ).toBeUndefined()
  })

  it('drops Infinity', () => {
    expect(
      validateExploreSearch({ price_max: Infinity }).price_max,
    ).toBeUndefined()
  })

  it('omits absent finiteNumber fields entirely', () => {
    expect(validateExploreSearch({})).not.toHaveProperty('radius_max')
  })
})

describe('validateExploreSearch — boundedInt fields (page/size)', () => {
  it('keeps valid positive ints', () => {
    expect(validateExploreSearch({ page: '3', size: '20' })).toMatchObject({
      page: 3,
      size: 20,
    })
  })

  it('clamps values below 1 up to 1', () => {
    // '-3' is truthy → Number('-3') = -3 → Math.max(1, -3) = 1
    expect(validateExploreSearch({ page: '-3' }).page).toBe(1)
  })

  it('falls back to 1 for page on present-but-invalid "0"', () => {
    // Number('0') = 0 (falsy) → 0 || 1 = 1 → Math.max(1, 1) = 1
    expect(validateExploreSearch({ page: '0' }).page).toBe(1)
  })

  it('falls back to 1 for page on non-numeric "x"', () => {
    expect(validateExploreSearch({ page: 'x' }).page).toBe(1)
  })

  it('falls back to 8 for size on present-but-invalid "0"', () => {
    expect(validateExploreSearch({ size: '0' }).size).toBe(8)
  })

  it('falls back to 8 for size on non-numeric "x"', () => {
    expect(validateExploreSearch({ size: 'x' }).size).toBe(8)
  })

  it('omits page/size when absent', () => {
    const r = validateExploreSearch({})
    expect(r).not.toHaveProperty('page')
    expect(r).not.toHaveProperty('size')
  })
})

describe('validateExploreSearch — flag fields (map_view/is_featured)', () => {
  it('accepts the boolean true', () => {
    expect(validateExploreSearch({ map_view: true }).map_view).toBe(true)
  })

  it('accepts the string "true"', () => {
    expect(validateExploreSearch({ is_featured: 'true' }).is_featured).toBe(
      true,
    )
  })

  it('drops the boolean false (never emits false)', () => {
    expect(validateExploreSearch({ map_view: false }).map_view).toBeUndefined()
  })

  it('drops the string "false"', () => {
    expect(
      validateExploreSearch({ is_featured: 'false' }).is_featured,
    ).toBeUndefined()
  })

  it('drops other truthy-but-invalid values', () => {
    expect(validateExploreSearch({ map_view: 1 }).map_view).toBeUndefined()
    expect(
      validateExploreSearch({ is_featured: 'yes' }).is_featured,
    ).toBeUndefined()
  })

  it('omits flags when absent', () => {
    const r = validateExploreSearch({})
    expect(r).not.toHaveProperty('map_view')
    expect(r).not.toHaveProperty('is_featured')
  })
})

describe('validateExploreSearch — oneOf fields (view/order)', () => {
  it('keeps valid view enum values', () => {
    expect(validateExploreSearch({ view: 'grid' }).view).toBe('grid')
    expect(validateExploreSearch({ view: 'list' }).view).toBe('list')
  })

  it('drops invalid view values', () => {
    expect(validateExploreSearch({ view: 'cards' }).view).toBeUndefined()
  })

  it('keeps valid order enum values', () => {
    expect(validateExploreSearch({ order: 'asc' }).order).toBe('asc')
    expect(validateExploreSearch({ order: 'desc' }).order).toBe('desc')
  })

  it('drops invalid order values', () => {
    expect(validateExploreSearch({ order: 'up' }).order).toBeUndefined()
  })

  it('omits enum fields when absent', () => {
    const r = validateExploreSearch({})
    expect(r).not.toHaveProperty('view')
    expect(r).not.toHaveProperty('order')
  })
})

describe('validateExploreSearch — looseString fields', () => {
  it('passes string values through', () => {
    const r = validateExploreSearch({
      query_id: 'abc',
      query_type: 'district',
      query_coords: '-6.9,107.6',
      sort: 'rating',
      open_hour: 'now',
      tags: 'wifi,quiet',
      ratings: '1,2',
    })
    expect(r).toMatchObject({
      query_id: 'abc',
      query_type: 'district',
      query_coords: '-6.9,107.6',
      sort: 'rating',
      open_hour: 'now',
      tags: 'wifi,quiet',
      ratings: '1,2',
    })
  })

  it('drops non-string values such as arrays (repeated query params)', () => {
    expect(validateExploreSearch({ tags: ['wifi'] }).tags).toBeUndefined()
  })

  it('drops numeric (non-string) values', () => {
    expect(validateExploreSearch({ sort: 5 }).sort).toBeUndefined()
  })

  it('omits looseString fields when absent', () => {
    expect(validateExploreSearch({})).not.toHaveProperty('query_id')
  })
})

describe('validateExploreSearch — whole-object behaviour', () => {
  it('returns an empty object for empty input', () => {
    expect(validateExploreSearch({})).toEqual({})
  })

  it('never rejects: a fully-invalid bag degrades to no usable fields', () => {
    const r = validateExploreSearch({
      radius_max: 'abc',
      price_min: Infinity,
      view: 'bad',
      order: 'up',
      tags: ['a'],
      map_view: false,
      is_featured: 'false',
    })
    // page/size are absent here, everything else degraded to undefined.
    expect(r).toEqual({})
  })

  it('coerces a realistic mixed bag correctly', () => {
    expect(
      validateExploreSearch({
        page: '2',
        size: '0',
        radius_max: '1500',
        view: 'list',
        map_view: 'true',
        order: 'desc',
        tags: 'wifi,quiet',
        sort: 'rating',
      }),
    ).toEqual({
      page: 2,
      size: 8,
      radius_max: 1500,
      view: 'list',
      map_view: true,
      order: 'desc',
      tags: 'wifi,quiet',
      sort: 'rating',
    })
  })
})

describe('exploreLoaderDeps', () => {
  it('fills sort/page/size defaults when search is empty', () => {
    expect(exploreLoaderDeps({})).toEqual({
      sort: 'default',
      page: 1,
      size: 8,
    })
  })

  it('preserves provided values without applying defaults', () => {
    const search: ExploreSearch = {
      query_id: 'x',
      query_type: 'area',
      sort: 'rating',
      page: 3,
      size: 20,
      tags: 'wifi',
      is_featured: true,
      order: 'asc',
    }
    expect(exploreLoaderDeps(search)).toMatchObject({
      query_id: 'x',
      query_type: 'area',
      sort: 'rating',
      page: 3,
      size: 20,
      tags: 'wifi',
      is_featured: true,
      order: 'asc',
    })
  })

  it('maps every documented search field through to params', () => {
    const search: ExploreSearch = {
      query_id: 'q',
      query_type: 'district',
      query_coords: '1,2',
      radius_max: 500,
      open_hour: 'now',
      tags: 'a,b',
      price_min: 10,
      price_max: 40,
      ratings: '1,2',
      is_featured: true,
      sort: 'distance',
      page: 2,
      size: 12,
      order: 'desc',
    }
    expect(exploreLoaderDeps(search)).toEqual({
      query_id: 'q',
      query_type: 'district',
      query_coords: '1,2',
      radius_max: 500,
      open_hour: 'now',
      tags: 'a,b',
      price_min: 10,
      price_max: 40,
      ratings: '1,2',
      is_featured: true,
      sort: 'distance',
      page: 2,
      size: 12,
      order: 'desc',
    })
  })
})
