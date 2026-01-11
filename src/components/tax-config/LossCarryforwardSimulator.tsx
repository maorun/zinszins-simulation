import { useMemo, useState, type ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Alert, AlertDescription } from '../ui/alert'
import { Badge } from '../ui/badge'
import {
  TrendingUp,
  TrendingDown,
  Info,
  Calculator,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from 'lucide-react'
import { generateFormId } from '../../utils/unique-id'
import {
  compareStrategies,
  calculateOptimalTiming,
  generateTimelineData,
  validateSimulatorConfig,
  type LossCarryforwardSimulatorConfig,
  type LossRealizationStrategy,
  type LossSimulationScenario,
  type ScenarioComparisonResult,
  type OptimalTimingRecommendation,
} from '../../../helpers/loss-carryforward-simulator'
import { formatCurrency } from '../../utils/currency'

/**
 * Props for LossCarryforwardSimulator component
 */
interface LossCarryforwardSimulatorProps {
  /** Current year for simulation start */
  currentYear: number
  /** Tax rate for calculations */
  taxRate: number
}

/**
 * Extended Loss Carryforward Strategy Simulator Component
 *
 * Provides comprehensive multi-year planning for loss carryforward
 * with strategy comparison and optimization recommendations.
 */
export function LossCarryforwardSimulator({ currentYear, taxRate }: LossCarryforwardSimulatorProps) {
  // Form IDs for accessibility
  const stockLossesId = useMemo(() => generateFormId('loss-simulator', 'stock-losses'), [])
  const otherLossesId = useMemo(() => generateFormId('loss-simulator', 'other-losses'), [])
  const planningYearsId = useMemo(() => generateFormId('loss-simulator', 'planning-years'), [])
  const maxStockGainsId = useMemo(() => generateFormId('loss-simulator', 'max-stock-gains'), [])
  const maxOtherGainsId = useMemo(() => generateFormId('loss-simulator', 'max-other-gains'), [])

  // Simulation configuration state
  const [stockLosses, setStockLosses] = useState<number>(10000)
  const [otherLosses, setOtherLosses] = useState<number>(5000)
  const [planningYears, setPlanningYears] = useState<number>(5)
  const [maxStockGains, setMaxStockGains] = useState<number>(15000)
  const [maxOtherGains, setMaxOtherGains] = useState<number>(8000)

  // Results state
  const [comparisonResult, setComparisonResult] = useState<ScenarioComparisonResult | null>(null)
  const [timingRecommendations, setTimingRecommendations] = useState<OptimalTimingRecommendation[]>([])
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  /**
   * Build simulator config from user inputs
   */
  const buildConfig = (): Omit<LossCarryforwardSimulatorConfig, 'strategy'> => {
    const startYear = currentYear
    const endYear = currentYear + planningYears - 1

    // Build projected gains for all years (simplified: same every year)
    const projectedMaxGains: Record<number, { stockGains: number; otherGains: number }> = {}
    for (let year = startYear; year <= endYear; year++) {
      projectedMaxGains[year] = { stockGains: maxStockGains, otherGains: maxOtherGains }
    }

    return {
      initialLosses: {
        stockLosses,
        otherLosses,
        year: startYear,
      },
      projectedRealizedLosses: {},
      projectedMaxGains,
      taxRate,
      startYear,
      endYear,
    }
  }

  /**
   * Run simulation comparing all strategies
   */
  const handleRunSimulation = () => {
    const config = buildConfig()

    // Validate configuration
    const testConfig = { ...config, strategy: 'optimized' as LossRealizationStrategy }
    const errors = validateSimulatorConfig(testConfig)

    if (errors.length > 0) {
      setValidationErrors(errors)
      return
    }

    setValidationErrors([])

    // Compare all strategies
    const allStrategies: LossRealizationStrategy[] = ['immediate', 'gradual', 'optimized', 'aggressive', 'conservative']

    const comparison = compareStrategies(config, allStrategies)
    setComparisonResult(comparison)

    // Calculate optimal timing
    const timing = calculateOptimalTiming(config)
    setTimingRecommendations(timing)
  }

  return (
    <div className="space-y-6">
      {/* Configuration Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Simulator-Konfiguration
          </CardTitle>
          <CardDescription>
            Konfigurieren Sie Ihre Verlustvorträge und geplanten Gewinne für die Mehrjahres-Simulation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Initial Losses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={stockLossesId}>Verfügbare Aktienverluste (€)</Label>
              <Input
                id={stockLossesId}
                type="number"
                min="0"
                step="1000"
                value={stockLosses}
                onChange={e => setStockLosses(Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                Aktueller Verlustvortrag aus Aktienverkäufen
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor={otherLossesId}>Sonstige Verluste (€)</Label>
              <Input
                id={otherLossesId}
                type="number"
                min="0"
                step="1000"
                value={otherLosses}
                onChange={e => setOtherLosses(Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                Verluste aus anderen Kapitalanlagen
              </p>
            </div>
          </div>

          {/* Planning Period */}
          <div className="space-y-2">
            <Label htmlFor={planningYearsId}>Planungszeitraum (Jahre)</Label>
            <Input
              id={planningYearsId}
              type="number"
              min="1"
              max="20"
              value={planningYears}
              onChange={e => setPlanningYears(Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">
              Simulation von {currentYear} bis {currentYear + planningYears - 1} ({planningYears} Jahre)
            </p>
          </div>

          {/* Projected Gains */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Maximal realisierbare Gewinne pro Jahr</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={maxStockGainsId}>Aktiengewinne (€/Jahr)</Label>
                <Input
                  id={maxStockGainsId}
                  type="number"
                  min="0"
                  step="1000"
                  value={maxStockGains}
                  onChange={e => setMaxStockGains(Number(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={maxOtherGainsId}>Sonstige Gewinne (€/Jahr)</Label>
                <Input
                  id={maxOtherGainsId}
                  type="number"
                  min="0"
                  step="1000"
                  value={maxOtherGains}
                  onChange={e => setMaxOtherGains(Number(e.target.value))}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Maximale Gewinne, die Sie jährlich realisieren könnten (z.B. durch Verkäufe)
            </p>
          </div>

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc list-inside">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Run Simulation Button */}
          <Button onClick={handleRunSimulation} className="w-full" size="lg">
            <BarChart3 className="h-4 w-4 mr-2" />
            Simulation starten
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {comparisonResult && (
        <>
          {/* Strategy Comparison */}
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
              {/* Recommended Strategy Highlight */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <p className="font-medium text-green-900">
                      Empfohlene Strategie: {getStrategyDisplayName(comparisonResult.recommendedScenario.strategy)}
                    </p>
                    <p className="text-sm text-green-800">
                      {comparisonResult.recommendedScenario.strategyDescription}
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                      <MetricDisplay
                        label="Steuerersparnisse"
                        value={formatCurrency(comparisonResult.recommendedScenario.totalTaxSavings)}
                        icon={<TrendingUp className="h-4 w-4" />}
                      />
                      <MetricDisplay
                        label="Effizienz"
                        value={`${comparisonResult.recommendedScenario.efficiencyScore}%`}
                        icon={<BarChart3 className="h-4 w-4" />}
                      />
                      <MetricDisplay
                        label="Jahre mit Nutzung"
                        value={`${comparisonResult.recommendedScenario.yearsWithLossUsage}/${planningYears}`}
                        icon={<Clock className="h-4 w-4" />}
                      />
                      <MetricDisplay
                        label="Ø jährlich"
                        value={formatCurrency(comparisonResult.recommendedScenario.averageAnnualSavings)}
                        icon={<TrendingUp className="h-4 w-4" />}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* All Strategies Table */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Alle Strategien im Vergleich</Label>
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
                          <tr
                            key={scenario.strategy}
                            className={`border-b ${isRecommended ? 'bg-green-50' : ''}`}
                          >
                            <td className="p-2">
                              <div className="flex items-center gap-2">
                                {getStrategyDisplayName(scenario.strategy)}
                                {isRecommended && <Badge variant="default">Empfohlen</Badge>}
                                {isHighestSavings && <Badge variant="secondary">Höchste Ersparnis</Badge>}
                                {isFastestUtilization && <Badge variant="outline">Effizienteste</Badge>}
                              </div>
                            </td>
                            <td className="text-right p-2 font-medium">
                              {formatCurrency(scenario.totalTaxSavings)}
                            </td>
                            <td className="text-right p-2">
                              <EfficiencyBadge score={scenario.efficiencyScore} />
                            </td>
                            <td className="text-right p-2 text-muted-foreground">
                              {formatCurrency(
                                scenario.finalUnusedLosses.stockLosses + scenario.finalUnusedLosses.otherLosses,
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Strategic Recommendations */}
              {comparisonResult.comparison.strategicRecommendations.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-base font-medium">Strategische Empfehlungen</Label>
                  <div className="space-y-2">
                    {comparisonResult.comparison.strategicRecommendations.map((rec, index) => (
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
              )}
            </CardContent>
          </Card>

          {/* Optimal Timing Recommendations */}
          {timingRecommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Optimale Zeitplanung
                </CardTitle>
                <CardDescription>
                  Jahr-für-Jahr Empfehlungen zur optimalen Gewinnrealisierung
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {timingRecommendations.map(rec => (
                    <div
                      key={rec.year}
                      className={`border rounded-lg p-4 ${getPriorityBorderClass(rec.priority)}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-bold text-lg">{rec.year}</span>
                            <Badge variant={getPriorityVariant(rec.priority)}>
                              {getPriorityLabel(rec.priority)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{rec.reasoning}</p>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {rec.recommendedStockGainRealization > 0 && (
                              <MetricDisplay
                                label="Aktiengewinne"
                                value={formatCurrency(rec.recommendedStockGainRealization)}
                                icon={<TrendingUp className="h-3 w-3" />}
                                small
                              />
                            )}
                            {rec.recommendedOtherGainRealization > 0 && (
                              <MetricDisplay
                                label="Sonstige Gewinne"
                                value={formatCurrency(rec.recommendedOtherGainRealization)}
                                icon={<TrendingUp className="h-3 w-3" />}
                                small
                              />
                            )}
                            <MetricDisplay
                              label="Steuerersparnis"
                              value={formatCurrency(rec.projectedTaxSavings)}
                              icon={<TrendingDown className="h-3 w-3" />}
                              small
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Timeline Visualization for Recommended Strategy */}
          <TimelineVisualization scenario={comparisonResult.recommendedScenario} />
        </>
      )}
    </div>
  )
}

/**
 * Helper Components
 */

interface MetricDisplayProps {
  label: string
  value: string
  icon?: ReactNode
  small?: boolean
}

function MetricDisplay({ label, value, icon, small = false }: MetricDisplayProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <p className={small ? 'font-medium text-sm' : 'font-bold'}>{value}</p>
    </div>
  )
}

interface EfficiencyBadgeProps {
  score: number
}

function EfficiencyBadge({ score }: EfficiencyBadgeProps) {
  let variant: 'default' | 'secondary' | 'outline' = 'outline'
  if (score >= 80) variant = 'default'
  else if (score >= 60) variant = 'secondary'

  return <Badge variant={variant}>{score}%</Badge>
}

interface TimelineVisualizationProps {
  scenario: LossSimulationScenario
}

function TimelineVisualization({ scenario }: TimelineVisualizationProps) {
  const timeline = generateTimelineData(scenario)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Zeitlicher Verlauf ({getStrategyDisplayName(scenario.strategy)})
        </CardTitle>
        <CardDescription>
          Entwicklung der Verlustvorträge und Steuerersparnisse über den Planungszeitraum
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Jahr</th>
                <th className="text-right p-2">Verfügbare Verluste</th>
                <th className="text-right p-2">Realisierte Gewinne</th>
                <th className="text-right p-2">Genutzte Verluste</th>
                <th className="text-right p-2">Steuerersparnis</th>
                <th className="text-right p-2">Verlustvortrag</th>
              </tr>
            </thead>
            <tbody>
              {timeline.map(point => (
                <tr key={point.year} className="border-b">
                  <td className="p-2 font-medium">{point.year}</td>
                  <td className="text-right p-2 text-muted-foreground">
                    {formatCurrency(point.availableStockLosses + point.availableOtherLosses)}
                  </td>
                  <td className="text-right p-2 text-muted-foreground">
                    {formatCurrency(point.realizedStockGains + point.realizedOtherGains)}
                  </td>
                  <td className="text-right p-2 font-medium text-blue-600">
                    {formatCurrency(point.stockLossesUsed + point.otherLossesUsed)}
                  </td>
                  <td className="text-right p-2 font-medium text-green-600">
                    {formatCurrency(point.taxSavings)}
                  </td>
                  <td className="text-right p-2 text-muted-foreground">
                    {formatCurrency(point.carryforwardStockLosses + point.carryforwardOtherLosses)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 font-bold">
                <td className="p-2">Gesamt</td>
                <td className="text-right p-2"></td>
                <td className="text-right p-2"></td>
                <td className="text-right p-2"></td>
                <td className="text-right p-2 text-green-600">
                  {formatCurrency(scenario.totalTaxSavings)}
                </td>
                <td className="text-right p-2 text-muted-foreground">
                  {formatCurrency(scenario.finalUnusedLosses.stockLosses + scenario.finalUnusedLosses.otherLosses)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Helper Functions
 */

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

function getPriorityBorderClass(priority: 'low' | 'medium' | 'high'): string {
  const classes = {
    low: 'border-gray-300',
    medium: 'border-yellow-300',
    high: 'border-green-400',
  }
  return classes[priority]
}

function getPriorityVariant(priority: 'low' | 'medium' | 'high'): 'default' | 'secondary' | 'outline' {
  const variants: Record<'low' | 'medium' | 'high', 'default' | 'secondary' | 'outline'> = {
    low: 'outline',
    medium: 'secondary',
    high: 'default',
  }
  return variants[priority]
}

function getPriorityLabel(priority: 'low' | 'medium' | 'high'): string {
  const labels = {
    low: 'Niedrig',
    medium: 'Mittel',
    high: 'Hoch',
  }
  return labels[priority]
}
