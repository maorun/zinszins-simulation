import { useState, useMemo, type ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Calculator, Users, User, Info, TrendingDown, Check } from 'lucide-react'
import { formatCurrency } from '../utils/currency'
import { generateFormId } from '../utils/unique-id'
import {
  compareAccountStructures,
  calculateOptimalDistribution,
  areSeparateAccountsWorthwhile,
  type PartnerCapitalGains,
  type AccountStructure,
} from '../../helpers/account-type-comparison'
import { Alert, AlertDescription } from './ui/alert'

interface AccountTypeComparisonCardProps {
  kapitalertragsteuer: number
  teilfreistellungsquote: number
}

/**
 * Info message explaining account type comparison for married couples
 */
function InfoMessage() {
  return (
    <div className="text-sm text-muted-foreground bg-blue-50 border border-blue-200 rounded-lg p-3">
      <div className="flex gap-2 items-start">
        <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-blue-900">
          <p className="font-medium mb-1">🏦 Einzel- vs. Gemeinschaftsdepot Vergleich</p>
          <p>
            Für Ehepaare: Vergleich zwischen <strong>zwei getrennten Depots</strong> (je 2.000€ Freibetrag) und einem{' '}
            <strong>Gemeinschaftsdepot</strong> (4.000€ Freibetrag). Die steuerlich optimale Wahl hängt von der
            Verteilung der Kapitalerträge ab.
          </p>
        </div>
      </div>
    </div>
  )
}

/**
 * Input form for capital gains distribution
 */
interface GainsInputFormProps {
  partner1Gains: number
  partner2Gains: number
  onPartner1Change: (value: number) => void
  onPartner2Change: (value: number) => void
}

function GainsInputForm({ partner1Gains, partner2Gains, onPartner1Change, onPartner2Change }: GainsInputFormProps) {
  const partner1Id = useMemo(() => generateFormId('account-comparison', 'partner1-gains'), [])
  const partner2Id = useMemo(() => generateFormId('account-comparison', 'partner2-gains'), [])

  const totalGains = partner1Gains + partner2Gains

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={partner1Id}>Kapitalerträge Partner 1 (€/Jahr)</Label>
        <Input
          id={partner1Id}
          type="number"
          min="0"
          step="100"
          value={partner1Gains}
          onChange={e => onPartner1Change(parseFloat(e.target.value) || 0)}
          placeholder="z.B. 8000"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={partner2Id}>Kapitalerträge Partner 2 (€/Jahr)</Label>
        <Input
          id={partner2Id}
          type="number"
          min="0"
          step="100"
          value={partner2Gains}
          onChange={e => onPartner2Change(parseFloat(e.target.value) || 0)}
          placeholder="z.B. 2000"
        />
      </div>

      <div className="text-sm text-muted-foreground bg-gray-50 p-3 rounded-lg">
        <div className="flex justify-between">
          <span>Gesamte Kapitalerträge:</span>
          <span className="font-medium">{formatCurrency(totalGains)}</span>
        </div>
      </div>
    </div>
  )
}

/**
 * Display card for a single account structure scenario
 */
interface ScenarioCardProps {
  title: string
  icon: ReactNode
  totalFreibetrag: number
  taxableGainsPartner1: number
  taxableGainsPartner2: number
  totalTaxableGains: number
  taxAmountPartner1: number
  taxAmountPartner2: number
  totalTaxAmount: number
  effectiveTaxRate: number
  isRecommended: boolean
  colorClass: string
  textColorClass: string
}

function ScenarioCardHeader({ title, icon, isRecommended }: { title: string; icon: ReactNode; isRecommended: boolean }) {
  return (
    <>
      {isRecommended && (
        <div className="absolute top-2 right-2">
          <div className="bg-green-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
            <Check className="h-3 w-3" />
            <span>Empfohlen</span>
          </div>
        </div>
      )}
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h4 className="font-medium text-sm">{title}</h4>
      </div>
    </>
  )
}

function ScenarioCardTaxableSection({
  taxableGainsPartner1,
  taxableGainsPartner2,
  totalTaxableGains,
}: Pick<ScenarioCardProps, 'taxableGainsPartner1' | 'taxableGainsPartner2' | 'totalTaxableGains'>) {
  return (
    <div className="border-t pt-2 space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">Steuerpflichtig Partner 1:</span>
        <span>{formatCurrency(taxableGainsPartner1)}</span>
      </div>
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">Steuerpflichtig Partner 2:</span>
        <span>{formatCurrency(taxableGainsPartner2)}</span>
      </div>
      <div className="flex justify-between font-medium">
        <span className="text-muted-foreground">Steuerpflichtig gesamt:</span>
        <span>{formatCurrency(totalTaxableGains)}</span>
      </div>
    </div>
  )
}

