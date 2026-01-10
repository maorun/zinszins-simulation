import { formatCurrency } from '../../utils/currency'
import { TrendingUp, Calendar } from 'lucide-react'
import type { MultiYearOptimizationResult, MultiYearFreibetragOptimizationConfig } from '../../../helpers/multi-year-freibetrag-optimization'

/**
 * Results summary card showing tax savings and utilization
 */
export function ResultsSummaryCard({ result }: { result: MultiYearOptimizationResult }) {
  return (
    <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="h-5 w-5 text-green-600" />
        <h3 className="font-semibold text-green-900">Optimierungs-Ergebnis</h3>
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-green-700 mb-1">Steuerersparnis</p>
          <p className="text-2xl font-bold text-green-900">{formatCurrency(result.totalTaxSavings)}</p>
          <p className="text-xs text-green-700 mt-1">
            {result.taxSavingsPercentage.toFixed(1)}% Ersparnis gegenüber sofortiger Realisierung
          </p>
        </div>
        <div>
          <p className="text-green-700 mb-1">Freibetrag-Nutzung</p>
          <p className="text-2xl font-bold text-green-900">
            {(result.summary.averageFreibetragUtilizationRate * 100).toFixed(0)}%
          </p>
          <p className="text-xs text-green-700 mt-1">Durchschnittliche Auslastung des jährlichen Freibetrags</p>
        </div>
      </div>
    </div>
  )
}

/**
 * Strategy comparison showing naive vs optimized approach
 */
export function StrategyComparison({ result, config }: { result: MultiYearOptimizationResult; config: MultiYearFreibetragOptimizationConfig }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="bg-red-50 border border-red-200 rounded p-3">
        <p className="text-xs text-red-700 mb-1">Naive Strategie</p>
        <p className="text-lg font-semibold text-red-900">{formatCurrency(result.summary.naiveStrategyTax)}</p>
        <p className="text-xs text-red-600">Sofortige Realisierung</p>
      </div>
      <div className="bg-green-50 border border-green-200 rounded p-3">
        <p className="text-xs text-green-700 mb-1">Optimierte Strategie</p>
        <p className="text-lg font-semibold text-green-900">{formatCurrency(result.summary.optimizedStrategyTax)}</p>
        <p className="text-xs text-green-600">Über {config.optimizationHorizonYears} Jahre verteilt</p>
      </div>
    </div>
  )
}

/**
 * List of recommendations
 */
export function RecommendationsList({ recommendations }: { recommendations: string[] }) {
  return (
    <div className="space-y-2">
      <h4 className="font-medium text-sm flex items-center gap-2">
        <Calendar className="h-4 w-4" />
        Handlungsempfehlungen
      </h4>
      <div className="space-y-1.5">
        {recommendations.map((rec, idx) => (
          <div key={idx} className="text-xs bg-white border border-gray-200 rounded p-2">
            {rec}
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Year-by-year optimization schedule table
 */
export function YearlyScheduleTable({ schedule }: { schedule: MultiYearOptimizationResult['optimalRealizationSchedule'] }) {
  return (
    <div>
      <h4 className="font-medium text-sm mb-2">Jahr-für-Jahr Optimierungsplan</h4>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Jahr</th>
              <th className="p-2 text-right">Realisierung</th>
              <th className="p-2 text-right">Verf. Freibetrag</th>
              <th className="p-2 text-right">Steuerersparnis</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {schedule.map((entry, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="p-2">{entry.year}</td>
                <td className="p-2 text-right font-medium">{formatCurrency(entry.recommendedRealization)}</td>
                <td className="p-2 text-right text-muted-foreground">{formatCurrency(entry.availableFreibetrag)}</td>
                <td className="p-2 text-right text-green-600">+{formatCurrency(entry.taxSavings)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
