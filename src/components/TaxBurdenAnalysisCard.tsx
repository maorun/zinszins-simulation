import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { Alert } from './ui/alert'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'
import { Button } from './ui/button'
import { ChevronDown } from 'lucide-react'
import { analyzeTaxBurden, identifyHighTaxYears } from '../../helpers/tax-burden-analysis'
import type { SimulationResult } from '../utils/simulate'
import { useMemo, useState } from 'react'
import { formatCurrency } from '../utils/currency'

interface TaxBurdenAnalysisCardProps {
  simulationResult: SimulationResult | undefined
  className?: string
}

/**
 * TaxBurdenAnalysisCard Component
 * 
 * Displays comprehensive tax burden analysis over the investment period.
 * Shows:
 * - Total tax metrics
 * - Peak tax year identification
 * - Years with above-average tax burden
 * - Year-by-year breakdown
 * 
 * Helps users understand their tax situation and identify optimization opportunities.
 */
export function TaxBurdenAnalysisCard({ simulationResult, className = '' }: TaxBurdenAnalysisCardProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  // Analyze tax burden
  const analysis = useMemo(() => analyzeTaxBurden(simulationResult), [simulationResult])
  const highTaxYears = useMemo(() => identifyHighTaxYears(analysis), [analysis])

  // Don't render if no data
  if (!analysis.yearlyData.length) {
    return null
  }

  return (
    <Card className={className}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-3">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 hover:bg-transparent">
              <CardTitle className="flex items-center gap-2 text-left">
                📊 Steuerbelastungs-Verlaufsanalyse
              </CardTitle>
              <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="space-y-4">
            <SummaryMetrics analysis={analysis} />
            <PeakTaxYearAlert analysis={analysis} />
            <HighTaxYearsAlert highTaxYears={highTaxYears} />
            <YearlyBreakdownTable analysis={analysis} highTaxYears={highTaxYears} />
            <TaxAnalysisLegend />
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}

/**
 * Summary metrics display
 */
function SummaryMetrics({ analysis }: { analysis: ReturnType<typeof analyzeTaxBurden> }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <SummaryCard
        title="Gesamte Steuerlast"
        value={formatCurrency(analysis.totalTaxPaid)}
        icon="💶"
        description="Gesamte bezahlte Kapitalertragsteuer"
      />
      <SummaryCard
        title="Durchschnittlicher Steuersatz"
        value={`${analysis.averageEffectiveTaxRate.toFixed(2)}%`}
        icon="📈"
        description="Effektiver Steuersatz auf Gewinne"
      />
      <SummaryCard
        title="Genutzter Freibetrag"
        value={formatCurrency(analysis.totalAllowanceUsed)}
        icon="🎯"
        description="Summe aller genutzten Freibeträge"
      />
      <SummaryCard
        title="Vorabpauschale"
        value={formatCurrency(analysis.totalVorabpauschale)}
        icon="📋"
        description="Gesamte Vorabpauschale-Beträge"
      />
    </div>
  )
}

/**
 * Peak tax year alert component
 */
function PeakTaxYearAlert({ analysis }: { analysis: ReturnType<typeof analyzeTaxBurden> }) {
  if (!analysis.peakTaxYear) {
    return null
  }

  return (
    <Alert>
      <div className="flex items-start gap-2">
        <span className="text-xl">⚠️</span>
        <div className="flex-1">
          <div className="font-medium text-sm mb-1">Höchste Steuerbelastung</div>
          <div className="text-sm">
            Im Jahr <strong>{analysis.peakTaxYear}</strong> erreicht die Steuerlast ihren Höhepunkt mit{' '}
            <strong>{formatCurrency(analysis.peakTaxAmount)}</strong>.
          </div>
        </div>
      </div>
    </Alert>
  )
}

/**
 * High tax years warning alert
 */
function HighTaxYearsAlert({ highTaxYears }: { highTaxYears: number[] }) {
  if (highTaxYears.length === 0) {
    return null
  }

  return (
    <Alert>
      <div className="flex items-start gap-2">
        <span className="text-xl">💡</span>
        <div className="flex-1">
          <div className="font-medium text-sm mb-1">Optimierungsmöglichkeiten</div>
          <div className="text-sm">
            Die folgenden Jahre haben eine überdurchschnittlich hohe Steuerbelastung (20% über dem Durchschnitt):
            <div className="mt-1 font-medium">{highTaxYears.join(', ')}</div>
            <div className="mt-2 text-xs opacity-80">
              Erwägen Sie Steueroptimierungsstrategien wie Tax Loss Harvesting oder Anpassung der
              Entnahmezeitpunkte für diese Jahre.
            </div>
          </div>
        </div>
      </div>
    </Alert>
  )
}

