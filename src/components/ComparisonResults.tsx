/**
 * Comparison Results Display Component
 *
 * Displays statistics and detailed table of comparison results
 * for Capital Growth Scenario Comparison.
 * 
 * Features:
 * - Delta highlighting: Color-coded cells showing best (green) and worst (red) values per metric
 * - Percentage deviations: Relative comparisons to baseline scenario
 * - Responsive table with horizontal scrolling
 */

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { formatCurrency } from '../utils/currency'
import type { CapitalGrowthComparison } from '../types/capital-growth-comparison'

interface ComparisonResultsProps {
  /** Comparison data including results and statistics */
  comparison: CapitalGrowthComparison
  /** Optional: ID of baseline scenario for percentage comparisons */
  baselineScenarioId?: string
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
 * Gets the background color class for a cell based on its value ranking
 * @param value - The numeric value of this cell
 * @param allValues - All values in this column for comparison
 * @param lowerIsBetter - If true, lower values are better (e.g., taxes)
 * @returns Tailwind CSS class for background color
 */
function getCellColorClass(value: number, allValues: number[], lowerIsBetter = false): string {
  if (allValues.length <= 1) return '' // No highlighting if only one scenario

  const sortedValues = [...allValues].sort((a, b) => (lowerIsBetter ? a - b : b - a))
  const best = sortedValues[0]
  const worst = sortedValues[sortedValues.length - 1]

  // Apply color coding: green for best, red for worst, default for others
  if (value === best) {
    return 'bg-green-100 dark:bg-green-900/20'
  } else if (value === worst) {
    return 'bg-red-100 dark:bg-red-900/20'
  }
  return ''
}

/**
 * Calculates percentage deviation from baseline
 * @param value - Current value
 * @param baselineValue - Baseline value to compare against
 * @returns Formatted percentage string with +/- sign
 */
function calculateDeviation(value: number, baselineValue: number): string {
  if (baselineValue === 0) return '-'
  const deviation = ((value - baselineValue) / baselineValue) * 100
  const sign = deviation > 0 ? '+' : ''
  return `${sign}${deviation.toFixed(1)}%`
}

/**
 * Renders a single table cell with optional delta highlighting and deviation
 */
function TableCell({
  value,
  formatter,
  allValues,
  baseline,
  showDeviation,
  lowerIsBetter = false,
}: {
  value: number
  formatter: (val: number) => string
  allValues: number[]
  baseline?: number
  showDeviation?: boolean
  lowerIsBetter?: boolean
}) {
  return (
    <td
      className={`text-right p-2 ${getCellColorClass(value, allValues, lowerIsBetter)}`}
    >
      <div>{formatter(value)}</div>
      {showDeviation && baseline !== undefined && baseline !== value && (
        <div className="text-xs text-muted-foreground">
          {calculateDeviation(value, baseline)}
        </div>
      )}
    </td>
  )
}

/**
 * Renders scenario name with color indicator
 */
function ScenarioNameCell({
  scenario,
  isBaseline,
}: {
  scenario: CapitalGrowthComparison['scenarios'][number]
  isBaseline: boolean
}) {
  return (
    <td className="p-2">
      <div className="flex items-center gap-2">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: scenario.color }}
        />
        {scenario.name}
        {isBaseline && (
          <span className="text-xs text-muted-foreground ml-1">(Basis)</span>
        )}
      </div>
    </td>
  )
}

/**
 * Renders capital-related metric cells
 */
function CapitalMetricCells({
  result,
  metricValues,
  baselineResult,
  showDeviation,
}: {
  result: NonNullable<CapitalGrowthComparison['results']>[number]
  metricValues: {
    endCapital: number[]
    annualizedReturn: number[]
    totalContributions: number[]
  }
  baselineResult: NonNullable<CapitalGrowthComparison['results']>[number]
  showDeviation: boolean
}) {
  return (
    <>
      <TableCell
        value={result.metrics.endCapital}
        formatter={formatCurrency}
        allValues={metricValues.endCapital}
        baseline={baselineResult.metrics.endCapital}
        showDeviation={showDeviation}
      />
      <TableCell
        value={result.metrics.annualizedReturn}
        formatter={(v) => `${v.toFixed(2)}%`}
        allValues={metricValues.annualizedReturn}
        baseline={baselineResult.metrics.annualizedReturn}
        showDeviation={showDeviation}
      />
      <td className="text-right p-2">
        {formatCurrency(result.metrics.totalContributions)}
      </td>
    </>
  )
}

/**
 * Renders return and tax metric cells
 */
function ReturnAndTaxCells({
  result,
  metricValues,
  baselineResult,
  showDeviation,
}: {
  result: NonNullable<CapitalGrowthComparison['results']>[number]
  metricValues: {
    totalReturns: number[]
    totalTaxes: number[]
  }
  baselineResult: NonNullable<CapitalGrowthComparison['results']>[number]
  showDeviation: boolean
}) {
  return (
    <>
      <TableCell
        value={result.metrics.totalReturns}
        formatter={formatCurrency}
        allValues={metricValues.totalReturns}
        baseline={baselineResult.metrics.totalReturns}
        showDeviation={showDeviation}
      />
      <TableCell
        value={result.metrics.totalTaxes}
        formatter={formatCurrency}
        allValues={metricValues.totalTaxes}
        baseline={baselineResult.metrics.totalTaxes}
        showDeviation={showDeviation}
        lowerIsBetter={true}
      />
    </>
  )
}

/**
 * Renders metric cells for a table row
 */
