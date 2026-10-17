import { PUBLIC_API_BASE, apiFetch } from '@/lib/api'
import type { ApiResponse } from '@/lib/type'

export interface Me {
  id: string
  name: string
  email: string
  avatar_url: string | null
}

export type AuthProvider = 'google'

// getMe returns the logged-in user from the session cookie, or null when there
// is no (valid) session. Browser-only: the cookie never reaches SSR.
export async function getMe(): Promise<Me | null> {
  const res = await apiFetch('/v1/me')
  if (res.status === 401) return null
  if (!res.ok) throw new Error(`Failed to load session: ${res.status}`)
  const body: ApiResponse<Me> = await res.json()
  return body.data
}

export async function logout(): Promise<void> {
  const res = await apiFetch('/v1/auth/logout', { method: 'POST' })
  if (!res.ok) throw new Error(`Failed to log out: ${res.status}`)
}

// loginUrl is the backend OAuth entry point on the public (browser-facing) API
// origin. It is a full-page navigation: the backend bounces through the
// provider and lands back on `redirect` (a site-relative path + query).
export function loginUrl(provider: AuthProvider, redirect: string): string {
  return `${PUBLIC_API_BASE}/v1/auth/${provider}?redirect=${encodeURIComponent(redirect)}`
}
