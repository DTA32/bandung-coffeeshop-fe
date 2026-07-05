import { describe, it, expect } from 'vitest'
import {
  SITE_URL,
  SITE_NAME,
  localizedPath,
  cafeCrumbs,
  breadcrumbJsonLd,
  cafeJsonLd,
  cafeItemListJsonLd,
} from '@/lib/seo'
import type { Crumb } from '@/lib/seo'
import type { CafeData, CafeReview } from '@/lib/api/cafe'
import type { CafeListing } from '@/lib/api/search'
import type { Location } from '@/lib/type'

// A fake translator that echoes the key, so we can assert WHICH key each
// static crumb resolves to without coupling to the real translation copy.
const t = (key: string) => `[${key}]`

function makeLocation(
  over: Partial<Location> & Pick<Location, 'id' | 'name'>,
): Location {
  return { type: 'area', thumbnail: null, ...over }
}

// Minimal CafeData fixture: every conditional field defaults to "off" so each
// test can opt a field in explicitly.
function makeCafe(over: Partial<CafeData> = {}): CafeData {
  return {
    id: 'kopi-anjis',
    name: 'Kopi Anjis',
    description: null,
    status: 'active',
    images: [],
    instagram: null,
    open_hour: null,
    close_hour: null,
    gmaps_id: null,
    locations: [],
    price: {
      price_range_min: null,
      price_range_max: null,
      coffee_price_min: null,
      coffee_price_max: null,
      snack_price_min: null,
      snack_price_max: null,
      food_price_min: null,
      food_price_max: null,
      rank: null,
    },
    ...over,
  }
}

function makeReview(over: Partial<CafeReview> = {}): CafeReview {
  return {
    is_subjective: false,
    overall_score: null,
    wfc_score: null,
    tags: [],
    content: null,
    visited_at: null,
    updated_at: '2026-01-01T00:00:00Z',
    ratings: {},
    ...over,
  }
}

function makeListing(
  over: Partial<CafeListing> & Pick<CafeListing, 'id' | 'name'>,
): CafeListing {
  return {
    description: '',
    thumbnail: null,
    area: null,
    price_range: null,
    distance: null,
    remark: null,
    ...over,
  }
}

describe('localizedPath', () => {
  it('maps the home path to the locale prefix for en, bare slash for id', () => {
    expect(localizedPath('en', '/')).toBe('/en')
    expect(localizedPath('id', '/')).toBe('/')
  })

  it('prefixes non-root paths with /en for English', () => {
    expect(localizedPath('en', '/explore')).toBe('/en/explore')
    expect(localizedPath('en', '/cafe/kopi-anjis')).toBe('/en/cafe/kopi-anjis')
  })

  it('leaves non-root paths bare for Indonesian', () => {
    expect(localizedPath('id', '/explore')).toBe('/explore')
    expect(localizedPath('id', '/cafe/kopi-anjis')).toBe('/cafe/kopi-anjis')
  })
})