/**
 * Yearly breakdown table
 */
function YearlyBreakdownTable({
  analysis,
  highTaxYears,
}: {
  analysis: ReturnType<typeof analyzeTaxBurden>
  highTaxYears: number[]
}) {
  return (
    <div>
      <h3 className="text-sm font-medium mb-2">Jährliche Aufschlüsselung</h3>
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-2 text-left font-medium">Jahr</th>
                <th className="px-4 py-2 text-right font-medium">Gewinne</th>
                <th className="px-4 py-2 text-right font-medium">Steuern</th>
                <th className="px-4 py-2 text-right font-medium">Steuersatz</th>
                <th className="px-4 py-2 text-right font-medium">Vorabpauschale</th>
                <th className="px-4 py-2 text-right font-medium">Freibetrag</th>
              </tr>
            </thead>
            <tbody>
              {analysis.yearlyData.map(yearData => (
                <YearRow key={yearData.year} yearData={yearData} highTaxYears={highTaxYears} peakTaxYear={analysis.peakTaxYear} />
              ))}
            </tbody>
            <tfoot className="bg-gray-50 border-t-2 font-medium">
              <tr>
                <td className="px-4 py-2">Gesamt</td>
                <td className="px-4 py-2 text-right">{formatCurrency(analysis.totalGains)}</td>
                <td className="px-4 py-2 text-right">{formatCurrency(analysis.totalTaxPaid)}</td>
                <td className="px-4 py-2 text-right">{analysis.averageEffectiveTaxRate.toFixed(2)}%</td>
                <td className="px-4 py-2 text-right">{formatCurrency(analysis.totalVorabpauschale)}</td>
                <td className="px-4 py-2 text-right">{formatCurrency(analysis.totalAllowanceUsed)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}

/**
 * Single year row in the table
 */
function YearRow({
  yearData,
  highTaxYears,
  peakTaxYear,
}: {
  yearData: ReturnType<typeof analyzeTaxBurden>['yearlyData'][number]
  highTaxYears: number[]
  peakTaxYear: number | null
}) {
  const isHighTaxYear = highTaxYears.includes(yearData.year)
  const isPeakYear = yearData.year === peakTaxYear

  return (
    <tr
      className={`border-b last:border-b-0 ${
        isPeakYear ? 'bg-red-50' : isHighTaxYear ? 'bg-yellow-50' : 'hover:bg-gray-50'
      }`}
    >
      <td className="px-4 py-2 font-medium">
        {yearData.year}
        {isPeakYear && <span className="ml-1 text-xs">🔴</span>}
        {isHighTaxYear && !isPeakYear && <span className="ml-1 text-xs">⚠️</span>}
      </td>
      <td className="px-4 py-2 text-right">{formatCurrency(yearData.gains)}</td>
      <td className="px-4 py-2 text-right font-medium">{formatCurrency(yearData.capitalGainsTax)}</td>
      <td className="px-4 py-2 text-right">{yearData.effectiveTaxRate.toFixed(2)}%</td>
      <td className="px-4 py-2 text-right">{formatCurrency(yearData.vorabpauschale)}</td>
      <td className="px-4 py-2 text-right">{formatCurrency(yearData.usedAllowance)}</td>
    </tr>
  )
}

/**
 * Legend explaining the symbols and metrics
 */
function TaxAnalysisLegend() {
  return (
    <div className="text-xs text-gray-600 space-y-1 bg-gray-50 p-3 rounded-md">
      <div className="font-medium mb-2">Legende:</div>
      <div>🔴 = Jahr mit höchster Steuerbelastung</div>
      <div>⚠️ = Überdurchschnittliche Steuerbelastung (20% über Durchschnitt)</div>
      <div className="mt-2 border-t pt-2">
        <strong>Steuersatz:</strong> Effektiver Steuersatz = Bezahlte Steuern / Gewinne × 100%
      </div>
    </div>
  )
}

/**
 * SummaryCard Component
 * Displays a single summary metric card
 */
interface SummaryCardProps {
  title: string
  value: string
  icon: string
  description: string
}

function SummaryCard({ title, value, icon, description }: SummaryCardProps) {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
      <div className="flex items-start gap-2 mb-2">
        <span className="text-2xl">{icon}</span>
        <div className="flex-1">
          <div className="text-xs text-gray-600 mb-1">{title}</div>
          <div className="text-lg font-bold text-gray-900">{value}</div>
        </div>
      </div>
      <div className="text-xs text-gray-600">{description}</div>
    </div>
  )
}
