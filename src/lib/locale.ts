import { useRouterState } from '@tanstack/react-router'
import { normalizeLocale } from '@/i18n'
import type { Locale } from '@/i18n'

export type { Locale }
export { normalizeLocale }

// localeFromPathname derives the active locale from a URL pathname. English
// lives under the `/en` prefix; everything else (bare paths) is Indonesian.
export function localeFromPathname(pathname: string): Locale {
  return pathname === '/en' || pathname.startsWith('/en/') ? 'en' : 'id'
}

// localeParam maps a locale to the value of the optional `{-$locale}` route
// param: English is the visible `/en` prefix, Indonesian is the bare path
// (param omitted).
export function localeParam(locale: Locale): 'en' | undefined {
  return locale === 'en' ? 'en' : undefined
}

// localePrefix maps a locale to its URL path prefix: `/en` for English, ''
// (bare path) for Indonesian. Use when building a raw URL string; for route
// params use localeParam instead.
export function localePrefix(locale: Locale): string {
  return locale === 'en' ? '/en' : ''
}

// dateLocale maps an app locale to the BCP-47 tag used for date formatting via
// Intl/toLocaleString (both render in the Indonesia region).
export function dateLocale(locale: Locale): string {
  return locale === 'en' ? 'en-ID' : 'id-ID'
}

// useLocale reads the active locale from the current route. Works during SSR and
// client navigation since it derives from the router's location.
export function useLocale(): Locale {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  return localeFromPathname(pathname)
}

// toggleLocalePath returns the same pathname with the `/en` prefix flipped:
// English (`/en/...`) ⇄ Indonesian (bare). Search params are carried separately
// by the caller.
export function toggleLocalePath(pathname: string): string {
  return localeFromPathname(pathname) === 'en'
    ? pathname.replace(/^\/en(?=\/|$)/, '') || '/'
    : '/en' + (pathname === '/' ? '' : pathname)
}
