import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface ToastProps {
  // Placement of the horizontally centered toast, e.g. `fixed top-16 z-50`.
  className?: string
  tone?: 'info' | 'warning'
  children: ReactNode
}

const TONE = {
  info: 'text-moss',
  warning: 'text-warning',
} as const

// Toast is a small pill centered at the top of its positioned ancestor (or the
// viewport, with `fixed`). It slides down and fades in when it mounts, so
// render it conditionally. The outer element owns the centering translate and
// the inner one the animation, so the keyframe's `translate` doesn't undo it.
export default function Toast({
  className,
  tone = 'info',
  children,
}: ToastProps) {
  return (
    <div className={cn('left-1/2 -translate-x-1/2', className)}>
      <div
        className={cn(
          'rounded-md bg-grove-light px-4 py-2 text-center text-sm font-semibold shadow-md motion-safe:animate-toast-in',
          TONE[tone],
        )}
      >
        {children}
      </div>
    </div>
  )
}
