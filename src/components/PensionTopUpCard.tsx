import { useState, useMemo } from 'react'
import { Card, CardContent } from './ui/card'
import { Collapsible, CollapsibleContent } from './ui/collapsible'
import { CollapsibleCardHeader } from './ui/collapsible-card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Info, TrendingUp, AlertCircle } from 'lucide-react'
import { generateFormId } from '../utils/unique-id'
import { formatCurrency } from '../utils/currency'
import {
  calculatePensionTopUp,
  getDefaultPensionTopUpConfig,
  validatePensionTopUpConfig,
  type PensionTopUpConfig,
} from '../../helpers/pension-top-up'

function InfoMessage() {
  return (
    <div className="text-sm text-muted-foreground bg-blue-50 border border-blue-200 rounded-lg p-3">
      <div className="flex gap-2 items-start">
        <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-blue-900">
          <p className="font-medium mb-1">💰 Renten-Auffüll-Strategie</p>
          <p>
            Berechnen Sie die Kosten und Vorteile von freiwilligen Rentenbeiträgen: Nachkauf von Rentenpunkten und
            Ausgleich von Rentenabschlägen bei vorzeitigem Renteneintritt.
          </p>
        </div>
      </div>
    </div>
  )
}

function TaxInfoBox() {
  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-xs text-green-900">
      <div className="flex gap-2 items-start">
        <TrendingUp className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-medium mb-1">Steuervorteile:</p>
          <ul className="list-disc list-inside space-y-0.5">
            <li>100% steuerlich absetzbar als Vorsorgeaufwendungen (ab 2024)</li>
            <li>Reduziert Ihre Einkommensteuerlast im Zahlungsjahr</li>
            <li>Erhöht Ihre spätere Rente dauerhaft</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

interface ConfigFormProps {
  config: PensionTopUpConfig
  onConfigChange: (config: PensionTopUpConfig) => void
}

function BasicInfoFields({ config, onConfigChange }: ConfigFormProps) {
  const birthYearId = generateFormId('pension-topup', 'birth-year')
  const desiredRetirementAgeId = generateFormId('pension-topup', 'desired-retirement-age')

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor={birthYearId}>Geburtsjahr</Label>
        <Input
          id={birthYearId}
          type="number"
          min="1940"
          max="2020"
          value={config.birthYear}
          onChange={(e) => onConfigChange({ ...config, birthYear: parseInt(e.target.value) || 1980 })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={desiredRetirementAgeId}>Gewünschtes Renteneintrittsalter</Label>
        <Input
          id={desiredRetirementAgeId}
          type="number"
          min="50"
          max="75"
          step="0.5"
          value={config.desiredRetirementAge}
          onChange={(e) => onConfigChange({ ...config, desiredRetirementAge: parseFloat(e.target.value) || 63 })}
        />
      </div>
    </div>
  )
}

function PensionPointsFields({ config, onConfigChange }: ConfigFormProps) {
  const currentPointsId = generateFormId('pension-topup', 'current-points')
  const targetPointsId = generateFormId('pension-topup', 'target-points')

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor={currentPointsId}>Aktuelle Rentenpunkte</Label>
        <Input
          id={currentPointsId}
          type="number"
          min="0"
          step="0.1"
          value={config.currentPensionPoints}
          onChange={(e) =>
            onConfigChange({ ...config, currentPensionPoints: parseFloat(e.target.value) || 0 })
          }
        />
        <p className="text-xs text-muted-foreground">
          Ihre bisher erworbenen Rentenpunkte (aus Ihrer Renteninformation)
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor={targetPointsId}>Ziel-Rentenpunkte (optional)</Label>
        <Input
          id={targetPointsId}
          type="number"
          min="0"
          step="0.1"
          value={config.targetPensionPoints || ''}
          onChange={(e) => {
            const value = e.target.value === '' ? undefined : parseFloat(e.target.value)
            onConfigChange({ ...config, targetPensionPoints: value })
          }}
          placeholder="Leer lassen für nur Abschlagsausgleich"
        />
        <p className="text-xs text-muted-foreground">
          Gewünschte Gesamtzahl an Rentenpunkten (für Nachkauf)
        </p>
      </div>
    </div>
  )
}

function ConfigForm({ config, onConfigChange }: ConfigFormProps) {
  return (
    <div className="space-y-4">
      <BasicInfoFields config={config} onConfigChange={onConfigChange} />
      <PensionPointsFields config={config} onConfigChange={onConfigChange} />
    </div>
  )
}

