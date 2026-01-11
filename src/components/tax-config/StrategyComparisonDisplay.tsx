import { type ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Alert, AlertDescription } from '../ui/alert'
import { Badge } from '../ui/badge'
import { TrendingUp, Info, CheckCircle2, BarChart3, Clock } from 'lucide-react'
import type {
  LossRealizationStrategy,
  ScenarioComparisonResult,
} from '../../../helpers/loss-carryforward-simulator'
import { formatCurrency } from '../../utils/currency'

interface StrategyComparisonDisplayProps {
  comparisonResult: ScenarioComparisonResult
  planningYears: number
}

export function StrategyComparisonDisplay({ comparisonResult, planningYears }: StrategyComparisonDisplayProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Strategievergleich
        </CardTitle>
        <CardDescription>
          Vergleich von {comparisonResult.scenarios.length} verschiedenen Verlustverwendungsstrategien
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <RecommendedStrategyHighlight
          recommendedScenario={comparisonResult.recommendedScenario}
          planningYears={planningYears}
        />

        <StrategyComparisonTable comparisonResult={comparisonResult} />

        {comparisonResult.comparison.strategicRecommendations.length > 0 && (
          <StrategicRecommendations recommendations={comparisonResult.comparison.strategicRecommendations} />
        )}
      </CardContent>
    </Card>
  )
}

function RecommendedStrategyHighlight({
  recommendedScenario,
  planningYears,
}: {
  recommendedScenario: ScenarioComparisonResult['recommendedScenario']
  planningYears: number
}) {
  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <p className="font-medium text-green-900">
            Empfohlene Strategie: {getStrategyDisplayName(recommendedScenario.strategy)}
          </p>
          <p className="text-sm text-green-800">{recommendedScenario.strategyDescription}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
            <MetricDisplay
              label="Steuerersparnisse"
              value={formatCurrency(recommendedScenario.totalTaxSavings)}
              icon={<TrendingUp className="h-4 w-4" />}
            />
            <MetricDisplay
              label="Effizienz"
              value={`${recommendedScenario.efficiencyScore}%`}
              icon={<BarChart3 className="h-4 w-4" />}
            />
            <MetricDisplay
              label="Jahre mit Nutzung"
              value={`${recommendedScenario.yearsWithLossUsage}/${planningYears}`}
              icon={<Clock className="h-4 w-4" />}
            />
            <MetricDisplay
              label="Ø jährlich"
              value={formatCurrency(recommendedScenario.averageAnnualSavings)}
              icon={<TrendingUp className="h-4 w-4" />}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function StrategyComparisonTable({ comparisonResult }: { comparisonResult: ScenarioComparisonResult }) {
  return (
    <div className="space-y-3">
      <p className="text-base font-medium">Alle Strategien im Vergleich</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">Strategie</th>
              <th className="text-right p-2">Gesamtersparnis</th>
              <th className="text-right p-2">Effizienz</th>
              <th className="text-right p-2">Verbleibende Verluste</th>
            </tr>
          </thead>
          <tbody>
            {comparisonResult.scenarios.map(scenario => {
              const isRecommended = scenario.strategy === comparisonResult.recommendedScenario.strategy
              const isHighestSavings = scenario.strategy === comparisonResult.highestSavingsScenario.strategy
              const isFastestUtilization =
                scenario.strategy === comparisonResult.fastestUtilizationScenario.strategy

              return (
                <tr key={scenario.strategy} className={`border-b ${isRecommended ? 'bg-green-50' : ''}`}>
                  <td className="p-2">
                    <div className="flex items-center gap-2">
                      {getStrategyDisplayName(scenario.strategy)}
                      {isRecommended && <Badge variant="default">Empfohlen</Badge>}
                      {isHighestSavings && <Badge variant="secondary">Höchste Ersparnis</Badge>}
                      {isFastestUtilization && <Badge variant="outline">Effizienteste</Badge>}
                    </div>
                  </td>
                  <td className="text-right p-2 font-medium">{formatCurrency(scenario.totalTaxSavings)}</td>
                  <td className="text-right p-2">
                    <EfficiencyBadge score={scenario.efficiencyScore} />
                  </td>
                  <td className="text-right p-2 text-muted-foreground">
                    {formatCurrency(scenario.finalUnusedLosses.stockLosses + scenario.finalUnusedLosses.otherLosses)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function StrategicRecommendations({
  recommendations,
}: {
  recommendations: ScenarioComparisonResult['comparison']['strategicRecommendations']
}) {
  return (
    <div className="space-y-3">
      <p className="text-base font-medium">Strategische Empfehlungen</p>
      <div className="space-y-2">
        {recommendations.map((rec, index) => (
          <Alert key={index} className={getPriorityAlertClass(rec.priority)}>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <p className="font-medium">{rec.title}</p>
              <p className="text-sm mt-1">{rec.description}</p>
              {rec.potentialSavings !== undefined && (
                <p className="text-sm mt-1 font-medium">
                  Potenzielle Ersparnis: {formatCurrency(rec.potentialSavings)}
                </p>
              )}
            </AlertDescription>
          </Alert>
        ))}
      </div>
    </div>
  )
}

function MetricDisplay({ label, value, icon }: { label: string; value: string; icon?: ReactNode }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <p className="font-bold">{value}</p>
    </div>
  )
}

function EfficiencyBadge({ score }: { score: number }) {
  let variant: 'default' | 'secondary' | 'outline' = 'outline'
  if (score >= 80) variant = 'default'
  else if (score >= 60) variant = 'secondary'

  return <Badge variant={variant}>{score}%</Badge>
}

function getStrategyDisplayName(strategy: LossRealizationStrategy): string {
  const names: Record<LossRealizationStrategy, string> = {
    immediate: 'Sofortige Realisierung',
    gradual: 'Schrittweise Realisierung',
    optimized: 'Optimierte Realisierung',
    aggressive: 'Aggressive Strategie',
    conservative: 'Konservative Strategie',
  }
  return names[strategy]
}

function getPriorityAlertClass(priority: 'low' | 'medium' | 'high'): string {
  const classes = {
    low: 'border-blue-200 bg-blue-50',
    medium: 'border-yellow-200 bg-yellow-50',
    high: 'border-green-200 bg-green-50',
  }
  return classes[priority]
}
