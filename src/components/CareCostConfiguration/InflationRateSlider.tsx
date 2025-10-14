import { Label } from '../ui/label'
import { Slider } from '../ui/slider'

interface InflationRateSliderProps {
  value: number
  onChange: (value: number) => void
}

export function InflationRateSlider({
  value,
  onChange,
}: InflationRateSliderProps) {
  return (
    <div className="space-y-2">
      <Label>
        Inflationsrate für Pflegekosten:
        {' '}
        {value}
        %
      </Label>
      <Slider
        value={[value]}
        onValueChange={vals => onChange(vals[0])}
        min={0}
        max={10}
        step={0.5}
        className="mt-2"
      />
      <div className="flex justify-between text-sm text-gray-500">
        <span>0%</span>
        <span className="font-medium text-gray-900">
          {value}
          %
        </span>
        <span>10%</span>
      </div>
      <div className="text-sm text-muted-foreground">
        Jährliche Steigerung der Pflegekosten
      </div>
    </div>
  )
}
