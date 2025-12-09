import { useMemo } from 'react'
import { Card, CardContent } from './ui/card'
import { Collapsible, CollapsibleContent } from './ui/collapsible'
import { CollapsibleCardHeader } from './ui/collapsible-card'
import { useSimulation } from '../contexts/useSimulation'
import { useWithdrawalConfig } from '../hooks/useWithdrawalConfig'
import { formatCurrency } from '../utils/currency'
import {
  calculateInsuranceCostSummary,
  generateOptimizationRecommendations,
  type InsuranceCostSummary,
  type InsuranceOptimizationRecommendation,
} from '../../helpers/insurance-cost-overview'

/**
 * Info message explaining what this tool shows
 */
function InfoMessage() {
  return (
    <div className="text-sm text-muted-foreground bg-blue-50 border border-blue-200 rounded-lg p-3">
      <p className="font-medium text-blue-900 mb-1">💡 Versicherungskostenübersicht</p>
      <p className="text-xs text-blue-800">
        Diese Übersicht zeigt Ihre konfigurierten Versicherungskosten über den Planungszeitraum. Sie hilft dabei,
        Optimierungspotenziale zu erkennen und die Gesamtbelastung durch Versicherungen einzuschätzen.
      </p>
    </div>
  )
}

/**
 * Display a single recommendation
 */
interface RecommendationItemProps {
  recommendation: InsuranceOptimizationRecommendation
}

function RecommendationItem({ recommendation }: RecommendationItemProps) {
  const bgColor =
    recommendation.level === 'critical'
      ? 'bg-red-50 border-red-200'
      : recommendation.level === 'warning'
        ? 'bg-yellow-50 border-yellow-200'
        : 'bg-blue-50 border-blue-200'

  const textColor =
    recommendation.level === 'critical'
      ? 'text-red-900'
      : recommendation.level === 'warning'
        ? 'text-yellow-900'
        : 'text-blue-900'

  const icon = recommendation.level === 'critical' ? '🚨' : recommendation.level === 'warning' ? '⚠️' : 'ℹ️'

  return (
    <div className={`text-sm border rounded-lg p-3 ${bgColor}`}>
      <p className={`font-medium mb-1 ${textColor}`}>
        {icon} {recommendation.title}
      </p>
      <p className={`text-xs ${textColor.replace('900', '800')}`}>{recommendation.message}</p>
    </div>
  )
}

/**
 * Display optimization recommendations
 */
interface RecommendationsDisplayProps {
  recommendations: InsuranceOptimizationRecommendation[]
}

function RecommendationsDisplay({ recommendations }: RecommendationsDisplayProps) {
  if (recommendations.length === 0) {
    return (
      <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-sm text-green-900">
          ✅ <span className="font-medium">Gut optimiert!</span> Ihre Versicherungskonfiguration zeigt keine
          offensichtlichen Optimierungspotenziale.
        </p>
      </div>
    )
  }

  return (
    <div className="mt-4 space-y-2">
      <h4 className="font-medium text-sm">💡 Optimierungsempfehlungen</h4>
      {recommendations.map((rec, idx) => (
        <RecommendationItem key={idx} recommendation={rec} />
      ))}
    </div>
  )
}

/**
 * Display category costs breakdown
 */
interface CategoryCostsProps {
  averageCostByCategory: {
    health: number
    life: number
    care: number
    disability: number
    other: number
  }
}

