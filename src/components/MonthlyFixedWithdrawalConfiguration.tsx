import { Label } from './ui/label'
import { Input } from './ui/input'
import { Switch } from './ui/switch'
import { Slider } from './ui/slider'

export interface FormValueSubset {
  monatlicheBetrag?: number
  guardrailsAktiv: boolean
  guardrailsSchwelle: number
}

interface MonthlyFixedWithdrawalConfigurationProps {
  monatlicheBetrag: number | undefined
  guardrailsAktiv: boolean
  guardrailsSchwelle: number
  onMonthlyAmountChange: (amount: number | undefined) => void
  onGuardrailsActiveChange: (active: boolean) => void
  onGuardrailsThresholdChange: (threshold: number) => void
}

export function MonthlyFixedWithdrawalConfiguration({
  monatlicheBetrag,
  guardrailsAktiv,
  guardrailsSchwelle,
  onMonthlyAmountChange,
  onGuardrailsActiveChange,
  onGuardrailsThresholdChange,
}: MonthlyFixedWithdrawalConfigurationProps) {
  return (
    <>
      <div className="mb-4 space-y-2">
        <Label>Monatlicher Betrag (€)</Label>
        <Input
          type="number"
          value={monatlicheBetrag}
          onChange={(e) => {
            const value = e.target.value ? Number(e.target.value) : undefined
            onMonthlyAmountChange(value)
          }}
          min={100}
          max={50000}
          step={100}
        />
      </div>
      <div className="mb-4 space-y-2">
        <Label>
          Dynamische Anpassung (Guardrails)
        </Label>
        <Switch
          checked={guardrailsAktiv}
          onCheckedChange={onGuardrailsActiveChange}
        />
        <div className="text-sm text-muted-foreground mt-1">
          Passt die Entnahme basierend auf der Portfolio-Performance
          an
        </div>
      </div>
      {guardrailsAktiv && (
        <div className="mb-4 space-y-2">
          <Label>
            Anpassungsschwelle (%)
          </Label>
          <div className="space-y-2">
            <Slider
              value={[guardrailsSchwelle]}
              onValueChange={(values: number[]) => {
                onGuardrailsThresholdChange(values[0])
              }}
              min={5}
              max={20}
              step={1}
              className="mt-2"
            />
            <div className="flex justify-between text-sm text-gray-500">
              <span>5%</span>
              <span className="font-medium text-gray-900">
                {guardrailsSchwelle}
                %
              </span>
              <span>20%</span>
            </div>
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            Bei Überschreitung dieser Schwelle wird die Entnahme
            angepasst
          </div>
        </div>
      )}
    </>
  )
}
