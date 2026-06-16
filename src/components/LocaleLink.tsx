import { Link } from '@tanstack/react-router'
import type { LinkComponent } from '@tanstack/react-router'
import type { ReactElement } from 'react'
import { useLocale, localeParam } from '@/lib/locale'

// LocaleLink is a locale-aware <Link>. It injects the active locale into the
// optional `{-$locale}` route param so navigation stays within the current
// language (bare path for `id`, `/en/...` for `en`).
//
// `to` must be one of the optional-locale route paths, e.g.
// "/{-$locale}/explore" or "/{-$locale}/cafe/$cafeId". Pass other route params
// (like cafeId or _splat) via `params`; `locale` is the only param injected for
// you — it stays optional at the call site.
//
// The public type is LinkComponent<'a'> (the same type as TanStack's <Link>),
// so call sites keep full inference and checking on `to`/`params`/`search`. The
// loose `RawLink` alias is an implementation detail used only to merge the
// locale into `params` — it does not leak into the public surface.
const RawLink = Link as (props: Record<string, unknown>) => ReactElement

const LocaleLink: LinkComponent<'a'> = (props) => {
  const locale = useLocale()
  const { params, ...rest } = props as Record<string, unknown> & {
    params?: Record<string, unknown>
  }
  return (
    <RawLink {...rest} params={{ ...params, locale: localeParam(locale) }} />
  )
}

export default LocaleLink
