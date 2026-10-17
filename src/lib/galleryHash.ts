// Deep-link helpers for the cafe photo gallery: `#image-N` (N is 1-based, same
// as the gallery's "N / total" counter).
const IMAGE_HASH = /^#image-([1-9][0-9]*)$/

// parseImageHash returns the 0-based image index for a `#image-N` hash, or null
// when the hash is not a valid gallery hash or N is out of range.
export function parseImageHash(hash: string, count: number): number | null {
  const m = IMAGE_HASH.exec(hash)
  if (!m) return null
  const n = Number(m[1])
  return n >= 1 && n <= count ? n - 1 : null
}

// setImageHash updates (or, with null, clears) the URL hash without adding a
// history entry. history.state is passed through untouched so TanStack Router
// (which wraps history.replaceState) sees the same entry key and doesn't treat
// this as a navigation.
export function setImageHash(index: number | null): void {
  const { pathname, search } = window.location
  const url = pathname + search + (index === null ? '' : `#image-${index + 1}`)
  window.history.replaceState(window.history.state, '', url)
}
