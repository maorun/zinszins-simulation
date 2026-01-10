import { useState, useMemo } from 'react'
import { Card, CardContent } from './ui/card'
import { Collapsible, CollapsibleContent } from './ui/collapsible'
import { CollapsibleCardHeader } from './ui/collapsible-card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Slider } from './ui/slider'
import {
  optimizeMultiYearFreibetrag,
  compareFreibetragOptimizationHorizons,
  type MultiYearFreibetragOptimizationConfig,
  type MultiYearOptimizationResult,
} from '../../helpers/multi-year-freibetrag-optimization'
import { useSimulation } from '../contexts/useSimulation'
import { formatCurrency } from '../utils/currency'
import { Calendar, Info } from 'lucide-react'
import { useFormId } from '../utils/unique-id'
import { ResultsSummaryCard, StrategyComparison, RecommendationsList, YearlyScheduleTable } from './multi-year-optimization/ResultsComponents'

/**
 * Info message explaining the multi-year freibetrag optimization
 */
function InfoMessage() {
  return (
    <div className="text-sm text-muted-foreground bg-blue-50 border border-blue-200 rounded-lg p-3">
      <div className="flex gap-2 items-start">
        <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-blue-900">
          <p className="font-medium mb-1">📈 Multi-Jahres Freibetrags-Optimierung</p>
          <p>
            Strategische Verteilung von Kapitalgewinnen über mehrere Jahre zur maximalen Nutzung des jährlichen{' '}
            <strong>Sparerpauschbetrags (Freibetrag)</strong>. Zeigt den optimalen Zeitpunkt zur Realisierung von
            Gewinnen und die mögliche Steuerersparnis.
          </p>
          <p className="mt-2">
            <strong>Ideal für:</strong> Entnahmephase, planbare Verkäufe, strategische Portfolioanpassungen
          </p>
        </div>
      </div>
    </div>
  )
}

/**
 * Capital gains input field
 */
function CapitalGainsInput({
  capitalGainsId,
  value,
  onChange,
}: {
  capitalGainsId: string
  value: number
  onChange: (value: number) => void
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={capitalGainsId}>Zu realisierende Kapitalgewinne (€)</Label>
      <Input
        id={capitalGainsId}
        type="number"
        min="0"
        step="1000"
        value={value}
        onChange={e => onChange(parseFloat(e.target.value) || 0)}
        placeholder="z.B. 50000"
      />
      <p className="text-xs text-muted-foreground">
        Gesamtsumme der geplanten Kapitalgewinne, die strategisch verteilt werden sollen
      </p>
    </div>
  )
}

/**
 * Optimization horizon slider
 */
function HorizonSlider({
  horizonId,
  value,
  onChange,
}: {
  horizonId: string
  value: number
  onChange: (value: number) => void
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={horizonId}>Optimierungszeitraum (Jahre): {value}</Label>
      <Slider id={horizonId} min={1} max={20} step={1} value={[value]} onValueChange={([v]) => onChange(v)} />
      <p className="text-xs text-muted-foreground">Zeitraum zur Verteilung der Kapitalgewinne (5-20 Jahre empfohlen)</p>
    </div>
  )
}

/**
 * Portfolio value input field
 */
function PortfolioValueInput({
  portfolioValueId,
  value,
  onChange,
}: {
  portfolioValueId: string
  value: number
  onChange: (value: number) => void
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={portfolioValueId}>Aktueller Portfoliowert (€)</Label>
      <Input
        id={portfolioValueId}
        type="number"
        min="0"
        step="10000"
        value={value}
        onChange={e => onChange(parseFloat(e.target.value) || 0)}
        placeholder="z.B. 200000"
      />
      <p className="text-xs text-muted-foreground">
        Für Vorabpauschale-Berechnung (bei wachsendem Portfolio während Ansparphase)
      </p>
    </div>
  )
}

/**
 * Return rate slider
 */
function ReturnRateSlider({
  returnRateId,
  value,
  onChange,
}: {
  returnRateId: string
  value: number
  onChange: (value: number) => void
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={returnRateId}>Portfolio-Rendite: {(value * 100).toFixed(1)}%</Label>
      <Slider id={returnRateId} min={0} max={10} step={0.5} value={[value * 100]} onValueChange={([v]) => onChange(v / 100)} />
      <p className="text-xs text-muted-foreground">
        Jährliche Rendite (0% für Entnahmephase ohne Wachstum, &gt;0% für Ansparphase)
      </p>
    </div>
  )
}

/**
 * Configuration form for multi-year optimization
 */
interface ConfigFormProps {
  config: MultiYearFreibetragOptimizationConfig
  onConfigChange: (config: Partial<MultiYearFreibetragOptimizationConfig>) => void
}