describe('cafeCrumbs', () => {
  const locations: Location[] = [
    makeLocation({
      id: 'bandung-kota',
      name: 'Bandung Kota',
      type: 'district',
    }),
    makeLocation({ id: 'dago', name: 'Dago', type: 'area' }),
  ]

  it('builds Home › Explore › ancestor chain › cafe in order (en)', () => {
    const cafe = makeCafe({ id: 'kopi-anjis', name: 'Kopi Anjis', locations })
    const crumbs = cafeCrumbs(cafe, t, 'en')

    expect(crumbs).toEqual<Crumb[]>([
      { name: '[explore.breadcrumb.home]', path: '/en' },
      { name: '[explore.breadcrumb.explore]', path: '/en/explore' },
      { name: 'Bandung Kota', path: '/en/explore/bandung-kota' },
      { name: 'Dago', path: '/en/explore/bandung-kota/dago' },
      { name: 'Kopi Anjis', path: '/en/cafe/kopi-anjis' },
    ])
  })

  it('uses bare (Indonesian) paths for the id locale', () => {
    const cafe = makeCafe({ id: 'kopi-anjis', name: 'Kopi Anjis', locations })
    const crumbs = cafeCrumbs(cafe, t, 'id')

    expect(crumbs).toEqual<Crumb[]>([
      { name: '[explore.breadcrumb.home]', path: '/' },
      { name: '[explore.breadcrumb.explore]', path: '/explore' },
      { name: 'Bandung Kota', path: '/explore/bandung-kota' },
      { name: 'Dago', path: '/explore/bandung-kota/dago' },
      { name: 'Kopi Anjis', path: '/cafe/kopi-anjis' },
    ])
  })

  it('accumulates ancestor ids into the splat for each location crumb', () => {
    const cafe = makeCafe({
      locations: [
        makeLocation({ id: 'a', name: 'A' }),
        makeLocation({ id: 'b', name: 'B' }),
        makeLocation({ id: 'c', name: 'C' }),
      ],
    })
    const crumbs = cafeCrumbs(cafe, t, 'id')
    // Locations occupy indices 2..4 (after Home + Explore).
    expect(crumbs[2].path).toBe('/explore/a')
    expect(crumbs[3].path).toBe('/explore/a/b')
    expect(crumbs[4].path).toBe('/explore/a/b/c')
  })

  it('still emits Home › Explore › cafe when the cafe has no locations', () => {
    const cafe = makeCafe({ id: 'solo-cafe', name: 'Solo Cafe', locations: [] })
    const crumbs = cafeCrumbs(cafe, t, 'en')

    expect(crumbs).toHaveLength(3)
    expect(crumbs[2]).toEqual({ name: 'Solo Cafe', path: '/en/cafe/solo-cafe' })
  })
})

describe('breadcrumbJsonLd', () => {
  const crumbs: Crumb[] = [
    { name: 'Home', path: '/en' },
    { name: 'Explore', path: '/en/explore' },
    { name: 'Kopi Anjis', path: '/en/cafe/kopi-anjis' },
  ]

  it('emits a BreadcrumbList with 1-based positions and absolute item urls', () => {
    const node = breadcrumbJsonLd(crumbs)

    expect(node).toMatchObject({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: `${SITE_URL}/en`,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Explore',
          item: `${SITE_URL}/en/explore`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Kopi Anjis',
          item: `${SITE_URL}/en/cafe/kopi-anjis`,
        },
      ],
    })
  })

  it('produces an empty itemListElement for no crumbs', () => {
    expect(breadcrumbJsonLd([])).toMatchObject({
      '@type': 'BreadcrumbList',
      itemListElement: [],
    })
  })
})

