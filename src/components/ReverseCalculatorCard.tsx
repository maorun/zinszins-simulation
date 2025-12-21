import { useState, useMemo } from 'react'
import { Card, CardContent } from './ui/card'
import { Collapsible, CollapsibleContent } from './ui/collapsible'
import { CollapsibleCardHeader } from './ui/collapsible-card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Button } from './ui/button'
import {
  calculateRequiredSavingsRate,
  performSensitivityAnalysis,
  getDefaultReverseCalculatorConfig,
  type ReverseCalculatorConfig,
} from '../../helpers/reverse-calculator'
import { useSimulation } from '../contexts/useSimulation'
import { formatCurrency } from '../utils/currency'
import { Info, Calculator } from 'lucide-react'
import { useFormId } from '../utils/unique-id'

function InfoMessage() {
  return (
    <div className="text-sm text-muted-foreground bg-blue-50 border border-blue-200 rounded-lg p-3">
      <div className="flex gap-2 items-start">
        <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-blue-900">
          <p className="font-medium mb-1">🎯 Reverse-Rechner für Ruhestands-Zielbetrag</p>
          <p>
            Dieser Rechner berechnet die erforderliche Sparrate, um ein bestimmtes Zielkapital zu erreichen.
            Berücksichtigt werden Vorabpauschale, TER, Teilfreistellung und Freibetrag.
          </p>
        </div>
      </div>
    </div>
  )
}

interface ConfigFormProps {
  config: ReverseCalculatorConfig
  onConfigChange: (config: ReverseCalculatorConfig) => void
}

function ConfigForm({ config, onConfigChange }: ConfigFormProps) {
  const targetCapitalId = useFormId('reverse-calc', 'target-capital')
  const yearsId = useFormId('reverse-calc', 'years')
  const returnRateId = useFormId('reverse-calc', 'return-rate')

  return (
    <div className="space-y-4">
      <TargetCapitalInput id={targetCapitalId} config={config} onChange={onConfigChange} />
      <YearsAndReturnInputs
        yearsId={yearsId}
        returnRateId={returnRateId}
        config={config}
        onChange={onConfigChange}
      />
      <CalculationModeSelector config={config} onChange={onConfigChange} />
    </div>
  )
}

function TargetCapitalInput({
  id,
  config,
  onChange,
}: {
  id: string
  config: ReverseCalculatorConfig
  onChange: (config: ReverseCalculatorConfig) => void
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>Zielkapital (€)</Label>
      <Input
        id={id}
        type="number"
        min="1000"
        step="1000"
        value={config.targetCapital}
        onChange={e => onChange({ ...config, targetCapital: parseFloat(e.target.value) || 0 })}
        placeholder="z.B. 500000"
      />
    </div>
  )
}

function YearsAndReturnInputs({
  yearsId,
  returnRateId,
  config,
  onChange,
}: {
  yearsId: string
  returnRateId: string
  config: ReverseCalculatorConfig
  onChange: (config: ReverseCalculatorConfig) => void
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor={yearsId}>Zeitraum (Jahre)</Label>
        <Input
          id={yearsId}
          type="number"
          min="1"
          max="100"
          value={config.years}
          onChange={e => onChange({ ...config, years: parseInt(e.target.value) || 0 })}
          placeholder="z.B. 30"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={returnRateId}>Erwartete Rendite (%)</Label>
        <Input
          id={returnRateId}
          type="number"
          min="0"
          max="20"
          step="0.1"
          value={(config.returnRate * 100).toFixed(1)}
          onChange={e => onChange({ ...config, returnRate: (parseFloat(e.target.value) || 0) / 100 })}
          placeholder="z.B. 5.0"
        />
      </div>
    </div>
  )
}

function CalculationModeSelector({
  config,
  onChange,
}: {
  config: ReverseCalculatorConfig
  onChange: (config: ReverseCalculatorConfig) => void
}) {
  return (
    <div className="space-y-2">
      <Label>Berechnungsmodus</Label>
      <div className="flex gap-2">
        <Button
          type="button"
          variant={config.calculationMode === 'monthly' ? 'default' : 'outline'}
          size="sm"
          className="flex-1"
          onClick={() => onChange({ ...config, calculationMode: 'monthly' })}
        >
          Monatlich
        </Button>
        <Button
          type="button"
          variant={config.calculationMode === 'yearly' ? 'default' : 'outline'}
          size="sm"
          className="flex-1"
          onClick={() => onChange({ ...config, calculationMode: 'yearly' })}
        >
          Jährlich
        </Button>
      </div>
    </div>
  )
}

interface ResultsDisplayProps {
  result: ReturnType<typeof calculateRequiredSavingsRate>
  config: ReverseCalculatorConfig
}

