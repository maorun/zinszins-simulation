import { Label } from '../ui/label'
import { Slider } from '../ui/slider'
import type { OtherIncomeSource } from '../../../helpers/other-income'

interface VacancyRateSliderProps {
  editingSource: OtherIncomeSource
  onUpdate: (source: OtherIncomeSource) => void
}

export function VacancyRateSlider({ editingSource, onUpdate }: VacancyRateSliderProps) {
  if (!editingSource.realEstateConfig) {
    return null
  }

  return (
    <div className="space-y-2">
      <Label>Leerstandsquote (%)</Label>
      <Slider
        value={[editingSource.realEstateConfig.vacancyRatePercent]}
        onValueChange={values =>
          onUpdate({
            ...editingSource,
            realEstateConfig: {
              ...editingSource.realEstateConfig!,
              vacancyRatePercent: values[0],
            },
          })
        }
        min={0}
        max={20}
        step={0.5}
        className="mt-2"
      />
      <div className="flex justify-between text-sm text-gray-500">
        <span>0%</span>
        <span className="font-medium text-gray-900">
          {editingSource.realEstateConfig.vacancyRatePercent.toFixed(1)}%
        </span>
        <span>20%</span>
      </div>
      <p className="text-xs text-gray-600">Erwarteter jährlicher Leerstand (Richtwert: 3-5%)</p>
    </div>
  )
}
