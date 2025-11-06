import { Button } from '../ui/button'
import { Edit3, Copy, Trash2 } from 'lucide-react'

interface ProfileCardActionsProps {
  isActive: boolean
  canDelete: boolean
  onSwitch: () => void
  onEdit: () => void
  onDuplicate: () => void
  onDelete: () => void
}

/** Profile Card Actions Component */
export function ProfileCardActions({
  isActive,
  canDelete,
  onSwitch,
  onEdit,
  onDuplicate,
  onDelete,
}: ProfileCardActionsProps) {
  return (
    <div className="flex items-center gap-1 ml-2">
      {!isActive && (
        <Button variant="outline" size="sm" onClick={onSwitch} title="Profil aktivieren">
          Aktivieren
        </Button>
      )}
      <Button variant="outline" size="sm" onClick={onEdit} title="Profil bearbeiten">
        <Edit3 className="h-3 w-3" />
      </Button>
      <Button variant="outline" size="sm" onClick={onDuplicate} title="Profil duplizieren">
        <Copy className="h-3 w-3" />
      </Button>
      {canDelete && (
        <Button
          variant="outline"
          size="sm"
          onClick={onDelete}
          title="Profil löschen"
          className="text-red-600 hover:text-red-700"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      )}
    </div>
  )
}