function MetricCells({
  result,
  metricValues,
  baselineResult,
  showDeviation,
}: {
  result: NonNullable<CapitalGrowthComparison['results']>[number]
  metricValues: {
    endCapital: number[]
    annualizedReturn: number[]
    totalContributions: number[]
    totalReturns: number[]
    totalTaxes: number[]
  }
  baselineResult: NonNullable<CapitalGrowthComparison['results']>[number]
  showDeviation: boolean
}) {
  return (
    <>
      <CapitalMetricCells
        result={result}
        metricValues={metricValues}
        baselineResult={baselineResult}
        showDeviation={showDeviation}
      />
      <ReturnAndTaxCells
        result={result}
        metricValues={metricValues}
        baselineResult={baselineResult}
        showDeviation={showDeviation}
      />
    </>
  )
}

/**
 * Renders a single row in the comparison table
 */
function ComparisonTableRow({
  result,
  scenario,
  metricValues,
  baselineResult,
  baselineScenarioId,
}: {
  result: NonNullable<CapitalGrowthComparison['results']>[number]
  scenario: CapitalGrowthComparison['scenarios'][number]
  metricValues: {
    endCapital: number[]
    annualizedReturn: number[]
    totalContributions: number[]
    totalReturns: number[]
    totalTaxes: number[]
  }
  baselineResult: NonNullable<CapitalGrowthComparison['results']>[number]
  baselineScenarioId?: string
}) {
  const isBaseline = result.scenarioId === baselineScenarioId
  const showDeviation = baselineScenarioId !== undefined && !isBaseline

  return (
    <tr key={result.scenarioId} className="border-b hover:bg-muted/50">
      <ScenarioNameCell scenario={scenario} isBaseline={isBaseline} />
      <MetricCells
        result={result}
        metricValues={metricValues}
        baselineResult={baselineResult}
        showDeviation={showDeviation}
      />
    </tr>
  )
}

/**
 * Renders table header with optional deviation column labels
 */
function ComparisonTableHeader({ baselineScenarioId }: { baselineScenarioId?: string }) {
  return (
    <thead>
      <tr className="border-b">
        <th className="text-left p-2">Szenario</th>
        <th className="text-right p-2">
          Endkapital
          {baselineScenarioId && (
            <div className="text-xs font-normal text-muted-foreground">(Abweichung)</div>
          )}
        </th>
        <th className="text-right p-2">
          Rendite p.a.
          {baselineScenarioId && (
            <div className="text-xs font-normal text-muted-foreground">(Abweichung)</div>
          )}
        </th>
        <th className="text-right p-2">Gesamtbeiträge</th>
        <th className="text-right p-2">
          Gesamtertrag
          {baselineScenarioId && (
            <div className="text-xs font-normal text-muted-foreground">(Abweichung)</div>
          )}
        </th>
        <th className="text-right p-2">
          Steuern
          {baselineScenarioId && (
            <div className="text-xs font-normal text-muted-foreground">(Abweichung)</div>
          )}
        </th>
      </tr>
    </thead>
  )
}

/**
 * Renders the legend for color-coded best/worst values
 */
function ComparisonTableLegend() {
  return (
    <div className="flex gap-4 mt-3 text-sm text-muted-foreground">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded" />
        <span>Beste Option</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded" />
        <span>Schlechteste Option</span>
      </div>
    </div>
  )
}

/**
 * Displays a detailed table of all scenario results with delta highlighting
 */
function DetailedResultsTable({ comparison, baselineScenarioId }: ComparisonResultsProps) {
  const { results, scenarios } = comparison

  // Compute all values for each metric to determine best/worst
  const metricValues = useMemo(() => {
    if (!results || results.length === 0) {
      return {
        endCapital: [],
        annualizedReturn: [],
        totalContributions: [],
        totalReturns: [],
        totalTaxes: [],
      }
    }
    return {
      endCapital: results.map((r) => r.metrics.endCapital),
      annualizedReturn: results.map((r) => r.metrics.annualizedReturn),
      totalContributions: results.map((r) => r.metrics.totalContributions),
      totalReturns: results.map((r) => r.metrics.totalReturns),
      totalTaxes: results.map((r) => r.metrics.totalTaxes),
    }
  }, [results])

  if (!results || results.length === 0) return null

  // Find baseline result for percentage comparisons
  const baselineResult = results.find((r) => r.scenarioId === baselineScenarioId) || results[0]

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <ComparisonTableHeader baselineScenarioId={baselineScenarioId} />
        <tbody>
          {results.map((result) => {
            const scenario = scenarios.find((s) => s.id === result.scenarioId)
            if (!scenario) return null

            return (
              <ComparisonTableRow
                key={result.scenarioId}
                result={result}
                scenario={scenario}
                metricValues={metricValues}
                baselineResult={baselineResult}
                baselineScenarioId={baselineScenarioId}
              />
            )
          })}
        </tbody>
      </table>
      <ComparisonTableLegend />
    </div>
  )
}

/**
 * Main results display component combining statistics and detailed table
 */
export function ComparisonResults({ comparison, baselineScenarioId }: ComparisonResultsProps) {
  const { results, statistics } = comparison

  if (!results || !statistics) return null

  return (
    <div className="space-y-4 pt-4 border-t">
      <h3 className="text-lg font-semibold">Vergleichsergebnisse</h3>

      {/* Statistics Summary */}
      <StatisticsSummary comparison={comparison} />

      {/* Detailed Results Table with Delta Highlighting */}
      <DetailedResultsTable comparison={comparison} baselineScenarioId={baselineScenarioId} />
    </div>
  )
}
