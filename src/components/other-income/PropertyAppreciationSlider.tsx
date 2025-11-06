import { Label } from '../ui/label'
import { Slider } from '../ui/slider'
import type { OtherIncomeSource } from '../../../helpers/other-income'

interface PropertyAppreciationSliderProps {
  editingSource: OtherIncomeSource
  onUpdate: (source: OtherIncomeSource) => void
}

export function PropertyAppreciationSlider({ editingSource, onUpdate }: PropertyAppreciationSliderProps) {
  if (!editingSource.realEstateConfig) {
    return null
  }

  return (
    <div className="space-y-2">
      <Label>Jährliche Wertsteigerung (%)</Label>
      <Slider
        value={[editingSource.realEstateConfig.propertyAppreciationRate]}
        onValueChange={(values) =>
          onUpdate({
            ...editingSource,
            realEstateConfig: {
              ...editingSource.realEstateConfig!,
              propertyAppreciationRate: values[0],
            },
          })
        }
        min={0}
        max={8}
        step={0.1}
        className="mt-2"
      />
      <div className="flex justify-between text-sm text-gray-500">
        <span>0%</span>
        <span className="font-medium text-gray-900">
          {editingSource.realEstateConfig.propertyAppreciationRate.toFixed(1)}%
        </span>
        <span>8%</span>
      </div>
      <p className="text-xs text-gray-600">Erwartete jährliche Wertsteigerung der Immobilie (Richtwert: 2-3%)</p>
    </div>
  )
}
