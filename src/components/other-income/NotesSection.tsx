import { Label } from '../ui/label'
import type { OtherIncomeSource } from '../../../helpers/other-income'

interface NotesSectionProps {
  editingSource: OtherIncomeSource
  onUpdate: (source: OtherIncomeSource) => void
}

export function NotesSection({ editingSource, onUpdate }: NotesSectionProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="notes">Notizen (optional)</Label>
      <textarea
        id="notes"
        value={editingSource.notes || ''}
        onChange={(e) =>
          onUpdate({
            ...editingSource,
            notes: e.target.value,
          })
        }
        placeholder="Zusätzliche Informationen zu dieser Einkommensquelle"
        rows={2}
        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      />
    </div>
  )
}
