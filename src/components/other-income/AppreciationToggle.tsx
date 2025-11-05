import { Label } from '../ui/label'
import { Switch } from '../ui/switch'
import type { OtherIncomeSource } from '../../../helpers/other-income'

interface AppreciationToggleProps {
  editingSource: OtherIncomeSource
  onUpdate: (source: OtherIncomeSource) => void
}

export function AppreciationToggle({
  editingSource,
  onUpdate,
}: AppreciationToggleProps) {
  if (!editingSource.realEstateConfig) {
    return null
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="include-appreciation" className="text-sm font-medium">
          Wertsteigerung in Berechnung einbeziehen
        </Label>
        <Switch
          id="include-appreciation"
          checked={editingSource.realEstateConfig.includeAppreciation}
          onCheckedChange={includeAppreciation => onUpdate({
            ...editingSource,
            realEstateConfig: {
              ...editingSource.realEstateConfig!,
              includeAppreciation,
            },
          })}
        />
      </div>
      <p className="text-xs text-gray-600">
        {editingSource.realEstateConfig.includeAppreciation
          ? 'Wertsteigerung wird als zusätzliches Einkommen berücksichtigt'
          : 'Nur Mieteinnahmen werden berücksichtigt (konservativer Ansatz)'}
      </p>
    </div>
  )
}
