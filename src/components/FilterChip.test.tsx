import { describe, expect, it, vi } from 'vitest'
import { renderWithProviders, screen, userEvent } from '@/test/utils'
import FilterChip from './FilterChip'

describe('FilterChip', () => {
  it('renders the label text inside a button', () => {
    renderWithProviders(
      <FilterChip label="Wifi" selected={false} onToggle={vi.fn()} />,
    )
    const button = screen.getByRole('button', { name: 'Wifi' })
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('type', 'button')
  })

  it('sets aria-pressed to false when not selected', () => {
    renderWithProviders(
      <FilterChip label="Quiet" selected={false} onToggle={vi.fn()} />,
    )
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false')
  })

  it('sets aria-pressed to true when selected', () => {
    renderWithProviders(
      <FilterChip label="Quiet" selected onToggle={vi.fn()} />,
    )
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true')
  })

  it('calls onToggle exactly once when clicked', async () => {
    const onToggle = vi.fn()
    renderWithProviders(
      <FilterChip label="Parking" selected={false} onToggle={onToggle} />,
    )
    await userEvent.click(screen.getByRole('button'))
    expect(onToggle).toHaveBeenCalledTimes(1)
  })

  it('calls onToggle once per click on repeated clicks', async () => {
    const onToggle = vi.fn()
    renderWithProviders(
      <FilterChip label="Parking" selected onToggle={onToggle} />,
    )
    const button = screen.getByRole('button')
    await userEvent.click(button)
    await userEvent.click(button)
    expect(onToggle).toHaveBeenCalledTimes(2)
  })

  it('passes through the title attribute when provided', () => {
    renderWithProviders(
      <FilterChip
        label="Wifi"
        selected={false}
        onToggle={vi.fn()}
        title="Filter by wifi availability"
      />,
    )
    expect(screen.getByRole('button')).toHaveAttribute(
      'title',
      'Filter by wifi availability',
    )
  })

  it('omits the title attribute when not provided', () => {
    renderWithProviders(
      <FilterChip label="Wifi" selected={false} onToggle={vi.fn()} />,
    )
    expect(screen.getByRole('button')).not.toHaveAttribute('title')
  })

  it('applies selected styling classes when selected', () => {
    renderWithProviders(
      <FilterChip label="Meals" selected onToggle={vi.fn()} />,
    )
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-forest', 'text-cream')
  })

  it('applies unselected styling classes when not selected', () => {
    renderWithProviders(
      <FilterChip label="Meals" selected={false} onToggle={vi.fn()} />,
    )
    const button = screen.getByRole('button')
    expect(button).toHaveClass('border', 'bg-white', 'text-forest')
  })
})
