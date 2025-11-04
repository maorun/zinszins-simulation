import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HistoricalReturnContent } from './HistoricalReturnContent'
import { HISTORICAL_INDICES } from '../../utils/historical-data'

describe('HistoricalReturnContent', () => {
  const daxIndex = HISTORICAL_INDICES.find(idx => idx.id === 'dax')!

  it('should render all main sections', () => {
    const mockOnIndexChange = vi.fn()
    render(
      <HistoricalReturnContent
        nestingLevel={0}
        selectedIndexId="dax"
        onIndexChange={mockOnIndexChange}
        currentIndex={daxIndex}
        simulationStartYear={2024}
        simulationEndYear={2040}
        isAvailable={true}
        historicalReturns={{ 2020: 0.05, 2021: 0.07 }}
      />,
    )

    // Check for important sections
    expect(screen.getByText('Wichtiger Hinweis zum Backtesting')).toBeInTheDocument()
    expect(screen.getByText('Historischer Index für Backtesting')).toBeInTheDocument()
    expect(screen.getByText(/Statistische Kennzahlen/)).toBeInTheDocument()
  })

  it('should display index statistics when currentIndex is provided', () => {
    const mockOnIndexChange = vi.fn()
    render(
      <HistoricalReturnContent
        nestingLevel={0}
        selectedIndexId="dax"
        onIndexChange={mockOnIndexChange}
        currentIndex={daxIndex}
        simulationStartYear={2024}
        simulationEndYear={2040}
        isAvailable={true}
        historicalReturns={{ 2020: 0.05 }}
      />,
    )

    expect(screen.getByText(/Ø Rendite p.a.:/)).toBeInTheDocument()
    expect(screen.getByText(/Volatilität:/)).toBeInTheDocument()
  })

  it('should not display index statistics when currentIndex is undefined', () => {
    const mockOnIndexChange = vi.fn()
    render(
      <HistoricalReturnContent
        nestingLevel={0}
        selectedIndexId="invalid"
        onIndexChange={mockOnIndexChange}
        currentIndex={undefined}
        simulationStartYear={2024}
        simulationEndYear={2040}
        isAvailable={false}
        historicalReturns={null}
      />,
    )

    expect(screen.queryByText(/Ø Rendite p.a.:/)).not.toBeInTheDocument()
  })

  it('should display data availability warning when data is not available', () => {
    const mockOnIndexChange = vi.fn()
    render(
      <HistoricalReturnContent
        nestingLevel={0}
        selectedIndexId="dax"
        onIndexChange={mockOnIndexChange}
        currentIndex={daxIndex}
        simulationStartYear={2024}
        simulationEndYear={2050}
        isAvailable={false}
        historicalReturns={null}
      />,
    )

    expect(screen.getByText(/Begrenzte Datenabdeckung/)).toBeInTheDocument()
  })

  it('should not display data availability warning when data is available', () => {
    const mockOnIndexChange = vi.fn()
    render(
      <HistoricalReturnContent
        nestingLevel={0}
        selectedIndexId="dax"
        onIndexChange={mockOnIndexChange}
        currentIndex={daxIndex}
        simulationStartYear={2024}
        simulationEndYear={2023}
        isAvailable={true}
        historicalReturns={{ 2020: 0.05 }}
      />,
    )

    expect(screen.queryByText(/Begrenzte Datenabdeckung/)).not.toBeInTheDocument()
  })

  it('should display historical data preview when historicalReturns is provided', () => {
    const mockOnIndexChange = vi.fn()
    render(
      <HistoricalReturnContent
        nestingLevel={0}
        selectedIndexId="dax"
        onIndexChange={mockOnIndexChange}
        currentIndex={daxIndex}
        simulationStartYear={2024}
        simulationEndYear={2040}
        isAvailable={true}
        historicalReturns={{ 2020: 0.05, 2021: 0.07 }}
      />,
    )

    expect(screen.getByText(/Historische Renditen/)).toBeInTheDocument()
  })

  it('should not display historical data preview when historicalReturns is null', () => {
    const mockOnIndexChange = vi.fn()
    render(
      <HistoricalReturnContent
        nestingLevel={0}
        selectedIndexId="dax"
        onIndexChange={mockOnIndexChange}
        currentIndex={daxIndex}
        simulationStartYear={2024}
        simulationEndYear={2040}
        isAvailable={true}
        historicalReturns={null}
      />,
    )

    expect(screen.queryByText(/Historische Renditen/)).not.toBeInTheDocument()
  })

  it('should render backtesting warning', () => {
    const mockOnIndexChange = vi.fn()
    render(
      <HistoricalReturnContent
        nestingLevel={0}
        selectedIndexId="dax"
        onIndexChange={mockOnIndexChange}
        currentIndex={daxIndex}
        simulationStartYear={2024}
        simulationEndYear={2040}
        isAvailable={true}
        historicalReturns={null}
      />,
    )

    expect(screen.getByText(/Die Vergangenheit lässt keine Rückschlüsse auf die Zukunft zu/))
      .toBeInTheDocument()
  })
})
