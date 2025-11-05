import { Input } from '../ui/input'
import { Label } from '../ui/label'
import type { OtherIncomeSource } from '../../../helpers/other-income'

interface PropertyValueInputProps {
  editingSource: OtherIncomeSource
  propertyValueId: string
  onUpdate: (source: OtherIncomeSource) => void
}

export function PropertyValueInput({
  editingSource,
  propertyValueId,
  onUpdate,
}: PropertyValueInputProps) {
  if (!editingSource.realEstateConfig) {
    return null
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={propertyValueId}>Immobilienwert (€)</Label>
      <Input
        id={propertyValueId}
        type="number"
        value={editingSource.realEstateConfig.propertyValue}
        onChange={e => onUpdate({
          ...editingSource,
          realEstateConfig: {
            ...editingSource.realEstateConfig!,
            propertyValue: Number(e.target.value) || 0,
          },
        })}
        min={0}
        step={10000}
      />
      <p className="text-xs text-gray-600">
        Aktueller Marktwert der Immobilie für Wertsteigerungsberechnungen
      </p>
    </div>
  )
}
