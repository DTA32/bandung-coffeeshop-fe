import { describe, it, expect } from 'vitest'
import type { FilterOptions } from '@/lib/api/filters'
import {
  buildSrpContent,
  buildSrpRegistry,
  resolveSrp,
  srpVariants,
} from '@/lib/srp'

// A small but realistic /v1/filters payload. Includes the edge cases the source
// cares about:
//   - tags with and without a description (description drives blurb copy)
//   - a tag with an empty slug (not SRP-eligible → excluded from the registry)
//   - a rating bucket with an empty slug (the mushy "Moderate" bucket)
//   - a price tier with max === null (open-ended top tier → price_max omitted)
//   - a price tier with an empty slug (excluded)
const options: FilterOptions = {
  tags: [
    {
      name: 'WFC Friendly',
      slug: 'wfc-friendly',
      description: 'Great for working from cafe.',
    },
    { name: 'Pet Friendly', slug: 'pet-friendly' }, // no description → no blurb
    { name: 'No Slug Tag', slug: '' }, // empty slug → not SRP-eligible
  ],
  rating_categories: [
    {
      type: 'noise',
      display_name: 'Noise Level',
      options: [
        {
          id: 11,
          slug: 'quiet-noise',
          name: 'Quiet',
          description: 'short',
          long_description: 'A calm and quiet spot.',
          lower_bound: 0,
          upper_bound: 2,
        },
        {
          id: 12,
          slug: '', // Moderate has no pretty URL
          name: 'Moderate',
          description: 'short',
          lower_bound: 2,
          upper_bound: 4,
        },
        {
          id: 13,
          slug: 'loud-noise',
          name: 'Loud',
          description: 'short',
          lower_bound: 4,
          upper_bound: 5,
        },
      ],
    },
    {
      type: 'wifi',
      display_name: 'WiFi Quality',
      options: [
        {
          id: 21,
          slug: 'fast-wifi',
          name: 'Fast',
          description: 'short',
          long_description: 'Blazing fast wifi.',
          lower_bound: 4,
          upper_bound: 5,
        },
      ],
    },
  ],
  price_tiers: [
    {
      label: 'Budget',
      slug: 'budget-price',
      long_description: 'Easy on the wallet.',
      min: 0,
      max: 25000,
    },
    {
      label: 'Premium',
      slug: 'premium-price',
      long_description: 'Top tier.',
      min: 75000,
      max: null, // open-ended → price_max omitted from params
    },
    {
      label: 'No Slug Price',
      slug: '', // not SRP-eligible
      long_description: 'hidden',
      min: 1,
      max: 2,
    },
  ],
}

const registry = buildSrpRegistry(options)

describe('buildSrpRegistry', () => {
  it('adds only non-empty tag slugs to the tag set', () => {
    expect(registry.tag.has('wfc-friendly')).toBe(true)
    expect(registry.tag.has('pet-friendly')).toBe(true)
    expect(registry.tag.has('')).toBe(false)
    expect(registry.tag.size).toBe(2)
  })

  it('maps non-empty rating slugs to their bucket id', () => {
    expect(registry.rating.get('quiet-noise')).toBe(11)
    expect(registry.rating.get('loud-noise')).toBe(13)
    expect(registry.rating.get('fast-wifi')).toBe(21)
    // The empty-slug "Moderate" bucket (id 12) never enters the map.
    expect(registry.rating.has('')).toBe(false)
    expect(registry.rating.size).toBe(3)
  })

  it('maps non-empty price slugs to their numeric bounds, preserving max=null', () => {
    expect(registry.price.get('budget-price')).toEqual({ min: 0, max: 25000 })
    expect(registry.price.get('premium-price')).toEqual({
      min: 75000,
      max: null,
    })
    expect(registry.price.has('')).toBe(false)
    expect(registry.price.size).toBe(2)
  })
})

