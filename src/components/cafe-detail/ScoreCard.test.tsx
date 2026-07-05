import { describe, it, expect } from 'vitest'
import { renderWithProviders, screen } from '@/test/utils'
import ScoreCard from '@/components/cafe-detail/ScoreCard'

describe('ScoreCard', () => {
  it('renders both scores with the personal-note hint', () => {
    renderWithProviders(<ScoreCard overallScore={4.52} wfcScore={4.18} />)
    expect(screen.getByText('Overall Score')).toBeInTheDocument()
    expect(screen.getByText('Work-from-cafe Score')).toBeInTheDocument()
    // fmt() rounds to one decimal place
    expect(screen.getByText('4.5 / 5.0')).toBeInTheDocument()
    expect(screen.getByText('4.2 / 5.0')).toBeInTheDocument()
    expect(
      screen.getByText('Highly personal, see disclaimer below'),
    ).toBeInTheDocument()
    expect(screen.queryByText('No scores yet.')).not.toBeInTheDocument()
  })

  it('renders only the overall score when wfc is null', () => {
    renderWithProviders(<ScoreCard overallScore={4.5} wfcScore={null} />)
    expect(screen.getByText('Overall Score')).toBeInTheDocument()
    expect(screen.queryByText('Work-from-cafe Score')).not.toBeInTheDocument()
  })

  it('renders only the wfc score when overall is null', () => {
    renderWithProviders(<ScoreCard overallScore={null} wfcScore={4.2} />)
    expect(screen.getByText('Work-from-cafe Score')).toBeInTheDocument()
    expect(screen.queryByText('Overall Score')).not.toBeInTheDocument()
  })

  it('shows the empty state and hides the note when both are null', () => {
    renderWithProviders(<ScoreCard overallScore={null} wfcScore={null} />)
    expect(screen.getByText('No scores yet.')).toBeInTheDocument()
    expect(
      screen.queryByText('Highly personal, see disclaimer below'),
    ).not.toBeInTheDocument()
  })

  it('treats a 0 score as absent (documents the current falsy behavior)', () => {
    renderWithProviders(<ScoreCard overallScore={0} wfcScore={null} />)
    expect(screen.queryByText('Overall Score')).not.toBeInTheDocument()
    expect(screen.getByText('No scores yet.')).toBeInTheDocument()
  })
})
