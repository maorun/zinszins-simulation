import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { SegmentedComparisonTable } from './SegmentedComparisonTable'
import type { SegmentedComparisonStrategy } from '../utils/config-storage'
import type { WithdrawalStrategy } from '../../helpers/withdrawal'

// Mock currency formatting
vi.mock('../utils/currency', () => ({
  formatCurrency: (amount: number) => `${amount.toLocaleString('de-DE')} €`,
}))

const mockStrategy1: SegmentedComparisonStrategy = {
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
      returnConfig: { mode: 'fixed', fixedRate: 0.04 },
      inflationConfig: { inflationRate: 0.02 },
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
      returnConfig: { mode: 'fixed', fixedRate: 0.06 },
      inflationConfig: { inflationRate: 0.02 },
      incomeTaxRate: 0.18,
      steuerReduzierenEndkapital: true,
    },
  ],
}

const mockResult1 = {
  strategy: mockStrategy1,
  finalCapital: 75000,
  totalWithdrawal: 800000,
  averageAnnualWithdrawal: 32000,
  duration: 25,
  result: {},
}

const mockResult2 = {
  strategy: {
    ...mockStrategy1,
    id: 'strategy-2',
    name: 'Aggressive-Conservative Mix',
    segments: [mockStrategy1.segments[0]], // Single segment
  },
  finalCapital: 50000,
  totalWithdrawal: 900000,
  averageAnnualWithdrawal: 36000,
  duration: 22,
  result: {},
}

describe('SegmentedComparisonTable', () => {
  it('renders nothing when no comparison results', () => {
    const { container } = render(<SegmentedComparisonTable segmentedComparisonResults={[]} />)

    expect(container.firstChild).toBeNull()
  })

  it('renders nothing when only one comparison result', () => {
    const { container } = render(<SegmentedComparisonTable segmentedComparisonResults={[mockResult1]} />)

    expect(container.firstChild).toBeNull()
  })

  it('renders table with heading when multiple results', () => {
    render(<SegmentedComparisonTable segmentedComparisonResults={[mockResult1, mockResult2]} />)

    expect(screen.getByText('📊 Detaillierter Vergleich')).toBeInTheDocument()
  })

  it('renders table headers correctly', () => {
    render(<SegmentedComparisonTable segmentedComparisonResults={[mockResult1, mockResult2]} />)

    expect(screen.getByText('Konfiguration')).toBeInTheDocument()
    expect(screen.getByText('Endkapital')).toBeInTheDocument()
    expect(screen.getByText('Gesamtentnahme')).toBeInTheDocument()
    expect(screen.getByText('Ø Jährlich')).toBeInTheDocument()
    expect(screen.getByText('Laufzeit')).toBeInTheDocument()
    expect(screen.getByText('Phasen')).toBeInTheDocument()
  })

  it('renders strategy names in table', () => {
    render(<SegmentedComparisonTable segmentedComparisonResults={[mockResult1, mockResult2]} />)

    expect(screen.getByText('Conservative-Aggressive Mix')).toBeInTheDocument()
    expect(screen.getByText('Aggressive-Conservative Mix')).toBeInTheDocument()
  })

  it('renders financial metrics correctly', () => {
    render(<SegmentedComparisonTable segmentedComparisonResults={[mockResult1, mockResult2]} />)

    // Check endkapital
    expect(screen.getByText('75.000 €')).toBeInTheDocument()
    expect(screen.getByText('50.000 €')).toBeInTheDocument()

    // Check total withdrawal
    expect(screen.getByText('800.000 €')).toBeInTheDocument()
    expect(screen.getByText('900.000 €')).toBeInTheDocument()

    // Check average annual
    expect(screen.getByText('32.000 €')).toBeInTheDocument()
    expect(screen.getByText('36.000 €')).toBeInTheDocument()
  })

  it('renders duration in years', () => {
    render(<SegmentedComparisonTable segmentedComparisonResults={[mockResult1, mockResult2]} />)

    expect(screen.getByText('25 Jahre')).toBeInTheDocument()
    expect(screen.getByText('22 Jahre')).toBeInTheDocument()
  })

  it('handles unlimited duration as string', () => {
    const unlimitedResult = {
      ...mockResult1,
      duration: 'unbegrenzt',
    }

    render(<SegmentedComparisonTable segmentedComparisonResults={[unlimitedResult, mockResult2]} />)

    expect(screen.getByText('unbegrenzt')).toBeInTheDocument()
  })

  it('renders phase counts correctly', () => {
    render(<SegmentedComparisonTable segmentedComparisonResults={[mockResult1, mockResult2]} />)

    // mockResult1 has 2 segments, mockResult2 has 1 segment
    const cells = screen.getAllByRole('cell')
    const phaseCells = cells.filter((cell) => cell.textContent === '2' || cell.textContent === '1')

    expect(phaseCells.length).toBeGreaterThanOrEqual(2)
  })

  it('renders alternating row backgrounds', () => {
    const { container } = render(<SegmentedComparisonTable segmentedComparisonResults={[mockResult1, mockResult2]} />)

    const rows = container.querySelectorAll('tbody tr')
    expect(rows).toHaveLength(2)

    // First row should have white background class
    expect(rows[0]).toHaveClass('bg-white')
    // Second row should have gray background class
    expect(rows[1]).toHaveClass('bg-[#f8f9fa]')
  })
})
