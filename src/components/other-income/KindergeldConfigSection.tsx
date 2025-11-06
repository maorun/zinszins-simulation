import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Switch } from '../ui/switch'
import type { OtherIncomeSource } from '../../../helpers/other-income'

interface KindergeldConfigSectionProps {
  editingSource: OtherIncomeSource
  onUpdate: (source: OtherIncomeSource) => void
}

interface ChildBirthYearFieldProps {
  childBirthYear: number
  onChange: (year: number) => void
}

function ChildBirthYearField({ childBirthYear, onChange }: ChildBirthYearFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="child-birth-year">Geburtsjahr des Kindes</Label>
      <Input
        id="child-birth-year"
        type="number"
        value={childBirthYear}
        onChange={(e) => onChange(Number(e.target.value) || new Date().getFullYear())}
        min={1950}
        max={new Date().getFullYear() + 10}
        step={1}
      />
      <p className="text-xs text-gray-600">
        Kindergeld wird bis zum 18. Geburtstag gezahlt (oder bis 25 bei Ausbildung)
      </p>
    </div>
  )
}

interface ChildOrderFieldProps {
  childOrderNumber: number
  onChange: (order: number) => void
}

function ChildOrderField({ childOrderNumber, onChange }: ChildOrderFieldProps) {
  const selectClasses =
    'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ' +
    'ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium ' +
    'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 ' +
    'focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'

  return (
    <div className="space-y-2">
      <Label htmlFor="child-order">Position des Kindes</Label>
      <select
        id="child-order"
        value={childOrderNumber}
        onChange={(e) => onChange(Number(e.target.value))}
        className={selectClasses}
      >
        <option value={1}>1. Kind</option>
        <option value={2}>2. Kind</option>
        <option value={3}>3. Kind</option>
        <option value={4}>4. Kind oder höher</option>
      </select>
      <p className="text-xs text-gray-600">Aktuell: 250€/Monat für alle Kinder (Stand 2024)</p>
    </div>
  )
}

interface EducationStatusFieldProps {
  inEducation: boolean
  onChange: (inEducation: boolean) => void
}

function EducationStatusField({ inEducation, onChange }: EducationStatusFieldProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="in-education" className="text-sm font-medium">
          Kind in Ausbildung/Studium (ab 18)
        </Label>
        <Switch id="in-education" checked={inEducation} onCheckedChange={onChange} />
      </div>
      <p className="text-xs text-gray-600">
        {inEducation ? 'Kindergeld wird bis zum 25. Geburtstag gezahlt' : 'Kindergeld endet mit dem 18. Geburtstag'}
      </p>
    </div>
  )
}

function KindergeldInfoBox() {
  return (
    <div className="p-3 bg-blue-50 rounded border border-blue-200">
      <p className="text-xs text-blue-800">
        <strong>ℹ️ Hinweis:</strong> Kindergeld ist steuerfrei und wird automatisch berücksichtigt. Der monatliche
        Betrag wird automatisch auf 250€ gesetzt (Stand 2024).
      </p>
    </div>
  )
}

function createKindergeldHandlers(editingSource: OtherIncomeSource, onUpdate: (source: OtherIncomeSource) => void) {
  const handleBirthYearChange = (childBirthYear: number) => {
    onUpdate({
      ...editingSource,
      kindergeldConfig: {
        ...editingSource.kindergeldConfig!,
        childBirthYear,
      },
    })
  }

  const handleOrderChange = (childOrderNumber: number) => {
    onUpdate({
      ...editingSource,
      kindergeldConfig: {
        ...editingSource.kindergeldConfig!,
        childOrderNumber,
      },
    })
  }

  const handleEducationChange = (inEducation: boolean) => {
    onUpdate({
      ...editingSource,
      kindergeldConfig: {
        ...editingSource.kindergeldConfig!,
        inEducation,
      },
    })
  }

  return { handleBirthYearChange, handleOrderChange, handleEducationChange }
}

export function KindergeldConfigSection({ editingSource, onUpdate }: KindergeldConfigSectionProps) {
  if (!editingSource.kindergeldConfig) {
    return null
  }

  const { handleBirthYearChange, handleOrderChange, handleEducationChange } = createKindergeldHandlers(
    editingSource,
    onUpdate,
  )

  return (
    <div className="space-y-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
      <h4 className="text-sm font-semibold text-yellow-800 flex items-center gap-2">
        👶 Kindergeld-spezifische Einstellungen
      </h4>

      <ChildBirthYearField
        childBirthYear={editingSource.kindergeldConfig.childBirthYear}
        onChange={handleBirthYearChange}
      />

      <ChildOrderField
        childOrderNumber={editingSource.kindergeldConfig.childOrderNumber}
        onChange={handleOrderChange}
      />

      <EducationStatusField inEducation={editingSource.kindergeldConfig.inEducation} onChange={handleEducationChange} />

      <KindergeldInfoBox />
    </div>
  )
}
