import type { ReactNode } from 'react'

interface PrimaryButtonProps {
  onClick: () => void
  disabled?: boolean
  children: ReactNode
}

export default function PrimaryButton({
  onClick,
  disabled,
  children,
}: PrimaryButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="h-11 cursor-pointer rounded-full border-none bg-moss px-6 text-sm font-bold text-white hover:bg-forest disabled:cursor-default disabled:opacity-60"
    >
      {children}
    </button>
  )
}
