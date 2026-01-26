import { useState, useMemo } from 'react'
import { Card, CardContent } from './ui/card'
import { Collapsible, CollapsibleContent } from './ui/collapsible'
import { CollapsibleCardHeader } from './ui/collapsible-card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Slider } from './ui/slider'
import { RadioGroup, RadioGroupItem } from './ui/radio-group'
import {
  compareRuerupVsEtf,
  createDefaultRuerupVsEtfConfig,
  type RuerupVsEtfComparisonConfig,
  type RuerupVsEtfComparison,
  type InvestmentResult,
} from '../../helpers/ruerup-vs-etf-comparison'
import { useSimulation } from '../contexts/useSimulation'
import { formatCurrency } from '../utils/currency'
import { Info, TrendingUp, PiggyBank, Wallet, ArrowRight, Award, AlertCircle } from 'lucide-react'
import { useFormId } from '../utils/unique-id'

/**
 * Info message explaining the Rürup vs. ETF comparison
 */
function InfoMessage() {
  return (
    <div className="text-sm text-muted-foreground bg-blue-50 border border-blue-200 rounded-lg p-3">
      <div className="flex gap-2 items-start">
        <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-blue-900">
          <p className="font-medium mb-1">🔄 Rürup-Rente vs. ETF-Sparplan Vergleich</p>
          <p>
            Vergleich zwischen <strong>Rürup-Rente</strong> (Steuerabzug in Beitragsphase, volle Versteuerung im
            Ruhestand) und <strong>privatem ETF-Sparplan</strong> (kein Steuerabzug, aber niedrigere Besteuerung durch
            Vorabpauschale und Teilfreistellung).
          </p>
        </div>
      </div>
    </div>
  )
}

/**
 * Configuration form for Rürup vs. ETF comparison
 */
interface ConfigFormProps {
  config: RuerupVsEtfComparisonConfig
  onConfigChange: (config: Partial<RuerupVsEtfComparisonConfig>) => void
}

function ContributionFields({ config, onConfigChange }: ConfigFormProps) {
  const annualContributionId = useFormId('ruerup-vs-etf', 'annual-contribution')
  const contributionYearsId = useFormId('ruerup-vs-etf', 'contribution-years')

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor={annualContributionId}>Jährlicher Beitrag (€)</Label>
        <Input
          id={annualContributionId}
          type="number"
          min="10000"
          max="50000"
          step="1000"
          value={config.annualContribution}
          onChange={e => onConfigChange({ annualContribution: parseFloat(e.target.value) || 10000 })}
          placeholder="z.B. 10000"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={contributionYearsId}>Ansparphase (Jahre): {config.contributionYears}</Label>
        <Slider
          id={contributionYearsId}
          min={5}
          max={40}
          step={1}
          value={[config.contributionYears]}
          onValueChange={([value]) => onConfigChange({ contributionYears: value })}
        />
      </div>
    </>
  )
}

