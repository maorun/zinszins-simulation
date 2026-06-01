import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Switch } from '../ui/switch'
import { generateFormId } from '../../utils/unique-id'
import { getErtragsanteil, calculateAgeAtBUStart } from '../../../helpers/bu-case'
import type { EventFormValues } from './EventFormFields'

interface BUCaseFieldsProps {
  formValues: EventFormValues
  onFormChange: (values: EventFormValues) => void
}

interface FieldProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  helpText?: string
  min?: string
  max?: string
  step?: string
}

function NumberInputField({ id, label, value, onChange, placeholder, helpText, min, max, step }: FieldProps) {
  return (
    <div className="space-y-1">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="number"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step ?? '1'}
      />
      {helpText && <p className="text-xs text-gray-600">{helpText}</p>}
    </div>
  )
}

interface BUCaseInfoBoxProps {
  buStartYear: string
  buEndYear: string
  buBirthYear: string
  applyLeibrentenBesteuerung: boolean
}

function getErtragsanteilText(age: number, apply: boolean): string | null {
  if (!apply) return null
  const pct = getErtragsanteil(age)
  return `Ertragsanteil nach § 22 EStG: ${pct}% steuerpflichtig (${100 - pct}% steuerfrei)`
}

function getBUPeriodDescription(isTemporary: boolean, startYear: number, endYear: number | null): string {
  if (!isTemporary) {
    return `Die BU beginnt ${startYear} und gilt dauerhaft bis zum Lebensende.`
  }
  return `Die BU dauert von ${startYear} bis ${endYear} (${(endYear ?? 0) - startYear} Jahre). Danach entfällt der Effekt.`
}

function BUCaseInfoBox({ buStartYear, buEndYear, buBirthYear, applyLeibrentenBesteuerung }: BUCaseInfoBoxProps) {
  const startYear = Number(buStartYear)
  const birthYear = Number(buBirthYear)

  if (!startYear || !birthYear) {
    return (
      <div className="p-3 bg-purple-50 rounded border border-purple-200">
        <p className="text-xs text-purple-800">
          <strong>ℹ️ Hinweis:</strong> Bitte füllen Sie Geburtsjahr und BU-Beginn aus, um weitere Informationen zu
          erhalten.
        </p>
      </div>
    )
  }

  const isTemporary = buEndYear.trim() !== ''
  const endYear = isTemporary ? Number(buEndYear) : null
  const ageAtBUStart = calculateAgeAtBUStart(birthYear, startYear)
  const ertragsanteilText = getErtragsanteilText(ageAtBUStart, applyLeibrentenBesteuerung)
  const caseTypeLabel = isTemporary ? '⏱️ Zeitlich begrenzter BU-Fall' : '♾️ Dauerhafter BU-Fall'
  const durationText = endYear ? ` | Dauer: ${endYear - startYear} Jahre` : ''
  const periodText = getBUPeriodDescription(isTemporary, startYear, endYear)

  return (
    <div className="p-3 bg-purple-50 rounded border border-purple-200 space-y-2">
      <p className="text-xs text-purple-800 font-semibold">ℹ️ Zusammenfassung: {caseTypeLabel}</p>
      <p className="text-xs text-purple-700">
        Alter bei BU-Beginn: <strong>{ageAtBUStart} Jahre</strong>{durationText}
      </p>
      {ertragsanteilText && <p className="text-xs text-purple-700">{ertragsanteilText}</p>}
      <p className="text-xs text-purple-700">{periodText}</p>
    </div>
  )
}

interface BUPersonalFieldsProps {
  ids: {
    buBirthYear: string
    buStartYear: string
    buEndYear: string
  }
  currentYear: number
  formValues: EventFormValues
  onFormChange: (values: EventFormValues) => void
}

function BUPersonalFields({ ids, currentYear, formValues, onFormChange }: BUPersonalFieldsProps) {
  return (
    <>
      <NumberInputField
        id={ids.buBirthYear}
        label="Geburtsjahr des Versicherten *"
        value={formValues.buBirthYear}
        onChange={v => onFormChange({ ...formValues, buBirthYear: v })}
        placeholder={String(currentYear - 40)}
        min="1920"
        max={String(currentYear)}
        helpText="Wird für die Altersberechnung beim BU-Beginn benötigt"
      />
      <NumberInputField
        id={ids.buStartYear}
        label="Beginn der Berufsunfähigkeit (Jahr) *"
        value={formValues.buStartYear}
        onChange={v => onFormChange({ ...formValues, buStartYear: v })}
        placeholder={String(currentYear)}
        min={String(currentYear - 10)}
        max="2100"
        helpText="Jahr, ab dem die BU-Leistungen beginnen"
      />
      <NumberInputField
        id={ids.buEndYear}
        label="Ende der Berufsunfähigkeit (Jahr, leer = dauerhaft)"
        value={formValues.buEndYear}
        onChange={v => onFormChange({ ...formValues, buEndYear: v })}
        placeholder="Dauerhaft (leer lassen)"
        min={String(currentYear)}
        max="2100"
        helpText="Leer lassen für dauerhaften BU-Fall (unbegrenzt). Jahresangabe für zeitlich begrenzten Fall."
      />
    </>
  )
}

