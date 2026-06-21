import { Link } from '@tanstack/react-router'
import type { ReactElement, ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { Crumb } from '@/lib/seo'

const PathLink = Link as (props: {
  to: string
  className?: string
  children: ReactNode
}) => ReactElement

export default function Breadcrumb({
  items,
  className,
}: {
  items: Crumb[]
  className?: string
}) {
  const { t } = useTranslation()
  if (items.length === 0) return null

  return (
    <nav aria-label={t('explore.breadcrumb.label')} className={className}>
      <ol className="flex flex-wrap items-center gap-1.5 p-0 m-0 list-none text-sm text-bark">
        {items.map((c, i) => {
          const isLast = i === items.length - 1
          return (
            <li key={c.path} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight size={14} aria-hidden="true" />}
              {isLast ? (
                <span aria-current="page" className="font-medium text-forest">
                  {c.name}
                </span>
              ) : (
                <PathLink
                  to={c.path}
                  className="no-underline hover:text-forest"
                >
                  {c.name}
                </PathLink>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
