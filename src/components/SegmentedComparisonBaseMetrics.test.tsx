import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { SegmentedComparisonBaseMetrics } from './SegmentedComparisonBaseMetrics'

// Mock currency formatting
vi.mock('../utils/currency', () => ({
  formatCurrency: (amount: number) => `${amount.toLocaleString('de-DE')} €`,
}))

describe('SegmentedComparisonBaseMetrics', () => {
  it('renders base configuration heading', () => {
    render(<SegmentedComparisonBaseMetrics endkapital={100000} duration={25} />)

    expect(screen.getByText('📊 Basis-Konfiguration (aktuell):')).toBeInTheDocument()
  })

  it('displays endkapital correctly', () => {
    render(<SegmentedComparisonBaseMetrics endkapital={100000} duration={25} />)

    expect(screen.getByText('Endkapital:')).toBeInTheDocument()
    expect(screen.getByText('100.000 €')).toBeInTheDocument()
  })

  it('displays duration in years (plural)', () => {
    render(<SegmentedComparisonBaseMetrics endkapital={100000} duration={25} />)

    expect(screen.getByText('Vermögen reicht für:')).toBeInTheDocument()
    expect(screen.getByText('25 Jahre')).toBeInTheDocument()
  })

  it('displays duration in year (singular)', () => {
    render(<SegmentedComparisonBaseMetrics endkapital={100000} duration={1} />)

    expect(screen.getByText('1 Jahr')).toBeInTheDocument()
  })

  it('displays unlimited duration when duration is null', () => {
    render(<SegmentedComparisonBaseMetrics endkapital={500000} duration={null} />)

    expect(screen.getByText('unbegrenzt')).toBeInTheDocument()
  })

  it('handles zero endkapital', () => {
    render(<SegmentedComparisonBaseMetrics endkapital={0} duration={10} />)

    expect(screen.getByText('0 €')).toBeInTheDocument()
  })

  it('handles large endkapital values', () => {
    render(<SegmentedComparisonBaseMetrics endkapital={1500000} duration={30} />)

    expect(screen.getByText('1.500.000 €')).toBeInTheDocument()
  })
})
