import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { getRandomCafe } from '@/lib/api/cafe'
import type { RandomCafe } from '@/lib/api/cafe'
import { localeParam, useLocale } from '@/lib/locale'

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
