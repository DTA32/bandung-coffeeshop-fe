import {
  createFileRoute,
  useNavigate,
  useRouterState,
} from '@tanstack/react-router'
import { LayoutGrid, List, Map } from 'lucide-react'
import SearchBox from '@/components/search/SearchBox'
import CafeCard from '@/components/explore/CafeCard'
import CafeListItem from '@/components/explore/CafeListItem'
import Pagination from '@/components/explore/Pagination'
import type { ExploreSearch } from '@/lib/api/search'
import { cleanExploreSearch, searchCafes } from '@/lib/api/search'

export const Route = createFileRoute('/explore')({
  validateSearch: (search): ExploreSearch => ({
    q: search.q as string | undefined,
    query_id: search.query_id as string | undefined,
    query_type: search.query_type as string | undefined,
    query_coords: search.query_coords as string | undefined,
    radius_max: search.radius_max as number | undefined,
    sort: search.sort as string | undefined,
    page:
      search.page !== undefined
        ? Math.max(1, Number(search.page) || 1)
        : undefined,
    size:
      search.size !== undefined
        ? Math.max(1, Number(search.size) || 8)
        : undefined,
    view:
      search.view === 'list'
        ? 'list'
        : search.view === 'grid'
          ? 'grid'
          : undefined,
  }),
  loaderDeps: ({ search }) => ({
    query_id: search.query_id,
    query_type: search.query_type,
    query_coords: search.query_coords,
    radius_max: search.radius_max,
    sort: search.sort ?? 'default',
    page: search.page ?? 1,
    size: search.size ?? 8,
  }),
  loader: ({ deps }) => searchCafes(deps),
  errorComponent: () => (
    <div className="flex h-128 items-center justify-center text-lg text-red-500">
      Failed to load cafes.
    </div>
  ),
  component: ExplorePage,
})

const SORT_OPTIONS = [
  { value: 'default', label: 'Best match' },
  { value: 'rating', label: 'Rating' },
  { value: 'price_range', label: 'Price' },
  { value: 'updated_at', label: 'Recently updated' },
]

function ExplorePage() {
  const data = Route.useLoaderData()
  const search = Route.useSearch()
  const navigate = useNavigate()
  const isLoading = useRouterState({ select: (s) => s.isLoading })

  // Resolved values with defaults applied
  const page = search.page ?? 1
  const sort = search.sort ?? 'default'
  const view = search.view ?? 'grid'
  const totalPages = Math.ceil(data.total / (search.size ?? 8))

  function goTo(update: ExploreSearch) {
    navigate({
      to: '/explore',
      search: cleanExploreSearch({ ...search, ...update }),
    })
  }

  return (
    <main className="flex flex-col bg-cream">
      <SearchBox variant="srp" initialQuery={search.q ?? ''} />

      <div className="mx-auto w-full max-w-screen-2xl px-6 md:px-16 py-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="hidden md:flex items-center gap-2">
            <button
              disabled
              className="flex cursor-not-allowed items-center gap-1.5 px-4 py-2.5 text-sm text-gray-400 rounded-lg bg-white "
            >
              <Map size={14} />
              Show Map
            </button>
            <div className="flex overflow-hidden rounded-lg border border-white bg-white p-1 ">
              <button
                onClick={() => goTo({ view: 'grid', page: 1 })}
                className={`flex rounded-lg cursor-pointer items-center gap-1.5 border-none px-3 py-1.5 text-sm transition ${
                  view === 'grid'
                    ? 'bg-forest text-cream'
                    : 'bg-transparent text-forest hover:bg-grove-light'
                }`}
              >
                <LayoutGrid size={14} />
                Grid
              </button>
              <button
                onClick={() => goTo({ view: 'list', page: 1 })}
                className={`flex rounded-lg cursor-pointer items-center gap-1.5 border-none px-3 py-1.5 text-sm transition ${
                  view === 'list'
                    ? 'bg-forest text-cream'
                    : 'bg-transparent text-forest hover:bg-grove-light'
                }`}
              >
                <List size={14} />
                List
              </button>
            </div>
          </div>

          <span className="text-sm text-bark">
            {data.total} {data.total === 1 ? 'cafe' : 'cafes'} found
            <span className="font-bold">
              {data.formatted_location_name
                ? ` ${data.formatted_location_name}`
                : ''}
            </span>
          </span>

          <div className="flex items-center gap-2">
            <span className="text-sm text-bark">Sort by:</span>
            <select
              value={sort}
              onChange={(e) => goTo({ sort: e.target.value, page: 1 })}
              className="cursor-pointer rounded-md py-1.5 text-sm text-grove focus:outline-none"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div
          className={`transition-opacity ${isLoading ? 'opacity-50' : 'opacity-100'}`}
        >
          {data.cafes.length === 0 ? (
            <div className="flex h-128 items-center justify-center text-lg text-bark">
              No cafes found.
            </div>
          ) : view === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {data.cafes.map((cafe) => (
                <CafeCard key={cafe.id} cafe={cafe} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {data.cafes.map((cafe) => (
                <CafeListItem key={cafe.id} cafe={cafe} />
              ))}
            </div>
          )}

          <Pagination
            page={page}
            totalPages={totalPages}
            searchForPage={(p) => cleanExploreSearch({ ...search, page: p })}
          />
        </div>
      </div>
    </main>
  )
}
