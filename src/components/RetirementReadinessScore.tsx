import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import {
  calculateRetirementReadinessScore,
  getScoreDescription,
  getScoreRecommendations,
  type RetirementReadinessMetrics,
} from '../utils/retirement-readiness-score'
import type { EnhancedSummary } from '../utils/summary-utils'
import type { WithdrawalResult } from '../../helpers/withdrawal'
import { formatCurrency } from '../utils/currency'

interface RetirementReadinessScoreProps {
  enhancedSummary: EnhancedSummary | null
  withdrawalResult: WithdrawalResult | null
  planningYears: number
  lifeExpectancy?: number
  nestingLevel?: number
}

/**
 * Score badge component with color coding based on score value
 */
function ScoreBadge({ score, label }: { score: number; label: string }) {
  const bgColor = useMemo(() => {
    if (score >= 90) return 'bg-green-100 border-green-500 text-green-800'
    if (score >= 75) return 'bg-blue-100 border-blue-500 text-blue-800'
    if (score >= 60) return 'bg-yellow-100 border-yellow-500 text-yellow-800'
    if (score >= 40) return 'bg-orange-100 border-orange-500 text-orange-800'
    return 'bg-red-100 border-red-500 text-red-800'
  }, [score])

  return (
    <div className={`${bgColor} border-l-4 rounded-lg p-4 text-center`}>
      <div className="text-4xl font-bold mb-1">{score}</div>
      <div className="text-sm font-medium">{label}</div>
    </div>
  )
}

/**
 * Individual metric display card
 */
function MetricCard({
  icon,
  label,
  value,
  description,
  colorClass,
}: {
  icon: string
  label: string
  value: string | number
  description: string
  colorClass: string
}) {
  return (
    <div className={`${colorClass} rounded-lg p-4 border-l-4`}>
      <div className="text-sm font-medium text-gray-700 mb-1">
        {icon} {label}
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-600 mt-1">{description}</div>
    </div>
  )
}

/**
 * Recommendation list item
 */
function RecommendationItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-2 text-sm text-gray-700">
      <span className="text-base">{text}</span>
    </li>
  )
}

/**
 * Overall score display section
 */
function OverallScoreSection({ score, label, description }: { score: number; label: string; description: string }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-1">
        <ScoreBadge score={score} label={label} />
      </div>
      <div className="lg:col-span-2 flex items-center">
        <p className="text-sm text-gray-700 italic">{description}</p>
      </div>
    </div>
  )
}

/**
 * Detailed metrics section
 */
function DetailedMetricsSection({ metrics }: { metrics: RetirementReadinessMetrics }) {
  return (
    <div>
      <h4 className="text-base font-semibold text-gray-800 mb-3">📊 Detaillierte Bewertung</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard
          icon="💰"
          label="Kapitaldeckung"
          value={`${metrics.capitalCoverage}%`}
          description="Verhältnis zwischen Ihrem Kapital und dem idealen Betrag nach der 4%-Regel"
          colorClass="bg-blue-50 border-blue-500"
        />
        <MetricCard
          icon="📈"
          label="Einkommensersatz"
          value={`${metrics.incomeReplacement}%`}
          description="Wie gut Ihre monatliche Entnahme den Lebensstandard sichert"
          colorClass="bg-green-50 border-green-500"
        />
        <MetricCard
          icon="⏱️"
          label="Nachhaltigkeit"
          value={`${metrics.sustainabilityScore}%`}
          description="Wie lange Ihr Kapital voraussichtlich reichen wird"
          colorClass="bg-purple-50 border-purple-500"
        />
      </div>
    </div>
  )
}

/**
 * Financial details section
 */
function FinancialDetailsSection({ metrics }: { metrics: RetirementReadinessMetrics }) {
  return (
    <div>
      <h4 className="text-base font-semibold text-gray-800 mb-3">💼 Finanzielle Kennzahlen</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <span className="text-gray-600">Gesamtkapital (Start Ruhestand):</span>
          <span className="float-right font-semibold text-gray-900">{formatCurrency(metrics.totalCapital)}</span>
        </div>
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <span className="text-gray-600">Monatliches Einkommen:</span>
          <span className="float-right font-semibold text-gray-900">{formatCurrency(metrics.monthlyIncome)}</span>
        </div>
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <span className="text-gray-600">Jährliche Ausgaben:</span>
          <span className="float-right font-semibold text-gray-900">
            {formatCurrency(metrics.estimatedAnnualExpenses)}
          </span>
        </div>
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <span className="text-gray-600">Restkapital (Planungsende):</span>
          <span className="float-right font-semibold text-gray-900">{formatCurrency(metrics.remainingCapital)}</span>
        </div>
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <span className="text-gray-600">Versorgungsdauer:</span>
          <span className="float-right font-semibold text-gray-900">{metrics.sustainabilityYears} Jahre</span>
        </div>
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <span className="text-gray-600">Gesamt entnommen:</span>
          <span className="float-right font-semibold text-gray-900">{formatCurrency(metrics.totalWithdrawn)}</span>
        </div>
      </div>
    </div>
  )
}

/**
 * Retirement-Readiness Score Component
 *
 * Displays a comprehensive retirement readiness assessment based on German retirement planning standards.
 * Shows overall score, detailed metrics, and personalized recommendations.
 */
export function RetirementReadinessScore({
  enhancedSummary,
  withdrawalResult,
  planningYears,
  lifeExpectancy = 25,
  nestingLevel = 0,
}: RetirementReadinessScoreProps) {
  const metrics: RetirementReadinessMetrics | null = useMemo(() => {
    return calculateRetirementReadinessScore(enhancedSummary, withdrawalResult, planningYears, lifeExpectancy)
  }, [enhancedSummary, withdrawalResult, planningYears, lifeExpectancy])

  if (!metrics) {
    return null
  }

  const description = getScoreDescription(metrics.overallScore)
  const recommendations = getScoreRecommendations(metrics)

  return (
    <Card nestingLevel={nestingLevel} className="bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardHeader nestingLevel={nestingLevel}>
        <CardTitle>🎯 Retirement-Readiness Score</CardTitle>
        <CardDescription>Bewertung Ihrer Altersvorsorge basierend auf deutscher Finanzplanung</CardDescription>
      </CardHeader>
      <CardContent nestingLevel={nestingLevel} className="space-y-6">
        <OverallScoreSection score={metrics.overallScore} label={metrics.scoreLabel} description={description} />
        <DetailedMetricsSection metrics={metrics} />
        <FinancialDetailsSection metrics={metrics} />

        {/* Recommendations */}
        <div>
          <h4 className="text-base font-semibold text-gray-800 mb-3">💡 Empfehlungen</h4>
          <ul className="space-y-2">
            {recommendations.map((recommendation, index) => (
              <RecommendationItem key={index} text={recommendation} />
            ))}
          </ul>
        </div>

        {/* Methodology Note */}
        <div className="bg-blue-50 border-l-4 border-blue-400 rounded-lg p-3 text-xs text-gray-600">
          <strong>Hinweis zur Berechnung:</strong> Der Score basiert auf drei Hauptfaktoren: Kapitaldeckung (40%),
          Einkommensersatz (30%) und Nachhaltigkeit (30%). Die Bewertung orientiert sich an der 4%-Regel und deutschen
          Standards für die Altersvorsorge.
        </div>
      </CardContent>
    </Card>
  )
}
