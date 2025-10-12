import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Switch } from '../ui/switch'
import type { OtherIncomeSource } from '../../../helpers/other-income'

interface KindergeldConfigSectionProps {
  editingSource: OtherIncomeSource
  onUpdate: (source: OtherIncomeSource) => void
}

export function KindergeldConfigSection({
  editingSource,
  onUpdate,
}: KindergeldConfigSectionProps) {
  if (!editingSource.kindergeldConfig) {
    return null
  }

  return (
    <div className="space-y-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
      <h4 className="text-sm font-semibold text-yellow-800 flex items-center gap-2">
        👶 Kindergeld-spezifische Einstellungen
      </h4>

      {/* Child Birth Year */}
      <div className="space-y-2">
        <Label htmlFor="child-birth-year">Geburtsjahr des Kindes</Label>
        <Input
          id="child-birth-year"
          type="number"
          value={editingSource.kindergeldConfig.childBirthYear}
          onChange={e => onUpdate({
            ...editingSource,
            kindergeldConfig: {
              ...editingSource.kindergeldConfig!,
              childBirthYear: Number(e.target.value) || new Date().getFullYear(),
            },
          })}
          min={1950}
          max={new Date().getFullYear() + 10}
          step={1}
        />
        <p className="text-xs text-gray-600">
          Kindergeld wird bis zum 18. Geburtstag gezahlt (oder bis 25 bei Ausbildung)
        </p>
      </div>

      {/* Child Order Number */}
      <div className="space-y-2">
        <Label htmlFor="child-order">Position des Kindes</Label>
        <select
          id="child-order"
          value={editingSource.kindergeldConfig.childOrderNumber}
          onChange={e => onUpdate({
            ...editingSource,
            kindergeldConfig: {
              ...editingSource.kindergeldConfig!,
              childOrderNumber: Number(e.target.value),
            },
          })}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value={1}>1. Kind</option>
          <option value={2}>2. Kind</option>
          <option value={3}>3. Kind</option>
          <option value={4}>4. Kind oder höher</option>
        </select>
        <p className="text-xs text-gray-600">
          Aktuell: 250€/Monat für alle Kinder (Stand 2024)
        </p>
      </div>

      {/* In Education Toggle */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="in-education" className="text-sm font-medium">
            Kind in Ausbildung/Studium (ab 18)
          </Label>
          <Switch
            id="in-education"
            checked={editingSource.kindergeldConfig.inEducation}
            onCheckedChange={inEducation => onUpdate({
              ...editingSource,
              kindergeldConfig: {
                ...editingSource.kindergeldConfig!,
                inEducation,
              },
            })}
          />
        </div>
        <p className="text-xs text-gray-600">
          {editingSource.kindergeldConfig.inEducation
            ? 'Kindergeld wird bis zum 25. Geburtstag gezahlt'
            : 'Kindergeld endet mit dem 18. Geburtstag'}
        </p>
      </div>

      {/* Info Box */}
      <div className="p-3 bg-blue-50 rounded border border-blue-200">
        <p className="text-xs text-blue-800">
          <strong>ℹ️ Hinweis:</strong>
          {' '}
          Kindergeld ist steuerfrei und wird automatisch
          berücksichtigt. Der monatliche Betrag wird automatisch auf 250€ gesetzt
          (Stand 2024).
        </p>
      </div>
    </div>
  )
}
