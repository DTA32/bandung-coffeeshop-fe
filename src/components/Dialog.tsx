import { useRef } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/cn'
import { useEscapeKey } from '@/lib/hooks/useEscapeKey'
import { useFocusTrap } from '@/lib/hooks/useFocusTrap'
import { useScrollLock } from '@/lib/hooks/useScrollLock'

interface DialogProps {
  open: boolean
  onClose: () => void
  label?: string
  labelledBy?: string
  // adaptive: bottom sheet below `sm`, centered modal from `sm` up.
  // fullscreen: children fill a dark overlay (e.g. the image gallery).
  variant?: 'adaptive' | 'fullscreen'
  className?: string
  overlayClassName?: string
  children: ReactNode
}

const OVERLAY = {
  adaptive:
    'fixed inset-0 z-60 flex items-end justify-center bg-black/50 sm:items-center shadow-md',
  fullscreen: 'fixed inset-0 z-60 flex flex-col bg-black/90',
} as const

// Dialog is the shared modal shell: portals to <body>, closes on Escape and
// backdrop click, locks page scroll and traps focus while open. Render it from
// client-only code paths (or keep `open` false during SSR), since the portal
// needs `document`.
//
// In the adaptive variant children sit in a panel, and clicks inside it never
// reach the backdrop. In the fullscreen variant children are laid out directly
// on the overlay, so any click that bubbles up closes; stop propagation on the
// regions that should stay interactive.
export default function Dialog({
  open,
  onClose,
  label,
  labelledBy,
  variant = 'adaptive',
  className,
  overlayClassName,
  children,
}: DialogProps) {
  const ref = useRef<HTMLDivElement>(null)
  useEscapeKey(onClose, open)
  useScrollLock(open)
  useFocusTrap(ref, open)

  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-label={label}
      aria-labelledby={labelledBy}
      tabIndex={-1}
      className={cn(OVERLAY[variant], 'outline-none', overlayClassName)}
      onClick={onClose}
    >
      {variant === 'adaptive' ? (
        <div
          className={cn(
            'w-full rounded-t-2xl bg-cream shadow-xl sm:rounded-2xl',
            className,
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      ) : (
        children
      )}
    </div>,
    document.body,
  )
}
