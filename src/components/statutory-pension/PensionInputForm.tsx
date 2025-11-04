import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Slider } from '../ui/slider'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Calculator } from 'lucide-react'
import { useFormId } from '../../utils/unique-id'
import { TaxReturnDataForm } from './TaxReturnDataForm'

type PensionFormValues = {
  monthlyAmount: number
  annualIncreaseRate: number
  taxablePercentage: number
  retirementAge?: number
  startYear: number
  hasTaxReturnData: boolean
  taxYear: number
  annualPensionReceived: number
  taxablePortion: number
}

type PensionFormHandlers = {
  onMonthlyAmountChange: (amount: number) => void
  onAnnualIncreaseRateChange: (rate: number) => void
  onTaxablePercentageChange: (percentage: number) => void
  onRetirementAgeChange: (age: number) => void
  onTaxReturnDataChange: (data: {
    hasTaxReturnData: boolean
    taxYear: number
    annualPensionReceived: number
    taxablePortion: number
  }) => void
}

interface PensionInputFormProps {
  values: PensionFormValues
  onChange: PensionFormHandlers
  nestingLevel: number
  birthYear?: number
  spouseBirthYear?: number
  currentYear: number
  planningMode: 'individual' | 'couple'
  onImportFromTaxReturn: () => void
}

/**
 * Tax return data import section
 */
function TaxReturnDataImport({
  values,
  onChange,
  nestingLevel,
  currentYear,
  onImportFromTaxReturn,
}: {
  values: PensionFormValues
  onChange: PensionFormHandlers
  nestingLevel: number
  currentYear: number
  onImportFromTaxReturn: () => void
}) {
  return (
    <Card nestingLevel={nestingLevel + 1}>
      <CardHeader nestingLevel={nestingLevel + 1} className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Calculator className="h-4 w-4" />
          Daten aus Rentenbescheid importieren
        </CardTitle>
      </CardHeader>
      <CardContent nestingLevel={nestingLevel + 1} className="space-y-4">
        <TaxReturnDataForm
          values={values}
          onChange={onChange.onTaxReturnDataChange}
          currentYear={currentYear}
          onImportFromTaxReturn={onImportFromTaxReturn}
        />
      </CardContent>
    </Card>
  )
}

/**
 * Individual planning mode display
 */
function IndividualPlanningDisplay({
  birthYear,
  values,
}: {
  birthYear?: number
  values: PensionFormValues
}) {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-gray-600">Geburtsjahr:</span>
          <div className="font-medium">{birthYear || 'Nicht festgelegt'}</div>
        </div>
        <div>
          <span className="text-gray-600">Renteneintrittsalter:</span>
          <div className="font-medium">
            {values.retirementAge || 67}
            {' '}
            Jahre
          </div>
        </div>
      </div>
      <div className="pt-2 border-t border-green-200">
        <span className="text-gray-600">Berechneter Rentenbeginn:</span>
        <div className="text-lg font-bold text-green-800">
          {birthYear ? values.startYear : '—'}
        </div>
      </div>
    </div>
  )
}

/**
 * Couple planning mode display
 */
function CouplePlanningDisplay({
  birthYear,
  spouseBirthYear,
  values,
}: {
  birthYear?: number
  spouseBirthYear?: number
  values: PensionFormValues
}) {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-gray-600">Person 1 (Geburtsjahr):</span>
          <div className="font-medium">{birthYear || 'Nicht festgelegt'}</div>
        </div>
        <div>
          <span className="text-gray-600">Person 2 (Geburtsjahr):</span>
          <div className="font-medium">{spouseBirthYear || 'Nicht festgelegt'}</div>
        </div>
      </div>
      <div className="text-sm">
        <span className="text-gray-600">Renteneintrittsalter:</span>
        <span className="font-medium ml-1">
          {values.retirementAge || 67}
          {' '}
          Jahre (beide Partner)
        </span>
      </div>
      <div className="pt-2 border-t border-green-200">
        <span className="text-gray-600">Berechneter Rentenbeginn (frühester Partner):</span>
        <div className="text-lg font-bold text-green-800">
          {(birthYear && spouseBirthYear) ? values.startYear : '—'}
        </div>
      </div>
    </div>
  )
}

/**
 * Automatic retirement start year display section
 */
