import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface FilterChipProps {
  label: string
  selected: boolean
  onToggle: () => void
  title?: string
  // Optional leading icon, rendered left of the label.
  icon?: ReactNode
}

export default function FilterChip({
  label,
  selected,
  onToggle,
  title,
  icon,
}: FilterChipProps) {
  return (
    <button
      type="button"
      title={title}
      aria-pressed={selected}
      onClick={onToggle}
      className={cn(
        'inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition',
        selected
          ? 'bg-forest text-cream'
          : 'border border-grove-light bg-surface text-forest hover:bg-grove-light',
      )}
    >
      {icon}
      {label}
    </button>
  )
}
