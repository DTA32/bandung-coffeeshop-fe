import { describe, it, expect, vi } from 'vitest'
import {
  encodeMarker,
  decodeMarker,
  randomGreenHex,
} from '@/components/map/markers'
import type { UserMarker } from '@/components/map/markers'
import { COLORS } from '@/lib/colors'

const DEFAULT_NAME = 'Pin'

describe('encodeMarker', () => {
  it('strips the leading # from the color', () => {
    const m: UserMarker = {
      id: 'm-0',
      lat: -6.9,
      lng: 107.6,
      name: 'Cafe',
      color: '#4a7038',
    }
    const encoded = encodeMarker(m)
    expect(encoded).toBe('-6.9,107.6,4a7038,Cafe')
    expect(encoded).not.toContain('#')
  })

  it('URI-encodes the name (commas become %2C)', () => {
    const m: UserMarker = {
      id: 'm-1',
      lat: 1,
      lng: 2,
      name: 'Hello, World',
      color: '#4a7038',
    }
    const encoded = encodeMarker(m)
    expect(encoded).toBe('1,2,4a7038,Hello%2C%20World')
  })
})

describe('decodeMarker', () => {
  describe('coordinates', () => {
    it('parses finite lat/lng into numbers', () => {
      const result = decodeMarker('-6.9,107.6,4a7038,Cafe', 3, DEFAULT_NAME)
      expect(result).not.toBeNull()
      expect(result?.lat).toBe(-6.9)
      expect(result?.lng).toBe(107.6)
    })

    it('returns null for malformed coords', () => {
      expect(decodeMarker('abc,def', 0, DEFAULT_NAME)).toBeNull()
    })

    it('returns null when lat is non-numeric but lng is fine', () => {
      expect(decodeMarker('abc,107.6,4a7038,Cafe', 0, DEFAULT_NAME)).toBeNull()
    })

    it('returns null when lng is non-numeric but lat is fine', () => {
      expect(decodeMarker('-6.9,def,4a7038,Cafe', 0, DEFAULT_NAME)).toBeNull()
    })
  })

  describe('color', () => {
    it('accepts a valid 6-char hex and re-adds the #', () => {
      const result = decodeMarker('1,2,4a7038,Cafe', 0, DEFAULT_NAME)
      expect(result?.color).toBe('#4a7038')
    })

    it('accepts uppercase hex', () => {
      const result = decodeMarker('1,2,4A7038,Cafe', 0, DEFAULT_NAME)
      expect(result?.color).toBe('#4A7038')
    })

    it('falls back to COLORS.moss when color is missing', () => {
      const result = decodeMarker('1,2', 0, DEFAULT_NAME)
      expect(result?.color).toBe(COLORS.moss)
    })

    it('falls back to COLORS.moss for a non-hex string', () => {
      const result = decodeMarker('1,2,zzzzzz,Cafe', 0, DEFAULT_NAME)
      expect(result?.color).toBe(COLORS.moss)
    })

    it('falls back to COLORS.moss when hex is too short', () => {
      const result = decodeMarker('1,2,4a703,Cafe', 0, DEFAULT_NAME)
      expect(result?.color).toBe(COLORS.moss)
    })
  })

  describe('name', () => {
    it('uses the decoded name when present', () => {
      const result = decodeMarker('1,2,4a7038,Cafe', 0, DEFAULT_NAME)
      expect(result?.name).toBe('Cafe')
    })

    it('uses defaultName when the name part is missing', () => {
      const result = decodeMarker('1,2,4a7038', 0, DEFAULT_NAME)
      expect(result?.name).toBe(DEFAULT_NAME)
    })

    it('uses defaultName when the name part is blank', () => {
      const result = decodeMarker('1,2,4a7038,', 0, DEFAULT_NAME)
      expect(result?.name).toBe(DEFAULT_NAME)
    })
  })

  describe('id', () => {
    it('builds the id from the index', () => {
      expect(decodeMarker('1,2,4a7038,Cafe', 7, DEFAULT_NAME)?.id).toBe('m-7')
      expect(decodeMarker('1,2,4a7038,Cafe', 0, DEFAULT_NAME)?.id).toBe('m-0')
    })
  })
})

describe('encodeMarker -> decodeMarker round-trip', () => {
  it('preserves lat, lng, color and name', () => {
    const m: UserMarker = {
      id: 'm-99',
      lat: -6.914744,
      lng: 107.60981,
      name: 'My Cafe',
      color: '#4a7038',
    }
    const decoded = decodeMarker(encodeMarker(m), 0, DEFAULT_NAME)
    expect(decoded).not.toBeNull()
    expect(decoded?.lat).toBe(m.lat)
    expect(decoded?.lng).toBe(m.lng)
    expect(decoded?.color).toBe(m.color)
    expect(decoded?.name).toBe(m.name)
  })

  it('preserves a name containing commas', () => {
    const m: UserMarker = {
      id: 'm-0',
      lat: 1,
      lng: 2,
      name: 'Coffee, Tea, and More',
      color: '#6a9e52',
    }
    const decoded = decodeMarker(encodeMarker(m), 4, DEFAULT_NAME)
    expect(decoded?.name).toBe('Coffee, Tea, and More')
    expect(decoded?.color).toBe('#6a9e52')
    expect(decoded?.id).toBe('m-4')
  })

  it('regenerates the id from the index rather than the source id', () => {
    const m: UserMarker = {
      id: 'm-99',
      lat: 1,
      lng: 2,
      name: 'X',
      color: '#4a7038',
    }
    const decoded = decodeMarker(encodeMarker(m), 2, DEFAULT_NAME)
    expect(decoded?.id).toBe('m-2')
  })
})

describe('randomGreenHex', () => {
  it('produces a lowercase 6-digit hex for a range of seeds', () => {
    const seeds = [0, 0.25, 0.5, 0.75, 0.999]
    seeds.forEach((r) => {
      const spy = vi.spyOn(Math, 'random').mockReturnValue(r)
      const hex = randomGreenHex()
      expect(hex).toMatch(/^#[0-9a-f]{6}$/)
      spy.mockRestore()
    })
  })

  it('is deterministic for a fixed seed', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.42)
    const a = randomGreenHex()
    const b = randomGreenHex()
    expect(a).toBe(b)
    expect(a).toMatch(/^#[0-9a-f]{6}$/)
  })
})
