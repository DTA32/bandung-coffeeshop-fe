import { createFileRoute, notFound, redirect } from '@tanstack/react-router'

// Optional locale segment. Bare paths are Indonesian (the default); English is
// served under the visible `/en` prefix. The explicit `/id` prefix is redundant
// and redirects to the canonical bare path; any other prefix is not a locale and
// 404s.
export const Route = createFileRoute('/{-$locale}')({
  beforeLoad: ({ params, location }) => {
    const loc = params.locale
    if (loc === undefined || loc === 'en') return
    if (loc === 'id') {
      // Strip the redundant `/id` prefix while preserving any query/hash. Guard
      // the leading slash so a query-only path (`/id?q=1`) canonicalises to
      // `/?q=1` rather than the schemeless `?q=1`, which would resolve back onto
      // `/id?q=1` and loop.
      const stripped = location.href.replace(/^\/id(?=[/?#]|$)/, '')
      throw redirect({
        href: stripped.startsWith('/') ? stripped : '/' + stripped,
      })
    }
    throw notFound()
  },
})
