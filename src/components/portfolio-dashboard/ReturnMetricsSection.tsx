import React, { type ReactElement } from 'react'
import { TrendingUp, Target, Award } from 'lucide-react'
import { formatCurrency } from '../../utils/currency'
import type { PortfolioPerformanceMetrics } from '../../../helpers/portfolio-performance'

/**
 * Metric card component
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
 * Return Metrics Section
 */
export function ReturnMetricsSection({ metrics }: { metrics: PortfolioPerformanceMetrics }): ReactElement {
  return (
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
  )
}
