import { Label } from '../ui/label'
import { Slider } from '../ui/slider'
import type { OtherIncomeSource } from '../../../helpers/other-income'

interface TaxRateSectionProps {
  editingSource: OtherIncomeSource
  onUpdate: (source: OtherIncomeSource) => void
}

export function TaxRateSection({ editingSource, onUpdate }: TaxRateSectionProps) {
  return (
    <div className="space-y-2">
      <Label>Steuersatz (%)</Label>
      <Slider
        value={[editingSource.taxRate]}
        onValueChange={(values) =>
          onUpdate({
            ...editingSource,
            taxRate: values[0],
          })
        }
        min={0}
        max={50}
        step={0.5}
        className="mt-2"
      />
      <div className="flex justify-between text-sm text-gray-500">
        <span>0%</span>
        <span className="font-medium text-gray-900">{editingSource.taxRate.toFixed(1)}%</span>
        <span>50%</span>
      </div>
    </div>
  )
}
