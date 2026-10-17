import { useEffect } from 'react'
import type { RefObject } from 'react'

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

function focusables(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => el.getClientRects().length > 0,
  )
}

// Keeps Tab / Shift+Tab cycling inside `ref` while enabled. On activation it
// focuses the first focusable element (or the container itself); on release it
// returns focus to whatever was focused before, e.g. the button that opened it.
export function useFocusTrap(
  ref: RefObject<HTMLElement | null>,
  enabled = true,
) {
  useEffect(() => {
    const container = ref.current
    if (!enabled || !container) return
    const previous = document.activeElement as HTMLElement | null

    const first = focusables(container)[0] as HTMLElement | undefined
    if (first) first.focus()
    else container.focus()

    function handleKey(e: KeyboardEvent) {
      if (e.key !== 'Tab' || !container) return
      const items = focusables(container)
      if (items.length === 0) {
        e.preventDefault()
        return
      }
      const head = items[0]
      const tail = items[items.length - 1]
      const active = document.activeElement
      if (e.shiftKey && (active === head || !container.contains(active))) {
        e.preventDefault()
        tail.focus()
      } else if (
        !e.shiftKey &&
        (active === tail || !container.contains(active))
      ) {
        e.preventDefault()
        head.focus()
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('keydown', handleKey)
      if (previous?.isConnected) previous.focus()
    }
  }, [ref, enabled])
}
