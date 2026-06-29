import { cn } from '@/lib/cn'

interface FilterChipProps {
  label: string
  selected: boolean
  onToggle: () => void
  title?: string
}

export default function FilterChip({
  label,
  selected,
  onToggle,
  title,
}: FilterChipProps) {
  return (
    <button
      type="button"
      title={title}
      aria-pressed={selected}
      onClick={onToggle}
      className={cn(
        'cursor-pointer rounded-full px-3 py-1.5 text-sm transition',
        selected
          ? 'bg-forest text-cream'
          : 'border border-grove-light bg-white text-forest hover:bg-grove-light',
      )}
    >
      {label}
    </button>
  )
}