function ScenarioCardTaxSection({
  taxAmountPartner1,
  taxAmountPartner2,
  totalTaxAmount,
  textColorClass,
}: Pick<ScenarioCardProps, 'taxAmountPartner1' | 'taxAmountPartner2' | 'totalTaxAmount' | 'textColorClass'>) {
  return (
    <div className="border-t pt-2 space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">Steuer Partner 1:</span>
        <span>{formatCurrency(taxAmountPartner1)}</span>
      </div>
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">Steuer Partner 2:</span>
        <span>{formatCurrency(taxAmountPartner2)}</span>
      </div>
      <div className="flex justify-between font-medium">
        <span className="text-muted-foreground">Gesamtsteuer:</span>
        <span className={textColorClass}>{formatCurrency(totalTaxAmount)}</span>
      </div>
    </div>
  )
}

function ScenarioCardMetrics(props: Omit<ScenarioCardProps, 'title' | 'icon' | 'isRecommended' | 'colorClass'>) {
  return (
    <div className="space-y-2 text-sm">
      <div className="flex justify-between">
        <span className="text-muted-foreground">Gesamt-Freibetrag:</span>
        <span className="font-medium">{formatCurrency(props.totalFreibetrag)}</span>
      </div>

      <ScenarioCardTaxableSection
        taxableGainsPartner1={props.taxableGainsPartner1}
        taxableGainsPartner2={props.taxableGainsPartner2}
        totalTaxableGains={props.totalTaxableGains}
      />

      <ScenarioCardTaxSection
        taxAmountPartner1={props.taxAmountPartner1}
        taxAmountPartner2={props.taxAmountPartner2}
        totalTaxAmount={props.totalTaxAmount}
        textColorClass={props.textColorClass}
      />

      <div className="border-t pt-2">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Effektiver Steuersatz:</span>
          <span className="font-medium">{props.effectiveTaxRate.toFixed(2)}%</span>
        </div>
      </div>
    </div>
  )
}

function ScenarioCard(props: ScenarioCardProps) {
  return (
    <div className={`p-4 border rounded-lg ${props.colorClass} relative`}>
      <ScenarioCardHeader title={props.title} icon={props.icon} isRecommended={props.isRecommended} />
      <ScenarioCardMetrics {...props} />
    </div>
  )
}

/**
 * Comparison summary with recommendation
 */
interface ComparisonSummaryProps {
  recommendation: AccountStructure
  taxSavings: number
  description: string
}

function ComparisonSummary({ recommendation, taxSavings, description }: ComparisonSummaryProps) {
  const isSeparateBetter = recommendation === 'separate'

  return (
    <Alert>
      <TrendingDown className="h-4 w-4" />
      <AlertDescription>
        <div className="space-y-2">
          <div>
            <strong>Empfehlung:</strong>{' '}
            {isSeparateBetter ? '👫 Getrennte Depots (2 × 2.000€)' : '🏦 Gemeinschaftsdepot (1 × 4.000€)'}
          </div>
          {taxSavings > 0.01 && (
            <div className="text-sm">
              <strong>Steuerersparnis:</strong> {formatCurrency(taxSavings)} pro Jahr
            </div>
          )}
          <div className="text-sm text-muted-foreground">{description}</div>
        </div>
      </AlertDescription>
    </Alert>
  )
}

/**
 * Optimal distribution guidance
 */
interface OptimalDistributionGuidanceProps {
  totalGains: number
  taxRate: number
  teilfreistellung: number
}