interface ValidationErrorsProps {
  errors: string[]
}

function ValidationErrors({ errors }: ValidationErrorsProps) {
  if (errors.length === 0) return null

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
      <div className="flex gap-2 items-start">
        <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-red-900">
          <p className="font-medium mb-1">Eingabefehler:</p>
          <ul className="list-disc list-inside space-y-0.5">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

interface ResultsDisplayProps {
  result: ReturnType<typeof calculatePensionTopUp>
}

interface ResultRowProps {
  label: string
  value: string | number
  valueClassName?: string
  labelClassName?: string
  divClassName?: string
}

function ResultRow({ label, value, valueClassName = '', labelClassName = '', divClassName = '' }: ResultRowProps) {
  return (
    <div className={`grid grid-cols-2 gap-2 ${divClassName}`}>
      <span className={labelClassName}>{label}</span>
      <span className={valueClassName}>{value}</span>
    </div>
  )
}

function DeductionOffsetBasicInfo({ result }: ResultsDisplayProps) {
  const { deductionOffset } = result
  const baseLabel = 'text-blue-800'
  const baseValue = 'font-medium text-blue-900'

  return (
    <>
      <ResultRow
        label="Regelaltersgrenze:"
        value={`${deductionOffset.standardRetirementAge.toFixed(1)} Jahre`}
        labelClassName={baseLabel}
        valueClassName={baseValue}
      />
      <ResultRow
        label="Gewünschtes Alter:"
        value={`${deductionOffset.desiredRetirementAge} Jahre`}
        labelClassName={baseLabel}
        valueClassName={baseValue}
      />
      <ResultRow
        label="Vorzeitiger Eintritt:"
        value={`${deductionOffset.monthsOfEarlyRetirement} Monate`}
        labelClassName={baseLabel}
        valueClassName={baseValue}
      />
      <ResultRow
        label="Rentenabschlag:"
        value={`${(deductionOffset.totalDeductionPercentage * 100).toFixed(2)}%`}
        labelClassName={baseLabel}
        valueClassName={baseValue}
      />
    </>
  )
}

function DeductionOffsetCosts({ result }: ResultsDisplayProps) {
  const { deductionOffset, breakEvenAnalysis } = result
  const baseLabel = 'text-blue-800'
  const baseValue = 'font-medium text-blue-900'

  return (
    <>
      <ResultRow
        label="Monatlicher Rentenverlust:"
        value={formatCurrency(deductionOffset.monthlyPensionLost)}
        labelClassName={baseLabel}
        valueClassName={baseValue}
        divClassName="pt-2 border-t border-blue-300"
      />
      <ResultRow
        label="Ausgleichskosten:"
        value={formatCurrency(deductionOffset.offsetCost)}
        labelClassName="font-medium text-blue-900"
        valueClassName="font-bold text-blue-900 text-base"
      />
      {breakEvenAnalysis.yearsUntilBreakEvenDeduction !== Infinity && (
        <ResultRow
          label="Break-Even:"
          value={`${breakEvenAnalysis.yearsUntilBreakEvenDeduction.toFixed(1)} Jahre`}
          labelClassName={baseLabel}
          valueClassName={baseValue}
          divClassName="mt-2 pt-2 border-t border-blue-300"
        />
      )}
    </>
  )
}

function DeductionOffsetContent({ result }: ResultsDisplayProps) {
  return (
    <>
      <DeductionOffsetBasicInfo result={result} />
      <DeductionOffsetCosts result={result} />
    </>
  )
}

function DeductionOffsetResults({ result }: ResultsDisplayProps) {
  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <h4 className="font-medium text-blue-900 mb-3">📉 Ausgleich von Rentenabschlägen</h4>
      <div className="space-y-2 text-sm">
        <DeductionOffsetContent result={result} />
      </div>
    </div>
  )
}

function PointsPurchaseBasicInfo({ result }: ResultsDisplayProps) {
  if (!result.pointsPurchase) return null

  const { pointsPurchase } = result
  const baseLabel = 'text-green-800'
  const baseValue = 'font-medium text-green-900'

  return (
    <>
      <ResultRow
        label="Aktuelle Rentenpunkte:"
        value={pointsPurchase.currentPensionPoints.toFixed(2)}
        labelClassName={baseLabel}
        valueClassName={baseValue}
      />
      <ResultRow
        label="Ziel-Rentenpunkte:"
        value={pointsPurchase.targetPensionPoints.toFixed(2)}
        labelClassName={baseLabel}
        valueClassName={baseValue}
      />
      <ResultRow
        label="Zusätzliche Punkte:"
        value={pointsPurchase.additionalPoints.toFixed(2)}
        labelClassName={baseLabel}
        valueClassName={baseValue}
      />
    </>
  )
}

