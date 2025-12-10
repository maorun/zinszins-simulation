import { formatRiskMetric, type RiskMetrics } from '../utils/risk-metrics'
import { RiskMetricsDisplay } from './RiskMetricsDisplay'
import { StressTestDisplay } from './StressTestDisplay'

/**
 * Additional Risk Metrics Component
 */
interface AdditionalRiskMetricsProps {
  riskMetrics: {
    valueAtRisk1: number
  }
  portfolioDataLength: number
}

function AdditionalRiskMetrics({ riskMetrics, portfolioDataLength }: AdditionalRiskMetricsProps) {
  return (
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
          <div className="text-lg font-bold text-gray-700">{portfolioDataLength} Jahre</div>
          <div className="text-xs text-gray-500">Simulationszeitraum für Risikoanalyse</div>
        </div>
      </div>
    </div>
  )
}

interface RiskMetricsContainerProps {
  riskMetrics: RiskMetrics | null
  portfolioDataLength: number
  showFixedReturnNotice: boolean
  /** Current portfolio value for stress testing */
  portfolioValue?: number
}

/**
 * Container component for all risk metrics displays
 */
export function RiskMetricsContainer({
  riskMetrics,
  portfolioDataLength,
  showFixedReturnNotice,
  portfolioValue,
}: RiskMetricsContainerProps) {
  // Only show stress tests if we have a portfolio value and risk metrics
  const showStressTests = portfolioValue && portfolioValue > 0 && riskMetrics && !showFixedReturnNotice

  return (
    <>
      {/* Show notice for fixed return mode */}
      {showFixedReturnNotice && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-blue-800 font-semibold mb-2">ℹ️ Feste Rendite gewählt</div>
          <div className="text-sm text-blue-700">
            Bei einer festen Rendite gibt es keine Volatilität und damit keine klassischen Risikokennzahlen. Wechseln
            Sie zu "Zufällige Renditen" oder "Variable Renditen" für eine vollständige Risikoanalyse.
          </div>
        </div>
      )}

      {/* Single-value metrics displayed prominently */}
      {riskMetrics && <RiskMetricsDisplay riskMetrics={riskMetrics} />}

      {/* Additional risk metrics */}
      {riskMetrics && <AdditionalRiskMetrics riskMetrics={riskMetrics} portfolioDataLength={portfolioDataLength} />}

      {/* Stress Test Analysis */}
      {showStressTests && (
        <div className="mt-4">
          <StressTestDisplay portfolioValue={portfolioValue} scenarioType="historical" showDetails={true} />
        </div>
      )}
    </>
  )
}
