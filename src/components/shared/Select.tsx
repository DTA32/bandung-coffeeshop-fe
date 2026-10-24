import type { ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/cn'

interface SelectProps {
  label: string
  value: string
  onChange: (value: string) => void
  invalid?: boolean
  className?: string
  children: ReactNode
}

// Select is a native <select> styled as a form field, with an empty
// placeholder option labelled `label` and a chevron.
export default function Select({
  label,
  value,
  onChange,
  invalid,
  className,
  children,
}: SelectProps) {
  return (
    <div className={cn('relative', className)}>
      <select
        aria-label={label}
        aria-invalid={invalid}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'h-11 w-full cursor-pointer appearance-none rounded-[10px] border bg-surface pr-9 pl-3.5 text-sm text-forest outline-none focus:border-moss',
          invalid ? 'border-error-accent' : 'border-grove-light',
          !value && 'text-forest-light',
        )}
      >
        <option value="">{label}</option>
        {children}
      </select>
      <ChevronDown
        size={16}
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-bark"
      />
    </div>
  )
}
