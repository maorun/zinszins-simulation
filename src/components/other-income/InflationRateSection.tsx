import { Label } from '../ui/label'
import { Slider } from '../ui/slider'
import type { OtherIncomeSource } from '../../../helpers/other-income'

interface InflationRateSectionProps {
  editingSource: OtherIncomeSource
  onUpdate: (source: OtherIncomeSource) => void
}

export function InflationRateSection({ editingSource, onUpdate }: InflationRateSectionProps) {
  return (
    <div className="space-y-2">
      <Label>Inflationsanpassung (%)</Label>
      <Slider
        value={[editingSource.inflationRate]}
        onValueChange={values =>
          onUpdate({
            ...editingSource,
            inflationRate: values[0],
          })
        }
        min={0}
        max={8}
        step={0.1}
        className="mt-2"
      />
      <div className="flex justify-between text-sm text-gray-500">
        <span>0%</span>
        <span className="font-medium text-gray-900">{editingSource.inflationRate.toFixed(1)}%</span>
        <span>8%</span>
      </div>
      <p className="text-xs text-gray-600">Jährliche Steigerung der Einkünfte (z.B. Mietanpassungen)</p>
    </div>
  )
}
