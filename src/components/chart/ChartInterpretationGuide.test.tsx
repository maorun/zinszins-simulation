import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ChartInterpretationGuide } from './ChartInterpretationGuide'

describe('ChartInterpretationGuide', () => {
  const defaultProps = {
    showInflationAdjusted: false,
    showTaxes: true,
    chartView: 'overview' as const,
  }

  it('renders chart interpretation section', () => {
    render(<ChartInterpretationGuide {...defaultProps} />)

    expect(screen.getByText(/Chart-Interpretation:/)).toBeInTheDocument()
    expect(screen.getByText('Blaue Fläche:')).toBeInTheDocument()
    expect(screen.getByText('Grüne Fläche:')).toBeInTheDocument()
    expect(screen.getByText('Rote Linie:')).toBeInTheDocument()
  })

  it('renders interactive functions section', () => {
    render(<ChartInterpretationGuide {...defaultProps} />)

    expect(screen.getByText(/Interaktive Funktionen:/)).toBeInTheDocument()
    expect(screen.getByText(/Real-Werte:/)).toBeInTheDocument()
    expect(screen.getByText(/Steuern:/)).toBeInTheDocument()
    expect(screen.getByText(/Ansichten:/)).toBeInTheDocument()
  })

  it('shows tax line information when showTaxes is true', () => {
    render(<ChartInterpretationGuide {...defaultProps} showTaxes={true} />)

    expect(screen.getByText('Gelbe gestrichelte Linie:')).toBeInTheDocument()
    expect(screen.getByText(/Bezahlte Steuern/)).toBeInTheDocument()
  })

  it('hides tax line information when showTaxes is false', () => {
    render(<ChartInterpretationGuide {...defaultProps} showTaxes={false} />)

    expect(screen.queryByText('Gelbe gestrichelte Linie:')).not.toBeInTheDocument()
  })

  it('shows inflation adjusted text when showInflationAdjusted is true', () => {
    render(<ChartInterpretationGuide {...defaultProps} showInflationAdjusted={true} />)

    const inflationText = screen.getAllByText(/inflationsbereinigt/)
    expect(inflationText.length).toBeGreaterThan(0)
  })

  it('does not show inflation adjusted text when showInflationAdjusted is false', () => {
    render(<ChartInterpretationGuide {...defaultProps} showInflationAdjusted={false} />)

    const inflationText = screen.queryAllByText(/\(inflationsbereinigt\)/)
    expect(inflationText.length).toBe(0)
  })

  it('shows zoom information in detailed view', () => {
    render(<ChartInterpretationGuide {...defaultProps} chartView="detailed" />)

    expect(screen.getByText(/Zoom:/)).toBeInTheDocument()
    expect(screen.getByText(/Nutzen Sie den Slider unten für Zeitraum-Auswahl/)).toBeInTheDocument()
  })

  it('does not show zoom information in overview mode', () => {
    render(<ChartInterpretationGuide {...defaultProps} chartView="overview" />)

    expect(screen.queryByText(/Zoom:/)).not.toBeInTheDocument()
  })

  it('displays correct text for cumulative deposits', () => {
    render(<ChartInterpretationGuide {...defaultProps} />)

    expect(screen.getByText(/Ihre kumulierten Einzahlungen über Zeit/)).toBeInTheDocument()
  })

  it('displays correct text for interest and gains', () => {
    render(<ChartInterpretationGuide {...defaultProps} />)

    expect(screen.getByText(/Zinsen und Kapitalgewinne/)).toBeInTheDocument()
  })

  it('displays correct text for end capital', () => {
    render(<ChartInterpretationGuide {...defaultProps} />)

    expect(screen.getByText(/Gesamtes Endkapital/)).toBeInTheDocument()
  })
})
