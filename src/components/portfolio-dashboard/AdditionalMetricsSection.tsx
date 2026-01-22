import React, { type ReactElement } from 'react'
import { TrendingUp, BarChart3 } from 'lucide-react'
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
 * Year card component for best/worst years
 */
function YearCard({ year, return: returnValue, type }: { year: number; return: number; type: 'best' | 'worst' }): ReactElement {
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
 * Additional Metrics Section
 */
export function AdditionalMetricsSection({ metrics }: { metrics: PortfolioPerformanceMetrics }): ReactElement {
  return (
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
  )
}
