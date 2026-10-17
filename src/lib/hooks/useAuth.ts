import { useContext } from 'react'
import { AuthContext } from '@/lib/auth/AuthProvider'
import type { AuthContextValue } from '@/lib/auth/AuthProvider'

// useAuth reads the session state and login/logout actions from AuthProvider.
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
