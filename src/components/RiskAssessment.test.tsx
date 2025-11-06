import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RiskAssessment from './RiskAssessment'

// Mock the useSimulation hook
vi.mock('../contexts/useSimulation', () => ({
  useSimulation: vi.fn(),
}))

// Mock the MonteCarloAnalysisDisplay component
vi.mock('./MonteCarloAnalysisDisplay', () => ({
  default: ({ title }: { title: string }) => <div data-testid="monte-carlo-display">{title}</div>,
}))

const { useSimulation } = await import('../contexts/useSimulation')

const sampleSimulationData = {
  sparplanElements: [
    {
      simulation: {
        2020: { endkapital: 100000 },
        2021: { endkapital: 105000 },
        2022: { endkapital: 102000 },
        2023: { endkapital: 108000 },
        2024: { endkapital: 115000 },
      },
    },
    {
      simulation: {
        2020: { endkapital: 50000 },
        2021: { endkapital: 52500 },
        2022: { endkapital: 51000 },
        2023: { endkapital: 54000 },
        2024: { endkapital: 57500 },
      },
    },
  ],
}

describe('RiskAssessment', () => {
  beforeEach(() => {
    vi.mocked(useSimulation).mockReturnValue({
      simulationData: sampleSimulationData,
      averageReturn: 7,
      standardDeviation: 15,
      randomSeed: 12345,
    } as any)
  })

  test('renders risk assessment for savings phase', async () => {
    render(<RiskAssessment phase="savings" />)

    // Check that the heading is visible
    expect(screen.getByText(/Risikobewertung - Ansparphase/)).toBeInTheDocument()

    // Expand the panel to access the content
    const heading = screen.getByText(/🎯 Risikobewertung - Ansparphase/)
    fireEvent.click(heading)

    // Wait for content to become visible
    await waitFor(() => {
      expect(screen.getAllByText(/Value-at-Risk \(95%\)/)[0]).toBeInTheDocument()
      expect(screen.getAllByText(/Maximum Drawdown/)[0]).toBeInTheDocument()
      expect(screen.getAllByText(/Sharpe Ratio/)[0]).toBeInTheDocument()
      expect(screen.getAllByText(/Volatilität/)[0]).toBeInTheDocument()
    })
  })

  test('renders risk assessment for withdrawal phase', async () => {
    render(<RiskAssessment phase="withdrawal" />)

    // Check that the heading is visible
    expect(screen.getByText(/Risikobewertung - Entnahmephase/)).toBeInTheDocument()

    // Expand the panel to access the content
    const heading = screen.getByText(/🎯 Risikobewertung - Entnahmephase/)
    fireEvent.click(heading)

    // Wait for content to become visible
    await waitFor(() => {
      expect(screen.getAllByText(/Value-at-Risk/)).toHaveLength(2) // 95% and 99%
    })
  })

  test('displays risk metrics cards', async () => {
    render(<RiskAssessment phase="savings" />)

    // Expand the panel to access the content
    const heading = screen.getByText(/🎯 Risikobewertung - Ansparphase/)
    fireEvent.click(heading)

    // Wait for content to become visible and check for risk metric cards
    await waitFor(() => {
      expect(screen.getAllByText(/Value-at-Risk \(95%\)/)[0]).toBeInTheDocument()
      expect(screen.getAllByText(/Maximum Drawdown/)[0]).toBeInTheDocument()
      expect(screen.getAllByText(/Sharpe Ratio/)[0]).toBeInTheDocument()
      expect(screen.getAllByText(/Volatilität/)[0]).toBeInTheDocument()
      expect(screen.getAllByText(/Sortino Ratio/)[0]).toBeInTheDocument()
      expect(screen.getAllByText(/Calmar Ratio/)[0]).toBeInTheDocument()
    })
  })

  test('includes Monte Carlo analysis in collapsible panel', async () => {
    const user = userEvent.setup()
    render(<RiskAssessment phase="savings" />)

    // First expand the main risk assessment panel
    const expandHeading = screen.getByText(/🎯 Risikobewertung - Ansparphase/)
    await user.click(expandHeading)

    // Wait for the main panel content to become visible
    await waitFor(() => {
      expect(screen.getByText(/Monte Carlo Analyse/)).toBeInTheDocument()
    })

    // Now expand the nested Monte Carlo analysis panel
    const monteCarloHeading = screen.getByText(/🎲 Monte Carlo Analyse/)
    await user.click(monteCarloHeading)

    // Wait for the Monte Carlo content to become visible
    await waitFor(
      () => {
        expect(screen.getByTestId('monte-carlo-display')).toBeInTheDocument()
      },
      { timeout: 1000 },
    )
  })

  test('shows risk metrics with inline explanations', async () => {
    const user = userEvent.setup()
    render(<RiskAssessment phase="savings" />)

    // First expand the risk assessment panel by clicking on the heading
    const expandButton = screen.getByText(/🎯 Risikobewertung - Ansparphase/)
    await user.click(expandButton)

    // Check that metrics have their explanations inline
    expect(screen.getByText(/Zeigt potenzielle Verluste in einer bestimmten Zeitperiode/)).toBeInTheDocument()
    expect(screen.getByText(/Misst die risikoadjustierte Rendite/)).toBeInTheDocument()
    expect(screen.getByText(/Der größte Verlust vom Höchststand/)).toBeInTheDocument()
    expect(screen.getByText(/Standardabweichung der Renditen/)).toBeInTheDocument()
  })

  test('returns null when no simulation data', () => {
    vi.mocked(useSimulation).mockReturnValue({
      simulationData: null,
      averageReturn: 7,
      standardDeviation: 15,
      randomSeed: 12345,
    } as any)

    const { container } = render(<RiskAssessment phase="savings" />)
    expect(container.firstChild).toBeNull()
  })

  test('uses custom config when provided', () => {
    const customConfig = {
      averageReturn: 0.08,
      standardDeviation: 0.2,
      seed: 54321,
    }

    render(<RiskAssessment phase="savings" config={customConfig} />)

    // Component should render with the custom configuration
    expect(screen.getByText(/Risikobewertung - Ansparphase/)).toBeInTheDocument()
  })

  test('calculates risk metrics from simulation data', async () => {
    const user = userEvent.setup()
    render(<RiskAssessment phase="savings" />)

    // First expand the risk assessment panel by clicking on the heading
    const expandButton = screen.getByText(/🎯 Risikobewertung - Ansparphase/)
    await user.click(expandButton)

    // Should display numerical risk values (even if we can't predict exact values)
    const valueAtRiskElements = screen.getAllByText(/%$/)
    expect(valueAtRiskElements.length).toBeGreaterThan(0)
  })

  test('shows drawdown analysis when sufficient data available', async () => {
    const user = userEvent.setup()
    render(<RiskAssessment phase="savings" />)

    // First expand the risk assessment panel by clicking on the heading
    const expandButton = screen.getByText(/🎯 Risikobewertung - Ansparphase/)
    await user.click(expandButton)

    // Should include drawdown analysis section
    expect(screen.getAllByText(/Drawdown-Analyse/)[0]).toBeInTheDocument()
  })

  test('adapts phase-specific configuration', () => {
    // Test savings phase
    const { rerender } = render(<RiskAssessment phase="savings" />)
    expect(screen.getAllByText(/Ansparphase/)[0]).toBeInTheDocument()

    // Test withdrawal phase
    rerender(<RiskAssessment phase="withdrawal" />)
    expect(screen.getAllByText(/Entnahmephase/)[0]).toBeInTheDocument()
  })

  test('handles edge case with minimal data', () => {
    const minimalData = {
      sparplanElements: [
        {
          simulation: {
            2020: { endkapital: 100000 },
          },
        },
      ],
    }

    vi.mocked(useSimulation).mockReturnValue({
      simulationData: minimalData,
      averageReturn: 7,
      standardDeviation: 15,
      randomSeed: 12345,
    } as any)

    render(<RiskAssessment phase="savings" />)

    // Should still render the component structure
    expect(screen.getByText(/Risikobewertung - Ansparphase/)).toBeInTheDocument()
  })
})
