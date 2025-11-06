import { Label } from './ui/label'
import { Slider } from './ui/slider'

interface FixedReturnConfigProps {
  fixedRate: number | undefined
  onFixedRateChange: (rate: number) => void
}

export function SegmentFixedReturnConfig({ fixedRate, onFixedRateChange }: FixedReturnConfigProps) {
  const rate = fixedRate || 0.05

  return (
    <div className="mb-4 space-y-2">
      <Label>Erwartete Rendite (%)</Label>
      <div className="space-y-2">
        <Slider
          value={[rate * 100]}
          min={0}
          max={10}
          step={0.5}
          onValueChange={(value) => onFixedRateChange(value[0] / 100)}
          className="mt-2"
        />
        <div className="flex justify-between text-sm text-gray-500">
          <span>0%</span>
          <span className="font-medium text-gray-900">{(rate * 100).toFixed(1)}%</span>
          <span>10%</span>
        </div>
      </div>
    </div>
  )
}
