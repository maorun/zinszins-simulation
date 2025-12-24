import { useState, useMemo } from 'react'
import { Card, CardContent } from './ui/card'
import { Collapsible, CollapsibleContent } from './ui/collapsible'
import { CollapsibleCardHeader } from './ui/collapsible-card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Slider } from './ui/slider'
import {
  calculateTaxDeferralComparison,
  createDefaultTaxDeferralConfig,
  type TaxDeferralConfig,
} from '../../helpers/tax-deferral'
import { useSimulation } from '../contexts/useSimulation'
import { formatCurrency } from '../utils/currency'
import { Info, TrendingUp } from 'lucide-react'
import { useFormId } from '../utils/unique-id'

/**
 * Info message explaining the tax deferral calculator
 */
function InfoMessage() {
  return (
    <div className="text-sm text-muted-foreground bg-blue-50 border border-blue-200 rounded-lg p-3">
      <div className="flex gap-2 items-start">
        <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-blue-900">
          <p className="font-medium mb-1">📊 Steuerstundungs-Kalkulator</p>
          <p>
            Vergleich zwischen <strong>thesaurierenden</strong> (Vorabpauschale) und <strong>ausschüttenden</strong>{' '}
            (volle Besteuerung) Fonds. Zeigt den Vorteil der Steuerstundung durch Wiederanlage nicht versteuerter
            Erträge.
          </p>
        </div>
      </div>
    </div>
  )
}

/**
 * Configuration form for tax deferral comparison
 */
interface ConfigFormProps {
  config: TaxDeferralConfig
  onConfigChange: (config: Partial<TaxDeferralConfig>) => void
}

