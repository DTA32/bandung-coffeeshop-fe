import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { getRandomCafe } from '@/lib/api/cafe'
import type { RandomCafe } from '@/lib/api/cafe'
import { localeParam, useLocale } from '@/lib/locale'

// Backs the home "Surprise me" shortcut. A random café is prefetched on the
// client as soon as the hero mounts, so the click navigates straight to its
// detail page (client-side, no intermediate redirect route). If the prefetch
// hasn't landed yet the click waits on it, exposing `pending` for a spinner.
export function useSurpriseCafe() {
  const navigate = useNavigate()
  const locale = useLocale()
  const next = useRef<Promise<RandomCafe> | null>(null)
  const [pending, setPending] = useState(false)

  const prefetch = useCallback(() => {
    const promise = getRandomCafe(locale)
    // Swallow here so an unused failed prefetch isn't an unhandled rejection;
    // surprise() retries with a fresh request instead.
    promise.catch(() => undefined)
    next.current = promise
    return promise
  }, [locale])

  useEffect(() => {
    prefetch()
  }, [prefetch])

  async function surprise() {
    if (pending) return
    setPending(true)
    try {
      const cafe = await (next.current ?? prefetch()).catch(() => prefetch())
      // Consumed: coming back to home remounts the hero and prefetches anew.
      next.current = null
      await navigate({
        to: '/{-$locale}/cafe/$cafeId',
        params: { locale: localeParam(locale), cafeId: cafe.id },
      })
    } catch {
      // Both attempts failed; leave the button usable for another try.
    } finally {
      setPending(false)
    }
  }

  return { surprise, pending }
}
