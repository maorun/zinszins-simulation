import React from 'react'
import { useSimulation } from '../contexts/useSimulation'
import MonteCarloAnalysisDisplay from './MonteCarloAnalysisDisplay'
import BlackSwanEventConfiguration from './BlackSwanEventConfiguration'
import InflationScenarioConfiguration from './InflationScenarioConfiguration'
import { formatRiskMetric } from '../utils/risk-metrics'
import type { RandomReturnConfig } from '../utils/random-returns'
import { CollapsibleCard, CollapsibleCardContent, CollapsibleCardHeader } from './ui/collapsible-card'
import { useRiskCalculations } from '../hooks/useRiskCalculations'
import { RiskMetricsDisplay } from './RiskMetricsDisplay'
import { DrawdownAnalysis } from './DrawdownAnalysis'

interface RiskAssessmentProps {
  phase: 'savings' | 'withdrawal'
  config?: RandomReturnConfig
}

const RiskAssessment: React.FC<RiskAssessmentProps> = ({ phase, config }) => {
  const {
    simulationData,
    averageReturn,
    standardDeviation,
    randomSeed,
    returnMode,
    startEnd,
    blackSwanReturns,
    setBlackSwanReturns,
    blackSwanEventName,
    setBlackSwanEventName,
    setInflationScenarioRates,
    setInflationScenarioReturnModifiers,
    setInflationScenarioName,
    performSimulation,
  } = useSimulation()

  // Handle Black Swan event change
  const handleBlackSwanChange = React.useCallback((eventReturns: Record<number, number> | null, eventName?: string) => {
    setBlackSwanReturns(eventReturns)
    setBlackSwanEventName(eventName || '')
    // Trigger simulation update
    performSimulation()
  }, [setBlackSwanReturns, setBlackSwanEventName, performSimulation])

  // Handle Inflation Scenario change
  const handleInflationScenarioChange = React.useCallback((
    inflationRates: Record<number, number> | null,
    returnModifiers: Record<number, number> | null,
    scenarioName?: string,
  ) => {
    setInflationScenarioRates(inflationRates)
    setInflationScenarioReturnModifiers(returnModifiers)
    setInflationScenarioName(scenarioName || '')
    // Trigger simulation update
    performSimulation()
  }, [setInflationScenarioRates, setInflationScenarioReturnModifiers, setInflationScenarioName, performSimulation])

  // Use provided config or default based on phase
  const riskConfig: RandomReturnConfig = config || {
    averageReturn: phase === 'savings' ? averageReturn / 100 : 0.05,
    standardDeviation: phase === 'savings' ? standardDeviation / 100 : 0.12,
    seed: randomSeed,
  }

  // Use custom hook for risk calculations
  const { portfolioData, riskMetrics, hasRiskData } = useRiskCalculations(simulationData)

  if (!simulationData) return null

  const phaseTitle = phase === 'savings' ? 'Ansparphase' : 'Entnahmephase'

  return (
    <CollapsibleCard>
      <CollapsibleCardHeader>
        🎯 Risikobewertung -
        {' '}
        {phaseTitle}
      </CollapsibleCardHeader>
      <CollapsibleCardContent>
        <div className="space-y-4">
          {/* Show notice for fixed return mode */}
          {returnMode === 'fixed' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-blue-800 font-semibold mb-2">ℹ️ Feste Rendite gewählt</div>
              <div className="text-sm text-blue-700">
                Bei einer festen Rendite gibt es keine Volatilität und damit keine klassischen Risikokennzahlen.
                Wechseln Sie zu "Zufällige Renditen" oder "Variable Renditen" für eine vollständige Risikoanalyse.
              </div>
            </div>
          )}

          {/* Single-value metrics displayed prominently */}
          {riskMetrics && <RiskMetricsDisplay riskMetrics={riskMetrics} />}

          {/* Additional risk metrics */}
          {riskMetrics && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-600 mb-1">📉 Value-at-Risk (99%)</div>
                  <div className="text-lg font-bold text-gray-700">
                    {formatRiskMetric(riskMetrics.valueAtRisk1, 'percentage')}
                  </div>
                  <div className="text-xs text-gray-500">
                    Potenzielle Verluste in 1% der Fälle - extremere Verlustszenarien als VaR 95%
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-600 mb-1">📊 Datenpunkte</div>
                  <div className="text-lg font-bold text-gray-700">
                    {portfolioData.values.length}
                    {' '}
                    Jahre
                  </div>
                  <div className="text-xs text-gray-500">Simulationszeitraum für Risikoanalyse</div>
                </div>
              </div>
            </div>
          )}

          {/* Black Swan Event Configuration */}
          <BlackSwanEventConfiguration
            simulationStartYear={startEnd?.[0] || 2025}
            onEventChange={handleBlackSwanChange}
          />

          {/* Inflation Scenario Configuration */}
          <InflationScenarioConfiguration
            simulationStartYear={startEnd?.[0] || 2025}
            onScenarioChange={handleInflationScenarioChange}
          />

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
        </div>
      </CollapsibleCardContent>
    </CollapsibleCard>
  )
}

export default RiskAssessment