function ReturnAndTaxFields({ config, onConfigChange }: ConfigFormProps) {
  const expectedReturnId = useFormId('ruerup-vs-etf', 'expected-return')
  const contributionPhaseTaxRateId = useFormId('ruerup-vs-etf', 'contribution-phase-tax-rate')
  const retirementPhaseTaxRateId = useFormId('ruerup-vs-etf', 'retirement-phase-tax-rate')

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor={expectedReturnId}>Erwartete Rendite: {(config.expectedReturn * 100).toFixed(1)}%</Label>
        <Slider
          id={expectedReturnId}
          min={0}
          max={15}
          step={0.5}
          value={[config.expectedReturn * 100]}
          onValueChange={([value]) => onConfigChange({ expectedReturn: value / 100 })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={contributionPhaseTaxRateId}>
          Steuersatz Ansparphase: {(config.contributionPhaseTaxRate * 100).toFixed(0)}%
        </Label>
        <Slider
          id={contributionPhaseTaxRateId}
          min={20}
          max={50}
          step={1}
          value={[config.contributionPhaseTaxRate * 100]}
          onValueChange={([value]) => onConfigChange({ contributionPhaseTaxRate: value / 100 })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={retirementPhaseTaxRateId}>
          Steuersatz Ruhestand: {(config.retirementPhaseTaxRate * 100).toFixed(0)}%
        </Label>
        <Slider
          id={retirementPhaseTaxRateId}
          min={15}
          max={45}
          step={1}
          value={[config.retirementPhaseTaxRate * 100]}
          onValueChange={([value]) => onConfigChange({ retirementPhaseTaxRate: value / 100 })}
        />
      </div>
    </>
  )
}

function CivilStatusAndRetirementFields({ config, onConfigChange }: ConfigFormProps) {
  const civilStatusSingleId = useFormId('ruerup-vs-etf', 'civil-status-single')
  const civilStatusMarriedId = useFormId('ruerup-vs-etf', 'civil-status-married')
  const retirementYearsId = useFormId('ruerup-vs-etf', 'retirement-years')

  return (
    <>
      <div className="space-y-2">
        <Label>Familienstand</Label>
        <RadioGroup
          value={config.civilStatus}
          onValueChange={value => onConfigChange({ civilStatus: value as 'single' | 'married' })}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="single" id={civilStatusSingleId} />
            <Label htmlFor={civilStatusSingleId} className="cursor-pointer font-normal">
              Alleinstehend
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="married" id={civilStatusMarriedId} />
            <Label htmlFor={civilStatusMarriedId} className="cursor-pointer font-normal">
              Verheiratet
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label htmlFor={retirementYearsId}>Rentenphase (Jahre): {config.retirementYears}</Label>
        <Slider
          id={retirementYearsId}
          min={10}
          max={40}
          step={1}
          value={[config.retirementYears]}
          onValueChange={([value]) => onConfigChange({ retirementYears: value })}
        />
      </div>
    </>
  )
}

function ConfigForm({ config, onConfigChange }: ConfigFormProps) {
  return (
    <div className="space-y-4">
      <ContributionFields config={config} onConfigChange={onConfigChange} />
      <ReturnAndTaxFields config={config} onConfigChange={onConfigChange} />
      <CivilStatusAndRetirementFields config={config} onConfigChange={onConfigChange} />
    </div>
  )
}

/**
 * Display recommendation badge based on comparison result
 */
function RecommendationBadge({ recommendation }: { recommendation: 'ruerup' | 'etf' | 'similar' }) {
  if (recommendation === 'similar') {
    return (
      <div className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-300 rounded-lg">
        <AlertCircle className="h-5 w-5 text-gray-600" />
        <div>
          <div className="font-semibold text-gray-900">⚖️ Ähnliches Ergebnis</div>
          <div className="text-xs text-gray-700">Beide Optionen sind etwa gleichwertig</div>
        </div>
      </div>
    )
  }

  const isRuerup = recommendation === 'ruerup'

  return (
    <div
      className={`flex items-center gap-2 p-3 border rounded-lg ${
        isRuerup ? 'bg-emerald-50 border-emerald-300' : 'bg-blue-50 border-blue-300'
      }`}
    >
      <Award className={`h-5 w-5 ${isRuerup ? 'text-emerald-600' : 'text-blue-600'}`} />
      <div>
        <div className={`font-semibold ${isRuerup ? 'text-emerald-900' : 'text-blue-900'}`}>
          🏆 Empfehlung: {isRuerup ? 'Rürup-Rente' : 'ETF-Sparplan'}
        </div>
        <div className={`text-xs ${isRuerup ? 'text-emerald-700' : 'text-blue-700'}`}>
          Besseres Nettoergebnis bei Ihren Parametern
        </div>
      </div>
    </div>
  )
}

/**
 * Display accumulation phase comparison
 */
function RuerupAccumulationCard({ accumulation }: { accumulation: InvestmentResult['accumulation'] }) {
  return (
    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
      <h5 className="font-medium text-emerald-900 mb-2 text-sm">Rürup-Rente</h5>
      <div className="space-y-1 text-xs text-emerald-800">
        <div className="flex justify-between">
          <span>Endkapital:</span>
          <span className="font-medium">{formatCurrency(accumulation.finalValue)}</span>
        </div>
        <div className="flex justify-between">
          <span>Einzahlungen:</span>
          <span className="font-medium">{formatCurrency(accumulation.totalContributions)}</span>
        </div>
        <div className="flex justify-between">
          <span>Steuerersparnis:</span>
          <span className="font-medium text-emerald-600">
            {formatCurrency(Math.abs(accumulation.totalTaxEffect))}
          </span>
        </div>
        <div className="flex justify-between pt-1 border-t border-emerald-300">
          <span className="font-medium">Netto-Beiträge:</span>
          <span className="font-bold">{formatCurrency(accumulation.netContributions)}</span>
        </div>
      </div>
    </div>
  )
}

function EtfAccumulationCard({ accumulation }: { accumulation: InvestmentResult['accumulation'] }) {
  return (
    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <h5 className="font-medium text-blue-900 mb-2 text-sm">ETF-Sparplan</h5>
      <div className="space-y-1 text-xs text-blue-800">
        <div className="flex justify-between">
          <span>Endkapital:</span>
          <span className="font-medium">{formatCurrency(accumulation.finalValue)}</span>
        </div>
        <div className="flex justify-between">
          <span>Einzahlungen:</span>
          <span className="font-medium">{formatCurrency(accumulation.totalContributions)}</span>
        </div>
        <div className="flex justify-between">
          <span>Steuern gezahlt:</span>
          <span className="font-medium text-red-600">{formatCurrency(accumulation.totalTaxEffect)}</span>
        </div>
        <div className="flex justify-between pt-1 border-t border-blue-300">
          <span className="font-medium">Netto-Beiträge:</span>
          <span className="font-bold">{formatCurrency(accumulation.netContributions)}</span>
        </div>
      </div>
    </div>
  )
}

function AccumulationComparison({ result }: { result: RuerupVsEtfComparison }) {
  const { ruerup, etf } = result

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <PiggyBank className="h-5 w-5 text-purple-600" />
        <h4 className="font-medium text-purple-900">💰 Ansparphase</h4>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <RuerupAccumulationCard accumulation={ruerup.accumulation} />
        <EtfAccumulationCard accumulation={etf.accumulation} />
      </div>
    </div>
  )
}

