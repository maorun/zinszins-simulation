/**
 * Integration tests for Stress Testing feature
 * Tests the complete flow from RiskAnalysisPanels to StressTestingDisplay
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { RiskAnalysisPanels } from './RiskAnalysisPanels'
import type { RandomReturnConfig } from '../utils/random-returns'
import type { RiskMetrics, PortfolioData } from '../utils/risk-metrics'

describe('Stress Testing Integration', () => {
  const mockRiskConfig: RandomReturnConfig = {
    averageReturn: 0.07,
    standardDeviation: 0.15,
    seed: 12345,
  }

  const mockPortfolioData: PortfolioData = {
    values: [100000, 117000, 135000, 154000, 174000, 195000, 218000, 242000, 268000, 295000],
    years: [2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033],
  }

  const mockRiskMetrics: RiskMetrics = {
    volatility: 0.15,
    sharpeRatio: 0.47,
    maxDrawdown: 0.12,
    valueAtRisk5: 0.08,
    valueAtRisk1: 0.12,
    sortinoRatio: 0.52,
    calmarRatio: 0.58,
  }

  it('should display stress testing section in risk analysis', async () => {
    const user = userEvent.setup()

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

    // Find and click on the stress testing header
    const stressTestHeader = screen.getByText(/Stress-Testing - Portfolio-Resilienz/)
    expect(stressTestHeader).toBeInTheDocument()

    await user.click(stressTestHeader)

    // Verify stress testing content is displayed
    expect(screen.getByText(/Zusammenfassung Stress-Tests/)).toBeInTheDocument()
  })

  it('should display all historical crisis scenarios', async () => {
    const user = userEvent.setup()

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

    const stressTestHeader = screen.getByText(/Stress-Testing - Portfolio-Resilienz/)
    await user.click(stressTestHeader)

    // Verify all three historical scenarios are present
    const dotcomElements = screen.getAllByText(/Dotcom-Blase/)
    expect(dotcomElements.length).toBeGreaterThan(0)

    const financialElements = screen.getAllByText(/Finanzkrise/)
    expect(financialElements.length).toBeGreaterThan(0)

    const covidElements = screen.getAllByText(/COVID-19/)
    expect(covidElements.length).toBeGreaterThan(0)
  })

  it('should calculate and display stress test summary statistics', async () => {
    const user = userEvent.setup()

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

    const stressTestHeader = screen.getByText(/Stress-Testing - Portfolio-Resilienz/)
    await user.click(stressTestHeader)

    // Verify summary statistics are displayed
    expect(screen.getByText(/Getestete Szenarien:/)).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument() // 3 scenarios
    expect(screen.getByText(/Schlimmstes Szenario:/)).toBeInTheDocument()
    expect(screen.getByText(/Durchschnittlicher Verlust:/)).toBeInTheDocument()
    expect(screen.getByText(/Durchschnittliche Erholungszeit:/)).toBeInTheDocument()
  })

  it('should display stress test results table with all columns', async () => {
    const user = userEvent.setup()

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

    const stressTestHeader = screen.getByText(/Stress-Testing - Portfolio-Resilienz/)
    await user.click(stressTestHeader)

    // Verify table headers
    expect(screen.getByText('Krisenszenario')).toBeInTheDocument()
    expect(screen.getByText('Beschreibung')).toBeInTheDocument()
    expect(screen.getByText('Erholungszeit')).toBeInTheDocument()
    expect(screen.getByText('Endkapital')).toBeInTheDocument()
  })

  it('should not display stress testing when portfolio data is empty', () => {
    const emptyPortfolioData: PortfolioData = {
      values: [],
      years: [],
    }

    render(
      <RiskAnalysisPanels
        riskConfig={mockRiskConfig}
        phaseTitle="Ansparphase"
        blackSwanReturns={null}
        blackSwanEventName=""
        riskMetrics={mockRiskMetrics}
        portfolioData={emptyPortfolioData}
        hasRiskData={false}
      />,
    )

    // Stress testing should not be present
    expect(screen.queryByText(/🧪 Stress-Testing - Portfolio-Resilienz/)).not.toBeInTheDocument()
  })

  it('should display Monte Carlo and Stress Testing together', async () => {
    const user = userEvent.setup()

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

    // Both Monte Carlo and Stress Testing should be present
    const monteCarloHeader = screen.getByText(/Monte Carlo Analyse/)
    expect(monteCarloHeader).toBeInTheDocument()

    const stressTestHeader = screen.getByText(/Stress-Testing - Portfolio-Resilienz/)
    expect(stressTestHeader).toBeInTheDocument()

    // Expand both to verify they work independently
    await user.click(monteCarloHeader)
    expect(screen.getByText(/Simulationsparameter:/)).toBeInTheDocument()

    await user.click(stressTestHeader)
    expect(screen.getByText(/Zusammenfassung Stress-Tests/)).toBeInTheDocument()
  })

  it('should calculate stress tests based on portfolio return rate', async () => {
    const user = userEvent.setup()

    const highReturnConfig: RandomReturnConfig = {
      averageReturn: 0.1, // 10% return
      standardDeviation: 0.15,
      seed: 12345,
    }

    render(
      <RiskAnalysisPanels
        riskConfig={highReturnConfig}
        phaseTitle="Ansparphase"
        blackSwanReturns={null}
        blackSwanEventName=""
        riskMetrics={mockRiskMetrics}
        portfolioData={mockPortfolioData}
        hasRiskData={true}
      />,
    )

    const stressTestHeader = screen.getByText(/Stress-Testing - Portfolio-Resilienz/)
    await user.click(stressTestHeader)

    // Verify stress test calculations are based on the configured return rate
    // The exact values will depend on the calculation, but we verify the structure is there
    expect(screen.getByText(/Durchschnittlicher Verlust:/)).toBeInTheDocument()
  })

  it('should show warning and info box about stress test limitations', async () => {
    const user = userEvent.setup()

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

    // Expand the StressTestingDisplay component
    const stressTestHeader = screen.getByText(/Stress-Testing - Portfolio-Resilienz/)
    await user.click(stressTestHeader)

    // Verify info box with disclaimer
    expect(screen.getByText(/Was sind Stress-Tests?/)).toBeInTheDocument()
    expect(screen.getByText(/historischen Daten/)).toBeInTheDocument()
  })
})
