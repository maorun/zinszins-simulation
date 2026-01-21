import React, { useMemo, type ReactElement } from 'react'
import { TrendingUp, Activity, AlertTriangle, Award, BarChart3, Target } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { useSimulation } from '../contexts/useSimulation'
import { calculatePortfolioPerformance } from '../../helpers/portfolio-performance'
import { formatCurrency } from '../utils/currency'

/**
 * Metric card component with icon and color coding
 */
function MetricCard({
  icon: Icon,
  label,
  value,
  description,
  colorClass,
}: {
  icon: React.FC<{ className?: string }>
  label: string
  value: string
  description: string
  colorClass: string
}): ReactElement {
  return (
    <div className={`${colorClass} rounded-lg p-4 border-l-4`}>
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-xs text-gray-600">{description}</div>
    </div>
  )
}

/**
 * Performance indicator badge with color coding
 */
function PerformanceBadge({ value, type }: { value: number; type: 'return' | 'sharpe' }) {
  const bgColor = useMemo(() => {
    if (type === 'return') {
      if (value >= 8) return 'bg-green-100 border-green-500 text-green-800'
      if (value >= 5) return 'bg-blue-100 border-blue-500 text-blue-800'
      if (value >= 2) return 'bg-yellow-100 border-yellow-500 text-yellow-800'
      return 'bg-red-100 border-red-500 text-red-800'
    } else {
      // Sharpe ratio
      if (value >= 1.5) return 'bg-green-100 border-green-500 text-green-800'
      if (value >= 1.0) return 'bg-blue-100 border-blue-500 text-blue-800'
      if (value >= 0.5) return 'bg-yellow-100 border-yellow-500 text-yellow-800'
      return 'bg-orange-100 border-orange-500 text-orange-800'
    }
  }, [value, type])

  return (
    <div className={`${bgColor} border-l-4 rounded-lg p-4 text-center`}>
      <div className="text-4xl font-bold mb-1">{value.toFixed(2)}{type === 'return' ? '%' : ''}</div>
      <div className="text-sm font-medium">{type === 'return' ? 'Annualisierte Rendite' : 'Sharpe Ratio'}</div>
    </div>
  )
}

/**
 * Best/Worst year display component
 */
function YearCard({ year, return: returnValue, type }: { year: number; return: number; type: 'best' | 'worst' }) {
  const isPositive = returnValue >= 0
  const bgColor = type === 'best' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
  const textColor = type === 'best' ? 'text-green-800' : 'text-red-800'

  return (
    <div className={`${bgColor} border rounded-lg p-3`}>
      <div className="text-xs font-medium text-gray-600 mb-1">
        {type === 'best' ? '🏆 Bestes Jahr' : '📉 Schlechtestes Jahr'}
      </div>
      <div className="text-lg font-bold text-gray-900">{year}</div>
      <div className={`text-xl font-bold ${textColor}`}>
        {isPositive ? '+' : ''}{returnValue.toFixed(2)}%
      </div>
    </div>
  )
}

/**
 * Portfolio Performance Dashboard
 * Displays comprehensive Key Performance Indicators for the portfolio
 */
