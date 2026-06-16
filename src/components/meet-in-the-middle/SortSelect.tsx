import { useTranslation } from 'react-i18next'
import { SORT_OPTIONS } from '@/lib/constants'

type Props = {
  value: string
  onChange: (value: string) => void
  className?: string
}

export default function SortSelect({ value, onChange, className }: Props) {
  const { t } = useTranslation()
  const sortOptions = [
    ...SORT_OPTIONS,
    { value: 'distance', label: 'distance' },
  ]
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={
        className ??
        'cursor-pointer rounded-md py-1 text-sm text-grove focus:outline-none bg-transparent w-fit field-sizing-content pe-2'
      }
    >
      {sortOptions.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {t(`explore.sortOptions.${opt.value}`)}
        </option>
      ))}
    </select>
  )
}
