import { X } from 'lucide-react'
import type { UserMarker } from './markers'

type Props = {
  marker: UserMarker
  isEditing: boolean
  onStartEdit: () => void
  onCancelEdit: () => void
  onRename: (name: string) => void
  onRemove: () => void
  compact?: boolean
}

export default function MarkerListItem({
  marker,
  isEditing,
  onStartEdit,
  onCancelEdit,
  onRename,
  onRemove,
  compact = false,
}: Props) {
  const containerGap = compact ? 'gap-3 px-3' : 'gap-4 px-4'
  const innerGap = compact ? 'gap-3' : 'gap-4'
  const nameSize = compact ? 'text-sm' : ''

  return (
    <div
      className={`flex w-full justify-between py-2 rounded-lg bg-forest-lighter ${containerGap}`}
    >
      <div className={`flex items-center min-w-0 ${innerGap}`}>
        <span
          className="w-3 h-3 rounded-full shrink-0"
          style={{ backgroundColor: marker.color }}
        />
        <div className="flex flex-col min-w-0">
          {isEditing ? (
            <input
              autoFocus
              defaultValue={marker.name}
              onBlur={(e) => {
                onRename(e.target.value.trim() || marker.name)
                onCancelEdit()
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onRename(e.currentTarget.value.trim() || marker.name)
                  onCancelEdit()
                } else if (e.key === 'Escape') {
                  onCancelEdit()
                }
              }}
              className="font-semibold text-forest bg-white border border-grove-light rounded px-1 py-0.5 text-sm outline-none focus:border-forest"
            />
          ) : (
            <button
              onClick={onStartEdit}
              className={`font-semibold text-forest text-left cursor-text hover:underline ${nameSize}`}
            >
              {marker.name}
            </button>
          )}
          <span className="text-xs text-bark truncate">
            {marker.lat.toFixed(4)}, {marker.lng.toFixed(4)}
          </span>
        </div>
      </div>
      <button className="cursor-pointer" onClick={onRemove}>
        <X
          size={16}
          className="text-bark hover:text-forest transition-colors"
        />
      </button>
    </div>
  )
}