/**
 * Display retirement phase comparison
 */
function RuerupRetirementCard({ retirement }: { retirement: InvestmentResult['retirement'] }) {
  return (
    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
      <h5 className="font-medium text-emerald-900 mb-2 text-sm">Rürup-Rente</h5>
      <div className="space-y-1 text-xs text-emerald-800">
        <div className="flex justify-between">
          <span>Brutto-Auszahlungen:</span>
          <span className="font-medium">{formatCurrency(retirement.totalGrossWithdrawals)}</span>
        </div>
        <div className="flex justify-between">
          <span>Steuern gezahlt:</span>
          <span className="font-medium text-red-600">{formatCurrency(retirement.totalTaxPaid)}</span>
        </div>
        <div className="flex justify-between pt-1 border-t border-emerald-300">
          <span className="font-medium">Netto erhalten:</span>
          <span className="font-bold">{formatCurrency(retirement.totalNetReceived)}</span>
        </div>
        <div className="flex justify-between">
          <span>Restkapital:</span>
          <span className="font-medium">{formatCurrency(retirement.finalRemainingValue)}</span>
        </div>
      </div>
    </div>
  )
}

function EtfRetirementCard({ retirement }: { retirement: InvestmentResult['retirement'] }) {
  return (
    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <h5 className="font-medium text-blue-900 mb-2 text-sm">ETF-Sparplan</h5>
      <div className="space-y-1 text-xs text-blue-800">
        <div className="flex justify-between">
          <span>Brutto-Auszahlungen:</span>
          <span className="font-medium">{formatCurrency(retirement.totalGrossWithdrawals)}</span>
        </div>
        <div className="flex justify-between">
          <span>Steuern gezahlt:</span>
          <span className="font-medium text-red-600">{formatCurrency(retirement.totalTaxPaid)}</span>
        </div>
        <div className="flex justify-between pt-1 border-t border-blue-300">
          <span className="font-medium">Netto erhalten:</span>
          <span className="font-bold">{formatCurrency(retirement.totalNetReceived)}</span>
        </div>
        <div className="flex justify-between">
          <span>Restkapital:</span>
          <span className="font-medium text-blue-600">{formatCurrency(retirement.finalRemainingValue)}</span>
        </div>
      </div>
    </div>
  )
}

function RetirementComparison({ result }: { result: RuerupVsEtfComparison }) {
  const { ruerup, etf } = result

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Wallet className="h-5 w-5 text-orange-600" />
        <h4 className="font-medium text-orange-900">🏖️ Rentenphase</h4>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <RuerupRetirementCard retirement={ruerup.retirement} />
        <EtfRetirementCard retirement={etf.retirement} />
      </div>
    </div>
  )
}

/**
 * Display overall comparison metrics
 */
