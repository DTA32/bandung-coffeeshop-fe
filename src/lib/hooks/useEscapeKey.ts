import { useEffect } from 'react'

// Calls `onEscape` when Escape is pressed anywhere on the page, while enabled.
export function useEscapeKey(onEscape: () => void, enabled = true) {
  useEffect(() => {
    if (!enabled) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onEscape()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onEscape, enabled])
}
