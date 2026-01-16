/**
 * Depot-auf-Kind Configuration Section
 * UI component for configuring child's depot tax optimization strategy
 */

import { useMemo } from 'react'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Alert, AlertDescription } from '../ui/alert'
import { generateFormId } from '../../utils/unique-id'
import {
  simulateDepotAufKind,
  calculateOptimalTransferTiming,
  validateDepotAufKindConfig,
  type DepotAufKindConfig,
  type ChildDepotAssetType,
  CHILD_TAX_ALLOWANCES,
} from '../../../helpers/depot-auf-kind'
import { formatCurrency } from '../../utils/currency'
import { Info, TrendingUp, Shield, Calculator } from 'lucide-react'

interface DepotAufKindConfigSectionProps {
  config: DepotAufKindConfig
  onUpdate: (updates: Partial<DepotAufKindConfig>) => void
  currentYear: number
}

/**
 * Basic child information fields
 */
function ChildInfoFields({
  config,
  currentYear,
  onUpdate,
}: {
  config: DepotAufKindConfig
  currentYear: number
  onUpdate: (updates: Partial<DepotAufKindConfig>) => void
}) {
  const childNameId = useMemo(() => generateFormId('depot-auf-kind', 'child-name'), [])
  const birthYearId = useMemo(() => generateFormId('depot-auf-kind', 'birth-year'), [])

  const childAge = currentYear - config.birthYear

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor={childNameId}>Name des Kindes</Label>
        <Input
          id={childNameId}
          type="text"
          value={config.childName}
          onChange={(e) => onUpdate({ childName: e.target.value })}
          placeholder="z.B. Emma Müller"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={birthYearId}>Geburtsjahr</Label>
        <Input
          id={birthYearId}
          type="number"
          value={config.birthYear}
          onChange={(e) => onUpdate({ birthYear: Number(e.target.value) || currentYear - 5 })}
          min={currentYear - 30}
          max={currentYear}
          step={1}
        />
        <p className="text-xs text-gray-600">
          Alter des Kindes im Jahr {currentYear}: {childAge} Jahre
        </p>
      </div>
    </>
  )
}

/**
 * Single depot config field
 */
function DepotField({
  id,
  label,
  value,
  onChange,
  helpText,
  min,
  max,
  step,
}: {
  id: string
  label: string
  value: number
  onChange: (value: number) => void
  helpText: string
  min?: number
  max?: number
  step?: number
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        min={min}
        max={max}
        step={step}
      />
      <p className="text-xs text-gray-600">{helpText}</p>
    </div>
  )
}

/**
 * Depot configuration fields
 */
function DepotConfigFields({
  config,
  onUpdate,
}: {
  config: DepotAufKindConfig
  onUpdate: (updates: Partial<DepotAufKindConfig>) => void
}) {
  const depotValueId = useMemo(() => generateFormId('depot-auf-kind', 'depot-value'), [])
  const returnRateId = useMemo(() => generateFormId('depot-auf-kind', 'return-rate'), [])
  const simulationYearsId = useMemo(() => generateFormId('depot-auf-kind', 'simulation-years'), [])

  return (
    <>
      <DepotField
        id={depotValueId}
        label="Depot-Wert (Initial)"
        value={config.initialDepotValue}
        onChange={(value) => onUpdate({ initialDepotValue: value })}
        helpText="Startkapital für das Depot auf den Namen des Kindes"
        min={0}
        step={1000}
      />
      <DepotField
        id={returnRateId}
        label="Erwartete Rendite (% p.a.)"
        value={config.expectedAnnualReturn * 100}
        onChange={(value) => onUpdate({ expectedAnnualReturn: value / 100 })}
        helpText="Durchschnittliche jährliche Rendite (z.B. 5% für Aktienfonds)"
        min={-100}
        max={100}
        step={0.5}
      />
      <DepotField
        id={simulationYearsId}
        label="Simulationsdauer (Jahre)"
        value={config.simulationYears}
        onChange={(value) => onUpdate({ simulationYears: value })}
        helpText="Zeitraum der Simulation (typisch bis Studienbeginn oder -ende)"
        min={1}
        max={50}
        step={1}
      />
    </>
  )
}

/**
 * Asset types configuration
 */
const ASSET_TYPES: Array<{ value: ChildDepotAssetType; label: string; description: string }> = [
  {
    value: 'equity_fund',
    label: 'Aktienfonds',
    description: '30% Teilfreistellung - optimal für langfristige Anlage',
  },
  {
    value: 'mixed_fund',
    label: 'Mischfonds',
    description: '15% Teilfreistellung - ausgewogene Strategie',
  },
  {
    value: 'bond_fund',
    label: 'Rentenfonds',
    description: '0% Teilfreistellung - konservative Anlage',
  },
  {
    value: 'savings_account',
    label: 'Sparkonto',
    description: '0% Teilfreistellung - sichere Anlage',
  },
]

/**
 * Asset type button
 */
