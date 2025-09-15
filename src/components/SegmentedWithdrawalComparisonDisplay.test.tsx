import { render, screen } from '@testing-library/react'
import { SegmentedWithdrawalComparisonDisplay } from './SegmentedWithdrawalComparisonDisplay'
import type { SegmentedComparisonStrategy } from '../utils/config-storage'
import type { WithdrawalStrategy } from '../../helpers/withdrawal'
import { describe, it, expect } from 'vitest'

// Mock currency formatting
vi.mock('../utils/currency', () => ({
  formatCurrency: (amount: number) => `${amount.toLocaleString('de-DE')} €`,
}))

const mockWithdrawalData = {
  startingCapital: 500000,
  withdrawalArray: [
    {
      year: 2080,
      endkapital: 100000,
      entnahme: 25000,
    },
  ],
  withdrawalResult: {},
  duration: 25,
}

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
      enableGrundfreibetrag: false,
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
      enableGrundfreibetrag: false,
      incomeTaxRate: 0.18,
      steuerReduzierenEndkapital: true,
    },
  ],
}

const mockSegmentedComparisonResult = {
  strategy: mockStrategy,
  finalCapital: 75000,
  totalWithdrawal: 800000,
  averageAnnualWithdrawal: 32000,
  duration: 25,
  result: {},
}

