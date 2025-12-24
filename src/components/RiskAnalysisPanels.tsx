import MonteCarloAnalysisDisplay from './MonteCarloAnalysisDisplay'
import StressTestingDisplay from './StressTestingDisplay'
import { DrawdownAnalysis } from './DrawdownAnalysis'
import { CollapsibleCard, CollapsibleCardContent, CollapsibleCardHeader } from './ui/collapsible-card'
import type { RandomReturnConfig } from '../utils/random-returns'
import type { RiskMetrics, PortfolioData } from '../utils/risk-metrics'
import { runStressTests, calculateStressTestSummary, type StressTestConfiguration } from '../utils/stress-testing'
import { useMemo } from 'react'

interface RiskAnalysisPanelsProps {
  riskConfig: RandomReturnConfig
  phaseTitle: string
  blackSwanReturns: Record<number, number> | null
  blackSwanEventName: string
  riskMetrics: RiskMetrics | null
  portfolioData: PortfolioData
  hasRiskData: boolean
}

/**
 * Calculate stress test configuration from portfolio data
 */
function calculateStressTestConfig(
  portfolioData: PortfolioData,
  averageReturn: number,
): StressTestConfiguration | null {
  if (!portfolioData || portfolioData.values.length === 0) {
    return null
  }

  // Use first year's capital as baseline
  const baselineCapital = portfolioData.values[0]

  // Estimate annual contribution from portfolio growth
  const annualContribution =
    portfolioData.values.length > 1
      ? Math.max(0, (portfolioData.values[1] - portfolioData.values[0] * (1 + averageReturn)) / 2)
      : 10000

  return {
    baselineCapital,
    annualContribution,
    normalReturn: averageReturn,
    testDurationYears: Math.min(portfolioData.values.length, 10),
  }
}

/**
 * Component containing the analysis panels (Monte Carlo, Stress Testing, and Drawdown)
 */
export function RiskAnalysisPanels({
  riskConfig,
  phaseTitle,
  blackSwanReturns,
  blackSwanEventName,
  riskMetrics,
  portfolioData,
  hasRiskData,
}: RiskAnalysisPanelsProps) {
  // Calculate stress test results
  const stressTestData = useMemo(() => {
    const config = calculateStressTestConfig(portfolioData, riskConfig.averageReturn)
    if (!config) return null

    const results = runStressTests(config)
    const summary = calculateStressTestSummary(results)

    return { results, summary }
  }, [portfolioData, riskConfig.averageReturn])

  return (
    <>
      {/* Monte Carlo Analysis in collapsible sub-panel */}
      <CollapsibleCard className="border-l-4 border-l-blue-400">
        <CollapsibleCardHeader>🎲 Monte Carlo Analyse</CollapsibleCardHeader>
        <CollapsibleCardContent>
          <MonteCarloAnalysisDisplay
            config={riskConfig}
            title="Monte Carlo Simulation"
            phaseTitle={phaseTitle}
            blackSwanReturns={blackSwanReturns}
            blackSwanEventName={blackSwanEventName}
          />
        </CollapsibleCardContent>
      </CollapsibleCard>

      {/* Stress Testing Analysis - has its own collapsible card */}
      {stressTestData && <StressTestingDisplay results={stressTestData.results} summary={stressTestData.summary} />}

      {/* Drawdown Analysis in collapsible sub-panel if there's detailed data */}
      <DrawdownAnalysis riskMetrics={riskMetrics} portfolioData={portfolioData} hasRiskData={hasRiskData} />
    </>
  )
}
