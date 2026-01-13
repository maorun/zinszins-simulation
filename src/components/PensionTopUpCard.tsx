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

function ConfigForm({ config, onConfigChange }: ConfigFormProps) {
  const birthYearId = generateFormId('pension-topup', 'birth-year')
  const desiredRetirementAgeId = generateFormId('pension-topup', 'desired-retirement-age')
  const currentPointsId = generateFormId('pension-topup', 'current-points')
  const targetPointsId = generateFormId('pension-topup', 'target-points')

  return (
    <div className="space-y-4">
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
  config: PensionTopUpConfig
}

function ResultsDisplay({ result, config }: ResultsDisplayProps) {
  return (
    <div className="space-y-4 mt-4">
      {/* Deduction Offset Results */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-3">📉 Ausgleich von Rentenabschlägen</h4>
        <div className="space-y-2 text-sm">
          <div className="grid grid-cols-2 gap-2">
            <span className="text-blue-800">Regelaltersgrenze:</span>
            <span className="font-medium text-blue-900">
              {result.deductionOffset.standardRetirementAge.toFixed(1)} Jahre
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <span className="text-blue-800">Gewünschtes Alter:</span>
            <span className="font-medium text-blue-900">
              {result.deductionOffset.desiredRetirementAge} Jahre
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <span className="text-blue-800">Vorzeitiger Eintritt:</span>
            <span className="font-medium text-blue-900">
              {result.deductionOffset.monthsOfEarlyRetirement} Monate
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <span className="text-blue-800">Rentenabschlag:</span>
            <span className="font-medium text-blue-900">
              {(result.deductionOffset.totalDeductionPercentage * 100).toFixed(2)}%
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-blue-300">
            <span className="text-blue-800">Monatlicher Rentenverlust:</span>
            <span className="font-medium text-blue-900">
              {formatCurrency(result.deductionOffset.monthlyPensionLost)}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <span className="font-medium text-blue-900">Ausgleichskosten:</span>
            <span className="font-bold text-blue-900 text-base">
              {formatCurrency(result.deductionOffset.offsetCost)}
            </span>
          </div>
          {result.breakEvenAnalysis.yearsUntilBreakEvenDeduction !== Infinity && (
            <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-blue-300">
              <span className="text-blue-800">Break-Even:</span>
              <span className="font-medium text-blue-900">
                {result.breakEvenAnalysis.yearsUntilBreakEvenDeduction.toFixed(1)} Jahre
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Points Purchase Results (if applicable) */}
      {result.pointsPurchase && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="font-medium text-green-900 mb-3">📈 Nachkauf von Rentenpunkten</h4>
          <div className="space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <span className="text-green-800">Aktuelle Rentenpunkte:</span>
              <span className="font-medium text-green-900">
                {result.pointsPurchase.currentPensionPoints.toFixed(2)}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <span className="text-green-800">Ziel-Rentenpunkte:</span>
              <span className="font-medium text-green-900">
                {result.pointsPurchase.targetPensionPoints.toFixed(2)}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <span className="text-green-800">Zusätzliche Punkte:</span>
              <span className="font-medium text-green-900">
                {result.pointsPurchase.additionalPoints.toFixed(2)}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-green-300">
              <span className="text-green-800">Kosten pro Rentenpunkt:</span>
              <span className="font-medium text-green-900">
                {formatCurrency(result.pointsPurchase.costPerPoint)}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <span className="font-medium text-green-900">Gesamtkosten:</span>
              <span className="font-bold text-green-900 text-base">
                {formatCurrency(result.pointsPurchase.totalCost)}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-green-300">
              <span className="text-green-800">Zusätzliche Monatsrente:</span>
              <span className="font-medium text-green-900">
                +{formatCurrency(result.pointsPurchase.additionalMonthlyPension)}
              </span>
            </div>
            {result.breakEvenAnalysis.yearsUntilBreakEvenPurchase !== undefined &&
              result.breakEvenAnalysis.yearsUntilBreakEvenPurchase !== Infinity && (
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-green-800">Break-Even:</span>
                  <span className="font-medium text-green-900">
                    {result.breakEvenAnalysis.yearsUntilBreakEvenPurchase.toFixed(1)} Jahre
                  </span>
                </div>
              )}
          </div>
        </div>
      )}

      {/* Recommendation */}
      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-900">
        <p className="font-medium mb-1">💡 Empfehlung:</p>
        <p>
          Die Zahlungen sind vollständig steuerlich absetzbar und erhöhen Ihre spätere Rente. Die Break-Even-Analyse
          zeigt, ab wann sich die Investition amortisiert. Berücksichtigen Sie Ihre persönliche Lebenserwartung und
          finanzielle Situation.
        </p>
      </div>
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
              {result && <ResultsDisplay result={result} config={config} />}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
