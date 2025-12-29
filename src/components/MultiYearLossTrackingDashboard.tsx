/**
 * Multi-Year Loss Tracking Dashboard Component
 *
 * Displays comprehensive multi-year loss tracking analysis with:
 * - Yearly loss carryforward visualization
 * - Tax savings projections
 * - Warnings about unused losses
 * - Optimization recommendations
 */

import { useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Alert, AlertDescription } from './ui/alert'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { formatCurrency } from '../utils/currency'
import { generateFormId } from '../utils/unique-id'
import {
  analyzeMultiYearLossUsage,
  type MultiYearLossTracking,
  type YearLossAnalysis,
  type LossWarning,
  type LossRecommendation,
} from '../../helpers/loss-offset-accounts'
import { AlertTriangle, TrendingUp, Info, CheckCircle2, AlertCircle } from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'

interface MultiYearLossTrackingDashboardProps {
  /** Tax rate for calculating savings (e.g., 0.26375) */
  taxRate: number
  /** Start year for analysis */
  startYear: number
  /** End year for analysis */
  endYear: number
  /** Initial loss carryforward from before start year */
  initialStockLosses?: number
  initialOtherLosses?: number
}

/**
 * Warning badge component
 */
function WarningBadge({ severity }: { severity: 'low' | 'medium' | 'high' }) {
  const colors = {
    low: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    medium: 'bg-orange-100 text-orange-800 border-orange-300',
    high: 'bg-red-100 text-red-800 border-red-300',
  }

  const labels = {
    low: 'Niedrig',
    medium: 'Mittel',
    high: 'Hoch',
  }

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${colors[severity]}`}>
      {labels[severity]}
    </span>
  )
}

/**
 * Priority badge component
 */
function PriorityBadge({ priority }: { priority: 'low' | 'medium' | 'high' }) {
  const colors = {
    low: 'bg-blue-100 text-blue-800 border-blue-300',
    medium: 'bg-purple-100 text-purple-800 border-purple-300',
    high: 'bg-green-100 text-green-800 border-green-300',
  }

  const labels = {
    low: 'Optional',
    medium: 'Empfohlen',
    high: 'Wichtig',
  }

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${colors[priority]}`}>
      {labels[priority]}
    </span>
  )
}

/**
 * Warning display component
 */
function WarningDisplay({ warning }: { warning: LossWarning }) {
  return (
    <Alert className="mb-2">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <WarningBadge severity={warning.severity} />
            <span className="text-xs text-muted-foreground">Jahr {warning.year}</span>
          </div>
          <p className="text-sm">{warning.message}</p>
          {warning.affectedAmount && (
            <p className="text-xs text-muted-foreground mt-1">
              Betroffener Betrag: {formatCurrency(warning.affectedAmount)}
            </p>
          )}
        </div>
      </AlertDescription>
    </Alert>
  )
}

/**
 * Recommendation display component
 */
function RecommendationDisplay({ recommendation }: { recommendation: LossRecommendation }) {
  return (
    <Alert className="mb-2 border-green-200 bg-green-50">
      <TrendingUp className="h-4 w-4 text-green-600" />
      <AlertDescription>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <PriorityBadge priority={recommendation.priority} />
              <span className="text-xs text-muted-foreground">Jahr {recommendation.year}</span>
            </div>
            <p className="font-medium text-sm text-green-900">{recommendation.title}</p>
            <p className="text-sm text-green-800 mt-1">{recommendation.description}</p>
            {recommendation.potentialSavings && (
              <p className="text-xs text-green-700 mt-1 font-medium">
                💰 Potenzielle Ersparnis: {formatCurrency(recommendation.potentialSavings)}
              </p>
            )}
            {recommendation.actionRequired && (
              <p className="text-xs text-muted-foreground mt-1">
                ➡️ Aktion: {recommendation.actionRequired}
              </p>
            )}
          </div>
        </div>
      </AlertDescription>
    </Alert>
  )
}

/**
 * Year details section
 */
