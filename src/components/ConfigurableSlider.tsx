import { Slider } from './ui/slider'
import { Label } from './ui/label'

interface ConfigurableSliderProps {
  id: string
  label: string
  value: number
  min: number
  max: number
  step: number
  description: string
  onChange?: (value: number) => void
  formatValue?: (value: number) => string
  disabled?: boolean
}

export function ConfigurableSlider({
  id,
  label,
  value,
  min,
  max,
  step,
  description,
  onChange,
  formatValue = (v) => `${v}%`,
  disabled = false,
}: ConfigurableSliderProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="space-y-2">
        <Slider
          name={id}
          value={[value]}
          onValueChange={onChange ? ([v]) => onChange(v) : undefined}
          min={min}
          max={max}
          step={step}
          className="w-full"
          disabled={disabled}
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{formatValue(min)}</span>
          <span className="font-medium">{formatValue(value)}</span>
          <span>{formatValue(max)}</span>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
