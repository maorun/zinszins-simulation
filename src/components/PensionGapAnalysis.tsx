import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Info, TrendingDown, TrendingUp, AlertCircle } from 'lucide-react'
import { formatCurrency } from '../utils/currency'
import type { PensionGapAnalysisResult, YearlyPensionGapResult } from '../../helpers/pension-gap-analysis'
import { useNestingLevel } from '../lib/nesting-utils'

interface PensionGapAnalysisProps {
  /** Pension gap analysis result */
  analysisResult: PensionGapAnalysisResult

  /** Whether to show detailed year-by-year breakdown */
  showDetailedBreakdown?: boolean

  /** Maximum number of years to show in detailed breakdown */
  maxYearsToShow?: number
}

/**
 * Summary statistics grid
 */
function SummaryStatistics({ summary }: { summary: PensionGapAnalysisResult['summary'] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-600">Jahre mit voller Deckung:</span>
          <span className="font-semibold text-green-600">
            {summary.yearsCovered} / {summary.totalYears}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Jahre mit Rentenlücke:</span>
          <span className="font-semibold text-red-600">
            {summary.yearsWithGap} / {summary.totalYears}
          </span>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-600">Ø Rentendeckung:</span>
          <span className="font-semibold text-blue-600">{summary.averagePensionCoverage.toFixed(1)}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Ø Portfolio-Entnahme:</span>
          <span className="font-semibold text-blue-600">{summary.averagePortfolioWithdrawal.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  )
}

/**
 * Gap statistics section
 */
function GapStatistics({ summary }: { summary: PensionGapAnalysisResult['summary'] }) {
  if (summary.yearsWithGap === 0) return null

  return (
    <div className="mt-4 pt-4 border-t border-gray-200">
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Größte Rentenlücke:</span>
          <span className="font-bold text-red-600">
            {formatCurrency(summary.maxGapAmount)}
            {summary.maxGapYear && <span className="text-xs ml-1">({summary.maxGapYear})</span>}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Ø Rentenlücke:</span>
          <span className="font-semibold text-orange-600">{formatCurrency(summary.averageGapAmount)}</span>
        </div>
      </div>
    </div>
  )
}

/**
 * Summary Card showing overall pension gap statistics
 */
function SummaryCard({ summary }: { summary: PensionGapAnalysisResult['summary'] }) {
  const nestingLevel = useNestingLevel()
  const gapStatus = summary.yearsWithGap === 0 ? 'covered' : summary.yearsWithGap === summary.totalYears ? 'full-gap' : 'partial-gap'

  const statusColors = {
    covered: 'text-green-600',
    'partial-gap': 'text-orange-600',
    'full-gap': 'text-red-600',
  }

  const statusIcons = {
    covered: <TrendingUp className="h-5 w-5" />,
    'partial-gap': <AlertCircle className="h-5 w-5" />,
    'full-gap': <TrendingDown className="h-5 w-5" />,
  }

  return (
    <Card nestingLevel={nestingLevel + 1}>
      <CardHeader nestingLevel={nestingLevel + 1} className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          {statusIcons[gapStatus]}
          <span className={statusColors[gapStatus]}>Rentenlücken-Zusammenfassung</span>
        </CardTitle>
      </CardHeader>
      <CardContent nestingLevel={nestingLevel + 1}>
        <SummaryStatistics summary={summary} />
        <GapStatistics summary={summary} />
      </CardContent>
    </Card>
  )
}

/**
 * Income bar segment component
 */
function IncomeBarSegment({
  width,
  color,
  label,
  percentage,
}: {
  width: number
  color: string
  label: string
  percentage: number
}) {
  if (width <= 0) return null

  return (
    <div
      className={`${color} flex items-center justify-center text-xs font-medium text-white`}
      style={{ width: `${width}%` }}
      title={`${label}: ${percentage.toFixed(1)}%`}
    >
      {width > 10 && `${percentage.toFixed(0)}%`}
    </div>
  )
}

/**
 * Income breakdown legend
 */
function IncomeLegend({ result }: { result: YearlyPensionGapResult }) {
  return (
    <div className="flex flex-wrap gap-4 text-xs">
      <div className="flex items-center gap-1">
        <div className="w-3 h-3 bg-green-500 rounded"></div>
        <span>Rente ({result.pensionCoveragePercentage.toFixed(1)}%)</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-3 h-3 bg-blue-500 rounded"></div>
        <span>Portfolio ({result.portfolioWithdrawalPercentage.toFixed(1)}%)</span>
      </div>
      {result.otherIncomePercentage > 0 && (
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-purple-500 rounded"></div>
          <span>Andere ({result.otherIncomePercentage.toFixed(1)}%)</span>
        </div>
      )}
      {!result.isLifestyleCovered && (
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-red-200 rounded"></div>
          <span>Lücke ({result.gapPercentage.toFixed(1)}%)</span>
        </div>
      )}
    </div>
  )
}

/**
 * Income Breakdown Bar showing visual representation of income sources
 */
function IncomeBreakdownBar({ result }: { result: YearlyPensionGapResult }) {
  const pensionWidth = Math.min(result.pensionCoveragePercentage, 100)
  const portfolioWidth = Math.min(result.portfolioWithdrawalPercentage, 100)
  const otherWidth = Math.min(result.otherIncomePercentage, 100)

  const totalAvailablePercentage = Math.min(
    result.pensionCoveragePercentage + result.portfolioWithdrawalPercentage + result.otherIncomePercentage,
    100,
  )
  const gapWidth = Math.max(0, 100 - totalAvailablePercentage)

  return (
    <div className="space-y-2">
      <div className="flex h-8 w-full rounded-lg overflow-hidden border border-gray-300">
        <IncomeBarSegment
          width={pensionWidth}
          color="bg-green-500"
          label="Gesetzliche Rente"
          percentage={result.pensionCoveragePercentage}
        />
        <IncomeBarSegment
          width={portfolioWidth}
          color="bg-blue-500"
          label="Portfolio"
          percentage={result.portfolioWithdrawalPercentage}
        />
        <IncomeBarSegment
          width={otherWidth}
          color="bg-purple-500"
          label="Andere Einkünfte"
          percentage={result.otherIncomePercentage}
        />
        {gapWidth > 0 && (
          <div
            className="bg-red-200 flex items-center justify-center text-xs font-medium text-red-800"
            style={{ width: `${gapWidth}%` }}
            title={`Rentenlücke: ${gapWidth.toFixed(1)}%`}
          >
            {gapWidth > 10 && `Lücke ${gapWidth.toFixed(0)}%`}
          </div>
        )}
      </div>
      <IncomeLegend result={result} />
    </div>
  )
}

/**
 * Desired vs Available Income Display
 */
function IncomeComparison({ result }: { result: YearlyPensionGapResult }) {
  return (
    <div className="grid grid-cols-2 gap-4 text-sm">
      <div>
        <div className="text-gray-600">Gewünschtes Einkommen</div>
        <div className="text-lg font-bold text-blue-700">{formatCurrency(result.desiredAnnualIncome)}</div>
        <div className="text-xs text-gray-500">{formatCurrency(result.desiredMonthlyIncome)} / Monat</div>
      </div>
      <div>
        <div className="text-gray-600">Verfügbares Einkommen</div>
        <div className={`text-lg font-bold ${result.isLifestyleCovered ? 'text-green-600' : 'text-orange-600'}`}>
          {formatCurrency(result.totalAvailableIncome)}
        </div>
        <div className="text-xs text-gray-500">{formatCurrency(result.totalAvailableIncome / 12)} / Monat</div>
      </div>
    </div>
  )
}

/**
 * Detailed Income Breakdown
 */
function IncomeSourcesBreakdown({ result }: { result: YearlyPensionGapResult }) {
  return (
    <div className="space-y-1 text-sm border-t border-gray-200 pt-3">
      <div className="flex justify-between">
        <span className="text-gray-600">🏛️ Gesetzliche Rente (Netto):</span>
        <span className="font-semibold text-green-600">+{formatCurrency(result.statutoryPensionNet)}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">💰 Portfolio-Entnahme:</span>
        <span className="font-semibold text-blue-600">+{formatCurrency(result.portfolioWithdrawal)}</span>
      </div>
      {result.otherIncome > 0 && (
        <div className="flex justify-between">
          <span className="text-gray-600">💼 Andere Einkünfte:</span>
          <span className="font-semibold text-purple-600">+{formatCurrency(result.otherIncome)}</span>
        </div>
      )}
      {result.healthCareInsurance > 0 && (
        <div className="flex justify-between">
          <span className="text-gray-600">🏥 Kranken-/Pflegeversicherung:</span>
          <span className="font-semibold text-red-600">-{formatCurrency(result.healthCareInsurance)}</span>
        </div>
      )}
    </div>
  )
}

/**
 * Year Card showing detailed gap analysis for a single year
 */
function YearGapCard({ result }: { result: YearlyPensionGapResult }) {
  const nestingLevel = useNestingLevel()

  return (
    <Card nestingLevel={nestingLevel + 2}>
      <CardHeader nestingLevel={nestingLevel + 2} className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span>Jahr {result.year}</span>
          {result.isLifestyleCovered ? (
            <span className="text-sm text-green-600 flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              Vollständig gedeckt
            </span>
          ) : (
            <span className="text-sm text-red-600 flex items-center gap-1">
              <TrendingDown className="h-4 w-4" />
              Rentenlücke: {formatCurrency(result.gap)}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent nestingLevel={nestingLevel + 2}>
        <div className="space-y-4">
          <IncomeComparison result={result} />
          <IncomeBreakdownBar result={result} />
          <IncomeSourcesBreakdown result={result} />
          {result.inflationAdjustmentFactor > 1.0 && (
            <div className="text-xs text-gray-500 italic">
              Inflationsanpassung: {((result.inflationAdjustmentFactor - 1) * 100).toFixed(1)}%
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Detailed year-by-year breakdown section
 */
function YearlyBreakdown({
  yearsToDisplay,
  totalYears,
  maxYearsToShow,
}: {
  yearsToDisplay: YearlyPensionGapResult[]
  totalYears: number
  maxYearsToShow: number
}) {
  if (yearsToDisplay.length === 0) return null

  const hasMoreYears = totalYears > maxYearsToShow

  return (
    <div className="space-y-4">
      <h4 className="text-base font-semibold text-gray-700">Jahr-für-Jahr Aufschlüsselung</h4>
      <div className="space-y-3">
        {yearsToDisplay.map(result => (
          <YearGapCard key={result.year} result={result} />
        ))}
      </div>
      {hasMoreYears && (
        <div className="text-sm text-gray-500 text-center italic">
          ... und {totalYears - maxYearsToShow} weitere Jahre
        </div>
      )}
    </div>
  )
}

/**
 * Pension Gap Analysis Component
 *
 * Displays a comprehensive analysis of the pension gap, showing the difference
 * between desired retirement income and available income sources.
 */
export function PensionGapAnalysis({
  analysisResult,
  showDetailedBreakdown = true,
  maxYearsToShow = 10,
}: PensionGapAnalysisProps) {
  const nestingLevel = useNestingLevel()

  const yearsToDisplay = showDetailedBreakdown
    ? analysisResult.yearlyResults.slice(0, maxYearsToShow)
    : []

  return (
    <Card nestingLevel={nestingLevel}>
      <CardHeader nestingLevel={nestingLevel}>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5" />
          Rentenlücken-Analyse
        </CardTitle>
      </CardHeader>
      <CardContent nestingLevel={nestingLevel}>
        <div className="space-y-6">
          <div className="text-sm text-gray-700 bg-blue-50 p-4 rounded-lg">
            <p className="font-medium mb-2">Was ist die Rentenlücke?</p>
            <p>
              Die Rentenlücke zeigt den Unterschied zwischen Ihrem gewünschten Lebensstandard im Ruhestand und dem
              tatsächlich verfügbaren Einkommen aus gesetzlicher Rente, Portfolio-Entnahmen und anderen Quellen.
            </p>
          </div>

          <SummaryCard summary={analysisResult.summary} />

          <YearlyBreakdown
            yearsToDisplay={yearsToDisplay}
            totalYears={analysisResult.yearlyResults.length}
            maxYearsToShow={maxYearsToShow}
          />
        </div>
      </CardContent>
    </Card>
  )
}
