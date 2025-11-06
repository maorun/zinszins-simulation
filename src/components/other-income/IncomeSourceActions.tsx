import { Button } from '../ui/button'
import { Trash2 } from 'lucide-react'

interface IncomeSourceActionsProps {
  onEdit: () => void
  onDelete: () => void
  editingDisabled: boolean
}

export function IncomeSourceActions({ onEdit, onDelete, editingDisabled }: IncomeSourceActionsProps) {
  return (
    <div className="flex flex-row sm:flex-col gap-2 sm:ml-4 sm:min-w-0">
      <Button
        onClick={onEdit}
        variant="outline"
        size="sm"
        disabled={editingDisabled}
        className="flex-1 sm:flex-initial min-w-0"
      >
        <span className="truncate">Bearbeiten</span>
      </Button>
      <Button
        onClick={onDelete}
        variant="outline"
        size="sm"
        className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}
