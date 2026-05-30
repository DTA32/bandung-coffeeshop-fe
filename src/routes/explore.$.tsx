import { createFileRoute, notFound } from '@tanstack/react-router'
import ExplorePage, {
  ExploreError,
  ExploreNotFound,
} from '@/components/explore/ExplorePage'
import { searchCafes } from '@/lib/api/search'
import {
  exploreLoaderDeps,
  parseExploreSplat,
  validateExploreSearch,
} from '@/lib/explore'

// Nested location paths:
//   /explore/<district>             → district
//   /explore/<district>/<area>      → area
//   /explore/<district>/<area>/<poi>→ poi
// Depth derives the type; the leaf segment is the API query_id.
export const Route = createFileRoute('/explore/$')({
  validateSearch: validateExploreSearch,
  loaderDeps: ({ search }) => exploreLoaderDeps(search),
  loader: ({ params, deps }) => {
    const focus = parseExploreSplat(params._splat)
    if (!focus) throw notFound()
    return searchCafes({ ...deps, ...focus })
  },
  errorComponent: ExploreError,
  notFoundComponent: ExploreNotFound,
  component: ExploreSplat,
})

function ExploreSplat() {
  const data = Route.useLoaderData()
  const search = Route.useSearch()
  return <ExplorePage data={data} search={search} />
}
