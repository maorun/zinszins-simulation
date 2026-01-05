import { useMemo } from 'react'
import { ConfigurableSlider } from '../ConfigurableSlider'
import { Label } from '../ui/label'
import { generateFormId } from '../../utils/unique-id'

interface KapitalverzehrFormValues {
  kapitalverzehrTargetAge: number
  kapitalverzehrSafetyBuffer: number
  kapitalverzehrMinRate?: number
  kapitalverzehrMaxRate?: number
}

interface KapitalverzehrConfigValues {
  targetAge: number
  safetyBuffer: number
  minWithdrawalRate?: number
  maxWithdrawalRate?: number
}

interface KapitalverzehrChangeHandlers {
  onTargetAgeChange: (value: number) => void
  onSafetyBufferChange: (value: number) => void
  onMinWithdrawalRateChange?: (value: number) => void
  onMaxWithdrawalRateChange?: (value: number) => void
}

interface KapitalverzehrWithdrawalConfigurationProps {
  formValue?: KapitalverzehrFormValues
  values?: KapitalverzehrConfigValues
  onChange?: KapitalverzehrChangeHandlers
  birthYear?: number
}

export type { KapitalverzehrConfigValues, KapitalverzehrChangeHandlers }

function normalizeFormValues(formValue: KapitalverzehrFormValues): KapitalverzehrConfigValues {
  return {
    targetAge: formValue.kapitalverzehrTargetAge,
    safetyBuffer: formValue.kapitalverzehrSafetyBuffer,
    minWithdrawalRate: formValue.kapitalverzehrMinRate ? formValue.kapitalverzehrMinRate / 100 : undefined,
    maxWithdrawalRate: formValue.kapitalverzehrMaxRate ? formValue.kapitalverzehrMaxRate / 100 : undefined,
  }
}

function getCurrentAge(birthYear?: number): number | undefined {
  if (!birthYear) return undefined
  return new Date().getFullYear() - birthYear
}

function getDescription(label: string, currentAge?: number, effectiveTargetAge?: number): string {
  if (label === 'targetAge') {
    return `Zielalter für vollständigen Kapitalverzehr${currentAge ? ` (aktuell ${currentAge} Jahre alt)` : ''}`
  }
  if (label === 'safetyBuffer' && effectiveTargetAge) {
    return `Zusätzliche Jahre für Langlebigkeitsrisiko (Planung bis Alter ${effectiveTargetAge})`
  }
  return ''
}

function InfoSection({ currentAge, effectiveTargetAge }: { currentAge?: number; effectiveTargetAge: number }) {
  const yearsRemaining = currentAge ? effectiveTargetAge - currentAge : undefined

  return (
    <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
      <Label className="text-sm font-medium text-blue-900 mb-2">ℹ️ Funktionsweise</Label>
      <ul className="text-xs text-blue-800 space-y-1 mt-2">
        <li>• Berechnet jährliche Entnahme zur vollständigen Kapitalnutzung bis zum Zielalter</li>
        <li>• Verwendet Rentenbarwertformel für gleichmäßige Verteilung</li>
        <li>• Berücksichtigt erwartete Rendite für realistische Entnahmebeträge</li>
        <li>• Sicherheitspuffer schützt vor Langlebigkeitsrisiko</li>
        {yearsRemaining && (
          <li className="font-medium mt-2">
            → {yearsRemaining} Jahre bis zum effektiven Zielalter ({effectiveTargetAge})
          </li>
        )}
      </ul>
    </div>
  )
}

export function KapitalverzehrWithdrawalConfiguration({
  formValue,
  values,
  onChange,
  birthYear,
}: KapitalverzehrWithdrawalConfigurationProps) {
  const isFormMode = formValue !== undefined
  const isDirectMode = values !== undefined && onChange !== undefined

  if (!isFormMode && !isDirectMode) {
    throw new Error('KapitalverzehrWithdrawalConfiguration requires either formValue or (values + onChange)')
  }

  const currentValues = isFormMode ? normalizeFormValues(formValue!) : values!
  const currentAge = getCurrentAge(birthYear)
  const effectiveTargetAge = currentValues.targetAge + currentValues.safetyBuffer

  const targetAgeId = useMemo(() => generateFormId('kapitalverzehr', 'target-age'), [])
  const safetyBufferId = useMemo(() => generateFormId('kapitalverzehr', 'safety-buffer'), [])

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
      <div className="mb-2">
        <h4 className="text-sm font-medium mb-1">Kapitalverzehrsplan Konfiguration</h4>
        <p className="text-xs text-gray-600">
          Geplanter vollständiger Kapitalverzehr bis zum Zielalter.
        </p>
      </div>

      <ConfigurableSlider
        id={isFormMode ? 'kapitalverzehrTargetAge' : targetAgeId}
        label="Zielalter"
        value={currentValues.targetAge}
        onChange={value => isDirectMode && onChange!.onTargetAgeChange(value)}
        min={currentAge ? currentAge + 5 : 65}
        max={120}
        step={1}
        formatValue={v => `${v} Jahre`}
        description={getDescription('targetAge', currentAge)}
      />

      <ConfigurableSlider
        id={isFormMode ? 'kapitalverzehrSafetyBuffer' : safetyBufferId}
        label="Sicherheitspuffer (Jahre)"
        value={currentValues.safetyBuffer}
        onChange={value => isDirectMode && onChange!.onSafetyBufferChange(value)}
        min={0}
        max={15}
        step={1}
        formatValue={v => `${v} Jahre`}
        description={getDescription('safetyBuffer', currentAge, effectiveTargetAge)}
      />

      <InfoSection currentAge={currentAge} effectiveTargetAge={effectiveTargetAge} />
    </div>
  )
}