function YearDetails({ analysis }: { analysis: YearLossAnalysis }) {
  return (
    <div className="mt-3 space-y-2">
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-muted-foreground text-xs mb-1">Verfügbare Verluste</p>
          <p className="font-medium">Aktien: {formatCurrency(analysis.availableLosses.stockLosses)}</p>
          <p className="font-medium">Sonstige: {formatCurrency(analysis.availableLosses.otherLosses)}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs mb-1">Projizierte Gewinne</p>
          <p className="font-medium">Aktien: {formatCurrency(analysis.projectedGains.stockGains)}</p>
          <p className="font-medium">Sonstige: {formatCurrency(analysis.projectedGains.otherGains)}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm pt-2 border-t">
        <div>
          <p className="text-muted-foreground text-xs mb-1">Verrechnung</p>
          <p>Aktien: {formatCurrency(analysis.projectedLossUsage.stockLossesUsed)}</p>
          <p>Sonstige: {formatCurrency(analysis.projectedLossUsage.otherLossesUsed)}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs mb-1">Vortrag Folgejahr</p>
          <p>Aktien: {formatCurrency(analysis.carryForwardToNextYear.stockLosses)}</p>
          <p>Sonstige: {formatCurrency(analysis.carryForwardToNextYear.otherLosses)}</p>
        </div>
      </div>

      {analysis.warnings.length > 0 && (
        <div className="pt-2 border-t">
          <p className="text-xs font-medium mb-2">⚠️ Warnungen</p>
          {analysis.warnings.map((warning, idx) => (
            <WarningDisplay key={idx} warning={warning} />
          ))}
        </div>
      )}

      {analysis.recommendations.length > 0 && (
        <div className="pt-2 border-t">
          <p className="text-xs font-medium mb-2">💡 Empfehlungen</p>
          {analysis.recommendations.map((rec, idx) => (
            <RecommendationDisplay key={idx} recommendation={rec} />
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * Year analysis row component
 */
function YearAnalysisRow({ analysis }: { analysis: YearLossAnalysis }) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <div className="border rounded-lg p-3 bg-card">
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-4">
                <span className="font-medium text-sm">{analysis.year}</span>
                <div className="flex gap-2 text-xs text-muted-foreground">
                  <span>📊 Verfügbar: {formatCurrency(analysis.availableLosses.stockLosses + analysis.availableLosses.otherLosses)}</span>
                  <span>✅ Genutzt: {formatCurrency(analysis.projectedLossUsage.totalUsed)}</span>
                  <span className="text-green-700 font-medium">💰 {formatCurrency(analysis.projectedTaxSavings)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {analysis.warnings.length > 0 && (
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                    {analysis.warnings.length} ⚠️
                  </span>
                )}
                {analysis.recommendations.length > 0 && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    {analysis.recommendations.length} 💡
                  </span>
                )}
              </div>
            </div>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <YearDetails analysis={analysis} />
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}

/**
 * Summary statistics component
 */
function SummaryStatistics({
  totalProjectedSavings,
  totalUnusedLosses,
  warningCount,
}: {
  totalProjectedSavings: number
  totalUnusedLosses: number
  warningCount: { low: number; medium: number; high: number }
}) {
  const totalWarnings = warningCount.low + warningCount.medium + warningCount.high

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
      <Card>
        <CardHeader className="pb-2">
          <CardDescription className="text-xs">Gesamte Steuerersparnisse</CardDescription>
          <CardTitle className="text-2xl text-green-700">{formatCurrency(totalProjectedSavings)}</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground">
          Durch optimale Verlustnutzung
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardDescription className="text-xs">Ungenutzte Verluste</CardDescription>
          <CardTitle className="text-2xl">{formatCurrency(totalUnusedLosses)}</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground">
          Am Ende des Zeitraums
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardDescription className="text-xs">Warnungen</CardDescription>
          <CardTitle className="text-2xl">{totalWarnings}</CardTitle>
        </CardHeader>
        <CardContent className="text-xs">
          <div className="flex gap-2">
            {warningCount.high > 0 && <span className="text-red-600">🔴 {warningCount.high}</span>}
            {warningCount.medium > 0 && <span className="text-orange-600">🟠 {warningCount.medium}</span>}
            {warningCount.low > 0 && <span className="text-yellow-600">🟡 {warningCount.low}</span>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Loss input field component
 */
function LossInputField({
  id,
  label,
  value,
}: {
  id: string
  label: string
  value: number
}) {
  return (
    <div>
      <Label htmlFor={id} className="text-xs">
        {label}
      </Label>
      <Input id={id} type="number" min="0" step="1000" value={value} disabled className="mt-1" />
    </div>
  )
}

/**
 * Initial losses configuration section
 */
function InitialLossesSection({
  startYear,
  initialStockLosses,
  initialOtherLosses,
  stockLossesInputId,
  otherLossesInputId,
}: {
  startYear: number
  initialStockLosses: number
  initialOtherLosses: number
  stockLossesInputId: string
  otherLossesInputId: string
}) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h3 className="font-medium text-sm mb-3 flex items-center gap-2">
        <Info className="h-4 w-4" />
        Ausgangssituation ({startYear})
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <LossInputField id={stockLossesInputId} label="Aktienverluste Vortrag (€)" value={initialStockLosses} />
        <LossInputField id={otherLossesInputId} label="Sonstige Verluste Vortrag (€)" value={initialOtherLosses} />
      </div>
    </div>
  )
}

/**
 * Yearly analyses section
 */
function YearlyAnalysesSection({
  startYear,
  endYear,
  yearlyAnalyses,
}: {
  startYear: number
  endYear: number
  yearlyAnalyses: YearLossAnalysis[]
}) {
  return (
    <div className="space-y-2">
      <h3 className="font-medium text-sm flex items-center gap-2">
        <AlertCircle className="h-4 w-4" />
        Jahr-für-Jahr Analyse ({startYear} - {endYear})
      </h3>
      <p className="text-xs text-muted-foreground mb-3">
        Klicken Sie auf ein Jahr, um Details zu sehen
      </p>
      {yearlyAnalyses.map(yearAnalysis => (
        <YearAnalysisRow key={yearAnalysis.year} analysis={yearAnalysis} />
      ))}
    </div>
  )
}

/**
 * Info box section
 */
function InfoBoxSection() {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs text-muted-foreground">
      <p className="font-medium mb-1">ℹ️ Hinweis zur Verlustverrechnung</p>
      <ul className="list-disc list-inside space-y-1">
        <li>Aktienverluste können nur mit Aktiengewinnen verrechnet werden</li>
        <li>Sonstige Verluste können mit allen Kapitalerträgen verrechnet werden</li>
        <li>Nicht genutzte Verluste werden unbegrenzt vorgetragen</li>
        <li>Diese Analyse berücksichtigt aktuelle deutsche Steuergesetze (§ 20 EStG)</li>
      </ul>
    </div>
  )
}

/**
 * Overall recommendations section
 */
function OverallRecommendationsSection({ recommendations }: { recommendations: LossRecommendation[] }) {
  if (recommendations.length === 0) return null

  return (
    <div className="space-y-2">
      <h3 className="font-medium text-sm flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        Übergreifende Optimierungsempfehlungen
      </h3>
      {recommendations.map((rec, idx) => (
        <RecommendationDisplay key={idx} recommendation={rec} />
      ))}
    </div>
  )
}

/**
 * Dashboard content sections
 */
function DashboardContent({
  startYear,
  endYear,
  initialStockLosses,
  initialOtherLosses,
  analysis,
  stockLossesInputId,
  otherLossesInputId,
}: {
  startYear: number
  endYear: number
  initialStockLosses: number
  initialOtherLosses: number
  analysis: ReturnType<typeof analyzeMultiYearLossUsage>
  stockLossesInputId: string
  otherLossesInputId: string
}) {
  return (
    <>
      <InitialLossesSection
        startYear={startYear}
        initialStockLosses={initialStockLosses}
        initialOtherLosses={initialOtherLosses}
        stockLossesInputId={stockLossesInputId}
        otherLossesInputId={otherLossesInputId}
      />
      <SummaryStatistics
        totalProjectedSavings={analysis.totalProjectedSavings}
        totalUnusedLosses={analysis.totalUnusedLosses}
        warningCount={analysis.warningCount}
      />
      <OverallRecommendationsSection recommendations={analysis.overallRecommendations} />
      <YearlyAnalysesSection startYear={startYear} endYear={endYear} yearlyAnalyses={analysis.yearlyAnalyses} />
      <InfoBoxSection />
    </>
  )
}

function MultiYearLossTrackingHeader({ isOpen }: { isOpen: boolean }) {
  return (
    <CollapsibleTrigger asChild>
      <div className="flex items-center justify-between cursor-pointer">
        <div className="flex-1">
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Multi-Jahr Verlustplanung & Optimierung
          </CardTitle>
          <CardDescription>
            Analyse und Optimierung der Verlustverrechnung über mehrere Jahre gemäß deutscher Steuergesetzgebung
          </CardDescription>
        </div>
        <div className="ml-2">
          {isOpen ? <AlertCircle className="h-5 w-5 text-muted-foreground" /> : <Info className="h-5 w-5 text-muted-foreground" />}
        </div>
      </div>
    </CollapsibleTrigger>
  )
}

/**
 * Multi-Year Loss Tracking Dashboard Main Component
 */
export function MultiYearLossTrackingDashboard({
  taxRate,
  startYear,
  endYear,
  initialStockLosses = 0,
  initialOtherLosses = 0,
}: MultiYearLossTrackingDashboardProps) {
  const [isOpen, setIsOpen] = useState(false)
  const stockLossesInputId = useMemo(() => generateFormId('multi-year-loss-tracking', 'initial-stock-losses'), [])
  const otherLossesInputId = useMemo(() => generateFormId('multi-year-loss-tracking', 'initial-other-losses'), [])

  // Build tracking configuration - useMemo ensures stable reference
  const tracking: MultiYearLossTracking = useMemo(() => {
    return {
      yearlyStates: {
        [startYear]: {
          stockLosses: initialStockLosses,
          otherLosses: initialOtherLosses,
          year: startYear,
        },
      },
      yearlyRealizedLosses: {},
      projectedGains: {}, // Empty for now - future enhancement can add UI for user input
    }
  }, [startYear, initialStockLosses, initialOtherLosses])

  // Analyze multi-year loss usage
  const analysis = useMemo(() => {
    return analyzeMultiYearLossUsage(tracking, taxRate, startYear, endYear)
  }, [tracking, taxRate, startYear, endYear])

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="w-full">
        <CardHeader>
          <MultiYearLossTrackingHeader isOpen={isOpen} />
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="space-y-6">
            <DashboardContent
              startYear={startYear}
              endYear={endYear}
              initialStockLosses={initialStockLosses}
              initialOtherLosses={initialOtherLosses}
              analysis={analysis}
              stockLossesInputId={stockLossesInputId}
              otherLossesInputId={otherLossesInputId}
            />
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}
