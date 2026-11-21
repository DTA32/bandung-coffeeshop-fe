import { useEffect, useState } from 'react'

// useDelayedTrue turns true only once `value` has stayed true for `delayMs`,
// and turns false as soon as `value` does.
export function useDelayedTrue(value: boolean, delayMs: number) {
  const [delayed, setDelayed] = useState(false)
  useEffect(() => {
    if (!value) {
      setDelayed(false)
      return
    }
    const id = setTimeout(() => setDelayed(true), delayMs)
    return () => clearTimeout(id)
  }, [value, delayMs])
  return delayed
}
