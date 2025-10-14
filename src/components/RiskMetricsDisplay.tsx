import { formatRiskMetric, type RiskMetrics } from '../utils/risk-metrics'

interface RiskMetricsDisplayProps {
  riskMetrics: RiskMetrics
}

export function RiskMetricsDisplay({ riskMetrics }: RiskMetricsDisplayProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 border-l-4 border-l-red-500">
        <div className="text-sm font-medium text-gray-600 mb-1">📉 Value-at-Risk (95%)</div>
        <div className="text-xl font-bold text-red-700">
          {formatRiskMetric(riskMetrics.valueAtRisk5, 'percentage')}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Zeigt potenzielle Verluste in einer bestimmten Zeitperiode mit einer bestimmten
          Wahrscheinlichkeit. In 5% der Fälle können die Verluste diesen Wert erreichen oder
          überschreiten.
        </div>
      </div>

      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 border-l-4 border-l-orange-500">
        <div className="text-sm font-medium text-gray-600 mb-1">📊 Maximum Drawdown</div>
        <div className="text-xl font-bold text-orange-700">
          {formatRiskMetric(riskMetrics.maxDrawdown, 'percentage')}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Der größte Verlust vom Höchststand bis zum Tiefststand in der betrachteten Periode.
          Misst das maximale Risiko von Portfoliorückgängen.
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 border-l-4 border-l-blue-500">
        <div className="text-sm font-medium text-gray-600 mb-1">⚖️ Sharpe Ratio</div>
        <div className="text-xl font-bold text-blue-700">
          {formatRiskMetric(riskMetrics.sharpeRatio, 'ratio')}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Misst die risikoadjustierte Rendite. Höhere Werte zeigen bessere Renditen pro
          Risikoeinheit und eine effizientere Nutzung des eingegangenen Risikos.
        </div>
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 border-l-4 border-l-purple-500">
        <div className="text-sm font-medium text-gray-600 mb-1">📈 Volatilität</div>
        <div className="text-xl font-bold text-purple-700">
          {formatRiskMetric(riskMetrics.volatility, 'percentage')}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Standardabweichung der Renditen. Misst die Schwankungsbreite der Anlage - höhere Werte
          bedeuten unvorhersagbarere Ergebnisse.
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4 border-l-4 border-l-green-500">
        <div className="text-sm font-medium text-gray-600 mb-1">🎯 Sortino Ratio</div>
        <div className="text-xl font-bold text-green-700">
          {riskMetrics.sortinoRatio >= 999 ? '999+' : formatRiskMetric(riskMetrics.sortinoRatio, 'ratio')}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Ähnlich der Sharpe Ratio, berücksichtigt aber nur negative Volatilität (Downside-Risk).
          Fokussiert auf unerwünschte Verluste statt allgemeine Schwankungen.
        </div>
      </div>

      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 border-l-4 border-l-indigo-500">
        <div className="text-sm font-medium text-gray-600 mb-1">📊 Calmar Ratio</div>
        <div className="text-xl font-bold text-indigo-700">
          {riskMetrics.calmarRatio >= 999 ? '999+' : formatRiskMetric(riskMetrics.calmarRatio, 'ratio')}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Verhältnis von Jahresrendite zu maximalem Drawdown. Bewertet die Performance im
          Verhältnis zum größten erlittenen Verlust.
        </div>
      </div>
    </div>
  )
}
