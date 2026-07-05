import { describe, it, expect } from 'vitest'
import {
  localeFromPathname,
  localeParam,
  localePrefix,
  dateLocale,
  toggleLocalePath,
} from '@/lib/locale'

describe('localeFromPathname', () => {
  it('treats /en and /en/* as English', () => {
    expect(localeFromPathname('/en')).toBe('en')
    expect(localeFromPathname('/en/')).toBe('en')
    expect(localeFromPathname('/en/cafe/123')).toBe('en')
  })

  it('treats bare paths as Indonesian', () => {
    expect(localeFromPathname('/')).toBe('id')
    expect(localeFromPathname('/explore')).toBe('id')
    // `/enx` is not the `/en` prefix → Indonesian
    expect(localeFromPathname('/enx')).toBe('id')
  })
})

describe('localeParam', () => {
  it('maps en to the visible param and id to undefined', () => {
    expect(localeParam('en')).toBe('en')
    expect(localeParam('id')).toBeUndefined()
  })
})

describe('localePrefix', () => {
  it('maps en to /en and id to empty', () => {
    expect(localePrefix('en')).toBe('/en')
    expect(localePrefix('id')).toBe('')
  })
})

describe('dateLocale', () => {
  it('maps to Indonesia-region BCP-47 tags', () => {
    expect(dateLocale('en')).toBe('en-ID')
    expect(dateLocale('id')).toBe('id-ID')
  })
})

describe('toggleLocalePath', () => {
  it('strips the /en prefix for English paths', () => {
    expect(toggleLocalePath('/en/explore')).toBe('/explore')
    expect(toggleLocalePath('/en')).toBe('/')
  })

  it('adds the /en prefix for Indonesian paths', () => {
    expect(toggleLocalePath('/explore')).toBe('/en/explore')
    expect(toggleLocalePath('/')).toBe('/en')
  })
})
