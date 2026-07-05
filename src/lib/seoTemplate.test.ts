import { describe, it, expect } from 'vitest'
import {
  prettifySlug,
  formatSrpLabel,
  srpLocationClause,
  buildExploreH1,
  buildExploreMeta,
} from '@/lib/seoTemplate'
import type { SrpItem } from '@/lib/srp'

// A fake t: the real i18n is not loaded here, so we drive the assertions off a
// small lookup map. This lets us verify the composition/ordering logic with
// readable English-ish words while the `locale` arg (not t) drives word order.
const dict: Record<string, string> = {
  'explore.priceCheap': 'Cheap',
  'explore.breadcrumb.explore': 'Explore',
  'explore.in': 'in',
  'explore.h1.with': 'with',
  'explore.h1.cafe': 'cafe',
  'explore.meta.cafes': 'cafes',
  'explore.meta.descLead': 'Discover the best',
  'explore.meta.descTail': 'Updated daily.',
  brand: 'BDGCafé',
}
const t = (key: string): string => dict[key] ?? key

// Reusable crumbs for the "all filters" cases. Note: the explore root + the
// location crumb are present but never feed the filter phrase — filterParts only
// pulls price/tag/rating, and location is carried by the locationClause arg.
const allFilterCrumbs: SrpItem[] = [
  { name: 'explore', type: 'explore', url: '' },
  { name: 'dago', type: 'location', url: 'dago' },
  { name: 'WFH Friendly', type: 'tag', url: 'dago/wfh-friendly' },
  { name: 'cheap', type: 'price', url: 'dago/wfh-friendly/cheap' },
  {
    name: 'Quiet',
    type: 'noise',
    url: 'dago/wfh-friendly/cheap/quiet-noise',
    typeLabel: 'Noise Level',
  },
]

describe('prettifySlug', () => {
  it('title-cases a single-word slug', () => {
    expect(prettifySlug('dago')).toBe('Dago')
  })

  it('title-cases each hyphen-separated word', () => {
    expect(prettifySlug('hangout-vibe')).toBe('Hangout Vibe')
  })

  it('handles slugs with more than two words', () => {
    expect(prettifySlug('a-b-c')).toBe('A B C')
  })

  it('uppercases a single character', () => {
    expect(prettifySlug('a')).toBe('A')
  })

  it('leaves an already-capitalized word unchanged', () => {
    expect(prettifySlug('Dago')).toBe('Dago')
  })

  it('returns an empty string for an empty slug', () => {
    expect(prettifySlug('')).toBe('')
  })

  it('only touches the first letter of each word (preserves the rest)', () => {
    expect(prettifySlug('gedung-sate')).toBe('Gedung Sate')
  })
})

describe('formatSrpLabel', () => {
  it('price → the localized cheap label (ignores name)', () => {
    expect(formatSrpLabel({ name: 'anything', type: 'price' }, t, 'en')).toBe(
      'Cheap',
    )
  })

  it('explore root → the localized Explore label', () => {
    expect(formatSrpLabel({ name: 'explore', type: 'explore' }, t, 'en')).toBe(
      'Explore',
    )
  })

  it('location → the title-cased slug', () => {
    expect(
      formatSrpLabel({ name: 'gedung-sate', type: 'location' }, t, 'en'),
    ).toBe('Gedung Sate')
  })

  it('tag → the name as-is', () => {
    expect(formatSrpLabel({ name: 'WFH Friendly', type: 'tag' }, t, 'en')).toBe(
      'WFH Friendly',
    )
  })

  describe('rating category (default branch)', () => {
    const rating = { name: 'Quiet', type: 'noise', typeLabel: 'Noise Level' }

    it('EN order is "<name> <typeLabel>"', () => {
      expect(formatSrpLabel(rating, t, 'en')).toBe('Quiet Noise Level')
    })

    it('ID order is "<typeLabel> <name>"', () => {
      expect(formatSrpLabel(rating, t, 'id')).toBe('Noise Level Quiet')
    })

    it('falls back to prettifySlug(type) when typeLabel is absent (EN)', () => {
      expect(
        formatSrpLabel({ name: 'Quiet', type: 'noise-level' }, t, 'en'),
      ).toBe('Quiet Noise Level')
    })

    it('falls back to prettifySlug(type) when typeLabel is absent (ID)', () => {
      expect(
        formatSrpLabel({ name: 'Quiet', type: 'noise-level' }, t, 'id'),
      ).toBe('Noise Level Quiet')
    })

    it('treats any non-known type as a rating category', () => {
      // 'vibe' is not price/explore/location/tag → rating branch.
      expect(formatSrpLabel({ name: 'Hangout', type: 'vibe' }, t, 'en')).toBe(
        'Hangout Vibe',
      )
    })
  })
})

