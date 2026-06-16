import { createFileRoute } from '@tanstack/react-router'
import ExplorePage, {
  ExploreError,
  ExploreNotFound,
} from '@/components/explore/ExplorePage'
import { searchCafes } from '@/lib/api/search'
import { exploreLoaderDeps, validateExploreSearch } from '@/lib/explore'
import { normalizeLocale } from '@/i18n'

export const Route = createFileRoute('/{-$locale}/explore/')({
  validateSearch: validateExploreSearch,
  loaderDeps: ({ search }) => exploreLoaderDeps(search),
  loader: ({ deps, params }) =>
    searchCafes(deps, normalizeLocale(params.locale)),
  errorComponent: ExploreError,
  notFoundComponent: ExploreNotFound,
  component: ExploreIndex,
})

function ExploreIndex() {
  const data = Route.useLoaderData()
  const search = Route.useSearch()
  return <ExplorePage data={data} search={search} />
}