describe('cafeJsonLd', () => {
  const canonicalPath = '/en/cafe/kopi-anjis'

  it('emits the base place node with locality from the last location', () => {
    const cafe = makeCafe({
      locations: [
        makeLocation({ id: 'bandung-kota', name: 'Bandung Kota' }),
        makeLocation({ id: 'dago', name: 'Dago' }),
      ],
    })
    const node = cafeJsonLd(cafe, makeReview(), canonicalPath)

    expect(node).toMatchObject({
      '@context': 'https://schema.org',
      '@type': 'CafeOrCoffeeShop',
      name: 'Kopi Anjis',
      url: `${SITE_URL}${canonicalPath}`,
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Dago',
        addressRegion: 'Bandung',
        addressCountry: 'ID',
      },
    })
  })

  it('falls back to Bandung locality when the cafe has no locations', () => {
    const node = cafeJsonLd(
      makeCafe({ locations: [] }),
      makeReview(),
      canonicalPath,
    )
    expect(node).toMatchObject({
      address: { addressLocality: 'Bandung' },
    })
  })

  it('omits optional fields when the underlying data is absent', () => {
    const cafe = makeCafe({
      images: [],
      instagram: null,
      open_hour: null,
      close_hour: null,
    })
    const node = cafeJsonLd(
      cafe,
      makeReview({ overall_score: null }),
      canonicalPath,
    ) as Record<string, unknown>

    expect(node).not.toHaveProperty('image')
    expect(node).not.toHaveProperty('sameAs')
    expect(node).not.toHaveProperty('priceRange')
    expect(node).not.toHaveProperty('openingHoursSpecification')
    expect(node).not.toHaveProperty('aggregateRating')
    expect(node).not.toHaveProperty('review')
  })

  it('includes image, sameAs (instagram) and priceRange when present', () => {
    const cafe = makeCafe({
      images: [{ url: 'https://cdn.example/img.jpg', description: 'front' }],
      instagram: 'kopianjis',
      price: { ...makeCafe().price, rank: { type: 2, label: '$$' } },
    })
    const node = cafeJsonLd(cafe, makeReview(), canonicalPath)

    expect(node).toMatchObject({
      image: 'https://cdn.example/img.jpg',
      sameAs: 'https://www.instagram.com/kopianjis',
      priceRange: '$$',
    })
  })

  it('emits openingHoursSpecification with the real hours for a normal schedule', () => {
    const cafe = makeCafe({ open_hour: '08:00', close_hour: '22:00' })
    const node = cafeJsonLd(cafe, makeReview(), canonicalPath)

    expect(node).toMatchObject({
      openingHoursSpecification: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
          'Sunday',
        ],
        opens: '08:00',
        closes: '22:00',
      },
    })
  })

  it('treats equal open/close hours as a 24h schedule (00:00 → 23:59)', () => {
    const cafe = makeCafe({ open_hour: '10:00', close_hour: '10:00' })
    const node = cafeJsonLd(cafe, makeReview(), canonicalPath)

    expect(node).toMatchObject({
      openingHoursSpecification: { opens: '00:00', closes: '23:59' },
    })
  })

  it('adds aggregateRating and review only when overall_score is a number', () => {
    const cafe = makeCafe()
    const node = cafeJsonLd(
      cafe,
      makeReview({ overall_score: 4.5 }),
      canonicalPath,
    )

    expect(node).toMatchObject({
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: 4.5,
        bestRating: 5,
        worstRating: 0,
        ratingCount: 1,
        reviewCount: 1,
      },
      review: {
        '@type': 'Review',
        reviewRating: {
          '@type': 'Rating',
          ratingValue: 4.5,
          bestRating: 5,
          worstRating: 0,
        },
        author: { '@type': 'Organization', name: SITE_NAME },
      },
    })
  })

  it('treats a zero overall_score as present (!= null guard, not falsy)', () => {
    const node = cafeJsonLd(
      makeCafe(),
      makeReview({ overall_score: 0 }),
      canonicalPath,
    ) as Record<string, unknown>
    expect(node).toHaveProperty('aggregateRating')
    expect(node).toMatchObject({ aggregateRating: { ratingValue: 0 } })
  })
})

describe('cafeItemListJsonLd', () => {
  const cafes: CafeListing[] = [
    makeListing({ id: 'first', name: 'First Cafe' }),
    makeListing({ id: 'second', name: 'Second Cafe' }),
  ]

  it('builds an ordered ItemList with locale-prefixed absolute urls (en)', () => {
    const node = cafeItemListJsonLd(cafes, 'en')

    expect(node).toMatchObject({
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          url: `${SITE_URL}/en/cafe/first`,
          name: 'First Cafe',
        },
        {
          '@type': 'ListItem',
          position: 2,
          url: `${SITE_URL}/en/cafe/second`,
          name: 'Second Cafe',
        },
      ],
    })
  })

  it('uses bare cafe urls for the id locale', () => {
    const node = cafeItemListJsonLd(cafes, 'id')
    expect(node).toMatchObject({
      itemListElement: [
        { position: 1, url: `${SITE_URL}/cafe/first` },
        { position: 2, url: `${SITE_URL}/cafe/second` },
      ],
    })
  })

  it('emits an empty list for no cafes', () => {
    expect(cafeItemListJsonLd([], 'en')).toMatchObject({
      '@type': 'ItemList',
      itemListElement: [],
    })
  })
})