describe('srpLocationClause', () => {
  it('prefixes a leading space when the backend supplies a formatted name', () => {
    // The backend name already carries its own preposition (e.g. "in Dago").
    expect(srpLocationClause('in Dago', t)).toBe(' in Dago')
    expect(srpLocationClause('near Gedung Sate', t)).toBe(' near Gedung Sate')
  })

  it('defaults to " in Bandung" when unfocused (empty name)', () => {
    expect(srpLocationClause('', t)).toBe(' in Bandung')
  })
})

describe('buildExploreH1', () => {
  it('bare /explore reads "Cafe in Bandung" (no filters, capitalized)', () => {
    const clause = srpLocationClause('', t) // ' in Bandung'
    expect(buildExploreH1([], clause, t, 'en')).toBe('Cafe in Bandung')
  })

  it('capitalizes the first letter even when the leading word is the lowercase noun', () => {
    // Only the explore root crumb → no filter parts → phrase is just the noun.
    const crumbs: SrpItem[] = [{ name: 'explore', type: 'explore', url: '' }]
    expect(buildExploreH1(crumbs, ' in Bandung', t, 'en')).toBe(
      'Cafe in Bandung',
    )
  })

  it('EN ordering: "<price> <tag> cafe with <rating><locationClause>"', () => {
    expect(buildExploreH1(allFilterCrumbs, ' in Dago', t, 'en')).toBe(
      'Cheap WFH Friendly cafe with Quiet Noise Level in Dago',
    )
  })

  it('ID ordering: "Cafe <price> <tag> with <rating><locationClause>"', () => {
    expect(buildExploreH1(allFilterCrumbs, ' in Dago', t, 'id')).toBe(
      'Cafe Cheap WFH Friendly with Noise Level Quiet in Dago',
    )
  })

  it('omits absent filter parts (rating-only, EN)', () => {
    const crumbs: SrpItem[] = [
      { name: 'explore', type: 'explore', url: '' },
      { name: 'Quiet', type: 'noise', url: 'quiet-noise', typeLabel: 'Noise' },
    ]
    expect(buildExploreH1(crumbs, ' in Bandung', t, 'en')).toBe(
      'Cafe with Quiet Noise in Bandung',
    )
  })

  it('keeps an already-capitalized leading filter word unchanged', () => {
    const crumbs: SrpItem[] = [
      { name: 'explore', type: 'explore', url: '' },
      { name: 'cheap', type: 'price', url: 'cheap' },
    ]
    expect(buildExploreH1(crumbs, ' in Bandung', t, 'en')).toBe(
      'Cheap cafe in Bandung',
    )
  })
})

describe('buildExploreMeta', () => {
  it('bare /explore: title is "Cafe in Bandung | <brand>"', () => {
    const { title } = buildExploreMeta([], '', t, 'en')
    expect(title).toBe('Cafe in Bandung | BDGCafé')
  })

  it('bare /explore: description folds lead + cafes noun + clause + tail', () => {
    const { description } = buildExploreMeta([], '', t, 'en')
    expect(description).toBe(
      'Discover the best cafes in Bandung. Updated daily.',
    )
  })

  it('with a filter + backend location name (EN): title mirrors H1 + brand', () => {
    const crumbs: SrpItem[] = [
      { name: 'explore', type: 'explore', url: '' },
      { name: 'cheap', type: 'price', url: 'cheap' },
    ]
    const { title } = buildExploreMeta(crumbs, 'near Gedung Sate', t, 'en')
    expect(title).toBe('Cheap cafe near Gedung Sate | BDGCafé')
  })

  it('with a filter + backend location name (EN): description uses the cafes noun', () => {
    const crumbs: SrpItem[] = [
      { name: 'explore', type: 'explore', url: '' },
      { name: 'cheap', type: 'price', url: 'cheap' },
    ]
    const { description } = buildExploreMeta(
      crumbs,
      'near Gedung Sate',
      t,
      'en',
    )
    expect(description).toBe(
      'Discover the best Cheap cafes near Gedung Sate. Updated daily.',
    )
  })

  it('ID ordering flows through into both title and description', () => {
    const { title, description } = buildExploreMeta(
      allFilterCrumbs,
      'in Dago',
      t,
      'id',
    )
    expect(title).toBe(
      'Cafe Cheap WFH Friendly with Noise Level Quiet in Dago | BDGCafé',
    )
    expect(description).toBe(
      'Discover the best cafes Cheap WFH Friendly with Noise Level Quiet in Dago. Updated daily.',
    )
  })
})