function PointsPurchaseCosts({ result }: ResultsDisplayProps) {
  if (!result.pointsPurchase) return null

  const { pointsPurchase, breakEvenAnalysis } = result
  const baseLabel = 'text-green-800'
  const baseValue = 'font-medium text-green-900'

  return (
    <>
      <ResultRow
        label="Kosten pro Rentenpunkt:"
        value={formatCurrency(pointsPurchase.costPerPoint)}
        labelClassName={baseLabel}
        valueClassName={baseValue}
        divClassName="pt-2 border-t border-green-300"
      />
      <ResultRow
        label="Gesamtkosten:"
        value={formatCurrency(pointsPurchase.totalCost)}
        labelClassName="font-medium text-green-900"
        valueClassName="font-bold text-green-900 text-base"
      />
      <ResultRow
        label="Zusätzliche Monatsrente:"
        value={`+${formatCurrency(pointsPurchase.additionalMonthlyPension)}`}
        labelClassName={baseLabel}
        valueClassName={baseValue}
        divClassName="mt-2 pt-2 border-t border-green-300"
      />
      {breakEvenAnalysis.yearsUntilBreakEvenPurchase !== undefined &&
        breakEvenAnalysis.yearsUntilBreakEvenPurchase !== Infinity && (
          <ResultRow
            label="Break-Even:"
            value={`${breakEvenAnalysis.yearsUntilBreakEvenPurchase.toFixed(1)} Jahre`}
            labelClassName={baseLabel}
            valueClassName={baseValue}
          />
        )}
    </>
  )
}

function PointsPurchaseContent({ result }: ResultsDisplayProps) {
  if (!result.pointsPurchase) return null

  return (
    <>
      <PointsPurchaseBasicInfo result={result} />
      <PointsPurchaseCosts result={result} />
    </>
  )
}

function PointsPurchaseResults({ result }: ResultsDisplayProps) {
  if (!result.pointsPurchase) return null

  return (
    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
      <h4 className="font-medium text-green-900 mb-3">📈 Nachkauf von Rentenpunkten</h4>
      <div className="space-y-2 text-sm">
        <PointsPurchaseContent result={result} />
      </div>
    </div>
  )
}

function RecommendationBox() {
  return (
    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-900">
      <p className="font-medium mb-1">💡 Empfehlung:</p>
      <p>
        Die Zahlungen sind vollständig steuerlich absetzbar und erhöhen Ihre spätere Rente. Die Break-Even-Analyse
        zeigt, ab wann sich die Investition amortisiert. Berücksichtigen Sie Ihre persönliche Lebenserwartung und
        finanzielle Situation.
      </p>
    </div>
  )
}

function ResultsDisplay({ result }: ResultsDisplayProps) {
  return (
    <div className="space-y-4 mt-4">
      <DeductionOffsetResults result={result} />
      <PointsPurchaseResults result={result} />
      <RecommendationBox />
    </div>
  )
}

/**
 * Pension Top-Up Strategy Card (Renten-Auffüll-Strategie)
 * 
 * Educational calculator for voluntary pension contributions:
 * - Offsetting pension deductions for early retirement
 * - Purchasing additional pension points
 */
export function PensionTopUpCard() {
  const [config, setConfig] = useState<PensionTopUpConfig>(() => getDefaultPensionTopUpConfig())

  const validationErrors = useMemo(() => validatePensionTopUpConfig(config), [config])

  const result = useMemo(() => {
    if (validationErrors.length > 0) return null
    return calculatePensionTopUp(config)
  }, [config, validationErrors])

  return (
    <Card nestingLevel={1}>
      <Collapsible defaultOpen={false}>
        <CollapsibleCardHeader titleClassName="text-left" simplifiedPadding>
          💰 Renten-Auffüll-Strategie
        </CollapsibleCardHeader>
        <CollapsibleContent>
          <CardContent nestingLevel={1}>
            <div className="space-y-4">
              <InfoMessage />
              <TaxInfoBox />
              <ConfigForm config={config} onConfigChange={setConfig} />
              <ValidationErrors errors={validationErrors} />
              {result && <ResultsDisplay result={result} />}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
