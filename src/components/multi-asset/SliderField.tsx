import { Label } from '../ui/label'
import { Slider } from '../ui/slider'

interface SliderFieldProps {
  /** Label text to display */
  label: string
  /** Current value (as decimal, will be multiplied by 100 for display) */
  value: number
  /** Callback when value changes (receives decimal value) */
  onChange: (value: number) => void
  /** Minimum slider value (in percent) */
  min?: number
  /** Maximum slider value (in percent) */
  max?: number
  /** Step size for slider (in percent) */
  step?: number
}

/**
 * Reusable slider field component with label and percentage display.
 * Used for asset class configuration sliders.
 */
export function SliderField({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
}: SliderFieldProps) {
  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium text-gray-700">
        {label}
        :
        {' '}
        {(value * 100).toFixed(1)}
        %
      </Label>
      <Slider
        value={[value * 100]}
        onValueChange={([newValue]) => onChange(newValue / 100)}
        min={min}
        max={max}
        step={step}
        className="w-full"
      />
    </div>
  )
}
