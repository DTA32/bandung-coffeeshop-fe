// formatRelativeTime renders "2 days ago" / "2 hari yang lalu" style text.
// It depends on the current time, so only call it on the client after
// hydration: prerendered HTML would otherwise freeze the build time and
// mismatch on hydrate.
const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 365 * 24 * 3600],
  ['month', 30 * 24 * 3600],
  ['week', 7 * 24 * 3600],
  ['day', 24 * 3600],
  ['hour', 3600],
  ['minute', 60],
]

export function formatRelativeTime(
  date: Date,
  locale: string,
  now: Date = new Date(),
): string {
  const seconds = Math.round((date.getTime() - now.getTime()) / 1000)
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size) {
      const n = Math.trunc(seconds / size)
      // 'auto' only for ±1 ("yesterday", "minggu lalu"): beyond that CLDR has
      // locale-specific words like id "kemarin dulu" that read oddly here.
      const numeric = Math.abs(n) <= 1 ? 'auto' : 'always'
      return new Intl.RelativeTimeFormat(locale, { numeric }).format(n, unit)
    }
  }
  return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(
    0,
    'second',
  )
}

// The current year and month in WIB, which is what the API validates
// `visited_at` against.
export function currentMonthWIB(): { year: number; month: number } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: 'numeric',
  }).formatToParts(new Date())
  const get = (type: string) =>
    Number(parts.find((p) => p.type === type)?.value)
  return { year: get('year'), month: get('month') }
}
