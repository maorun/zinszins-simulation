import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Plus } from 'lucide-react'

interface AddYearFormProps {
  newYearInput: string
  newIncomeInput: string
  onYearInputChange: (value: string) => void
  onIncomeInputChange: (value: string) => void
  onAdd: () => void
  timeRange?: { start: number; end: number }
}

/**
 * Form for adding a new year with progression-relevant income
 */
export function AddYearForm({
  newYearInput,
  newIncomeInput,
  onYearInputChange,
  onIncomeInputChange,
  onAdd,
  timeRange,
}: AddYearFormProps) {
  return (
    <div className="space-y-3">
      <Label className="text-sm font-semibold">Neues Jahr hinzufügen:</Label>
      <div className="flex gap-2">
        <Input
          type="number"
          placeholder="Jahr (z.B. 2024)"
          value={newYearInput}
          onChange={e => onYearInputChange(e.target.value)}
          className="w-32"
          min={timeRange?.start || 2020}
          max={timeRange?.end || 2100}
        />
        <Input
          type="number"
          placeholder="Betrag in €"
          value={newIncomeInput}
          onChange={e => onIncomeInputChange(e.target.value)}
          className="flex-1"
          min="0"
          step="100"
        />
        <Button onClick={onAdd} size="sm" disabled={!newYearInput || !newIncomeInput}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