function CategoryCostsBreakdown({ averageCostByCategory }: CategoryCostsProps) {
  return (
    <div className="mt-3 pt-3 border-t border-indigo-300 text-xs text-indigo-800">
      <p className="font-medium mb-2">Durchschnittliche Kosten nach Kategorie:</p>
      <div className="space-y-1 ml-2">
        {averageCostByCategory.health > 0 && (
          <div className="flex justify-between">
            <span>🏥 Krankenversicherung:</span>
            <span className="font-medium">{formatCurrency(averageCostByCategory.health)}/Jahr</span>
          </div>
        )}
        {averageCostByCategory.life > 0 && (
          <div className="flex justify-between">
            <span>💼 Risikolebensversicherung:</span>
            <span className="font-medium">{formatCurrency(averageCostByCategory.life)}/Jahr</span>
          </div>
        )}
        {averageCostByCategory.care > 0 && (
          <div className="flex justify-between">
            <span>🩺 Pflegeversicherung:</span>
            <span className="font-medium">{formatCurrency(averageCostByCategory.care)}/Jahr</span>
          </div>
        )}
        {averageCostByCategory.disability > 0 && (
          <div className="flex justify-between">
            <span>🛡️ Berufsunfähigkeitsversicherung:</span>
            <span className="font-medium">{formatCurrency(averageCostByCategory.disability)}/Jahr</span>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Display summary statistics
 */
interface SummaryDisplayProps {
  summary: InsuranceCostSummary
}

function SummaryDisplay({ summary }: SummaryDisplayProps) {
  const hasInsurances = summary.insuranceTypes.length > 0

  if (!hasInsurances) {
    return (
      <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-sm text-gray-700">
          <span className="font-medium">Keine Versicherungen konfiguriert.</span> Fügen Sie Versicherungen in der
          Entnahme-Planung hinzu, um eine Kostenübersicht zu sehen.
        </p>
      </div>
    )
  }

  return (
    <div className="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
      <h4 className="font-medium text-indigo-900 mb-3">📊 Zusammenfassung</h4>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-indigo-800">Durchschnittliche jährliche Kosten:</span>
          <span className="font-medium text-indigo-900">{formatCurrency(summary.averageAnnualCost)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-indigo-800">Höchste jährliche Kosten:</span>
          <span className="font-medium text-indigo-900">
            {formatCurrency(summary.peakAnnualCost)} (Jahr {summary.peakCostYear})
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-indigo-800">Gesamtkosten über Zeitraum:</span>
          <span className="font-medium text-indigo-900">{formatCurrency(summary.totalCost)}</span>
        </div>
      </div>

      <CategoryCostsBreakdown averageCostByCategory={summary.averageCostByCategory} />

      <div className="mt-3 pt-3 border-t border-indigo-300 text-xs text-indigo-800">
        <p className="font-medium mb-1">Konfigurierte Versicherungen:</p>
        <p className="ml-2">{summary.insuranceTypes.join(', ')}</p>
      </div>
    </div>
  )
}

/**
 * Insurance Cost Overview Card
 * Displays aggregated insurance costs and optimization recommendations
 */
export function InsuranceCostOverview() {
  const simulation = useSimulation()
  const { currentConfig } = useWithdrawalConfig()

  const summary = useMemo(() => {
    const startYear = simulation.startEnd?.[0] || new Date().getFullYear()
    const endYear = simulation.startEnd?.[1] || startYear + 15

    return calculateInsuranceCostSummary(
      startYear,
      endYear,
      currentConfig.formValue.healthCareInsuranceConfig,
      simulation.termLifeInsuranceConfig || undefined,
      undefined, // otherIncomeSources not currently accessible here
    )
  }, [
    simulation.startEnd,
    currentConfig.formValue.healthCareInsuranceConfig,
    simulation.termLifeInsuranceConfig,
  ])

  const recommendations = useMemo(() => {
    // Calculate average withdrawal amount if available
    const withdrawalAmount = currentConfig.formValue.monatlicheBetrag
      ? currentConfig.formValue.monatlicheBetrag * 12
      : undefined

    return generateOptimizationRecommendations(summary, withdrawalAmount)
  }, [summary, currentConfig.formValue.monatlicheBetrag])

  return (
    <Card nestingLevel={1}>
      <Collapsible defaultOpen={false}>
        <CollapsibleCardHeader titleClassName="text-left" simplifiedPadding>
          🏥 Versicherungskostenübersicht
        </CollapsibleCardHeader>
        <CollapsibleContent>
          <CardContent nestingLevel={1}>
            <div className="space-y-4">
              <InfoMessage />
              <SummaryDisplay summary={summary} />
              <RecommendationsDisplay recommendations={recommendations} />
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
