import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { useRouter } from '@tanstack/react-router'
import { getMe, logout as apiLogout } from '@/lib/api/auth'
import type { Me } from '@/lib/api/auth'
import LoginModal from '@/components/auth/LoginModal'
import type { LoginError } from '@/components/auth/LoginModal'

export type AuthStatus = 'loading' | 'anon' | 'user'

export interface LoginOptions {
  cafeName?: string
  // 'review' sends the user back with `review=open` so the page can reopen
  // the review flow after login.
  intent?: 'review'
}

export interface AuthContextValue {
  status: AuthStatus
  me: Me | null
  logout: () => Promise<void>
  openLogin: (options?: LoginOptions) => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

const AUTH_ERRORS: ReadonlyArray<LoginError> = ['deactivated', 'failed']

type LoginState = LoginOptions & { error?: LoginError }

// AuthProvider owns the session state for the whole app. Pages are SSR'd and
// prerendered anonymously, so every render starts as 'loading' and the session
// is resolved in the browser after hydration; any failure (no backend, 401,
// network) just means 'anon'. It also hosts the single login modal.
export default function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [status, setStatus] = useState<AuthStatus>('loading')
  const [me, setMe] = useState<Me | null>(null)
  const [login, setLogin] = useState<LoginState | null>(null)

  useEffect(() => {
    let cancelled = false
    getMe()
      .then((user) => {
        if (cancelled) return
        setMe(user)
        setStatus(user ? 'user' : 'anon')
      })
      .catch(() => {
        if (!cancelled) setStatus('anon')
      })
    return () => {
      cancelled = true
    }
  }, [])

  // A failed OAuth round-trip lands back here with `auth_error`: reopen the
  // modal in that state and drop the param so a reload doesn't repeat it.
  useEffect(() => {
    const { pathname, search, hash } = window.location
    const params = new URLSearchParams(search)
    const error = params.get('auth_error') as LoginError | null
    if (!error || !AUTH_ERRORS.includes(error)) return
    setLogin({ error })
    params.delete('auth_error')
    const query = params.toString()
    void router.navigate({
      href: `${pathname}${query ? `?${query}` : ''}${hash}`,
      replace: true,
    })
  }, [router])

  const logout = useCallback(async () => {
    try {
      await apiLogout()
      setMe(null)
      setStatus('anon')
    } catch {
      // Session is still valid server-side; keep showing the user.
    }
  }, [])

  const openLogin = useCallback((options: LoginOptions = {}) => {
    setLogin(options)
  }, [])

  const closeLogin = useCallback(() => setLogin(null), [])

  const value = useMemo(
    () => ({ status, me, logout, openLogin }),
    [status, me, logout, openLogin],
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
      <LoginModal
        open={login !== null}
        onClose={closeLogin}
        cafeName={login?.cafeName}
        intent={login?.intent}
        error={login?.error}
      />
    </AuthContext.Provider>
  )
}
