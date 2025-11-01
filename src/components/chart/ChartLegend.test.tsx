import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ChartLegend } from './ChartLegend'

describe('ChartLegend', () => {
  const defaultProps = {
    showInflationAdjusted: false,
    showTaxes: true,
  }

  it('renders chart interpretation section', () => {
    render(<ChartLegend {...defaultProps} />)

    expect(screen.getByText(/Chart-Interpretation:/)).toBeInTheDocument()
    expect(screen.getByText('Blaue Fläche:')).toBeInTheDocument()
    expect(screen.getByText('Grüne Fläche:')).toBeInTheDocument()
    expect(screen.getByText('Rote Linie:')).toBeInTheDocument()
  })

  it('shows tax line information when showTaxes is true', () => {
    render(<ChartLegend {...defaultProps} showTaxes={true} />)

    expect(screen.getByText('Gelbe gestrichelte Linie:')).toBeInTheDocument()
    expect(screen.getByText(/Bezahlte Steuern/)).toBeInTheDocument()
  })

  it('hides tax line information when showTaxes is false', () => {
    render(<ChartLegend {...defaultProps} showTaxes={false} />)

    expect(screen.queryByText('Gelbe gestrichelte Linie:')).not.toBeInTheDocument()
  })

  it('shows inflation adjusted text when showInflationAdjusted is true', () => {
    render(<ChartLegend {...defaultProps} showInflationAdjusted={true} />)

    const inflationText = screen.getAllByText(/inflationsbereinigt/)
    expect(inflationText.length).toBeGreaterThan(0)
  })

  it('does not show inflation adjusted text when showInflationAdjusted is false', () => {
    render(<ChartLegend {...defaultProps} showInflationAdjusted={false} />)

    const inflationText = screen.queryAllByText(/\(inflationsbereinigt\)/)
    expect(inflationText.length).toBe(0)
  })

  it('displays correct text for cumulative deposits', () => {
    render(<ChartLegend {...defaultProps} />)

    expect(screen.getByText(/Ihre kumulierten Einzahlungen über Zeit/)).toBeInTheDocument()
  })

  it('displays correct text for interest and gains', () => {
    render(<ChartLegend {...defaultProps} />)

    expect(screen.getByText(/Zinsen und Kapitalgewinne/)).toBeInTheDocument()
  })

  it('displays correct text for end capital', () => {
    render(<ChartLegend {...defaultProps} />)

    expect(screen.getByText(/Gesamtes Endkapital/)).toBeInTheDocument()
  })
})
