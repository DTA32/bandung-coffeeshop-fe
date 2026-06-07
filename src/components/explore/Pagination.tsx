import { Link } from '@tanstack/react-router'
import type { ExploreSearch } from '@/lib/api/search'

interface PaginationProps {
  page: number
  totalPages: number
  searchForPage: (page: number) => ExploreSearch
}

export default function Pagination({
  page,
  totalPages,
  searchForPage,
}: PaginationProps) {
  if (totalPages <= 1) return null

  const pages: (number | '...')[] = []

  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (page > 3) pages.push('...')
    for (
      let i = Math.max(2, page - 1);
      i <= Math.min(totalPages - 1, page + 1);
      i++
    ) {
      pages.push(i)
    }
    if (page < totalPages - 2) pages.push('...')
    pages.push(totalPages)
  }

  const linkCls = 'rounded-md px-3 py-1.5 text-sm no-underline transition'
  const disabledCls = `${linkCls} cursor-default text-bark opacity-40`

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-center gap-1 py-8"
    >
      {page > 1 ? (
        <Link
          to="."
          search={searchForPage(page - 1)}
          preload="intent"
          className={`${linkCls} text-forest hover:bg-grove-light shrink-0`}
        >
          ← Prev
        </Link>
      ) : (
        <span className={disabledCls}>← Prev</span>
      )}

      {pages.map((p, i) =>
        p === '...' ? (
          <span
            key={`ellipsis-${i}`}
            aria-hidden="true"
            className="px-2 text-sm text-bark"
          >
            …
          </span>
        ) : (
          <Link
            key={p}
            to="."
            search={searchForPage(p)}
            preload="intent"
            aria-current={p === page ? 'page' : undefined}
            className={`${linkCls} ${
              p === page
                ? 'bg-forest text-cream'
                : 'text-forest hover:bg-grove-light'
            }`}
          >
            {p}
          </Link>
        ),
      )}

      {page < totalPages ? (
        <Link
          to="."
          search={searchForPage(page + 1)}
          preload="intent"
          className={`${linkCls} text-forest hover:bg-grove-light shrink-0`}
        >
          Next →
        </Link>
      ) : (
        <span className={disabledCls}>Next →</span>
      )}
    </nav>
  )
}
