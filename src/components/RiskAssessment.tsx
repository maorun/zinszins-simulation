import React from 'react'
import type { RandomReturnConfig } from '../utils/random-returns'
import { CollapsibleCard, CollapsibleCardContent, CollapsibleCardHeader } from './ui/collapsible-card'
import { useRiskAssessmentData } from '../hooks/useRiskAssessmentData'
import { RiskMetricsContainer } from './RiskMetricsContainer'
import { RiskEventConfiguration } from './RiskEventConfiguration'
import { RiskAnalysisPanels } from './RiskAnalysisPanels'

interface RiskAssessmentProps {
  phase: 'savings' | 'withdrawal'
  config?: RandomReturnConfig
}

const RiskAssessment: React.FC<RiskAssessmentProps> = ({ phase, config }) => {
  const {
    simulationData,
    returnMode,
    riskConfig,
    portfolioData,
    riskMetrics,
    hasRiskData,
    phaseTitle,
    simulationStartYear,
    blackSwanReturns,
    blackSwanEventName,
    handleBlackSwanChange,
    handleInflationScenarioChange,
  } = useRiskAssessmentData({ phase, config })

  if (!simulationData) return null

  // Get the latest portfolio value for stress testing
  const latestPortfolioValue = portfolioData.values.length > 0 
    ? portfolioData.values[portfolioData.values.length - 1] 
    : 0

  return (
    <CollapsibleCard>
      <CollapsibleCardHeader>🎯 Risikobewertung - {phaseTitle}</CollapsibleCardHeader>
      <CollapsibleCardContent>
        <div className="space-y-4">
          <RiskMetricsContainer
            riskMetrics={riskMetrics}
            portfolioDataLength={portfolioData.values.length}
            showFixedReturnNotice={returnMode === 'fixed'}
            portfolioValue={latestPortfolioValue}
          />
          <RiskEventConfiguration
            simulationStartYear={simulationStartYear}
            onBlackSwanChange={handleBlackSwanChange}
            onInflationScenarioChange={handleInflationScenarioChange}
          />
          <RiskAnalysisPanels
            riskConfig={riskConfig}
            phaseTitle={phaseTitle}
            blackSwanReturns={blackSwanReturns}
            blackSwanEventName={blackSwanEventName}
            riskMetrics={riskMetrics}
            portfolioData={portfolioData}
            hasRiskData={hasRiskData}
          />
        </div>
      </CollapsibleCardContent>
    </CollapsibleCard>
  )
}

export default RiskAssessment
