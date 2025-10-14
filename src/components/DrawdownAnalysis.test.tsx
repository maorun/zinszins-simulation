import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DrawdownAnalysis } from './DrawdownAnalysis'
import type { RiskMetrics, PortfolioData } from '../utils/risk-metrics'

describe('DrawdownAnalysis', () => {
  const setupTest = () => {
    const user = userEvent.setup()
    return { user }
  }

  const mockPortfolioData: PortfolioData = {
    years: [2023, 2024, 2025, 2026, 2027],
    values: [10000, 12000, 11000, 13000, 15000],
    riskFreeRate: 0.02,
  }

  const mockRiskMetrics: RiskMetrics = {
    valueAtRisk5: 0.15,
    valueAtRisk1: 0.25,
    maxDrawdown: 0.20,
    sharpeRatio: 1.5,
    sortinoRatio: 2.0,
    calmarRatio: 0.8,
    volatility: 0.12,
    drawdownSeries: [
      { year: 0, value: 10000, drawdown: 0 },
      { year: 1, value: 12000, drawdown: 0 },
      { year: 2, value: 11000, drawdown: 8.33 },
      { year: 3, value: 13000, drawdown: 0 },
      { year: 4, value: 15000, drawdown: 0 },
    ],
  }

  it('returns null when no drawdown series', () => {
    const metricsNoSeries = { ...mockRiskMetrics, drawdownSeries: undefined }
    const { container } = render(
      <DrawdownAnalysis
        riskMetrics={metricsNoSeries}
        portfolioData={mockPortfolioData}
        hasRiskData={true}
      />,
    )

    expect(container.firstChild).toBeNull()
  })

  it('returns null when drawdown series is too short', () => {
    const metricsShortSeries = { ...mockRiskMetrics, drawdownSeries: [{ year: 0, value: 10000, drawdown: 0 }] }
    const { container } = render(
      <DrawdownAnalysis
        riskMetrics={metricsShortSeries}
        portfolioData={mockPortfolioData}
        hasRiskData={true}
      />,
    )

    expect(container.firstChild).toBeNull()
  })

  it('returns null when no risk data', () => {
    const { container } = render(
      <DrawdownAnalysis
        riskMetrics={mockRiskMetrics}
        portfolioData={mockPortfolioData}
        hasRiskData={false}
      />,
    )

    expect(container.firstChild).toBeNull()
  })

  it('renders drawdown analysis when data is available', async () => {
    const { user } = setupTest()
    render(
      <DrawdownAnalysis
        riskMetrics={mockRiskMetrics}
        portfolioData={mockPortfolioData}
        hasRiskData={true}
      />,
    )

    expect(screen.getByText('📈 Drawdown-Analyse')).toBeInTheDocument()

    // Expand the card to see content
    const header = screen.getByText('📈 Drawdown-Analyse')
    await user.click(header)

    expect(screen.getByText(/Drawdown-Analyse:/)).toBeInTheDocument()
  })

  it('shows statistics for significant drawdowns', async () => {
    const { user } = setupTest()
    render(
      <DrawdownAnalysis
        riskMetrics={mockRiskMetrics}
        portfolioData={mockPortfolioData}
        hasRiskData={true}
      />,
    )

    // Expand the card first
    const header = screen.getByText('📈 Drawdown-Analyse')
    await user.click(header)

    expect(screen.getByText('Maximum Drawdown')).toBeInTheDocument()
    expect(screen.getByText('Durchschnittlicher Drawdown')).toBeInTheDocument()
    expect(screen.getByText('Perioden im Drawdown')).toBeInTheDocument()
  })

  it('shows table with drawdown details', async () => {
    const { user } = setupTest()
    render(
      <DrawdownAnalysis
        riskMetrics={mockRiskMetrics}
        portfolioData={mockPortfolioData}
        hasRiskData={true}
      />,
    )

    // Expand the card first
    const header = screen.getByText('📈 Drawdown-Analyse')
    await user.click(header)

    expect(screen.getByText('Jahr')).toBeInTheDocument()
    expect(screen.getByText('Portfolio-Wert')).toBeInTheDocument()
    expect(screen.getByText('Drawdown')).toBeInTheDocument()
  })

  it('shows positive message when no significant drawdowns', async () => {
    const { user } = setupTest()
    const metricsNoDrawdowns = {
      ...mockRiskMetrics,
      drawdownSeries: [
        { year: 0, value: 10000, drawdown: 0 },
        { year: 1, value: 12000, drawdown: 0 },
        { year: 2, value: 13000, drawdown: 0 },
        { year: 3, value: 14000, drawdown: 0 },
      ],
    }

    render(
      <DrawdownAnalysis
        riskMetrics={metricsNoDrawdowns}
        portfolioData={mockPortfolioData}
        hasRiskData={true}
      />,
    )

    // Expand the card first
    const header = screen.getByText('📈 Drawdown-Analyse')
    await user.click(header)

    expect(screen.getByText('✅ Keine signifikanten Drawdowns')).toBeInTheDocument()
    expect(screen.getByText(/stabile Aufwärtsentwicklung/)).toBeInTheDocument()
  })

  it('limits table to 10 significant drawdowns', async () => {
    const { user } = setupTest()
    const manyDrawdowns = {
      ...mockRiskMetrics,
      drawdownSeries: Array.from({ length: 20 }, (_, i) => ({
        year: i,
        value: 10000,
        drawdown: 2, // Significant drawdown > 1%
      })),
    }

    render(
      <DrawdownAnalysis
        riskMetrics={manyDrawdowns}
        portfolioData={mockPortfolioData}
        hasRiskData={true}
      />,
    )

    // Expand the card first
    const header = screen.getByText('📈 Drawdown-Analyse')
    await user.click(header)

    expect(screen.getByText(/ersten 10 Jahre mit signifikanten Drawdowns/)).toBeInTheDocument()
  })
})