describe('resolveSrp', () => {
  it('returns null for empty input', () => {
    expect(resolveSrp([], registry)).toBeNull()
  })

  it('returns null when the only segments are falsy (filtered out)', () => {
    expect(resolveSrp([''], registry)).toBeNull()
  })

  it('treats an unknown segment as a location (the fallback axis)', () => {
    const resolved = resolveSrp(['dago'], registry)
    expect(resolved).toEqual({
      locationIds: ['dago'],
      params: {},
      canonical: 'dago',
    })
  })

  it('classifies a known tag slug and passes it straight to the tags param', () => {
    const resolved = resolveSrp(['wfc-friendly'], registry)
    expect(resolved).toEqual({
      locationIds: [],
      params: { tags: 'wfc-friendly' },
      canonical: 'wfc-friendly',
    })
  })

  it('classifies a rating slug and resolves it to its bucket id', () => {
    const resolved = resolveSrp(['quiet-noise'], registry)
    expect(resolved?.params.ratings).toBe('11')
    expect(resolved?.locationIds).toEqual([])
    expect(resolved?.canonical).toBe('quiet-noise')
  })

  it('resolves a price tier with a finite max to price_min and price_max', () => {
    const resolved = resolveSrp(['budget-price'], registry)
    expect(resolved?.params.price_min).toBe(0)
    expect(resolved?.params.price_max).toBe(25000)
  })

  it('omits price_max when the tier has an open-ended (null) max', () => {
    const resolved = resolveSrp(['premium-price'], registry)
    expect(resolved?.params.price_min).toBe(75000)
    expect(resolved?.params).not.toHaveProperty('price_max')
  })

  it('combines a location and a tag', () => {
    const resolved = resolveSrp(['dago', 'wfc-friendly'], registry)
    expect(resolved).toEqual({
      locationIds: ['dago'],
      params: { tags: 'wfc-friendly' },
      canonical: 'dago/wfc-friendly',
    })
  })

  it('reorders segments into canonical axis order (location, tag, price, rating)', () => {
    const resolved = resolveSrp(
      ['quiet-noise', 'wfc-friendly', 'dago', 'budget-price'],
      registry,
    )
    expect(resolved?.canonical).toBe(
      'dago/wfc-friendly/budget-price/quiet-noise',
    )
    expect(resolved?.locationIds).toEqual(['dago'])
    expect(resolved?.params).toEqual({
      tags: 'wfc-friendly',
      ratings: '11',
      price_min: 0,
      price_max: 25000,
    })
  })

  it('preserves original order within an axis when reordering across axes', () => {
    const resolved = resolveSrp(['wfc-friendly', 'jakarta', 'dago'], registry)
    expect(resolved?.locationIds).toEqual(['jakarta', 'dago'])
    expect(resolved?.canonical).toBe('jakarta/dago/wfc-friendly')
  })

  it('strips falsy segments before resolving', () => {
    const resolved = resolveSrp(['', 'dago', ''], registry)
    expect(resolved).toEqual({
      locationIds: ['dago'],
      params: {},
      canonical: 'dago',
    })
  })

  it('allows up to 3 location segments and keeps their order', () => {
    const resolved = resolveSrp(['dago', 'jakarta', 'bandung'], registry)
    expect(resolved?.locationIds).toEqual(['dago', 'jakarta', 'bandung'])
    expect(resolved?.canonical).toBe('dago/jakarta/bandung')
  })

  it('returns null when the location cap (3) is exceeded', () => {
    expect(
      resolveSrp(['dago', 'jakarta', 'bandung', 'medan'], registry),
    ).toBeNull()
  })

  it('returns null when more than one tag is present (tag cap = 1)', () => {
    expect(resolveSrp(['wfc-friendly', 'pet-friendly'], registry)).toBeNull()
  })

  it('returns null when more than one price tier is present (price cap = 1)', () => {
    expect(resolveSrp(['budget-price', 'premium-price'], registry)).toBeNull()
  })

  it('returns null when more than one rating is present (rating cap = 1)', () => {
    expect(resolveSrp(['quiet-noise', 'loud-noise'], registry)).toBeNull()
  })

  it('resolves a maximal path with every axis at its cap', () => {
    const resolved = resolveSrp(
      [
        'dago',
        'jakarta',
        'bandung',
        'wfc-friendly',
        'budget-price',
        'quiet-noise',
      ],
      registry,
    )
    expect(resolved).toEqual({
      locationIds: ['dago', 'jakarta', 'bandung'],
      params: {
        tags: 'wfc-friendly',
        ratings: '11',
        price_min: 0,
        price_max: 25000,
      },
      canonical: 'dago/jakarta/bandung/wfc-friendly/budget-price/quiet-noise',
    })
  })
})

