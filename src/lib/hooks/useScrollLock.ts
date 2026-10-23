import { useEffect } from 'react'

// Stops the page behind an overlay from scrolling while enabled; restores the
// previous overflow value on release.
export function useScrollLock(enabled = true) {
  useEffect(() => {
    if (!enabled) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [enabled])
}
