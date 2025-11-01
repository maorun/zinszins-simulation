import MonteCarloAnalysisDisplay from './MonteCarloAnalysisDisplay'
import { DrawdownAnalysis } from './DrawdownAnalysis'
import { CollapsibleCard, CollapsibleCardContent, CollapsibleCardHeader } from './ui/collapsible-card'
import type { RandomReturnConfig } from '../utils/random-returns'
import type { RiskMetrics, PortfolioData } from '../utils/risk-metrics'

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
 * Component containing the analysis panels (Monte Carlo and Drawdown)
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

      {/* Drawdown Analysis in collapsible sub-panel if there's detailed data */}
      <DrawdownAnalysis
        riskMetrics={riskMetrics}
        portfolioData={portfolioData}
        hasRiskData={hasRiskData}
      />
    </>
  )
}