function OptimalDistributionGuidance({ totalGains, taxRate, teilfreistellung }: OptimalDistributionGuidanceProps) {
  const optimal = useMemo(
    () => calculateOptimalDistribution(totalGains, taxRate, teilfreistellung),
    [totalGains, taxRate, teilfreistellung],
  )

  if (totalGains === 0) {
    return null
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
      <div className="flex gap-2 items-start">
        <Info className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-amber-900">
          <p className="font-medium mb-1">💡 Optimale Aufteilung für getrennte Depots</p>
          <p>
            Für maximale Steuereffizienz bei getrennten Depots sollten die Kapitalerträge gleichmäßig verteilt werden:
          </p>
          <div className="mt-2 space-y-1">
            <div className="flex justify-between">
              <span>Partner 1:</span>
              <span className="font-medium">{formatCurrency(optimal.optimalSplit.partner1)}</span>
            </div>
            <div className="flex justify-between">
              <span>Partner 2:</span>
              <span className="font-medium">{formatCurrency(optimal.optimalSplit.partner2)}</span>
            </div>
            <div className="flex justify-between font-medium border-t border-amber-300 pt-1">
              <span>Erwartete Steuer:</span>
              <span>{formatCurrency(optimal.expectedTax)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Main comparison results display
 */
interface ComparisonResultsProps {
  gains: PartnerCapitalGains
  taxRate: number
  teilfreistellung: number
}

function ComparisonScenarios({ comparison }: { comparison: ReturnType<typeof compareAccountStructures> }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <ScenarioCard
        title="👫 Zwei getrennte Depots"
        icon={<Users className="h-4 w-4" />}
        totalFreibetrag={comparison.separateAccounts.totalFreibetrag}
        taxableGainsPartner1={comparison.separateAccounts.taxableGainsPartner1}
        taxableGainsPartner2={comparison.separateAccounts.taxableGainsPartner2}
        totalTaxableGains={comparison.separateAccounts.totalTaxableGains}
        taxAmountPartner1={comparison.separateAccounts.taxAmountPartner1}
        taxAmountPartner2={comparison.separateAccounts.taxAmountPartner2}
        totalTaxAmount={comparison.separateAccounts.totalTaxAmount}
        effectiveTaxRate={comparison.separateAccounts.effectiveTaxRate}
        isRecommended={comparison.recommendation === 'separate'}
        colorClass={comparison.recommendation === 'separate' ? 'bg-green-50' : 'bg-gray-50'}
        textColorClass={comparison.recommendation === 'separate' ? 'text-green-700' : 'text-gray-700'}
      />

      <ScenarioCard
        title="🏦 Gemeinschaftsdepot"
        icon={<User className="h-4 w-4" />}
        totalFreibetrag={comparison.jointAccount.totalFreibetrag}
        taxableGainsPartner1={comparison.jointAccount.taxableGainsPartner1}
        taxableGainsPartner2={comparison.jointAccount.taxableGainsPartner2}
        totalTaxableGains={comparison.jointAccount.totalTaxableGains}
        taxAmountPartner1={comparison.jointAccount.taxAmountPartner1}
        taxAmountPartner2={comparison.jointAccount.taxAmountPartner2}
        totalTaxAmount={comparison.jointAccount.totalTaxAmount}
        effectiveTaxRate={comparison.jointAccount.effectiveTaxRate}
        isRecommended={comparison.recommendation === 'joint'}
        colorClass={comparison.recommendation === 'joint' ? 'bg-green-50' : 'bg-gray-50'}
        textColorClass={comparison.recommendation === 'joint' ? 'text-green-700' : 'text-gray-700'}
      />
    </div>
  )
}

function ComparisonResults({ gains, taxRate, teilfreistellung }: ComparisonResultsProps) {
  const comparison = useMemo(
    () => compareAccountStructures(gains, taxRate, teilfreistellung),
    [gains, taxRate, teilfreistellung],
  )

  const worthwhile = useMemo(
    () => areSeparateAccountsWorthwhile(gains, taxRate, teilfreistellung),
    [gains, taxRate, teilfreistellung],
  )

  return (
    <div className="space-y-4">
      <ComparisonScenarios comparison={comparison} />

      <ComparisonSummary
        recommendation={comparison.recommendation}
        taxSavings={comparison.taxSavings}
        description={comparison.description}
      />

      {worthwhile.worthwhile && (
        <OptimalDistributionGuidance
          totalGains={gains.partner1 + gains.partner2}
          taxRate={taxRate}
          teilfreistellung={teilfreistellung}
        />
      )}
    </div>
  )
}

/**
 * Account Type Comparison Card for Married Couples
 *
 * Compares tax implications of:
 * - Two separate individual accounts (2 × 2.000€ Freibetrag)
 * - One joint account (1 × 4.000€ Freibetrag)
 */
export function AccountTypeComparisonCard({ kapitalertragsteuer, teilfreistellungsquote }: AccountTypeComparisonCardProps) {
  const [partner1Gains, setPartner1Gains] = useState(8000)
  const [partner2Gains, setPartner2Gains] = useState(2000)
  const [showComparison, setShowComparison] = useState(false)

  const gains: PartnerCapitalGains = useMemo(
    () => ({
      partner1: partner1Gains,
      partner2: partner2Gains,
    }),
    [partner1Gains, partner2Gains],
  )

  const handleCalculate = () => {
    setShowComparison(true)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Einzel- vs. Gemeinschaftsdepot Vergleich
        </CardTitle>
        <CardDescription>
          Vergleichen Sie für Ehepaare die steuerlichen Auswirkungen von getrennten Depots vs. Gemeinschaftsdepot
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <InfoMessage />

        <GainsInputForm
          partner1Gains={partner1Gains}
          partner2Gains={partner2Gains}
          onPartner1Change={setPartner1Gains}
          onPartner2Change={setPartner2Gains}
        />

        <Button onClick={handleCalculate} className="w-full">
          <Calculator className="h-4 w-4 mr-2" />
          Vergleich berechnen
        </Button>

        {showComparison && (
          <ComparisonResults gains={gains} taxRate={kapitalertragsteuer} teilfreistellung={teilfreistellungsquote} />
        )}
      </CardContent>
    </Card>
  )
}
