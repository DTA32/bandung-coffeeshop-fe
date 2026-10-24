import type { HourRange } from '@/lib/api/cafe'

// Open 24 hours is stored as 00:00–23:59.
export function isAllDay(range: HourRange): boolean {
  return range.open === '00:00' && range.close === '23:59'
}

// "08:00 - 14:00, 17:00 - 22:00": split ranges joined with ", ".
export function formatRanges(ranges: HourRange[]): string {
  return ranges.map((r) => `${r.open} - ${r.close}`).join(', ')
}