// Note: Disabling max-lines-per-function for this dashboard component as it naturally requires
// more lines to display multiple metric sections
export function PortfolioPerformanceDashboard() {
  const { simulationData } = useSimulation()

  // Calculate portfolio performance metrics
  const metrics = useMemo(() => {
    if (!simulationData?.sparplanElements || simulationData.sparplanElements.length === 0) {
      return null
    }

    // Merge all simulation results from sparplan elements
    const simulationResult: Record<number, {
      startkapital: number
      zinsen: number
      endkapital: number
      bezahlteSteuer: number
      genutzterFreibetrag: number
      vorabpauschale: number
      vorabpauschaleAccumulated: number
    }> = {}

    for (const element of simulationData.sparplanElements) {
      // Each element has its own simulation results
      const elementSim = element.simulation
      if (elementSim) {
        Object.assign(simulationResult, elementSim)
      }
    }

    return calculatePortfolioPerformance(simulationResult)
  }, [simulationData])

  // Don't render if no simulation data
  if (!metrics) {
    return null
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-blue-600" />
          Portfolio-Performance Dashboard
        </CardTitle>
        <CardDescription>
          Umfassende Analyse der Portfolio-Performance mit Key Performance Indicators
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Performance Badges */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PerformanceBadge value={metrics.annualizedReturn} type="return" />
          <PerformanceBadge value={metrics.sharpeRatio} type="sharpe" />
        </div>

        {/* Return Metrics */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Rendite-Kennzahlen
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard
              icon={Target}
              label="Gesamtrendite"
              value={`${metrics.totalReturn.toFixed(2)}%`}
              description="Gesamtwachstum über den Anlagezeitraum"
              colorClass="bg-blue-50 border-blue-400"
            />
            <MetricCard
              icon={TrendingUp}
              label="Durchschnittliche Rendite"
              value={`${metrics.averageReturn.toFixed(2)}%`}
              description="Durchschnittliche jährliche Rendite"
              colorClass="bg-indigo-50 border-indigo-400"
            />
            <MetricCard
              icon={Award}
              label="Kumulativer Gewinn"
              value={formatCurrency(metrics.cumulativeReturn)}
              description="Absoluter Wertzuwachs in Euro"
              colorClass="bg-purple-50 border-purple-400"
            />
          </div>
        </div>

        {/* Risk Metrics */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Activity className="h-5 w-5 text-orange-600" />
            Risiko-Kennzahlen
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard
              icon={Activity}
              label="Volatilität"
              value={`${metrics.volatility.toFixed(2)}%`}
              description="Standardabweichung der Renditen"
              colorClass="bg-orange-50 border-orange-400"
            />
            <MetricCard
              icon={AlertTriangle}
              label="Maximaler Drawdown"
              value={`${metrics.maxDrawdown.toFixed(2)}%`}
              description={`${metrics.maxDrawdownStartYear} - ${metrics.maxDrawdownEndYear}`}
              colorClass="bg-red-50 border-red-400"
            />
            <MetricCard
              icon={Award}
              label="Sortino Ratio"
              value={metrics.sortinoRatio.toFixed(2)}
              description="Rendite pro Einheit Abwärtsrisiko"
              colorClass="bg-yellow-50 border-yellow-400"
            />
          </div>
        </div>

        {/* Additional Metrics */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-green-600" />
            Weitere Kennzahlen
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MetricCard
              icon={TrendingUp}
              label="Erfolgsquote"
              value={`${metrics.winRate.toFixed(1)}%`}
              description="Prozentsatz positiver Jahre"
              colorClass="bg-green-50 border-green-400"
            />
            <div className="grid grid-cols-2 gap-3">
              <YearCard
                year={metrics.bestYear.year}
                return={metrics.bestYear.return}
                type="best"
              />
              <YearCard
                year={metrics.worstYear.year}
                return={metrics.worstYear.return}
                type="worst"
              />
            </div>
          </div>
        </div>

        {/* Interpretation Guide */}
        <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-2">
          <h4 className="font-semibold text-gray-900 mb-2">📘 Interpretationshilfe</h4>
          <ul className="space-y-1 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="font-medium text-gray-900">Sharpe Ratio:</span>
              <span>{'>'} 1,0 = gut, {'>'} 1,5 = sehr gut. Misst Überrendite pro Risikoeinheit.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-medium text-gray-900">Volatilität:</span>
              <span>Maß für Schwankungen. Niedrigere Werte bedeuten stabilere Renditen.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-medium text-gray-900">Max Drawdown:</span>
              <span>Größter Wertverlust vom Höchststand. Zeigt maximales historisches Risiko.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-medium text-gray-900">Sortino Ratio:</span>
              <span>Wie Sharpe Ratio, berücksichtigt aber nur Abwärtsvolatilität.</span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
