import FilterChip from '@/components/FilterChip'
import type { RatingCategory } from '@/lib/api/filters'

interface RatingCategoryGroupProps {
  category: RatingCategory
  selectedId?: number
  onSelect: (id: number | undefined) => void
}

export default function RatingCategoryGroup({
  category,
  selectedId,
  onSelect,
}: RatingCategoryGroupProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-semibold text-moss-dark uppercase">
        {category.display_name}
      </span>
      <div className="flex flex-wrap gap-2">
        {category.options.map((opt) => {
          const selected = selectedId === opt.id
          return (
            <FilterChip
              key={opt.id}
              label={opt.name}
              title={opt.description}
              selected={selected}
              onToggle={() => onSelect(selected ? undefined : opt.id)}
            />
          )
        })}
      </div>
    </div>
  )
}
