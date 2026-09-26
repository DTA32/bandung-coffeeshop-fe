import { useSyncExternalStore } from 'react'

// Keep in sync with the pre-paint script in `src/routes/__root.tsx`: a missing
// key means "follow the device", 'light' / 'dark' is an explicit choice.
const STORAGE_KEY = 'theme'
const DARK_QUERY = '(prefers-color-scheme: dark)'

export type ThemePreference = 'system' | 'light' | 'dark'

// In-memory copy so the choice still works for the session when localStorage
// is unavailable (private mode, disabled cookies). Loaded lazily on the client.
let preference: ThemePreference | null = null
const listeners = new Set<() => void>()

function readStoredPreference(): ThemePreference {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored === 'light' || stored === 'dark' ? stored : 'system'
  } catch {
    return 'system'
  }
}

function getPreference(): ThemePreference {
  preference ??= readStoredPreference()
  return preference
}

function systemPrefersDark() {
  return window.matchMedia(DARK_QUERY).matches
}

function applyTheme(pref: ThemePreference) {
  const dark = pref === 'system' ? systemPrefersDark() : pref === 'dark'
  document.documentElement.classList.toggle('dark', dark)
}

function subscribeToPreference(onChange: () => void) {
  listeners.add(onChange)
  // While following the device, track OS theme changes live.
  const mql = window.matchMedia(DARK_QUERY)
  const onSystemChange = () => {
    if (getPreference() === 'system') applyTheme('system')
  }
  mql.addEventListener('change', onSystemChange)
  return () => {
    listeners.delete(onChange)
    mql.removeEventListener('change', onSystemChange)
  }
}

// Re-renders whenever the `dark` class on <html> flips, regardless of which
// component (or the pre-paint script) flipped it. SSR renders as light.
function subscribeToThemeClass(onChange: () => void) {
  const observer = new MutationObserver(onChange)
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  })
  return () => observer.disconnect()
}

export function useIsDark() {
  return useSyncExternalStore(
    subscribeToThemeClass,
    () => document.documentElement.classList.contains('dark'),
    () => false,
  )
}

export function useTheme() {
  const current = useSyncExternalStore(
    subscribeToPreference,
    getPreference,
    (): ThemePreference => 'system',
  )
  const isDark = useIsDark()

  const setPreference = (next: ThemePreference) => {
    preference = next
    try {
      if (next === 'system') localStorage.removeItem(STORAGE_KEY)
      else localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // localStorage may be unavailable (private mode, disabled cookies)
    }
    applyTheme(next)
    listeners.forEach((l) => l())
  }

  // system → the opposite of the device theme → the device theme (explicitly)
  // → system, so the first click always changes what the user sees. While on
  // 'system' (always the case during SSR/hydration) isDark *is* the device
  // theme, so matchMedia is only read once an explicit choice exists.
  let next: ThemePreference
  if (current === 'system') next = isDark ? 'light' : 'dark'
  else if (current === (systemPrefersDark() ? 'dark' : 'light')) next = 'system'
  else next = current === 'dark' ? 'light' : 'dark'

  return { preference: current, isDark, next, setPreference }
}
