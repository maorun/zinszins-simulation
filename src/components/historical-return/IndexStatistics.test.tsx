import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { IndexStatistics } from './IndexStatistics'
import type { HistoricalIndex } from '../../utils/historical-data'

const mockIndex: HistoricalIndex = {
  id: 'dax',
  name: 'DAX',
  description: 'Deutscher Aktienindex',
  startYear: 2000,
  endYear: 2023,
  currency: 'EUR',
  averageReturn: 0.075,
  volatility: 0.22,
  data: [
    { year: 2000, return: -0.07 },
    { year: 2001, return: -0.19 },
    { year: 2002, return: -0.44 },
    { year: 2003, return: 0.37 },
  ],
}

describe('IndexStatistics', () => {
  it('should render statistics heading with correct year range', () => {
    render(<IndexStatistics index={mockIndex} nestingLevel={0} />)

    expect(screen.getByText(/Statistische Kennzahlen/)).toBeInTheDocument()
    expect(screen.getByText(/2000-2023/)).toBeInTheDocument()
  })

  it('should display average return correctly formatted', () => {
    render(<IndexStatistics index={mockIndex} nestingLevel={0} />)

    expect(screen.getByText('Ø Rendite p.a.:')).toBeInTheDocument()
    expect(screen.getByText('7.5%')).toBeInTheDocument()
  })

  it('should display volatility correctly formatted', () => {
    render(<IndexStatistics index={mockIndex} nestingLevel={0} />)

    expect(screen.getByText('Volatilität:')).toBeInTheDocument()
    expect(screen.getByText('22.0%')).toBeInTheDocument()
  })

  it('should display currency', () => {
    render(<IndexStatistics index={mockIndex} nestingLevel={0} />)

    expect(screen.getByText('Währung:')).toBeInTheDocument()
    expect(screen.getByText('EUR')).toBeInTheDocument()
  })

  it('should display data points count', () => {
    render(<IndexStatistics index={mockIndex} nestingLevel={0} />)

    expect(screen.getByText('Datenpunkte:')).toBeInTheDocument()
    expect(screen.getByText(/4/)).toBeInTheDocument()
    expect(screen.getByText(/Jahre/)).toBeInTheDocument()
  })

  it('should render with different nesting levels', () => {
    const { rerender } = render(<IndexStatistics index={mockIndex} nestingLevel={0} />)
    expect(screen.getByText('Ø Rendite p.a.:')).toBeInTheDocument()

    rerender(<IndexStatistics index={mockIndex} nestingLevel={2} />)
    expect(screen.getByText('Ø Rendite p.a.:')).toBeInTheDocument()
  })

  it('should display TrendingUp icon', () => {
    const { container } = render(<IndexStatistics index={mockIndex} nestingLevel={0} />)

    const icon = container.querySelector('.text-blue-600')
    expect(icon).toBeInTheDocument()
  })

  it('should format negative returns correctly', () => {
    const indexWithNegativeReturn: HistoricalIndex = {
      ...mockIndex,
      averageReturn: -0.05,
    }

    render(<IndexStatistics index={indexWithNegativeReturn} nestingLevel={0} />)
    expect(screen.getByText('-5.0%')).toBeInTheDocument()
  })

  it('should handle zero values correctly', () => {
    const indexWithZero: HistoricalIndex = {
      ...mockIndex,
      averageReturn: 0,
      volatility: 0,
    }

    render(<IndexStatistics index={indexWithZero} nestingLevel={0} />)
    expect(screen.getAllByText('0.0%').length).toBe(2)
  })

  it('should display all statistics in a grid layout', () => {
    const { container } = render(<IndexStatistics index={mockIndex} nestingLevel={0} />)

    const grid = container.querySelector('.grid.grid-cols-2')
    expect(grid).toBeInTheDocument()
  })
})
