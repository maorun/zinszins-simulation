import { Slider } from './ui/slider'
import { Label } from './ui/label'

interface PercentageSliderProps {
  label: string
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step: number
  helpText: string
  decimals?: number
}

export function PercentageSlider({
  label,
  value,
  onChange,
  min,
  max,
  step,
  helpText,
  decimals = 1,
}: PercentageSliderProps) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="space-y-2">
        <Slider
          value={[value * 100]}
          onValueChange={(values: number[]) => {
            onChange(values[0] / 100)
          }}
          min={min}
          max={max}
          step={step}
          className="mt-2"
        />
        <div className="flex justify-between text-sm text-gray-500">
          <span>
            {min}
            %
          </span>
          <span className="font-medium text-gray-900">
            {(value * 100).toFixed(decimals)}
            %
          </span>
          <span>
            {max}
            %
          </span>
        </div>
      </div>
      <div className="text-sm text-muted-foreground">{helpText}</div>
    </div>
  )
}