describe('SegmentedWithdrawalComparisonDisplay', () => {
  const defaultProps = {
    withdrawalData: mockWithdrawalData,
    segmentedComparisonResults: [],
  }

  it('renders the main heading and starting capital', () => {
    render(<SegmentedWithdrawalComparisonDisplay {...defaultProps} />)

    expect(screen.getByText('Geteilte Phasen Vergleich')).toBeInTheDocument()
    expect(screen.getByText('Startkapital bei Entnahme:')).toBeInTheDocument()
    expect(screen.getByText('500.000 €')).toBeInTheDocument()
  })

  it('displays base configuration summary', () => {
    render(<SegmentedWithdrawalComparisonDisplay {...defaultProps} />)

    expect(screen.getByText('📊 Basis-Konfiguration (aktuell):')).toBeInTheDocument()
    expect(screen.getByText('Endkapital:')).toBeInTheDocument()
    expect(screen.getByText('100.000 €')).toBeInTheDocument()
    expect(screen.getByText('Vermögen reicht für:')).toBeInTheDocument()
    expect(screen.getByText('25 Jahre')).toBeInTheDocument()
  })

  it('shows message when no comparison strategies exist', () => {
    render(<SegmentedWithdrawalComparisonDisplay {...defaultProps} />)

    expect(screen.getByText('🔍 Vergleichs-Konfigurationen')).toBeInTheDocument()
    expect(screen.getByText('Keine Vergleichs-Konfigurationen definiert.')).toBeInTheDocument()
    expect(screen.getByText(/Erstelle Vergleichs-Konfigurationen in den Variablen-Einstellungen/)).toBeInTheDocument()
  })

  it('displays comparison strategies when they exist', () => {
    const props = {
      ...defaultProps,
      segmentedComparisonResults: [mockSegmentedComparisonResult],
    }

    render(<SegmentedWithdrawalComparisonDisplay {...props} />)

    expect(screen.getByText('Conservative-Aggressive Mix (2 Phasen)')).toBeInTheDocument()
    expect(screen.getByText('Early Phase')).toBeInTheDocument()
    expect(screen.getByText('Late Phase')).toBeInTheDocument()
    expect(screen.getByText(/3% Regel - 4\.0% Rendite/)).toBeInTheDocument()
    expect(screen.getByText(/4% Regel - 6\.0% Rendite/)).toBeInTheDocument()
  })

  it('displays comparison results correctly', () => {
    const props = {
      ...defaultProps,
      segmentedComparisonResults: [mockSegmentedComparisonResult],
    }

    render(<SegmentedWithdrawalComparisonDisplay {...props} />)

    // Check results summary
    expect(screen.getAllByText('Endkapital:')).toHaveLength(2) // Base + comparison
    expect(screen.getByText('75.000 €')).toBeInTheDocument() // Final capital
    expect(screen.getByText('Gesamtentnahme:')).toBeInTheDocument()
    expect(screen.getByText('800.000 €')).toBeInTheDocument() // Total withdrawal
    expect(screen.getByText('Ø Jährliche Entnahme:')).toBeInTheDocument()
    expect(screen.getByText('32.000 €')).toBeInTheDocument() // Average annual
    expect(screen.getByText('Laufzeit:')).toBeInTheDocument()
    expect(screen.getAllByText('25 Jahre')).toHaveLength(2) // Base + comparison
  })

  it('handles unlimited duration correctly', () => {
    const unlimitedResult = {
      ...mockSegmentedComparisonResult,
      duration: 'unbegrenzt',
    }

    const props = {
      ...defaultProps,
      segmentedComparisonResults: [unlimitedResult],
    }

    render(<SegmentedWithdrawalComparisonDisplay {...props} />)

    expect(screen.getByText('unbegrenzt')).toBeInTheDocument()
  })

  it('displays detailed comparison table for multiple strategies', () => {
    const secondResult = {
      ...mockSegmentedComparisonResult,
      strategy: {
        ...mockStrategy,
        id: 'strategy-2',
        name: 'Aggressive-Conservative Mix',
        segments: [mockStrategy.segments[0]], // Single segment
      },
      finalCapital: 50000,
      totalWithdrawal: 900000,
      averageAnnualWithdrawal: 36000,
      duration: 22,
    }

    const props = {
      ...defaultProps,
      segmentedComparisonResults: [mockSegmentedComparisonResult, secondResult],
    }

    render(<SegmentedWithdrawalComparisonDisplay {...props} />)

    // Check for detailed comparison table
    expect(screen.getByText('📊 Detaillierter Vergleich')).toBeInTheDocument()
    expect(screen.getByText('Konfiguration')).toBeInTheDocument()
    expect(screen.getByText('Ø Jährlich')).toBeInTheDocument()
    expect(screen.getByText('Phasen')).toBeInTheDocument()

    // Check table content
    expect(screen.getByText('Conservative-Aggressive Mix')).toBeInTheDocument()
    expect(screen.getByText('Aggressive-Conservative Mix')).toBeInTheDocument()
    expect(screen.getAllByText('22 Jahre')).toHaveLength(2) // Appears in card and table

    // Check phase counts in table
    expect(screen.getByText('2')).toBeInTheDocument() // 2 phases
    expect(screen.getByText('1')).toBeInTheDocument() // 1 phase
  })

  it('handles single strategy without detailed table', () => {
    const props = {
      ...defaultProps,
      segmentedComparisonResults: [mockSegmentedComparisonResult],
    }

    render(<SegmentedWithdrawalComparisonDisplay {...props} />)

    // Should not show detailed comparison table for single strategy
    expect(screen.queryByText('📊 Detaillierter Vergleich')).not.toBeInTheDocument()
  })

  it('displays strategy types correctly', () => {
    const strategiesWithDifferentTypes = {
      ...mockSegmentedComparisonResult,
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

    const props = {
      ...defaultProps,
      segmentedComparisonResults: [strategiesWithDifferentTypes],
    }

    render(<SegmentedWithdrawalComparisonDisplay {...props} />)

    expect(screen.getByText(/Monatlich fest - 4\.0% Rendite/)).toBeInTheDocument()
    expect(screen.getByText(/Drei-Eimer-Strategie - 6\.0% Rendite/)).toBeInTheDocument()
  })

  it('handles base configuration with unlimited duration', () => {
    const unlimitedBaseData = {
      ...mockWithdrawalData,
      duration: null,
    }

    const props = {
      ...defaultProps,
      withdrawalData: unlimitedBaseData,
    }

    render(<SegmentedWithdrawalComparisonDisplay {...props} />)

    expect(screen.getByText('unbegrenzt')).toBeInTheDocument()
  })

  it('displays correct phase information for segments', () => {
    const props = {
      ...defaultProps,
      segmentedComparisonResults: [mockSegmentedComparisonResult],
    }

    render(<SegmentedWithdrawalComparisonDisplay {...props} />)

    // Check segment details
    expect(screen.getByText('Early Phase')).toBeInTheDocument()
    expect(screen.getByText('Late Phase')).toBeInTheDocument()
    expect(screen.getByText(/2041.*2060/)).toBeInTheDocument()
    expect(screen.getByText(/2061.*2080/)).toBeInTheDocument()
  })
})
