import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ParameterRankingCard from './ParameterRankingCard'

describe('ParameterRankingCard', () => {
  const mockRanking = {
    parameter: 'returnRate',
    impact: 3.5,
  }

  it('renders the parameter ranking card', () => {
    render(<ParameterRankingCard ranking={mockRanking} index={0} />)

    expect(screen.getByText('#1')).toBeInTheDocument()
    expect(screen.getByText('Rendite')).toBeInTheDocument()
    expect(screen.getByText('3.50%')).toBeInTheDocument()
  })

  it('displays correct impact level for high impact', () => {
    render(<ParameterRankingCard ranking={mockRanking} index={0} />)

    expect(screen.getByText('🟠 Hoher Einfluss')).toBeInTheDocument()
  })

  it('displays correct impact level for very high impact', () => {
    const highImpactRanking = {
      parameter: 'returnRate',
      impact: 6.0,
    }
    render(<ParameterRankingCard ranking={highImpactRanking} index={0} />)

    expect(screen.getByText('🔴 Sehr hoher Einfluss')).toBeInTheDocument()
  })

  it('displays correct impact level for medium impact', () => {
    const mediumImpactRanking = {
      parameter: 'savingsAmount',
      impact: 1.2,
    }
    render(<ParameterRankingCard ranking={mediumImpactRanking} index={1} />)

    expect(screen.getByText('🟡 Mittlerer Einfluss')).toBeInTheDocument()
  })

  it('displays correct impact level for low impact', () => {
    const lowImpactRanking = {
      parameter: 'inflationRate',
      impact: 0.3,
    }
    render(<ParameterRankingCard ranking={lowImpactRanking} index={2} />)

    expect(screen.getByText('🟢 Geringer Einfluss')).toBeInTheDocument()
  })

  it('displays correct rank number', () => {
    render(<ParameterRankingCard ranking={mockRanking} index={4} />)

    expect(screen.getByText('#5')).toBeInTheDocument()
  })
})
