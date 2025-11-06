import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog'
import type { UserProfile } from '../../utils/profile-storage'

interface DeleteProfileDialogProps {
  profile: UserProfile | null
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

/** Delete Profile Confirmation Dialog Component */
export function DeleteProfileDialog({ profile, onOpenChange, onConfirm }: DeleteProfileDialogProps) {
  return (
    <AlertDialog open={!!profile} onOpenChange={(open) => !open && onOpenChange(false)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Profil löschen</AlertDialogTitle>
          <AlertDialogDescription>
            Möchten Sie das Profil "{profile?.name}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht
            werden.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Abbrechen</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-red-600 hover:bg-red-700">
            Löschen
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
