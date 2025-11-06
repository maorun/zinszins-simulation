import { Label } from './ui/label'
import { Slider } from './ui/slider'

interface VariablePercentWithdrawalConfigurationProps {
  variabelProzent: number
  onVariablePercentChange: (percent: number) => void
}

export function VariablePercentWithdrawalConfiguration({
  variabelProzent,
  onVariablePercentChange,
}: VariablePercentWithdrawalConfigurationProps) {
  return (
    <div className="mb-4 space-y-2">
      <Label>Entnahme-Prozentsatz (%)</Label>
      <div className="space-y-2">
        <Slider
          value={[variabelProzent]}
          onValueChange={(values: number[]) => {
            onVariablePercentChange(values[0])
          }}
          min={2}
          max={7}
          step={0.5}
          className="mt-2"
        />
        <div className="flex justify-between text-sm text-gray-500">
          <span>2%</span>
          <span className="font-medium text-gray-900">{variabelProzent}%</span>
          <span>7%</span>
        </div>
      </div>
      <div className="text-sm text-muted-foreground mt-1">
        Wählen Sie einen Entnahme-Prozentsatz zwischen 2% und 7% in 0,5%-Schritten
      </div>
    </div>
  )
}
