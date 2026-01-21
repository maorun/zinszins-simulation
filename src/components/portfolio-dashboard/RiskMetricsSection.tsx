import React, { type ReactElement } from 'react'
import { Activity, AlertTriangle, Award } from 'lucide-react'
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
 * Risk Metrics Section
 */
export function RiskMetricsSection({ metrics }: { metrics: PortfolioPerformanceMetrics }): ReactElement {
  return (
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
  )
}
