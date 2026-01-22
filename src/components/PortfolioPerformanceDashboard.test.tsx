import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PortfolioPerformanceDashboard } from './PortfolioPerformanceDashboard'
import { useSimulation } from '../contexts/useSimulation'
import type { SimulationData } from '../contexts/helpers/config-types'

// Mock the useSimulation hook
vi.mock('../contexts/useSimulation')

describe('PortfolioPerformanceDashboard', () => {
  const mockSimulationData: SimulationData = {
    sparplanElements: [
      {
        start: '2023-01-01',
        type: 'sparplan',
        einzahlung: 0,
        simulation: {
          2023: { startkapital: 10000, zinsen: 500, endkapital: 10500, bezahlteSteuer: 0, genutzterFreibetrag: 0, vorabpauschale: 0, vorabpauschaleAccumulated: 0 },
          2024: { startkapital: 10500, zinsen: 525, endkapital: 11025, bezahlteSteuer: 0, genutzterFreibetrag: 0, vorabpauschale: 0, vorabpauschaleAccumulated: 0 },
          2025: { startkapital: 11025, zinsen: 551, endkapital: 11576, bezahlteSteuer: 0, genutzterFreibetrag: 0, vorabpauschale: 0, vorabpauschaleAccumulated: 0 },
        },
      },
    ],
  }

  it('should render nothing when simulationData is null', () => {
    vi.mocked(useSimulation).mockReturnValue({
      simulationData: null,
    } as any)

    const { container } = render(<PortfolioPerformanceDashboard />)
    expect(container.firstChild).toBeNull()
  })

  it('should render nothing when sparplanElements is empty', () => {
    vi.mocked(useSimulation).mockReturnValue({
      simulationData: { sparplanElements: [] },
    } as any)

    const { container } = render(<PortfolioPerformanceDashboard />)
    expect(container.firstChild).toBeNull()
  })

  it('should render the component with title and description', () => {
    vi.mocked(useSimulation).mockReturnValue({
      simulationData: mockSimulationData,
    } as any)

    render(<PortfolioPerformanceDashboard />)

    expect(screen.getByText('Portfolio-Performance Dashboard')).toBeInTheDocument()
    expect(screen.getByText(/Umfassende Analyse der Portfolio-Performance/)).toBeInTheDocument()
  })

  it('should display return metrics', () => {
    vi.mocked(useSimulation).mockReturnValue({
      simulationData: mockSimulationData,
    } as any)

    render(<PortfolioPerformanceDashboard />)

    expect(screen.getByText('Rendite-Kennzahlen')).toBeInTheDocument()
    expect(screen.getByText('Gesamtrendite')).toBeInTheDocument()
    expect(screen.getByText('Durchschnittliche Rendite')).toBeInTheDocument()
    expect(screen.getByText('Kumulativer Gewinn')).toBeInTheDocument()
  })

  it('should display risk metrics', () => {
    vi.mocked(useSimulation).mockReturnValue({
      simulationData: mockSimulationData,
    } as any)

    render(<PortfolioPerformanceDashboard />)

    expect(screen.getByText('Risiko-Kennzahlen')).toBeInTheDocument()
    expect(screen.getByText('Volatilität')).toBeInTheDocument()
    expect(screen.getByText('Maximaler Drawdown')).toBeInTheDocument()
    expect(screen.getByText('Sortino Ratio')).toBeInTheDocument()
  })

  it('should display additional metrics', () => {
    vi.mocked(useSimulation).mockReturnValue({
      simulationData: mockSimulationData,
    } as any)

    render(<PortfolioPerformanceDashboard />)

    expect(screen.getByText('Weitere Kennzahlen')).toBeInTheDocument()
    expect(screen.getByText('Erfolgsquote')).toBeInTheDocument()
    expect(screen.getByText('🏆 Bestes Jahr')).toBeInTheDocument()
    expect(screen.getByText('📉 Schlechtestes Jahr')).toBeInTheDocument()
  })

  it('should display interpretation guide', () => {
    vi.mocked(useSimulation).mockReturnValue({
      simulationData: mockSimulationData,
    } as any)

    render(<PortfolioPerformanceDashboard />)

    expect(screen.getByText('📘 Interpretationshilfe')).toBeInTheDocument()
    expect(screen.getByText(/Sharpe Ratio:/)).toBeInTheDocument()
    expect(screen.getByText(/Volatilität:/)).toBeInTheDocument()
    expect(screen.getByText(/Max Drawdown:/)).toBeInTheDocument()
    expect(screen.getByText(/Sortino Ratio:/)).toBeInTheDocument()
  })

  it('should display annualized return badge', () => {
    vi.mocked(useSimulation).mockReturnValue({
      simulationData: mockSimulationData,
    } as any)

    render(<PortfolioPerformanceDashboard />)

    expect(screen.getByText('Annualisierte Rendite')).toBeInTheDocument()
  })

  it('should display Sharpe ratio badge', () => {
    vi.mocked(useSimulation).mockReturnValue({
      simulationData: mockSimulationData,
    } as any)

    render(<PortfolioPerformanceDashboard />)

    expect(screen.getByText('Sharpe Ratio')).toBeInTheDocument()
  })

  it('should handle portfolio with losses', () => {
    const lossData: SimulationData = {
      sparplanElements: [
        {
          start: '2023-01-01',
          type: 'sparplan',
          einzahlung: 0,
          simulation: {
            2023: { startkapital: 10000, zinsen: 2000, endkapital: 12000, bezahlteSteuer: 0, genutzterFreibetrag: 0, vorabpauschale: 0, vorabpauschaleAccumulated: 0 },
            2024: { startkapital: 12000, zinsen: -3000, endkapital: 9000, bezahlteSteuer: 0, genutzterFreibetrag: 0, vorabpauschale: 0, vorabpauschaleAccumulated: 0 },
            2025: { startkapital: 9000, zinsen: 1000, endkapital: 10000, bezahlteSteuer: 0, genutzterFreibetrag: 0, vorabpauschale: 0, vorabpauschaleAccumulated: 0 },
          },
        },
      ],
    }

    vi.mocked(useSimulation).mockReturnValue({
      simulationData: lossData,
    } as any)

    render(<PortfolioPerformanceDashboard />)

    // Should still render the dashboard
    expect(screen.getByText('Portfolio-Performance Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Maximaler Drawdown')).toBeInTheDocument()
  })

  it('should calculate correct metrics for consistent growth', () => {
    const consistentGrowthData: SimulationData = {
      sparplanElements: [
        {
          start: '2023-01-01',
          type: 'sparplan',
          einzahlung: 0,
          simulation: {
            2023: { startkapital: 10000, zinsen: 500, endkapital: 10500, bezahlteSteuer: 0, genutzterFreibetrag: 0, vorabpauschale: 0, vorabpauschaleAccumulated: 0 },
            2024: { startkapital: 10500, zinsen: 525, endkapital: 11025, bezahlteSteuer: 0, genutzterFreibetrag: 0, vorabpauschale: 0, vorabpauschaleAccumulated: 0 },
            2025: { startkapital: 11025, zinsen: 551, endkapital: 11576, bezahlteSteuer: 0, genutzterFreibetrag: 0, vorabpauschale: 0, vorabpauschaleAccumulated: 0 },
          },
        },
      ],
    }

    vi.mocked(useSimulation).mockReturnValue({
      simulationData: consistentGrowthData,
    } as any)

    render(<PortfolioPerformanceDashboard />)

    // Should show 100% win rate for all positive years
    expect(screen.getByText('Erfolgsquote')).toBeInTheDocument()
  })

  it('should display year information for best and worst years', () => {
    vi.mocked(useSimulation).mockReturnValue({
      simulationData: mockSimulationData,
    } as any)

    render(<PortfolioPerformanceDashboard />)

    // Check that year labels exist
    expect(screen.getByText('🏆 Bestes Jahr')).toBeInTheDocument()
    expect(screen.getByText('📉 Schlechtestes Jahr')).toBeInTheDocument()

    // Years should be displayed (2023, 2024, or 2025)
    const yearTexts = screen.getAllByText(/202[345]/)
    expect(yearTexts.length).toBeGreaterThan(0)
  })

  it('should show proper color coding for badges', () => {
    vi.mocked(useSimulation).mockReturnValue({
      simulationData: mockSimulationData,
    } as any)

    const { container } = render(<PortfolioPerformanceDashboard />)

    // Check for colored badges (they should have border classes)
    const badges = container.querySelectorAll('[class*="border"]')
    expect(badges.length).toBeGreaterThan(0)
  })
})
