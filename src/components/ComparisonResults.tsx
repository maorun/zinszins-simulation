/**
 * Comparison Results Display Component
 *
 * Displays statistics and detailed table of comparison results
 * for Capital Growth Scenario Comparison.
 */

import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { formatCurrency } from '../utils/currency'
import type { CapitalGrowthComparison } from '../types/capital-growth-comparison'

interface ComparisonResultsProps {
  /** Comparison data including results and statistics */
  comparison: CapitalGrowthComparison
}

/**
 * Displays a summary card for a single statistic
 */
function StatCard({
  title,
  value,
  subtitle,
}: {
  title: string
  value: string
  subtitle?: string
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && <div className="text-sm text-muted-foreground mt-1">{subtitle}</div>}
      </CardContent>
    </Card>
  )
}

/**
 * Displays a summary of best, average, and worst scenarios
 */
function StatisticsSummary({ comparison }: ComparisonResultsProps) {
  const { results, statistics } = comparison

  if (!results || !statistics) return null

  const bestScenarioName = comparison.scenarios.find(
    (s) => s.id === statistics.bestScenario.scenarioId
  )?.name
  const worstScenarioName = comparison.scenarios.find(
    (s) => s.id === statistics.worstScenario.scenarioId
  )?.name

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatCard
        title="Bestes Szenario"
        value={formatCurrency(statistics.bestScenario.endCapital)}
        subtitle={bestScenarioName}
      />
      <StatCard
        title="Durchschnitt"
        value={formatCurrency(statistics.averageEndCapital)}
        subtitle={`Median: ${formatCurrency(statistics.percentiles.p50)}`}
      />
      <StatCard
        title="Schlechtestes Szenario"
        value={formatCurrency(statistics.worstScenario.endCapital)}
        subtitle={worstScenarioName}
      />
    </div>
  )
}

/**
 * Displays a detailed table of all scenario results
 */
function DetailedResultsTable({ comparison }: ComparisonResultsProps) {
  const { results, scenarios } = comparison

  if (!results) return null

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left p-2">Szenario</th>
            <th className="text-right p-2">Endkapital</th>
            <th className="text-right p-2">Rendite p.a.</th>
            <th className="text-right p-2">Gesamtbeiträge</th>
            <th className="text-right p-2">Gesamtertrag</th>
            <th className="text-right p-2">Steuern</th>
          </tr>
        </thead>
        <tbody>
          {results.map((result) => {
            const scenario = scenarios.find((s) => s.id === result.scenarioId)
            if (!scenario) return null

            return (
              <tr key={result.scenarioId} className="border-b hover:bg-muted/50">
                <td className="p-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: scenario.color }}
                    />
                    {scenario.name}
                  </div>
                </td>
                <td className="text-right p-2 font-medium">
                  {formatCurrency(result.metrics.endCapital)}
                </td>
                <td className="text-right p-2">{result.metrics.annualizedReturn.toFixed(2)}%</td>
                <td className="text-right p-2">
                  {formatCurrency(result.metrics.totalContributions)}
                </td>
                <td className="text-right p-2">{formatCurrency(result.metrics.totalReturns)}</td>
                <td className="text-right p-2">{formatCurrency(result.metrics.totalTaxes)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

/**
 * Main results display component combining statistics and detailed table
 */
export function ComparisonResults({ comparison }: ComparisonResultsProps) {
  const { results, statistics } = comparison

  if (!results || !statistics) return null

  return (
    <div className="space-y-4 pt-4 border-t">
      <h3 className="text-lg font-semibold">Vergleichsergebnisse</h3>

      {/* Statistics Summary */}
      <StatisticsSummary comparison={comparison} />

      {/* Detailed Results Table */}
      <DetailedResultsTable comparison={comparison} />
    </div>
  )
}