function ResultsDisplay({ result, config }: ResultsDisplayProps) {
  const savingsRate = config.calculationMode === 'monthly' ? result.monthlyRate! : result.yearlyRate!
  const modeLabel = config.calculationMode === 'monthly' ? 'monatlich' : 'jährlich'

  return (
    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
      <h4 className="font-medium text-green-900 mb-3 flex items-center gap-2">
        <Calculator className="h-5 w-5" />
        Berechnete Sparrate
      </h4>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between items-center pt-2 pb-2 border-b border-green-300">
          <span className="font-medium text-green-900">Erforderliche Sparrate ({modeLabel}):</span>
          <span className="font-bold text-green-900 text-xl">{formatCurrency(savingsRate)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-green-800">Gesamtbeiträge:</span>
          <span className="font-medium text-green-900">{formatCurrency(result.totalContributions)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-green-800">Endkapital:</span>
          <span className="font-medium text-green-900">{formatCurrency(result.finalCapital)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-green-800">Nettogewinn:</span>
          <span className="font-medium text-green-900">{formatCurrency(result.netGain)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-green-800">Steuern gesamt:</span>
          <span className="font-medium text-green-900">{formatCurrency(result.totalTaxesPaid)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-green-800">Kosten gesamt (TER):</span>
          <span className="font-medium text-green-900">{formatCurrency(result.totalCostsPaid)}</span>
        </div>
        {!result.converged && (
          <div className="text-xs text-yellow-700 mt-2 p-2 bg-yellow-100 rounded">
            ⚠️ Berechnung konvergierte nicht vollständig. Ergebnis ist eine Approximation.
          </div>
        )}
      </div>
    </div>
  )
}

interface SensitivityDisplayProps {
  analysis: ReturnType<typeof performSensitivityAnalysis>
  mode: 'monthly' | 'yearly'
}

function SensitivityDisplay({ analysis, mode }: SensitivityDisplayProps) {
  const modeLabel = mode === 'monthly' ? 'Monatlich' : 'Jährlich'

  return (
    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <h4 className="font-medium text-blue-900 mb-3">📊 Sensitivitätsanalyse</h4>
      <p className="text-xs text-blue-800 mb-3">
        Erforderliche Sparrate bei verschiedenen Rendite-Szenarien:
      </p>
      <div className="space-y-2">
        {analysis.map((item, index) => (
          <div key={index} className="flex justify-between text-sm border-b border-blue-200 last:border-b-0 pb-2">
            <span className="text-blue-800">{item.scenario}:</span>
            <span className="font-medium text-blue-900">
              {formatCurrency(item.savingsRate)} {modeLabel}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Reverse Calculator Card - Calculate required savings rate to reach a target capital
 */
export function ReverseCalculatorCard() {
  const { steuerlast, teilfreistellungsquote, basiszinsConfiguration } = useSimulation()

  const defaultConfig = useMemo(() => createDefaultConfig(steuerlast, teilfreistellungsquote, basiszinsConfiguration), [
    steuerlast,
    teilfreistellungsquote,
    basiszinsConfiguration,
  ])

  const [config, setConfig] = useState<ReverseCalculatorConfig>(defaultConfig)
  const [showResults, setShowResults] = useState(false)
  const [result, setResult] = useState<ReturnType<typeof calculateRequiredSavingsRate> | null>(null)
  const [sensitivity, setSensitivity] = useState<ReturnType<typeof performSensitivityAnalysis> | null>(null)

  const handleCalculate = () => {
    const { calculatedResult, sensitivityAnalysis } = calculateResults(config)
    setResult(calculatedResult)
    setSensitivity(sensitivityAnalysis)
    setShowResults(true)
  }

  return (
    <Card nestingLevel={1}>
      <Collapsible defaultOpen={false}>
        <CollapsibleCardHeader titleClassName="text-left" simplifiedPadding>
          🎯 Reverse-Rechner (Zielkapital-Planer)
        </CollapsibleCardHeader>
        <CollapsibleContent>
          <CardContent nestingLevel={1}>
            <div className="space-y-4">
              <InfoMessage />
              <ConfigForm config={config} onConfigChange={setConfig} />

              <Button onClick={handleCalculate} className="w-full" size="lg">
                <Calculator className="h-5 w-5 mr-2" />
                Erforderliche Sparrate berechnen
              </Button>

              {showResults && result && (
                <>
                  <ResultsDisplay result={result} config={config} />
                  {sensitivity && <SensitivityDisplay analysis={sensitivity} mode={config.calculationMode} />}
                </>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}

function createDefaultConfig(
  steuerlast: number,
  teilfreistellungsquote: number,
  basiszinsConfiguration: ReturnType<typeof useSimulation>['basiszinsConfiguration'],
): ReverseCalculatorConfig {
  const config = getDefaultReverseCalculatorConfig()
  config.taxRate = steuerlast / 100
  config.teilfreistellung = teilfreistellungsquote / 100

  const currentYear = new Date().getFullYear()
  const basiszinsForYear = basiszinsConfiguration?.[currentYear]?.rate
  if (basiszinsForYear !== undefined) {
    config.basiszins = basiszinsForYear
  }

  return config
}

function calculateResults(config: ReverseCalculatorConfig) {
  try {
    const calculatedResult = calculateRequiredSavingsRate(config)

    const scenarios = [config.returnRate - 0.02, config.returnRate, config.returnRate + 0.02, config.returnRate + 0.04].filter(
      rate => rate >= 0.01 && rate <= 0.2,
    )

    const sensitivityAnalysis = performSensitivityAnalysis(config, scenarios)

    return { calculatedResult, sensitivityAnalysis }
  } catch (error) {
    console.error('Error calculating reverse savings rate:', error)
    throw error
  }
}