describe('srpVariants', () => {
  it('offers every filter axis from the explore root (empty path)', () => {
    expect(srpVariants([], registry)).toEqual([
      { axis: 'tag', slug: 'wfc-friendly', splat: 'wfc-friendly' },
      { axis: 'tag', slug: 'pet-friendly', splat: 'pet-friendly' },
      { axis: 'price', slug: 'budget-price', splat: 'budget-price' },
      { axis: 'price', slug: 'premium-price', splat: 'premium-price' },
      { axis: 'rating', slug: 'quiet-noise', splat: 'quiet-noise' },
      { axis: 'rating', slug: 'loud-noise', splat: 'loud-noise' },
      { axis: 'rating', slug: 'fast-wifi', splat: 'fast-wifi' },
    ])
  })

  it('appends every filter axis after a location-only path', () => {
    const variants = srpVariants(['dago'], registry)
    expect(variants.map((v) => v.axis)).toEqual([
      'tag',
      'tag',
      'price',
      'price',
      'rating',
      'rating',
      'rating',
    ])
    expect(variants.every((v) => v.splat.startsWith('dago/'))).toBe(true)
    expect(variants[0]).toEqual({
      axis: 'tag',
      slug: 'wfc-friendly',
      splat: 'dago/wfc-friendly',
    })
  })

  it('drops the tag axis (at cap) and only offers price + rating after a tag', () => {
    expect(srpVariants(['dago', 'wfc-friendly'], registry)).toEqual([
      {
        axis: 'price',
        slug: 'budget-price',
        splat: 'dago/wfc-friendly/budget-price',
      },
      {
        axis: 'price',
        slug: 'premium-price',
        splat: 'dago/wfc-friendly/premium-price',
      },
      {
        axis: 'rating',
        slug: 'quiet-noise',
        splat: 'dago/wfc-friendly/quiet-noise',
      },
      {
        axis: 'rating',
        slug: 'loud-noise',
        splat: 'dago/wfc-friendly/loud-noise',
      },
      {
        axis: 'rating',
        slug: 'fast-wifi',
        splat: 'dago/wfc-friendly/fast-wifi',
      },
    ])
  })

  it('only offers rating after a price (tag would insert before price, not append)', () => {
    expect(srpVariants(['budget-price'], registry)).toEqual([
      {
        axis: 'rating',
        slug: 'quiet-noise',
        splat: 'budget-price/quiet-noise',
      },
      { axis: 'rating', slug: 'loud-noise', splat: 'budget-price/loud-noise' },
      { axis: 'rating', slug: 'fast-wifi', splat: 'budget-price/fast-wifi' },
    ])
  })

  it('offers no variants once a rating is present (rating is the last axis and at cap)', () => {
    expect(srpVariants(['dago', 'quiet-noise'], registry)).toEqual([])
    expect(
      srpVariants(['dago', 'wfc-friendly', 'quiet-noise'], registry),
    ).toEqual([])
  })
})

describe('buildSrpContent', () => {
  it('builds variants, crumbs and blurb for a location + tag path', () => {
    const content = buildSrpContent(['dago', 'wfc-friendly'], options)

    expect(content.variants).toEqual([
      {
        name: 'Budget',
        type: 'price',
        url: 'dago/wfc-friendly/budget-price',
        typeLabel: undefined,
      },
      {
        name: 'Premium',
        type: 'price',
        url: 'dago/wfc-friendly/premium-price',
        typeLabel: undefined,
      },
      {
        name: 'Quiet',
        type: 'noise',
        url: 'dago/wfc-friendly/quiet-noise',
        typeLabel: 'Noise Level',
      },
      {
        name: 'Loud',
        type: 'noise',
        url: 'dago/wfc-friendly/loud-noise',
        typeLabel: 'Noise Level',
      },
      {
        name: 'Fast',
        type: 'wifi',
        url: 'dago/wfc-friendly/fast-wifi',
        typeLabel: 'WiFi Quality',
      },
    ])

    expect(content.crumbs).toEqual([
      { name: 'explore', type: 'explore', url: '' },
      { name: 'dago', type: 'location', url: 'dago', typeLabel: undefined },
      {
        name: 'WFC Friendly',
        type: 'tag',
        url: 'dago/wfc-friendly',
        typeLabel: undefined,
      },
    ])

    expect(content.blurb).toEqual([
      {
        name: 'WFC Friendly',
        type: 'tag',
        body: 'Great for working from cafe.',
      },
    ])
  })

  it('builds a blurb from a rating bucket long_description', () => {
    const content = buildSrpContent(['quiet-noise'], options)
    expect(content.blurb).toEqual([
      { name: 'Quiet', type: 'noise', body: 'A calm and quiet spot.' },
    ])
  })

  it('emits no blurb for a filter that lacks descriptive copy', () => {
    expect(buildSrpContent(['pet-friendly'], options).blurb).toEqual([])
  })

  // NOTE: The interface/function comments say blurb is "tag/rating only", but
  // the implementation also stores price-tier long_description in descBySlug, so
  // a price segment with a long_description DOES produce a blurb entry. Asserting
  // the actual (current) behavior.
  it('also emits a blurb for a price tier that has a long_description', () => {
    expect(buildSrpContent(['budget-price'], options).blurb).toEqual([
      { name: 'Budget', type: 'price', body: 'Easy on the wallet.' },
    ])
  })

  it('degrades gracefully when options are absent', () => {
    const content = buildSrpContent(['dago', 'wfc-friendly'])
    expect(content.variants).toEqual([])
    expect(content.crumbs).toEqual([
      { name: 'explore', type: 'explore', url: '' },
      { name: 'dago', type: 'location', url: 'dago', typeLabel: undefined },
      // No metadata → slug name, 'location' type fallback (even for a real tag).
      {
        name: 'wfc-friendly',
        type: 'location',
        url: 'dago/wfc-friendly',
        typeLabel: undefined,
      },
    ])
    expect(content.blurb).toEqual([])
  })

  it('returns only the explore crumb (plus all root variants) for an empty path', () => {
    const content = buildSrpContent([], options)
    expect(content.crumbs).toEqual([
      { name: 'explore', type: 'explore', url: '' },
    ])
    expect(content.variants).toHaveLength(7)
    expect(content.blurb).toEqual([])
  })
})
