import { Input } from '../ui/input'
import { Label } from '../ui/label'
import type { OtherIncomeSource } from '../../../helpers/other-income'

interface TimePeriodSectionProps {
  editingSource: OtherIncomeSource
  currentYear: number
  onUpdate: (source: OtherIncomeSource) => void
}

export function TimePeriodSection({ editingSource, currentYear, onUpdate }: TimePeriodSectionProps) {
  const handleStartYearChange = (value: string) => {
    onUpdate({
      ...editingSource,
      startYear: Number(value) || currentYear,
    })
  }

  const handleEndYearChange = (value: string) => {
    onUpdate({
      ...editingSource,
      endYear: value ? Number(value) : null,
    })
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="start-year">Startjahr</Label>
        <Input
          id="start-year"
          type="number"
          value={editingSource.startYear}
          onChange={e => handleStartYearChange(e.target.value)}
          min={2020}
          max={2080}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="end-year">Endjahr (optional)</Label>
        <Input
          id="end-year"
          type="number"
          value={editingSource.endYear || ''}
          onChange={e => handleEndYearChange(e.target.value)}
          min={editingSource.startYear}
          max={2080}
          placeholder="Unbegrenzt"
        />
      </div>
    </div>
  )
}
