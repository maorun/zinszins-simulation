import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HistoricalDataPreview } from './HistoricalDataPreview'

const mockReturns: Record<string, number> = {
  2020: 0.04,
  2021: 0.15,
  2022: -0.12,
  2023: 0.2,
  2024: 0.08,
  2025: -0.05,
  2026: 0.12,
  2027: 0.07,
  2028: 0.1,
  2029: 0.03,
}

describe('HistoricalDataPreview', () => {
  it('should render heading', () => {
    render(<HistoricalDataPreview historicalReturns={mockReturns} nestingLevel={0} />)

    expect(screen.getByText('Historische Renditen (Auswahl)')).toBeInTheDocument()
  })

  it('should display last 8 years only', () => {
    render(<HistoricalDataPreview historicalReturns={mockReturns} nestingLevel={0} />)

    // Should show 2022-2029 (8 years)
    expect(screen.getByText('2022:')).toBeInTheDocument()
    expect(screen.getByText('2029:')).toBeInTheDocument()

    // Should NOT show 2020-2021
    expect(screen.queryByText('2020:')).not.toBeInTheDocument()
    expect(screen.queryByText('2021:')).not.toBeInTheDocument()
  })

  it('should display positive returns in green', () => {
    const { container } = render(<HistoricalDataPreview historicalReturns={mockReturns} nestingLevel={0} />)

    const greenElements = container.querySelectorAll('.text-green-600')
    expect(greenElements.length).toBeGreaterThan(0)
  })

  it('should display negative returns in red', () => {
    const { container } = render(<HistoricalDataPreview historicalReturns={mockReturns} nestingLevel={0} />)

    const redElements = container.querySelectorAll('.text-red-600')
    expect(redElements.length).toBeGreaterThan(0)
  })

  it('should format percentage values correctly', () => {
    render(<HistoricalDataPreview historicalReturns={mockReturns} nestingLevel={0} />)

    // Check for some formatted values
    expect(screen.getByText('20.0%')).toBeInTheDocument() // 2023: 0.20
    expect(screen.getByText('-12.0%')).toBeInTheDocument() // 2022: -0.12
  })

  it('should display explanatory text', () => {
    render(<HistoricalDataPreview historicalReturns={mockReturns} nestingLevel={0} />)

    expect(
      screen.getByText(/Die Simulation verwendet die tatsächlichen historischen Jahresrenditen/),
    ).toBeInTheDocument()
  })

  it('should return null when no data provided', () => {
    const { container } = render(<HistoricalDataPreview historicalReturns={{}} nestingLevel={0} />)

    expect(container.firstChild).toBeNull()
  })

  it('should render with different nesting levels', () => {
    const { rerender } = render(<HistoricalDataPreview historicalReturns={mockReturns} nestingLevel={0} />)
    expect(screen.getByText('Historische Renditen (Auswahl)')).toBeInTheDocument()

    rerender(<HistoricalDataPreview historicalReturns={mockReturns} nestingLevel={2} />)
    expect(screen.getByText('Historische Renditen (Auswahl)')).toBeInTheDocument()
  })

  it('should handle single year data', () => {
    const singleYear = { 2023: 0.05 }
    render(<HistoricalDataPreview historicalReturns={singleYear} nestingLevel={0} />)

    expect(screen.getByText('2023:')).toBeInTheDocument()
    expect(screen.getByText('5.0%')).toBeInTheDocument()
  })

  it('should handle zero return values', () => {
    const zeroReturns = { 2023: 0, 2024: 0 }
    render(<HistoricalDataPreview historicalReturns={zeroReturns} nestingLevel={0} />)

    // Zero should be displayed in green (>= 0)
    expect(screen.getAllByText('0.0%').length).toBe(2)
  })

  it('should display data in a grid layout', () => {
    const { container } = render(<HistoricalDataPreview historicalReturns={mockReturns} nestingLevel={0} />)

    const grid = container.querySelector('.grid.grid-cols-2')
    expect(grid).toBeInTheDocument()
  })

  it('should make content scrollable for many years', () => {
    const { container } = render(<HistoricalDataPreview historicalReturns={mockReturns} nestingLevel={0} />)

    const scrollContainer = container.querySelector('.max-h-32.overflow-y-auto')
    expect(scrollContainer).toBeInTheDocument()
  })
})
