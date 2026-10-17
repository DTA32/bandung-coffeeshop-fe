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
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size) {
      return rtf.format(Math.trunc(seconds / size), unit)
    }
  }
  return rtf.format(0, 'second')
}
