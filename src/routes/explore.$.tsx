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
import { getLocation } from '@/lib/api/location'

// Nested location paths:
//   /explore/<district>             → district
//   /explore/<district>/<area>      → area
//   /explore/<district>/<area>/<poi>→ poi
// Depth derives the type; the leaf segment is the API query_id.
export const Route = createFileRoute('/explore/$')({
  validateSearch: validateExploreSearch,
  loaderDeps: ({ search }) => exploreLoaderDeps(search),
  loader: async ({ params, deps }) => {
    const focus = parseExploreSplat(params._splat)
    if (!focus) throw notFound()
    const [searchData, locationData] = await Promise.all([
      searchCafes({ ...deps, ...focus }),
      getLocation(focus.query_id),
    ])
    if (Array.isArray(locationData)) {
      throw new Error(`Expected single location, got array`)
    }
    return { searchData, locationData }
  },
  errorComponent: ExploreError,
  notFoundComponent: ExploreNotFound,
  component: ExploreSplat,
})

function validatePath(
  splat: string | undefined,
  ancestors: string[] = [],
): void {
  if (typeof splat !== 'string') return
  const segments = splat.split('/').filter(Boolean)
  if (segments.length < 1 || segments.length > 3) return
  const expected = [...ancestors, segments[segments.length - 1]]
  if (segments.length !== expected.length) {
    throw notFound()
  }
  for (let i = 0; i < segments.length; i++) {
    if (segments[i] !== expected[i]) {
      throw notFound()
    }
  }
}

function ExploreSplat() {
  const { searchData, locationData } = Route.useLoaderData()
  const search = Route.useSearch()
  const params = Route.useParams()
  validatePath(
    params._splat,
    locationData.ancestors.map((a) => a.id),
  )
  return (
    <ExplorePage data={searchData} search={search} location={locationData} />
  )
}
