import { useEffect, useState } from 'react'

const STORAGE_KEY = 'theme'

export function useTheme() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'))

    // While the user hasn't made an explicit choice, track the OS preference.
    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (e: MediaQueryListEvent) => {
      if (localStorage.getItem(STORAGE_KEY)) return
      document.documentElement.classList.toggle('dark', e.matches)
      setIsDark(e.matches)
    }
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  const toggle = () => {
    const next = !document.documentElement.classList.contains('dark')
    document.documentElement.classList.toggle('dark', next)
    try {
      localStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light')
    } catch {
      // localStorage may be unavailable (private mode, disabled cookies)
    }
    setIsDark(next)
  }

  return { isDark, toggle }
}