function ConfigForm({ config, onConfigChange }: ConfigFormProps) {
  const initialInvestmentId = useFormId('tax-deferral', 'initial-investment')
  const yearsId = useFormId('tax-deferral', 'years')
  const returnRateId = useFormId('tax-deferral', 'return-rate')

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={initialInvestmentId}>Anfangsinvestition (€)</Label>
        <Input
          id={initialInvestmentId}
          type="number"
          min="1000"
          step="1000"
          value={config.initialInvestment}
          onChange={e => onConfigChange({ initialInvestment: parseFloat(e.target.value) || 0 })}
          placeholder="z.B. 50000"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={yearsId}>Anlagedauer (Jahre): {config.years}</Label>
        <Slider
          id={yearsId}
          min={1}
          max={40}
          step={1}
          value={[config.years]}
          onValueChange={([value]) => onConfigChange({ years: value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={returnRateId}>Erwartete Rendite: {(config.annualReturn * 100).toFixed(1)}%</Label>
        <Slider
          id={returnRateId}
          min={0}
          max={15}
          step={0.5}
          value={[config.annualReturn * 100]}
          onValueChange={([value]) => onConfigChange({ annualReturn: value / 100 })}
        />
      </div>
    </div>
  )
}

/**
 * Display summary comparison results
 */
function SummaryComparison({
  accumulating,
  distributing,
  comparison,
}: {
  accumulating: ResultsDisplayProps['result']['accumulating']
  distributing: ResultsDisplayProps['result']['distributing']
  comparison: ResultsDisplayProps['result']['comparison']
}) {
  return (
    <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="h-5 w-5 text-green-600" />
        <h4 className="font-medium text-green-900">🎯 Vergleichsergebnis</h4>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-green-800">Thesaurierend (Endkapital):</span>
          <span className="font-bold text-green-900 text-lg">{formatCurrency(accumulating.finalValue)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-green-800">Ausschüttend (Endkapital):</span>
          <span className="font-medium text-green-900">{formatCurrency(distributing.finalValue)}</span>
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-green-300">
          <span className="font-medium text-green-900">Vorteil Thesaurierung:</span>
          <div className="text-right">
            <div className="font-bold text-green-900 text-lg">{formatCurrency(comparison.valueDifference)}</div>
            <div className="text-xs text-green-700">({comparison.percentageAdvantage.toFixed(2)}% mehr)</div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Display tax comparison between fund types
 */
function TaxComparison({
  accumulating,
  distributing,
}: {
  accumulating: ResultsDisplayProps['result']['accumulating']
  distributing: ResultsDisplayProps['result']['distributing']
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <h5 className="font-medium text-blue-900 mb-2 text-sm">📘 Thesaurierend</h5>
        <div className="space-y-1 text-xs text-blue-800">
          <div className="flex justify-between">
            <span>Gezahlte Steuern:</span>
            <span className="font-medium">{formatCurrency(accumulating.totalTaxPaid)}</span>
          </div>
          <div className="flex justify-between">
            <span>Endkapital:</span>
            <span className="font-medium">{formatCurrency(accumulating.finalValue)}</span>
          </div>
        </div>
        <p className="mt-2 text-xs text-blue-700 italic">Nur Vorabpauschale besteuert</p>
      </div>

      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <h5 className="font-medium text-amber-900 mb-2 text-sm">📙 Ausschüttend</h5>
        <div className="space-y-1 text-xs text-amber-800">
          <div className="flex justify-between">
            <span>Gezahlte Steuern:</span>
            <span className="font-medium">{formatCurrency(distributing.totalTaxPaid)}</span>
          </div>
          <div className="flex justify-between">
            <span>Endkapital:</span>
            <span className="font-medium">{formatCurrency(distributing.finalValue)}</span>
          </div>
        </div>
        <p className="mt-2 text-xs text-amber-700 italic">Volle Besteuerung der Ausschüttungen</p>
      </div>
    </div>
  )
}

/**
 * Display tax benefit explanation
 */
function TaxBenefitExplanation({
  config,
  comparison,
}: {
  config: TaxDeferralConfig
  comparison: ResultsDisplayProps['result']['comparison']
}) {
  return (
    <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
      <h5 className="font-medium text-purple-900 mb-2 text-sm">💡 Steuerstundungsvorteil</h5>
      <div className="space-y-1 text-xs text-purple-800">
        <p>
          Der thesaurierende Fonds zahlt über {config.years} Jahre{' '}
          <strong>{formatCurrency(Math.abs(comparison.taxDifference))}</strong>{' '}
          {comparison.taxDifference >= 0 ? 'weniger' : 'mehr'} Steuern.
        </p>
        <p className="mt-2">
          Durch die niedrigere Vorabpauschale (statt voller Ertragsbesteuerung) bleibt mehr Kapital investiert, das vom
          Zinseszinseffekt profitiert. Dies führt zu einem <strong>Mehrvermögen</strong> von{' '}
          {formatCurrency(comparison.taxDeferralBenefit)}.
        </p>
      </div>
    </div>
  )
}

/**
 * Display calculation parameters
 */
function ParametersSummary({ config }: { config: TaxDeferralConfig }) {
  return (
    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700">
      <h5 className="font-medium text-slate-900 mb-2">⚙️ Berechnungsparameter</h5>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        <div>Anfangsinvestition:</div>
        <div className="font-medium text-right">{formatCurrency(config.initialInvestment)}</div>
        <div>Erwartete Rendite:</div>
        <div className="font-medium text-right">{(config.annualReturn * 100).toFixed(1)}%</div>
        <div>Anlagedauer:</div>
        <div className="font-medium text-right">{config.years} Jahre</div>
        <div>Steuersatz:</div>
        <div className="font-medium text-right">{(config.capitalGainsTaxRate * 100).toFixed(2)}%</div>
        <div>Teilfreistellung:</div>
        <div className="font-medium text-right">{(config.teilfreistellungsquote * 100).toFixed(0)}%</div>
        <div>Freibetrag:</div>
        <div className="font-medium text-right">{formatCurrency(config.freibetrag)}</div>
      </div>
    </div>
  )
}

/**
 * Display comparison results between accumulating and distributing funds
 */
interface ResultsDisplayProps {
  result: ReturnType<typeof calculateTaxDeferralComparison>
}

function ResultsDisplay({ result }: ResultsDisplayProps) {
  const { config, accumulating, distributing, comparison } = result

  return (
    <div className="mt-4 space-y-4">
      <SummaryComparison accumulating={accumulating} distributing={distributing} comparison={comparison} />
      <TaxComparison accumulating={accumulating} distributing={distributing} />
      <TaxBenefitExplanation config={config} comparison={comparison} />
      <ParametersSummary config={config} />
    </div>
  )
}

/**
 * Hook to manage tax deferral calculator configuration
 */
function useTaxDeferralConfig() {
  const { steuerlast, teilfreistellungsquote, freibetragPerYear } = useSimulation()
  const currentYear = new Date().getFullYear()

  const [userConfig, setUserConfig] = useState(() => {
    const defaultConfig = createDefaultTaxDeferralConfig()
    return {
      initialInvestment: defaultConfig.initialInvestment,
      annualReturn: defaultConfig.annualReturn,
      years: defaultConfig.years,
      startYear: currentYear,
    }
  })

  const handleConfigChange = (updates: Partial<TaxDeferralConfig>) => {
    setUserConfig(prev => ({ ...prev, ...updates }))
  }

  // Combine user config with simulation config for calculations
  const config: TaxDeferralConfig = useMemo(
    () => ({
      ...userConfig,
      capitalGainsTaxRate: steuerlast / 100,
      teilfreistellungsquote: teilfreistellungsquote / 100,
      freibetrag: freibetragPerYear[currentYear] || 1000,
    }),
    [userConfig, steuerlast, teilfreistellungsquote, freibetragPerYear, currentYear],
  )

  return { config, handleConfigChange }
}

/**
 * Tax Deferral Calculator Card - Compares accumulating vs. distributing funds
 *
 * This component allows users to compare the tax deferral effect between:
 * - Accumulating funds (thesaurierende Fonds): Pay Vorabpauschale annually
 * - Distributing funds (ausschüttende Fonds): Pay full tax on distributions annually
 *
 * The comparison shows how tax deferral benefits compound returns over time.
 */
export function TaxDeferralCalculatorCard() {
  const { config, handleConfigChange } = useTaxDeferralConfig()

  const result = useMemo(() => {
    try {
      return calculateTaxDeferralComparison(config)
    } catch (error) {
      console.error('Tax deferral calculation error:', error)
      return null
    }
  }, [config])

  return (
    <Card nestingLevel={1}>
      <Collapsible defaultOpen={false}>
        <CollapsibleCardHeader titleClassName="text-left" simplifiedPadding>
          📊 Steuerstundungs-Kalkulator (Thesaurierung vs. Ausschüttung)
        </CollapsibleCardHeader>
        <CollapsibleContent>
          <CardContent nestingLevel={1}>
            <div className="space-y-4">
              <InfoMessage />
              <ConfigForm config={config} onConfigChange={handleConfigChange} />
              {result && <ResultsDisplay result={result} />}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
