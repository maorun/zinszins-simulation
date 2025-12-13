import { describe, test, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RiskAnalysisPanels } from './RiskAnalysisPanels'

// Define types for mock component props
interface MonteCarloDisplayProps {
  phaseTitle: string
}

interface DrawdownAnalysisProps {
  hasRiskData: boolean
}

// Mock the sub-components
vi.mock('./MonteCarloAnalysisDisplay', () => ({
  default: ({ phaseTitle }: MonteCarloDisplayProps) => (
    <div data-testid="monte-carlo-display">Monte Carlo Analysis - {phaseTitle}</div>
  ),
}))

vi.mock('./DrawdownAnalysis', () => ({
  DrawdownAnalysis: ({ hasRiskData }: DrawdownAnalysisProps) =>
    hasRiskData ? <div data-testid="drawdown-analysis">Drawdown Analysis</div> : null,
}))

const mockRiskConfig = {
  averageReturn: 0.07,
  standardDeviation: 0.12,
  seed: 12345,
}

const mockRiskMetrics = {
  valueAtRisk5: 0.15,
  valueAtRisk1: 0.25,
  maxDrawdown: 0.2,
  sharpeRatio: 1.5,
  volatility: 0.12,
  sortinoRatio: 2.0,
  calmarRatio: 1.2,
}

const mockPortfolioData = {
  years: [2020, 2021, 2022],
  values: [100000, 105000, 110000],
  riskFreeRate: 0.02,
}

describe('RiskAnalysisPanels', () => {
  test('renders Monte Carlo Analysis panel', async () => {
    const user = (await import('@testing-library/user-event')).default.setup()
    render(
      <RiskAnalysisPanels
        riskConfig={mockRiskConfig}
        phaseTitle="Ansparphase"
        blackSwanReturns={null}
        blackSwanEventName=""
        riskMetrics={mockRiskMetrics}
        portfolioData={mockPortfolioData}
        hasRiskData={true}
      />,
    )

    expect(screen.getByText(/Monte Carlo Analyse/)).toBeInTheDocument()

    // The panel is collapsed by default, need to expand it
    const monteCarloHeading = screen.getByText(/Monte Carlo Analyse/)
    await user.click(monteCarloHeading)

    // Wait for content to be visible
    await screen.findByTestId('monte-carlo-display')
  })

  test('renders Drawdown Analysis when hasRiskData is true', () => {
    render(
      <RiskAnalysisPanels
        riskConfig={mockRiskConfig}
        phaseTitle="Ansparphase"
        blackSwanReturns={null}
        blackSwanEventName=""
        riskMetrics={mockRiskMetrics}
        portfolioData={mockPortfolioData}
        hasRiskData={true}
      />,
    )

    expect(screen.getByTestId('drawdown-analysis')).toBeInTheDocument()
  })

  test('does not render Drawdown Analysis when hasRiskData is false', () => {
    render(
      <RiskAnalysisPanels
        riskConfig={mockRiskConfig}
        phaseTitle="Ansparphase"
        blackSwanReturns={null}
        blackSwanEventName=""
        riskMetrics={mockRiskMetrics}
        portfolioData={mockPortfolioData}
        hasRiskData={false}
      />,
    )

    expect(screen.queryByTestId('drawdown-analysis')).not.toBeInTheDocument()
  })

  test('passes correct phaseTitle to Monte Carlo Display', async () => {
    const user = (await import('@testing-library/user-event')).default.setup()
    render(
      <RiskAnalysisPanels
        riskConfig={mockRiskConfig}
        phaseTitle="Entnahmephase"
        blackSwanReturns={null}
        blackSwanEventName=""
        riskMetrics={mockRiskMetrics}
        portfolioData={mockPortfolioData}
        hasRiskData={true}
      />,
    )

    // The Monte Carlo panel is collapsed by default, need to expand it
    const monteCarloHeading = screen.getByText(/Monte Carlo Analyse/)
    await user.click(monteCarloHeading)

    // Wait for content to be visible
    await screen.findByText(/Entnahmephase/)
  })

  test('renders with Black Swan event data', async () => {
    const user = (await import('@testing-library/user-event')).default.setup()
    const blackSwanReturns = { 2020: -0.3, 2021: -0.2 }

    render(
      <RiskAnalysisPanels
        riskConfig={mockRiskConfig}
        phaseTitle="Ansparphase"
        blackSwanReturns={blackSwanReturns}
        blackSwanEventName="COVID-19 Crash"
        riskMetrics={mockRiskMetrics}
        portfolioData={mockPortfolioData}
        hasRiskData={true}
      />,
    )

    // The Monte Carlo panel is collapsed by default, need to expand it
    const monteCarloHeading = screen.getByText(/Monte Carlo Analyse/)
    await user.click(monteCarloHeading)

    // Wait for content to be visible
    await screen.findByTestId('monte-carlo-display')
  })

  test('renders collapsible panel structure correctly', () => {
    const { container } = render(
      <RiskAnalysisPanels
        riskConfig={mockRiskConfig}
        phaseTitle="Ansparphase"
        blackSwanReturns={null}
        blackSwanEventName=""
        riskMetrics={mockRiskMetrics}
        portfolioData={mockPortfolioData}
        hasRiskData={true}
      />,
    )

    // Check that the collapsible card wrapper exists
    const collapsibleCard = container.querySelector('.border-l-4.border-l-blue-400')
    expect(collapsibleCard).toBeInTheDocument()
  })
})
