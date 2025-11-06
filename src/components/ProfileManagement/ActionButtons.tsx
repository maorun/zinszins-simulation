import { Plus } from 'lucide-react'
import { Button } from '../ui/button'

interface ActionButtonsProps {
  hasStoredProfiles: boolean
  onCreateProfile: () => void
  onClearAllProfiles: () => void
}

/** Action Buttons Component */
export function ActionButtons({ hasStoredProfiles, onCreateProfile, onClearAllProfiles }: ActionButtonsProps) {
  return (
    <div className="flex gap-2 pt-2">
      <Button onClick={onCreateProfile} className="flex items-center gap-2">
        <Plus className="h-4 w-4" />
        Neues Profil
      </Button>
      <Button variant="destructive" disabled={!hasStoredProfiles} onClick={onClearAllProfiles}>
        🗑️ Alle Profile löschen
      </Button>
    </div>
  )
}
