import { formatRiskMetric, type RiskMetrics } from '../utils/risk-metrics'

interface RiskMetricsDisplayProps {
  riskMetrics: RiskMetrics
}

/**
 * Single risk metric card with icon, value, and description
 */
function RiskMetricCard({
  icon,
  label,
  value,
  description,
  color,
}: {
  icon: string
  label: string
  value: string | number
  description: string
  color: 'red' | 'orange' | 'blue' | 'purple' | 'green' | 'indigo'
}) {
  return (
    <div className={`bg-${color}-50 border border-${color}-200 rounded-lg p-4 border-l-4 border-l-${color}-500`}>
      <div className="text-sm font-medium text-gray-600 mb-1">
        {icon} {label}
      </div>
      <div className={`text-xl font-bold text-${color}-700`}>{value}</div>
      <div className="text-xs text-gray-500 mt-1">{description}</div>
    </div>
  )
}

export function RiskMetricsDisplay({ riskMetrics }: RiskMetricsDisplayProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      <RiskMetricCard
        icon="📉"
        label="Value-at-Risk (95%)"
        value={formatRiskMetric(riskMetrics.valueAtRisk5, 'percentage')}
        description="Zeigt potenzielle Verluste in einer bestimmten Zeitperiode mit einer bestimmten Wahrscheinlichkeit. In 5% der Fälle können die Verluste diesen Wert erreichen oder überschreiten."
        color="red"
      />
      <RiskMetricCard
        icon="📊"
        label="Maximum Drawdown"
        value={formatRiskMetric(riskMetrics.maxDrawdown, 'percentage')}
        description="Der größte Verlust vom Höchststand bis zum Tiefststand in der betrachteten Periode. Misst das maximale Risiko von Portfoliorückgängen."
        color="orange"
      />
      <RiskMetricCard
        icon="⚖️"
        label="Sharpe Ratio"
        value={formatRiskMetric(riskMetrics.sharpeRatio, 'ratio')}
        description="Misst die risikoadjustierte Rendite. Höhere Werte zeigen bessere Renditen pro Risikoeinheit und eine effizientere Nutzung des eingegangenen Risikos."
        color="blue"
      />
      <RiskMetricCard
        icon="📈"
        label="Volatilität"
        value={formatRiskMetric(riskMetrics.volatility, 'percentage')}
        description="Standardabweichung der Renditen. Misst die Schwankungsbreite der Anlage - höhere Werte bedeuten unvorhersagbarere Ergebnisse."
        color="purple"
      />
      <RiskMetricCard
        icon="🎯"
        label="Sortino Ratio"
        value={riskMetrics.sortinoRatio >= 999 ? '999+' : formatRiskMetric(riskMetrics.sortinoRatio, 'ratio')}
        description="Ähnlich der Sharpe Ratio, berücksichtigt aber nur negative Volatilität (Downside-Risk). Fokussiert auf unerwünschte Verluste statt allgemeine Schwankungen."
        color="green"
      />
      <RiskMetricCard
        icon="📊"
        label="Calmar Ratio"
        value={riskMetrics.calmarRatio >= 999 ? '999+' : formatRiskMetric(riskMetrics.calmarRatio, 'ratio')}
        description="Verhältnis von Jahresrendite zu maximalem Drawdown. Bewertet die Performance im Verhältnis zum größten erlittenen Verlust."
        color="indigo"
      />
    </div>
  )
}
