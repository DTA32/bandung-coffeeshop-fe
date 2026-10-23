import { useEffect } from 'react'
import type { RefObject } from 'react'

// Calls `onOutside` when a pointer goes down outside `ref`, while enabled.
// Used to dismiss popovers.
export function useClickOutside(
  ref: RefObject<HTMLElement | null>,
  onOutside: () => void,
  enabled = true,
) {
  useEffect(() => {
    if (!enabled) return
    function handlePointer(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onOutside()
    }
    document.addEventListener('pointerdown', handlePointer)
    return () => document.removeEventListener('pointerdown', handlePointer)
  }, [ref, onOutside, enabled])
}