function AssetTypeButton({
  assetType,
  selected,
  onClick,
}: {
  assetType: { value: ChildDepotAssetType; label: string; description: string }
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-3 text-left text-sm rounded border ${
        selected ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
      }`}
    >
      <div className="font-semibold">{assetType.label}</div>
      <div className={`text-xs mt-1 ${selected ? 'text-purple-100' : 'text-gray-500'}`}>
        {assetType.description}
      </div>
    </button>
  )
}

/**
 * Asset type selector
 */
function AssetTypeSelector({
  config,
  onUpdate,
}: {
  config: DepotAufKindConfig
  onUpdate: (updates: Partial<DepotAufKindConfig>) => void
}) {
  return (
    <div className="space-y-2">
      <Label>Anlagetyp</Label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {ASSET_TYPES.map((assetType) => (
          <AssetTypeButton
            key={assetType.value}
            assetType={assetType}
            selected={config.assetType === assetType.value}
            onClick={() => onUpdate({ assetType: assetType.value })}
          />
        ))}
      </div>
    </div>
  )
}

/**
 * Parent tax rate configuration
 */
function ParentTaxFields({
  config,
  onUpdate,
}: {
  config: DepotAufKindConfig
  onUpdate: (updates: Partial<DepotAufKindConfig>) => void
}) {
  const parentTaxRateId = useMemo(() => generateFormId('depot-auf-kind', 'parent-tax-rate'), [])

  return (
    <div className="space-y-2">
      <Label htmlFor={parentTaxRateId}>Grenzsteuersatz der Eltern (%)</Label>
      <Input
        id={parentTaxRateId}
        type="number"
        value={config.parentMarginalTaxRate * 100}
        onChange={(e) => onUpdate({ parentMarginalTaxRate: (Number(e.target.value) || 0) / 100 })}
        min={0}
        max={45}
        step={1}
      />
      <p className="text-xs text-gray-600">
        Höchster Steuersatz der Eltern (z.B. 42% für Gutverdiener)
      </p>
    </div>
  )
}

/**
 * Child's other income configuration
 */
function ChildIncomeFields({
  config,
  onUpdate,
}: {
  config: DepotAufKindConfig
  onUpdate: (updates: Partial<DepotAufKindConfig>) => void
}) {
  const hasOtherIncomeId = useMemo(() => generateFormId('depot-auf-kind', 'has-other-income'), [])
  const otherIncomeId = useMemo(() => generateFormId('depot-auf-kind', 'other-income'), [])

  return (
    <>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <input
            id={hasOtherIncomeId}
            type="checkbox"
            checked={config.hasOtherIncome}
            onChange={(e) => onUpdate({ hasOtherIncome: e.target.checked })}
            className="rounded border-gray-300"
          />
          <Label htmlFor={hasOtherIncomeId}>Kind hat eigenes Einkommen</Label>
        </div>
        <p className="text-xs text-gray-600">
          z.B. durch Ausbildungsvergütung oder Nebenjob
        </p>
      </div>

      {config.hasOtherIncome && (
        <div className="space-y-2">
          <Label htmlFor={otherIncomeId}>Jahreseinkommen des Kindes</Label>
          <Input
            id={otherIncomeId}
            type="number"
            value={config.otherAnnualIncome}
            onChange={(e) => onUpdate({ otherAnnualIncome: Number(e.target.value) || 0 })}
            min={0}
            step={100}
          />
          <p className="text-xs text-gray-600">
            Bruttoeinkommen des Kindes pro Jahr
          </p>
        </div>
      )}
    </>
  )
}

/**
 * Depot comparison column
 */
function DepotColumn({
  title,
  endValue,
  taxAmount,
  effectiveRate,
  isChild,
}: {
  title: string
  endValue: number
  taxAmount: number
  effectiveRate: number
  isChild: boolean
}) {
  const taxColor = isChild ? 'text-green-600' : 'text-red-600'
  return (
    <div>
      <h5 className="text-sm font-semibold text-gray-700 mb-2">{title}</h5>
      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span>Endkapital:</span>
          <span className="font-semibold">{formatCurrency(endValue)}</span>
        </div>
        <div className="flex justify-between">
          <span>Steuerlast:</span>
          <span className={taxColor}>{formatCurrency(taxAmount)}</span>
        </div>
        <div className="flex justify-between">
          <span>Effektiver Steuersatz:</span>
          <span className={taxColor}>{(effectiveRate * 100).toFixed(2)}%</span>
        </div>
      </div>
    </div>
  )
}

/**
 * Tax savings summary
 */
function TaxSavingsSummary({
  totalSavings,
  averageAnnualSavings,
}: {
  totalSavings: number
  averageAnnualSavings: number
}) {
  return (
    <div className="pt-4 border-t border-green-300">
      <div className="bg-white rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <Calculator className="h-5 w-5 text-green-600" />
          <span className="font-semibold text-green-800">Gesamte Steuerersparnis</span>
        </div>
        <div className="text-3xl font-bold text-green-700 mb-1">{formatCurrency(totalSavings)}</div>
        <div className="text-sm text-gray-600">
          Durchschnittlich {formatCurrency(averageAnnualSavings)} pro Jahr
        </div>
      </div>
    </div>
  )
}

/**
 * Validation error display
 */
function ValidationErrorAlert({ errors }: { errors: string[] }) {
  return (
    <Alert>
      <Info className="h-4 w-4" />
      <AlertDescription>
        <div className="font-semibold mb-2">Konfiguration unvollständig</div>
        <ul className="list-disc list-inside space-y-1 text-sm">
          {errors.map((error, index) => (
            <li key={index}>{error}</li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  )
}

/**
 * Tax savings preview card
 */
function TaxSavingsPreview({ config }: { config: DepotAufKindConfig }) {
  const validation = validateDepotAufKindConfig(config)
  if (!validation.isValid) {
    return <ValidationErrorAlert errors={validation.errors} />
  }

  const result = simulateDepotAufKind(config)

  return (
    <Card className="bg-green-50 border-green-200">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-600" />
          Steueroptimierungs-Potenzial
        </CardTitle>
        <CardDescription>Vergleich: Depot auf Kind vs. Depot der Eltern</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DepotColumn
            title="📊 Depot des Kindes"
            endValue={result.summary.finalDepotValue}
            taxAmount={result.summary.totalTaxPaidByChild}
            effectiveRate={result.summary.effectiveTaxRateChild}
            isChild={true}
          />
          <DepotColumn
            title="👨‍👩‍👧‍👦 Depot der Eltern"
            endValue={result.summary.finalDepotValueIfParent}
            taxAmount={result.summary.totalTaxIfParentDepot}
            effectiveRate={result.summary.effectiveTaxRateParent}
            isChild={false}
          />
        </div>
        <TaxSavingsSummary
          totalSavings={result.summary.totalTaxSavings}
          averageAnnualSavings={result.summary.averageAnnualTaxSavings}
        />
      </CardContent>
    </Card>
  )
}

/**
 * Information card about tax benefits
 */
function TaxBenefitsInfo() {
  return (
    <Alert>
      <Shield className="h-4 w-4" />
      <AlertDescription>
        <div className="font-semibold mb-2">🎓 Steuervorteile der Depot-auf-Kind-Strategie</div>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>
            <strong>Sparerpauschbetrag:</strong> {formatCurrency(CHILD_TAX_ALLOWANCES.SPARERPAUSCHBETRAG)} pro Jahr
            steuerfrei
          </li>
          <li>
            <strong>Grundfreibetrag:</strong> {formatCurrency(CHILD_TAX_ALLOWANCES.GRUNDFREIBETRAG)} auf alle Einkünfte
          </li>
          <li>
            <strong>Niedrigere Steuersätze:</strong> Bei geringem Einkommen zahlt das Kind weniger Steuern als die Eltern
          </li>
          <li>
            <strong>Teilfreistellung:</strong> Aktienfonds profitieren von 30% Steuerfreistellung
          </li>
          <li>
            <strong>Langfristiger Vorteil:</strong> Über viele Jahre summiert sich die Steuerersparnis erheblich
          </li>
        </ul>
      </AlertDescription>
    </Alert>
  )
}

/**
 * Optimal transfer timing recommendation
 */
function TransferTimingRecommendation({ config }: { config: DepotAufKindConfig }) {
  // Calculate optimal transfer timing
  const studyStartYear = config.birthYear + 19 // Typical study start age
  const studyDuration = 5 // Typical bachelor + master duration

  const timing = calculateOptimalTransferTiming(config.birthYear, studyStartYear, studyDuration)

  return (
    <Alert className="bg-blue-50 border-blue-200">
      <Info className="h-4 w-4 text-blue-600" />
      <AlertDescription>
        <div className="font-semibold text-blue-900 mb-2">💡 Empfehlung: Optimaler Übertragungszeitpunkt</div>
        <p className="text-sm text-blue-800">{timing.reasoning}</p>
      </AlertDescription>
    </Alert>
  )
}

/**
 * Main component
 */
export function DepotAufKindConfigSection({
  config,
  onUpdate,
  currentYear,
}: DepotAufKindConfigSectionProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>👶 Depot-auf-Kind-Strategie</CardTitle>
          <CardDescription>
            Steueroptimierte Kapitalanlage auf den Namen des Kindes zur Finanzierung der Ausbildung
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <TaxBenefitsInfo />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Kind & Depot</h4>
              <ChildInfoFields config={config} currentYear={currentYear} onUpdate={onUpdate} />
              <DepotConfigFields config={config} onUpdate={onUpdate} />
              <AssetTypeSelector config={config} onUpdate={onUpdate} />
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Steuerliche Situation</h4>
              <ParentTaxFields config={config} onUpdate={onUpdate} />
              <ChildIncomeFields config={config} onUpdate={onUpdate} />
            </div>
          </div>
        </CardContent>
      </Card>

      <TransferTimingRecommendation config={config} />

      <TaxSavingsPreview config={config} />
    </div>
  )
}
