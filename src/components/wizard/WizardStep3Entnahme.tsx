import { useCallback } from 'react'
import { useWithdrawalConfig } from '../../hooks/useWithdrawalConfig'
import type { WithdrawalStrategy } from '../../../helpers/withdrawal'
import { RadioGroup, RadioGroupItem } from '../ui/radio-group'
import { Label } from '../ui/label'

interface StrategyOption {
  value: WithdrawalStrategy
  label: string
  description: string
  icon: string
}

const STRATEGY_OPTIONS: StrategyOption[] = [
  {
    value: '4prozent',
    label: '4 %-Regel',
    description: 'Jährlich 4 % des Startkapitals entnehmen – der Klassiker.',
    icon: '📏',
  },
  {
    value: '3prozent',
    label: '3 %-Regel',
    description: 'Konservativere Entnahme von 3 % – mehr Sicherheitspuffer.',
    icon: '🛡️',
  },
  {
    value: 'monatlich_fest',
    label: 'Monatlicher Festbetrag',
    description: 'Du entnimmst jeden Monat einen fixen Euro-Betrag.',
    icon: '📅',
  },
  {
    value: 'kapitalerhalt',
    label: 'Kapitalerhalt',
    description: 'Nur die realen Erträge entnehmen – das Kapital bleibt erhalten.',
    icon: '🏦',
  },
]

export function WizardStep3Entnahme() {
  const { currentConfig, updateFormValue } = useWithdrawalConfig()
  const currentStrategy = currentConfig.formValue.strategie

  const handleStrategyChange = useCallback(
    (value: string) => {
      updateFormValue({ strategie: value as WithdrawalStrategy })
    },
    [updateFormValue],
  )

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold">🏦 Entnahme-Strategie wählen</h2>
        <p className="text-sm text-muted-foreground">
          Wie möchtest du in der Rente Geld aus deinem Depot entnehmen?
        </p>
      </div>

      <RadioGroup value={currentStrategy} onValueChange={handleStrategyChange} className="space-y-3">
        {STRATEGY_OPTIONS.map(option => (
          <div
            key={option.value}
            className={`flex items-start gap-4 rounded-lg border p-4 cursor-pointer transition-colors ${
              currentStrategy === option.value
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50 hover:bg-muted/50'
            }`}
            onClick={() => handleStrategyChange(option.value)}
          >
            <RadioGroupItem value={option.value} id={`wizard-strategy-${option.value}`} className="mt-0.5" />
            <div className="flex-1 space-y-1">
              <Label htmlFor={`wizard-strategy-${option.value}`} className="cursor-pointer text-base font-medium">
                {option.icon} {option.label}
              </Label>
              <p className="text-sm text-muted-foreground">{option.description}</p>
            </div>
          </div>
        ))}
      </RadioGroup>

      <p className="text-xs text-muted-foreground text-center">
        Weitere Strategien (z.B. variable Prozente, Bucket-Strategie, RMD) sind in der erweiterten Ansicht verfügbar.
      </p>
    </div>
  )
}