function OverallMetricsGrid({ ruerup, etf }: { ruerup: InvestmentResult; etf: InvestmentResult }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <div className="space-y-2 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-purple-800">Rürup Netto-Vorteil:</span>
          <span className="font-bold text-purple-900">{formatCurrency(ruerup.overall.netBenefit)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-purple-800">Effektive Rendite:</span>
          <span className="font-medium text-purple-900">
            {(ruerup.overall.effectiveReturnRate * 100).toFixed(2)}%
          </span>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-blue-800">ETF Netto-Vorteil:</span>
          <span className="font-bold text-blue-900">{formatCurrency(etf.overall.netBenefit)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-blue-800">Effektive Rendite:</span>
          <span className="font-medium text-blue-900">{(etf.overall.effectiveReturnRate * 100).toFixed(2)}%</span>
        </div>
      </div>
    </div>
  )
}

function OverallComparison({ result }: { result: RuerupVsEtfComparison }) {
  const { ruerup, etf, comparison } = result

  return (
    <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="h-5 w-5 text-purple-600" />
        <h4 className="font-medium text-purple-900">📊 Gesamtergebnis</h4>
      </div>

      <OverallMetricsGrid ruerup={ruerup} etf={etf} />

      <div className="pt-3 border-t border-purple-300">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-purple-900">Vorteilsdifferenz:</span>
          <div className="flex items-center gap-2">
            <span
              className={`font-bold text-lg ${
                comparison.netBenefitDifference > 0 ? 'text-emerald-600' : 'text-blue-600'
              }`}
            >
              {formatCurrency(Math.abs(comparison.netBenefitDifference))}
            </span>
            <ArrowRight className="h-4 w-4 text-purple-600" />
            <span className="text-xs text-purple-700">({comparison.advantagePercentage.toFixed(1)}%)</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Display key factors influencing the comparison
 */
function KeyFactors({ factors }: { factors: string[] }) {
  if (factors.length === 0) return null

  return (
    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
      <h5 className="font-medium text-amber-900 mb-2 text-sm">💡 Wichtige Faktoren</h5>
      <ul className="space-y-1 text-xs text-amber-800">
        {factors.map((factor, index) => (
          <li key={index} className="flex items-start gap-2">
            <span className="text-amber-600 mt-0.5">•</span>
            <span>{factor}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * Display comparison results
 */
interface ResultsDisplayProps {
  result: RuerupVsEtfComparison
}

function ResultsDisplay({ result }: ResultsDisplayProps) {
  return (
    <div className="mt-4 space-y-4">
      <RecommendationBadge recommendation={result.comparison.recommendation} />
      <OverallComparison result={result} />
      <AccumulationComparison result={result} />
      <RetirementComparison result={result} />
      <KeyFactors factors={result.comparison.keyFactors} />
    </div>
  )
}

/**
 * Hook to manage Rürup vs. ETF comparison configuration
 */
function useRuerupVsEtfConfig() {
  const { steuerlast, teilfreistellungsquote, freibetragPerYear } = useSimulation()
  const currentYear = new Date().getFullYear()

  const [userConfig, setUserConfig] = useState(() => {
    const defaultConfig = createDefaultRuerupVsEtfConfig()
    return {
      annualContribution: defaultConfig.annualContribution,
      contributionYears: defaultConfig.contributionYears,
      expectedReturn: defaultConfig.expectedReturn,
      contributionPhaseTaxRate: defaultConfig.contributionPhaseTaxRate,
      retirementPhaseTaxRate: defaultConfig.retirementPhaseTaxRate,
      civilStatus: defaultConfig.civilStatus,
      retirementYears: defaultConfig.retirementYears,
    }
  })

  const handleConfigChange = (updates: Partial<RuerupVsEtfComparisonConfig>) => {
    setUserConfig(prev => ({ ...prev, ...updates }))
  }

  // Combine user config with simulation config for calculations
  const config: RuerupVsEtfComparisonConfig = useMemo(
    () => ({
      ...userConfig,
      startYear: currentYear,
      capitalGainsTaxRate: steuerlast / 100,
      teilfreistellungsquote: teilfreistellungsquote / 100,
      freibetrag: freibetragPerYear[currentYear] || 1000,
      ter: 0.002,
    }),
    [userConfig, steuerlast, teilfreistellungsquote, freibetragPerYear, currentYear],
  )

  return { config, handleConfigChange }
}

/**
 * Rürup vs. ETF Comparison Card - Compares Rürup-Rente vs. private ETF savings plan
 *
 * This component allows users to compare:
 * - Rürup-Rente (Basis-Rente): Tax deduction during contribution, full taxation in retirement
 * - Private ETF: No tax deduction, but lower taxation (Vorabpauschale + Teilfreistellung)
 *
 * The comparison shows:
 * - Accumulation phase: final values, tax effects, net contributions
 * - Retirement phase: total withdrawals, taxes, net received
 * - Overall metrics: net benefit, effective return rate
 * - Recommendation based on personal tax situation
 */
export function RuerupVsEtfComparisonCard() {
  const { config, handleConfigChange } = useRuerupVsEtfConfig()

  const result = useMemo(() => {
    try {
      return compareRuerupVsEtf(config)
    } catch (error) {
      console.error('Rürup vs. ETF comparison error:', error)
      return null
    }
  }, [config])

  return (
    <Card nestingLevel={1}>
      <Collapsible defaultOpen={false}>
        <CollapsibleCardHeader titleClassName="text-left" simplifiedPadding>
          🔄 Rürup-Rente vs. ETF-Sparplan Vergleich
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
