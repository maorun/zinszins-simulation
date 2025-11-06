import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { SegmentedComparisonCard } from './SegmentedComparisonCard'
import type { SegmentedComparisonStrategy } from '../utils/config-storage'
import type { WithdrawalStrategy } from '../../helpers/withdrawal'

// Mock currency formatting
vi.mock('../utils/currency', () => ({
  formatCurrency: (amount: number) => `${amount.toLocaleString('de-DE')} €`,
}))

// Mock strategy display names
vi.mock('../utils/withdrawal-strategy-utils', () => ({
  getStrategyDisplayName: (strategy: string) => {
    const names: Record<string, string> = {
      '4prozent': '4% Regel',
      '3prozent': '3% Regel',
      monatlich_fest: 'Monatlich fest',
      bucket_strategie: 'Drei-Eimer-Strategie',
    }
    return names[strategy] || strategy
  },
}))

const mockStrategy: SegmentedComparisonStrategy = {
  id: 'strategy-1',
  name: 'Conservative-Aggressive Mix',
  segments: [
    {
      id: 'early-phase',
      name: 'Early Phase',
      startYear: 2041,
      endYear: 2060,
      strategy: '3prozent' as WithdrawalStrategy,
      withdrawalFrequency: 'yearly',
      returnConfig: {
        mode: 'fixed',
        fixedRate: 0.04,
      },
      inflationConfig: {
        inflationRate: 0.02,
      },
      incomeTaxRate: 0.18,
      steuerReduzierenEndkapital: true,
    },
    {
      id: 'late-phase',
      name: 'Late Phase',
      startYear: 2061,
      endYear: 2080,
      strategy: '4prozent' as WithdrawalStrategy,
      withdrawalFrequency: 'yearly',
      returnConfig: {
        mode: 'fixed',
        fixedRate: 0.06,
      },
      inflationConfig: {
        inflationRate: 0.02,
      },
      incomeTaxRate: 0.18,
      steuerReduzierenEndkapital: true,
    },
  ],
}

const mockResult = {
  strategy: mockStrategy,
  finalCapital: 75000,
  totalWithdrawal: 800000,
  averageAnnualWithdrawal: 32000,
  duration: 25,
  result: {},
}

describe('SegmentedComparisonCard', () => {
  it('renders strategy name with phase count (plural)', () => {
    render(<SegmentedComparisonCard result={mockResult} />)

    expect(screen.getByText('Conservative-Aggressive Mix (2 Phasen)')).toBeInTheDocument()
  })

  it('renders strategy name with phase count (singular)', () => {
    const singleSegmentResult = {
      ...mockResult,
      strategy: {
        ...mockStrategy,
        segments: [mockStrategy.segments[0]],
      },
    }

    render(<SegmentedComparisonCard result={singleSegmentResult} />)

    expect(screen.getByText(/1 Phase\)/)).toBeInTheDocument()
  })

  it('displays segment details correctly', () => {
    render(<SegmentedComparisonCard result={mockResult} />)

    expect(screen.getByText('Early Phase')).toBeInTheDocument()
    expect(screen.getByText('Late Phase')).toBeInTheDocument()
    expect(screen.getByText(/2041.*2060/)).toBeInTheDocument()
    expect(screen.getByText(/2061.*2080/)).toBeInTheDocument()
  })

  it('displays strategy types and return rates', () => {
    render(<SegmentedComparisonCard result={mockResult} />)

    expect(screen.getByText(/3% Regel.*4\.0.*Rendite/)).toBeInTheDocument()
    expect(screen.getByText(/4% Regel.*6\.0.*Rendite/)).toBeInTheDocument()
  })

  it('displays financial metrics correctly', () => {
    render(<SegmentedComparisonCard result={mockResult} />)

    expect(screen.getByText('Endkapital:')).toBeInTheDocument()
    expect(screen.getByText('75.000 €')).toBeInTheDocument()
    expect(screen.getByText('Gesamtentnahme:')).toBeInTheDocument()
    expect(screen.getByText('800.000 €')).toBeInTheDocument()
    expect(screen.getByText('Ø Jährliche Entnahme:')).toBeInTheDocument()
    expect(screen.getByText('32.000 €')).toBeInTheDocument()
  })

  it('displays duration in years (plural)', () => {
    render(<SegmentedComparisonCard result={mockResult} />)

    expect(screen.getByText('Laufzeit:')).toBeInTheDocument()
    expect(screen.getByText('25 Jahre')).toBeInTheDocument()
  })

  it('displays duration in year (singular)', () => {
    const singleYearResult = {
      ...mockResult,
      duration: 1,
    }

    render(<SegmentedComparisonCard result={singleYearResult} />)

    expect(screen.getByText('1 Jahr')).toBeInTheDocument()
  })

  it('handles unlimited duration as string', () => {
    const unlimitedResult = {
      ...mockResult,
      duration: 'unbegrenzt',
    }

    render(<SegmentedComparisonCard result={unlimitedResult} />)

    expect(screen.getByText('unbegrenzt')).toBeInTheDocument()
  })

  it('handles zero final capital', () => {
    const zeroCapitalResult = {
      ...mockResult,
      finalCapital: 0,
    }

    render(<SegmentedComparisonCard result={zeroCapitalResult} />)

    expect(screen.getByText('0 €')).toBeInTheDocument()
  })

  it('renders multiple segments correctly', () => {
    const threeSegmentStrategy = {
      ...mockStrategy,
      segments: [
        mockStrategy.segments[0],
        mockStrategy.segments[1],
        {
          ...mockStrategy.segments[0],
          id: 'mid-phase',
          name: 'Mid Phase',
          startYear: 2070,
          endYear: 2090,
        },
      ],
    }

    const threeSegmentResult = {
      ...mockResult,
      strategy: threeSegmentStrategy,
    }

    render(<SegmentedComparisonCard result={threeSegmentResult} />)

    expect(screen.getByText(/3 Phasen\)/)).toBeInTheDocument()
    expect(screen.getByText('Early Phase')).toBeInTheDocument()
    expect(screen.getByText('Late Phase')).toBeInTheDocument()
    expect(screen.getByText('Mid Phase')).toBeInTheDocument()
  })

  it('handles different strategy types', () => {
    const differentStrategies = {
      ...mockResult,
      strategy: {
        ...mockStrategy,
        segments: [
          {
            ...mockStrategy.segments[0],
            strategy: 'monatlich_fest' as WithdrawalStrategy,
          },
          {
            ...mockStrategy.segments[1],
            strategy: 'bucket_strategie' as WithdrawalStrategy,
          },
        ],
      },
    }

    render(<SegmentedComparisonCard result={differentStrategies} />)

    expect(screen.getByText(/Monatlich fest.*4\.0.*Rendite/)).toBeInTheDocument()
    expect(screen.getByText(/Drei-Eimer-Strategie.*6\.0.*Rendite/)).toBeInTheDocument()
  })
})