interface BUFinancialFieldsProps {
  ids: {
    monthlyBUPension: string
    monthlyIncomeReduction: string
  }
  formValues: EventFormValues
  onFormChange: (values: EventFormValues) => void
}

function BUFinancialFields({ ids, formValues, onFormChange }: BUFinancialFieldsProps) {
  return (
    <>
      <NumberInputField
        id={ids.monthlyBUPension}
        label="Monatliche BU-Rente (€) *"
        value={formValues.monthlyBUPension}
        onChange={v => onFormChange({ ...formValues, monthlyBUPension: v })}
        placeholder="z.B. 2000"
        min="0"
        helpText="Monatliche Leistung aus der BU-Versicherung"
      />
      <NumberInputField
        id={ids.monthlyIncomeReduction}
        label="Monatlicher Einkommensverlust durch BU (€)"
        value={formValues.monthlyIncomeReduction}
        onChange={v => onFormChange({ ...formValues, monthlyIncomeReduction: v })}
        placeholder="z.B. 3500"
        min="0"
        helpText="Monatliches Einkommen, das durch die BU wegfällt (z.B. Gehalt). Der Nettoeffekt = BU-Rente − Einkommensverlust."
      />
    </>
  )
}

interface BULeibrentenSwitchProps {
  id: string
  checked: boolean
  onChange: (checked: boolean) => void
}

function BULeibrentenSwitch({ id, checked, onChange }: BULeibrentenSwitchProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className="text-sm font-medium">
          Leibrenten-Besteuerung anwenden (§ 22 EStG)
        </Label>
        <Switch id={id} checked={checked} onCheckedChange={onChange} />
      </div>
      <p className="text-xs text-gray-600">
        {checked
          ? 'Aktiviert: Nur der altersabhängige Ertragsanteil der BU-Rente ist steuerpflichtig (§ 22 EStG)'
          : 'Deaktiviert: Die gesamte BU-Rente gilt als voll steuerpflichtig'}
      </p>
    </div>
  )
}

export function BUCaseFields({ formValues, onFormChange }: BUCaseFieldsProps) {
  const ids = useMemo(
    () => ({
      buStartYear: generateFormId('bu-case', 'start-year'),
      buEndYear: generateFormId('bu-case', 'end-year'),
      monthlyBUPension: generateFormId('bu-case', 'monthly-pension'),
      monthlyIncomeReduction: generateFormId('bu-case', 'income-reduction'),
      buBirthYear: generateFormId('bu-case', 'birth-year'),
      leibrentenSwitch: generateFormId('bu-case', 'leibrenten-switch'),
    }),
    [],
  )

  const currentYear = new Date().getFullYear()

  return (
    <Card nestingLevel={2} className="mb-4">
      <CardHeader nestingLevel={2}>
        <CardTitle className="text-left text-base">🦽 BU-Fall-Details (Berufsunfähigkeit)</CardTitle>
      </CardHeader>
      <CardContent nestingLevel={2}>
        <div className="space-y-4">
          <BUPersonalFields ids={ids} currentYear={currentYear} formValues={formValues} onFormChange={onFormChange} />
          <BUFinancialFields ids={ids} formValues={formValues} onFormChange={onFormChange} />
          <BULeibrentenSwitch
            id={ids.leibrentenSwitch}
            checked={formValues.applyLeibrentenBesteuerung}
            onChange={checked => onFormChange({ ...formValues, applyLeibrentenBesteuerung: checked })}
          />
          <BUCaseInfoBox
            buStartYear={formValues.buStartYear}
            buEndYear={formValues.buEndYear}
            buBirthYear={formValues.buBirthYear}
            applyLeibrentenBesteuerung={formValues.applyLeibrentenBesteuerung}
          />
        </div>
      </CardContent>
    </Card>
  )
}