function ConfigForm({ config, onConfigChange }: ConfigFormProps) {
  const capitalGainsId = useFormId('multiyear-freibetrag', 'capital-gains')
  const horizonId = useFormId('multiyear-freibetrag', 'horizon')
  const portfolioValueId = useFormId('multiyear-freibetrag', 'portfolio-value')
  const returnRateId = useFormId('multiyear-freibetrag', 'return-rate')

  return (
    <div className="space-y-4">
      <CapitalGainsInput
        capitalGainsId={capitalGainsId}
        value={config.totalCapitalGains}
        onChange={v => onConfigChange({ totalCapitalGains: v })}
      />
      <HorizonSlider
        horizonId={horizonId}
        value={config.optimizationHorizonYears}
        onChange={v => onConfigChange({ optimizationHorizonYears: v })}
      />
      <PortfolioValueInput
        portfolioValueId={portfolioValueId}
        value={config.currentPortfolioValue}
        onChange={v => onConfigChange({ currentPortfolioValue: v })}
      />
      <ReturnRateSlider
        returnRateId={returnRateId}
        value={config.annualReturnRate}
        onChange={v => onConfigChange({ annualReturnRate: v })}
      />
    </div>
  )
}

/**
 * Display optimization results
 */
interface ResultsDisplayProps {
  result: MultiYearOptimizationResult
  config: MultiYearFreibetragOptimizationConfig
}

function ResultsDisplay({ result, config }: ResultsDisplayProps) {
  return (
    <div className="space-y-4">
      <ResultsSummaryCard result={result} />
      <StrategyComparison result={result} config={config} />
      <RecommendationsList recommendations={result.recommendations} />
      <YearlyScheduleTable schedule={result.optimalRealizationSchedule} />
    </div>
  )
}

/**
 * Create default configuration from simulation context
 */
function createDefaultConfig(simulation: ReturnType<typeof useSimulation>): MultiYearFreibetragOptimizationConfig {
  const currentYear = new Date().getFullYear()
  const freibetragPerYear: { [year: number]: number } = {}
  const firstYearFreibetrag = simulation.freibetragPerYear[currentYear] || 2000

  for (let i = 0; i < 20; i++) {
    freibetragPerYear[currentYear + i] = simulation.freibetragPerYear[currentYear + i] || firstYearFreibetrag
  }

  return {
    totalCapitalGains: 50000,
    currentPortfolioValue: 200000,
    annualReturnRate: 0,
    optimizationHorizonYears: 10,
    startYear: currentYear,
    freibetragPerYear,
    capitalGainsTaxRate: simulation.steuerlast / 100,
    teilfreistellung: simulation.teilfreistellungsquote / 100,
  }
}

/**
 * Horizon comparison display component
 */
function HorizonComparisonSection({
  horizonComparison,
}: {
  horizonComparison: ReturnType<typeof compareFreibetragOptimizationHorizons>
}) {
  return (
    <div className="border-t pt-4">
      <h4 className="font-medium text-sm mb-3">Zeitraum-Vergleich</h4>
      <div className="grid grid-cols-3 gap-3">
        {horizonComparison.horizons.map(horizon => (
          <div
            key={horizon.years}
            className={`p-3 rounded border ${
              horizon.years === horizonComparison.recommendedHorizon ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-200'
            }`}
          >
            <p className="text-xs text-muted-foreground mb-1">{horizon.years} Jahre</p>
            <p className="text-sm font-semibold">{formatCurrency(horizon.taxSavings)}</p>
            <p className="text-xs text-muted-foreground mt-1">{(horizon.utilizationRate * 100).toFixed(0)}% Auslastung</p>
            {horizon.years === horizonComparison.recommendedHorizon && (
              <p className="text-xs text-green-600 font-medium mt-1">✓ Empfohlen</p>
            )}
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        Vergleich verschiedener Optimierungszeiträume basierend auf Steuerersparnis pro Jahr
      </p>
    </div>
  )
}

/**
 * Multi-Year Freibetrag Optimization Card
 * 
 * Allows users to optimize capital gains realization across multiple years
 * to maximize tax allowance utilization and minimize tax burden.
 */
export function MultiYearFreibetragOptimizationCard() {
  const [isOpen, setIsOpen] = useState(false)
  const simulation = useSimulation()
  const [config, setConfig] = useState<MultiYearFreibetragOptimizationConfig>(() => createDefaultConfig(simulation))

  const result = useMemo(() => optimizeMultiYearFreibetrag(config), [config])
  const horizonComparison = useMemo(() => {
    const { optimizationHorizonYears: _optimizationHorizonYears, ...baseConfig } = config
    return compareFreibetragOptimizationHorizons(baseConfig)
  }, [config])

  const handleConfigChange = (updates: Partial<MultiYearFreibetragOptimizationConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }))
  }

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleCardHeader titleClassName="text-left" simplifiedPadding>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            <div>
              <div className="font-semibold">Multi-Jahres Freibetrags-Optimierung</div>
              <div className="text-sm text-muted-foreground font-normal">
                Strategische Verteilung von Kapitalgewinnen zur Steueroptimierung
              </div>
            </div>
          </div>
        </CollapsibleCardHeader>
        <CollapsibleContent>
          <CardContent className="space-y-6 pt-4">
            <InfoMessage />

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-3">Konfiguration</h3>
                <ConfigForm config={config} onConfigChange={handleConfigChange} />
              </div>

              <div>
                <h3 className="font-medium mb-3">Ergebnisse</h3>
                <ResultsDisplay result={result} config={config} />
              </div>
            </div>

            {config.totalCapitalGains > 0 && <HorizonComparisonSection horizonComparison={horizonComparison} />}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
