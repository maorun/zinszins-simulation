import { Label } from '../ui/label'
import { Slider } from '../ui/slider'
import type { OtherIncomeSource } from '../../../helpers/other-income'

interface MaintenanceCostSliderProps {
  editingSource: OtherIncomeSource
  onUpdate: (source: OtherIncomeSource) => void
}

export function MaintenanceCostSlider({ editingSource, onUpdate }: MaintenanceCostSliderProps) {
  if (!editingSource.realEstateConfig) {
    return null
  }

  return (
    <div className="space-y-2">
      <Label>Instandhaltungskosten (% der Mieteinnahmen)</Label>
      <Slider
        value={[editingSource.realEstateConfig.maintenanceCostPercent]}
        onValueChange={(values) =>
          onUpdate({
            ...editingSource,
            realEstateConfig: {
              ...editingSource.realEstateConfig!,
              maintenanceCostPercent: values[0],
            },
          })
        }
        min={0}
        max={30}
        step={0.5}
        className="mt-2"
      />
      <div className="flex justify-between text-sm text-gray-500">
        <span>0%</span>
        <span className="font-medium text-gray-900">
          {editingSource.realEstateConfig.maintenanceCostPercent.toFixed(1)}%
        </span>
        <span>30%</span>
      </div>
      <p className="text-xs text-gray-600">Reparaturen, Renovierungen, Verwaltungskosten (Richtwert: 15-20%)</p>
    </div>
  )
}
