import { useEffect, useRef, useState } from 'react'
import { searchCafeMarkers } from '@/lib/api/search'
import type { CafeMarker, SearchCafesParams } from '@/lib/api/search'
import type { Locale } from '@/lib/locale'

// Map pins for every cafe matching the filters, fetched on the client only
// while a map is on screen (effects never run during SSR). params carries
// filters + focus only, so page/sort/view changes keep the same key and don't
// refetch. A new key aborts the in-flight request; the old pins stay up until
// the new ones arrive.
export function useCafeMarkers(
  params: SearchCafesParams | undefined,
  enabled: boolean,
  lang: Locale,
): CafeMarker[] {
  const [markers, setMarkers] = useState<CafeMarker[]>([])
  const fetchedKey = useRef<string | null>(null)
  const key = params ? JSON.stringify([lang, params]) : null

  useEffect(() => {
    if (!enabled || !params || key === null || key === fetchedKey.current)
      return
    const controller = new AbortController()
    searchCafeMarkers(params, lang, controller.signal)
      .then((data) => {
        fetchedKey.current = key
        setMarkers(data)
      })
      .catch((e) => {
        // Aborted by a newer key, or a 404 the list call already surfaces.
        if (!controller.signal.aborted) console.error(e)
      })
    return () => controller.abort()
    // params is captured through key.
  }, [key, enabled])

  return markers
}
