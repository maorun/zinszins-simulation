import { Input } from '../ui/input'
import { Label } from '../ui/label'
import type { OtherIncomeSource } from '../../../helpers/other-income'

interface NameInputSectionProps {
  editingSource: OtherIncomeSource
  onUpdate: (source: OtherIncomeSource) => void
}

export function NameInputSection({ editingSource, onUpdate }: NameInputSectionProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="source-name">Bezeichnung</Label>
      <Input
        id="source-name"
        value={editingSource.name}
        onChange={e => onUpdate({ ...editingSource, name: e.target.value })}
        placeholder="z.B. Mieteinnahmen Wohnung 1"
      />
    </div>
  )
}
