import { Input } from './ui/input'
import { Label } from './ui/label'
import { Slider } from './ui/slider'
import { Switch } from './ui/switch'
import type { MonthlyWithdrawalConfig as MonthlyConfig } from '../../helpers/withdrawal'

interface MonthlyWithdrawalConfigProps {
  monthlyConfig: MonthlyConfig | undefined
  onMonthlyConfigChange: (config: MonthlyConfig) => void
}

/**
 * Monthly amount input field
 */
function MonthlyAmountInput({
  monthlyAmount,
  onMonthlyConfigChange,
  monthlyConfig,
}: {
  monthlyAmount: number
  onMonthlyConfigChange: (config: MonthlyConfig) => void
  monthlyConfig: MonthlyConfig | undefined
}) {
  return (
    <div className="mb-4 space-y-2">
      <Label>Monatlicher Betrag (€)</Label>
      <Input
        type="number"
        value={monthlyAmount}
        onChange={(e) => {
          const value = e.target.value ? Number(e.target.value) : 2000
          onMonthlyConfigChange({ ...monthlyConfig, monthlyAmount: value })
        }}
        min={100}
        max={50000}
        step={100}
      />
    </div>
  )
}

/**
 * Threshold slider with percentage display
 */
function ThresholdSlider({
  guardrailsThreshold,
  monthlyAmount,
  monthlyConfig,
  onMonthlyConfigChange,
}: {
  guardrailsThreshold: number
  monthlyAmount: number
  monthlyConfig: MonthlyConfig | undefined
  onMonthlyConfigChange: (config: MonthlyConfig) => void
}) {
  return (
    <div className="mb-4 space-y-2">
      <Label>Anpassungsschwelle (%)</Label>
      <div className="space-y-2">
        <Slider
          value={[guardrailsThreshold * 100]}
          min={5}
          max={20}
          step={1}
          onValueChange={value => onMonthlyConfigChange({
            ...monthlyConfig,
            monthlyAmount,
            guardrailsThreshold: value[0] / 100,
          })}
          className="mt-2"
        />
        <div className="flex justify-between text-sm text-gray-500">
          <span>5%</span>
          <span className="font-medium text-gray-900">
            {(guardrailsThreshold * 100).toFixed(0)}
            %
          </span>
          <span>20%</span>
        </div>
      </div>
    </div>
  )
}

/**
 * Guardrails configuration section
 */
function GuardrailsConfig({
  enableGuardrails,
  guardrailsThreshold,
  monthlyAmount,
  monthlyConfig,
  onMonthlyConfigChange,
}: {
  enableGuardrails: boolean
  guardrailsThreshold: number
  monthlyAmount: number
  monthlyConfig: MonthlyConfig | undefined
  onMonthlyConfigChange: (config: MonthlyConfig) => void
}) {
  return (
    <>
      <div className="mb-4 space-y-2">
        <Label>Dynamische Anpassung (Guardrails)</Label>
        <Switch
          checked={enableGuardrails}
          onCheckedChange={(checked: boolean) => onMonthlyConfigChange({
            ...monthlyConfig,
            monthlyAmount,
            enableGuardrails: checked,
          })}
        />
      </div>

      {enableGuardrails && (
        <ThresholdSlider
          guardrailsThreshold={guardrailsThreshold}
          monthlyAmount={monthlyAmount}
          monthlyConfig={monthlyConfig}
          onMonthlyConfigChange={onMonthlyConfigChange}
        />
      )}
    </>
  )
}

export function MonthlyWithdrawalConfig({
  monthlyConfig,
  onMonthlyConfigChange,
}: MonthlyWithdrawalConfigProps) {
  const monthlyAmount = monthlyConfig?.monthlyAmount || 2000
  const enableGuardrails = monthlyConfig?.enableGuardrails || false
  const guardrailsThreshold = monthlyConfig?.guardrailsThreshold || 0.10

  return (
    <>
      <MonthlyAmountInput
        monthlyAmount={monthlyAmount}
        onMonthlyConfigChange={onMonthlyConfigChange}
        monthlyConfig={monthlyConfig}
      />
      <GuardrailsConfig
        enableGuardrails={enableGuardrails}
        guardrailsThreshold={guardrailsThreshold}
        monthlyAmount={monthlyAmount}
        monthlyConfig={monthlyConfig}
        onMonthlyConfigChange={onMonthlyConfigChange}
      />
    </>
  )
}
