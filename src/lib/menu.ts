export type MenuKind = 'external' | 'gallery'

// How a cafe's `menu` value is shown: an http(s) URL is an external link, a
// `#image-N` hash points at a photo in the in-page gallery, anything else is
// treated as no menu.
export function menuKind(menu: string | null | undefined): MenuKind | null {
  if (!menu) return null
  if (/^https?:\/\//i.test(menu)) return 'external'
  if (/^#image-[1-9][0-9]*$/.test(menu)) return 'gallery'
  return null
}
