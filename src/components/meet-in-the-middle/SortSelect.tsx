export const SORT_OPTIONS = [
  { value: 'distance', label: 'Distance' },
  { value: 'default', label: 'Best match' },
  { value: 'rating', label: 'Rating' },
  { value: 'price_range', label: 'Price' },
  { value: 'updated_at', label: 'Recently updated' },
]

type Props = {
  value: string
  onChange: (value: string) => void
  className?: string
}

export default function SortSelect({ value, onChange, className }: Props) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={
        className ??
        'cursor-pointer rounded-md py-1 text-sm text-grove focus:outline-none bg-transparent'
      }
    >
      {SORT_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}
