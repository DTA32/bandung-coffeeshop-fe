import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, userEvent } from '@/test/utils'
import SegmentedControl from './SegmentedControl'

const segments = [
  { value: 'all', label: 'All' },
  { value: 'open', label: 'Open Now' },
  { value: 'top', label: 'Top Rated' },
]

describe('SegmentedControl', () => {
  it('renders one button per segment with each label', () => {
    render(
      <SegmentedControl segments={segments} value="all" onChange={() => {}} />,
    )
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(segments.length)
    for (const seg of segments) {
      expect(
        screen.getByRole('button', { name: seg.label }),
      ).toBeInTheDocument()
    }
  })

  it('gives every button type="button"', () => {
    render(
      <SegmentedControl segments={segments} value="all" onChange={() => {}} />,
    )
    for (const button of screen.getAllByRole('button')) {
      expect(button).toHaveAttribute('type', 'button')
    }
  })

  it('marks only the active segment with aria-pressed=true', () => {
    render(
      <SegmentedControl segments={segments} value="open" onChange={() => {}} />,
    )
    expect(screen.getByRole('button', { name: 'Open Now' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByRole('button', { name: 'All' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
    expect(screen.getByRole('button', { name: 'Top Rated' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })

  it('exposes the active button via the pressed accessible state', () => {
    render(
      <SegmentedControl segments={segments} value="top" onChange={() => {}} />,
    )
    // aria-pressed=true buttons match the { pressed: true } role query
    const pressed = screen.getAllByRole('button', { pressed: true })
    expect(pressed).toHaveLength(1)
    expect(pressed[0]).toHaveTextContent('Top Rated')
    expect(screen.getAllByRole('button', { pressed: false })).toHaveLength(2)
  })

  it('renders no button as pressed when value matches nothing', () => {
    render(
      <SegmentedControl
        segments={segments}
        value="nonexistent"
        onChange={() => {}}
      />,
    )
    expect(screen.queryAllByRole('button', { pressed: true })).toHaveLength(0)
    for (const button of screen.getAllByRole('button')) {
      expect(button).toHaveAttribute('aria-pressed', 'false')
    }
  })

  it('calls onChange with the clicked segment value', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(
      <SegmentedControl segments={segments} value="all" onChange={onChange} />,
    )
    await user.click(screen.getByRole('button', { name: 'Open Now' }))
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith('open')
  })

  it('calls onChange even when the already-active segment is clicked', () => {
    const onChange = vi.fn()
    render(
      <SegmentedControl segments={segments} value="all" onChange={onChange} />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'All' }))
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith('all')
  })

  it('fires the correct value for each segment independently', () => {
    const onChange = vi.fn()
    render(
      <SegmentedControl segments={segments} value="all" onChange={onChange} />,
    )
    for (const seg of segments) {
      fireEvent.click(screen.getByRole('button', { name: seg.label }))
    }
    expect(onChange.mock.calls.map((c) => c[0])).toEqual(['all', 'open', 'top'])
  })

  it('renders a separator between segments but not after the last one', () => {
    const { container } = render(
      <SegmentedControl segments={segments} value="all" onChange={() => {}} />,
    )
    // separators are the thin divider divs (w-px) between buttons
    const separators = container.querySelectorAll('div.w-px')
    expect(separators).toHaveLength(segments.length - 1)
  })

  it('handles a single segment with no separators', () => {
    const single = [{ value: 'only', label: 'Only' }]
    const { container } = render(
      <SegmentedControl segments={single} value="only" onChange={() => {}} />,
    )
    expect(screen.getAllByRole('button')).toHaveLength(1)
    expect(container.querySelectorAll('div.w-px')).toHaveLength(0)
    expect(screen.getByRole('button', { name: 'Only' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('renders nothing interactive for an empty segments array', () => {
    render(<SegmentedControl segments={[]} value="" onChange={() => {}} />)
    expect(screen.queryAllByRole('button')).toHaveLength(0)
  })
})
