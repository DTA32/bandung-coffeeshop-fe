import { Clock } from 'lucide-react'

export default function UpdatedAt({ updated_at }: { updated_at: string }) {
  if (isNaN(new Date(updated_at).getTime())) {
    return null
  }
  const updated_at_formatted = new Date(updated_at).toLocaleString('en-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  return (
    <div className="bg-cream rounded-xl flex flex-row items-center gap-2.5 px-4 py-3.5">
      <Clock size={14} className="text-bark shrink-0" aria-hidden="true" />
      <p className="text-xs text-bark leading-relaxed m-0">
        Last updated on{' '}
        <time dateTime={updated_at}>{updated_at_formatted}</time>
      </p>
    </div>
  )
}
