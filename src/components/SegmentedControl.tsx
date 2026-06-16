interface Segment {
  value: string
  label: string
}

interface SegmentedControlProps {
  segments: Segment[]
  value: string
  onChange: (value: string) => void
}

export default function SegmentedControl({
  segments,
  value,
  onChange,
}: SegmentedControlProps) {
  return (
    <div className="flex w-full gap-1 rounded-lg bg-white p-1">
      {segments.map((seg, i) => {
        const active = seg.value === value
        return (
          <>
            <button
              key={seg.value}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(seg.value)}
              className={`flex-1 cursor-pointer rounded-md px-3 py-1.5 text-sm transition ${
                active
                  ? 'shadow-sm bg-forest text-cream'
                  : 'bg-transparent text-forest hover:bg-grove-light'
              }`}
            >
              {seg.label}
            </button>
            {i < segments.length - 1 && (
              <div key={seg.value + i} className="w-px bg-grove-light" />
            )}
          </>
        )
      })}
    </div>
  )
}
