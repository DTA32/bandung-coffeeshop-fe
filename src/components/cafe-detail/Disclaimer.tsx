import { Info } from 'lucide-react'

export default function Disclaimer() {
  return (
    <div
      role="note"
      className="bg-cream rounded-xl flex flex-row items-start gap-1.5 px-4 py-3.5"
    >
      <Info size={18} className="text-bark shrink-0 pt-1" aria-hidden="true" />
      <p className="text-xs text-bark leading-relaxed m-0">
        Rating is subjective and not accurate. All scores reflect a single visit
        and personal preference. Your experience may vary.
      </p>
    </div>
  )
}
