import { Plus } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'

interface ManualEntryFormProps {
  newYear: string
  setNewYear: (year: string) => void
  newRate: string
  setNewRate: (rate: string) => void
  handleAddManualEntry: () => void
  getSuggestedRate: () => string
  currentYear: number
}

/**
 * Renders the manual entry form for adding new rates
 */
export function ManualEntryForm({
  newYear,
  setNewYear,
  newRate,
  setNewRate,
  handleAddManualEntry,
  getSuggestedRate,
  currentYear,
}: ManualEntryFormProps) {
  return (
    <div className="space-y-4">
      <Label>Manueller Eintrag für zukünftige Jahre</Label>
      <div className="flex gap-2">
        <Input
          type="number"
          placeholder="Jahr"
          value={newYear}
          min={currentYear}
          max={2050}
          onChange={(e) => setNewYear(e.target.value)}
        />
        <Input
          type="number"
          placeholder={`Zinssatz (%) - Vorschlag: ${getSuggestedRate()}%`}
          value={newRate}
          min={-2}
          max={10}
          step={0.01}
          onChange={(e) => setNewRate(e.target.value)}
        />
        <Button onClick={handleAddManualEntry}>
          <Plus className="h-4 w-4 mr-2" />
          Hinzufügen
        </Button>
      </div>
    </div>
  )
}
