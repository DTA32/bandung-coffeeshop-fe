import { createIsomorphicFn } from '@tanstack/react-start'
import type { Locale } from '@/i18n'

const PUBLIC_API_BASE =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

export const apiBase = createIsomorphicFn()
  .server(() => process.env.API_INTERNAL_URL || PUBLIC_API_BASE)
  .client(() => PUBLIC_API_BASE)

// langHeaders builds the request headers carrying the active locale to the
// backend for content negotiation. Locale is sent via the Accept-Language
// header (not a query param). Omitting it lets the backend apply its default.
export function langHeaders(lang?: Locale): HeadersInit | undefined {
  return lang ? { 'Accept-Language': lang } : undefined
}

export interface ApiFetchInit extends RequestInit {
  lang?: Locale
  params?: URLSearchParams
}

// apiFetch is the single entry point for backend calls: it resolves the
// runtime-appropriate origin and attaches the locale header. `path` is the
// API path (e.g. '/v1/filters'); `params` is appended as the query string.
export function apiFetch(
  path: string,
  { lang, params, headers, ...init }: ApiFetchInit = {},
): Promise<Response> {
  const query = params?.toString()
  const url = `${apiBase()}${path}${query ? `?${query}` : ''}`
  return fetch(url, {
    ...init,
    headers: { ...langHeaders(lang), ...headers },
  })
}
