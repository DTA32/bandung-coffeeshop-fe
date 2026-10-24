import type { ReactNode } from 'react'

interface SecondaryButtonProps {
  onClick: () => void
  disabled?: boolean
  children: ReactNode
}

export default function SecondaryButton({
  onClick,
  disabled,
  children,
}: SecondaryButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="h-11 cursor-pointer rounded-full border border-grove-light bg-transparent px-5 text-sm font-semibold text-moss hover:bg-forest-lighter disabled:cursor-default disabled:opacity-60"
    >
      {children}
    </button>
  )
}