function RetirementStartDisplay({
  planningMode,
  birthYear,
  spouseBirthYear,
  values,
  onChange,
}: {
  planningMode: 'individual' | 'couple'
  birthYear?: number
  spouseBirthYear?: number
  values: PensionFormValues
  onChange: PensionFormHandlers
}) {
  const missingBirthYear = !birthYear || (planningMode === 'couple' && !spouseBirthYear)

  return (
    <div className="space-y-4">
      <div className="p-3 bg-green-50 rounded-lg space-y-3">
        <div className="text-sm font-medium text-green-900">Automatischer Rentenbeginn</div>

        {planningMode === 'individual' ? (
          <IndividualPlanningDisplay birthYear={birthYear} values={values} />
        ) : (
          <CouplePlanningDisplay birthYear={birthYear} spouseBirthYear={spouseBirthYear} values={values} />
        )}

        {missingBirthYear && (
          <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded border border-orange-200">
            Bitte Geburtsjahr(e) in der Globalen Planung festlegen
          </div>
        )}
      </div>

      {/* Retirement Age Configuration */}
      <div className="space-y-2">
        <Label htmlFor="retirement-age">Renteneintrittsalter</Label>
        <Input
          id="retirement-age"
          type="number"
          value={values.retirementAge || 67}
          onChange={e => onChange.onRetirementAgeChange(Number(e.target.value))}
          min={60}
          max={75}
          className="w-32"
        />
        <div className="text-sm text-muted-foreground">
          Geplantes Alter für den Renteneintritt.
          Wird automatisch zur Berechnung des Rentenbeginns verwendet.
        </div>
      </div>
    </div>
  )
}

function MonthlyPensionField({
  values,
  onChange,
}: {
  values: PensionFormValues
  onChange: PensionFormHandlers
}) {
  const monthlyAmountId = useFormId('statutory-pension', 'monthly-amount', 'input-form')
  return (
    <div className="space-y-2">
      <Label htmlFor={monthlyAmountId}>Monatliche Rente (brutto) €</Label>
      <Input
        id={monthlyAmountId}
        type="number"
        value={values.monthlyAmount}
        onChange={e => onChange.onMonthlyAmountChange(Number(e.target.value))}
        min={0}
        step={50}
        className="w-40"
      />
      <div className="text-sm text-muted-foreground">
        Jährliche Rente:
        {' '}
        {(values.monthlyAmount * 12).toLocaleString('de-DE')}
        {' '}
        €
      </div>
    </div>
  )
}

function AnnualIncreaseRateField({
  values,
  onChange,
}: {
  values: PensionFormValues
  onChange: PensionFormHandlers
}) {
  return (
    <div className="space-y-2">
      <Label>Jährliche Rentenanpassung (%)</Label>
      <div className="space-y-2">
        <Slider
          value={[values.annualIncreaseRate]}
          onValueChange={vals => onChange.onAnnualIncreaseRateChange(vals[0])}
          min={0}
          max={5}
          step={0.1}
          className="mt-2"
        />
        <div className="flex justify-between text-sm text-gray-500">
          <span>0%</span>
          <span className="font-medium text-gray-900">
            {values.annualIncreaseRate.toFixed(1)}
            %
          </span>
          <span>5%</span>
        </div>
      </div>
      <div className="text-sm text-muted-foreground">
        Historisch schwanken Rentenerhöhungen zwischen 0-4% pro Jahr.
      </div>
    </div>
  )
}

function TaxablePercentageField({
  values,
  onChange,
}: {
  values: PensionFormValues
  onChange: PensionFormHandlers
}) {
  return (
    <div className="space-y-2">
      <Label>Steuerpflichtiger Anteil (%)</Label>
      <div className="space-y-2">
        <Slider
          value={[values.taxablePercentage]}
          onValueChange={vals => onChange.onTaxablePercentageChange(vals[0])}
          min={50}
          max={100}
          step={1}
          className="mt-2"
        />
        <div className="flex justify-between text-sm text-gray-500">
          <span>50%</span>
          <span className="font-medium text-gray-900">
            {values.taxablePercentage.toFixed(0)}
            %
          </span>
          <span>100%</span>
        </div>
      </div>
      <div className="text-sm text-muted-foreground">
        Der steuerpflichtige Anteil hängt vom Rentenbeginn ab. Aktuelle Werte: ~80%.
      </div>
    </div>
  )
}

export function PensionInputForm({
  values,
  onChange,
  nestingLevel,
  birthYear,
  spouseBirthYear,
  currentYear,
  planningMode,
  onImportFromTaxReturn,
}: PensionInputFormProps) {
  return (
    <>
      {/* Tax Return Data Import */}
      <TaxReturnDataImport
        values={values}
        onChange={onChange}
        nestingLevel={nestingLevel}
        currentYear={currentYear}
        onImportFromTaxReturn={onImportFromTaxReturn}
      />

      {/* Basic Pension Configuration */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <RetirementStartDisplay
            planningMode={planningMode}
            birthYear={birthYear}
            spouseBirthYear={spouseBirthYear}
            values={values}
            onChange={onChange}
          />
          <MonthlyPensionField values={values} onChange={onChange} />
        </div>

        <AnnualIncreaseRateField values={values} onChange={onChange} />
        <TaxablePercentageField values={values} onChange={onChange} />
      </div>
    </>
  )
}
