import type { Locale } from '@/i18n'

export const API_BASE =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

// langHeaders builds the request headers carrying the active locale to the
// backend for content negotiation. Locale is sent via the Accept-Language
// header (not a query param). Omitting it lets the backend apply its default.
export function langHeaders(lang?: Locale): HeadersInit | undefined {
  return lang ? { 'Accept-Language': lang } : undefined
}
