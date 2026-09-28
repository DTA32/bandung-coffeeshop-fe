import { useRouterState } from '@tanstack/react-router'
import { DoorClosed } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import Breadcrumb from '@/components/Breadcrumb'
import { CafeCard } from '@/components/cafe'
import Pagination from '@/components/explore/Pagination'
import type { SearchCafesData } from '@/lib/api/search'
import { closedCafesCrumbs } from '@/lib/seo'
import { useLocale } from '@/lib/locale'
import { cn } from '@/lib/cn'

// Stripped-down explore results page for closed / relocated cafes: title band,
// count line, CafeCard grid and pagination — no search box, filters or map.
export default function ClosedCafesPage({
  data,
  page,
  size,
}: {
  data: SearchCafesData
  page: number
  size: number
}) {
  const { t } = useTranslation()
  const locale = useLocale()
  const isLoading = useRouterState({ select: (s) => s.isLoading })
  const totalPages = Math.ceil(data.total / size)

  return (
    <main
      className={cn(
        'flex flex-col bg-cream flex-1 transition-opacity',
        isLoading ? 'opacity-50' : 'opacity-100',
      )}
    >
      <header className="bg-surface border-b border-grove-light px-6 md:px-16 py-8 flex flex-col gap-2">
        <h1 className="flex items-center gap-3 text-2xl md:text-3xl font-bold text-forest m-0">
          <DoorClosed
            className="size-6 md:size-7 shrink-0"
            aria-hidden="true"
          />
          {t('closedCafes.title')}
        </h1>
        <p className="text-sm text-bark">{t('closedCafes.subtitle')}</p>
      </header>

      <div className="flex-1 w-full max-w-screen-2xl mx-auto px-6 md:px-16 py-6 flex flex-col">
        <h2 className="text-sm text-bark mb-4">
          {t('explore.cafesFound', { count: data.total })}
        </h2>

        {data.cafes.length === 0 ? (
          <div className="flex h-128 items-center justify-center text-lg text-bark">
            {t('explore.noCafesFound')}
          </div>
        ) : (
          <div className="grid gap-5 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {data.cafes.map((cafe) => (
              <CafeCard key={cafe.id} cafe={cafe} small={false} />
            ))}
          </div>
        )}

        <Pagination
          page={page}
          totalPages={totalPages}
          searchForPage={(p) => (p > 1 ? { page: p } : {})}
        />
      </div>

      <Breadcrumb
        items={closedCafesCrumbs(t, locale)}
        className="px-6 md:px-16 pb-8"
      />
    </main>
  )
}
