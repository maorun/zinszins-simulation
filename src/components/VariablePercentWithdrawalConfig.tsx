import { Label } from './ui/label'
import { Slider } from './ui/slider'

interface VariablePercentWithdrawalConfigProps {
  customPercentage: number | undefined
  onCustomPercentageChange: (value: number) => void
}

export function VariablePercentWithdrawalConfig({
  customPercentage,
  onCustomPercentageChange,
}: VariablePercentWithdrawalConfigProps) {
  const percentage = customPercentage || 0.05

  return (
    <div className="mb-4 space-y-2">
      <Label>Entnahme-Prozentsatz (%)</Label>
      <div className="space-y-2">
        <Slider
          value={[percentage * 100]}
          min={2}
          max={7}
          step={0.5}
          onValueChange={value => onCustomPercentageChange(value[0] / 100)}
          className="mt-2"
        />
        <div className="flex justify-between text-sm text-gray-500">
          <span>2%</span>
          <span className="font-medium text-gray-900">
            {(percentage * 100).toFixed(1)}
            %
          </span>
          <span>7%</span>
        </div>
      </div>
    </div>
  )
}
