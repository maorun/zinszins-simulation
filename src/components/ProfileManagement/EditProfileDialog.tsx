import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Button } from '../ui/button'

interface ProfileFormData {
  name: string
  description: string
}

interface EditProfileDialogProps {
  isOpen: boolean
  formData: ProfileFormData
  onOpenChange: (open: boolean) => void
  onFormDataChange: (data: ProfileFormData) => void
  onSubmit: () => void
}

/** Edit Profile Dialog Component */
export function EditProfileDialog({
  isOpen,
  formData,
  onOpenChange,
  onFormDataChange,
  onSubmit,
}: EditProfileDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Profil bearbeiten</DialogTitle>
          <DialogDescription>Bearbeiten Sie die Details Ihres gespeicherten Profils.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="edit-name">Profilname *</Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={e => onFormDataChange({ ...formData, name: e.target.value })}
              placeholder="z.B. Familie Müller, Test Szenario 1"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="edit-description">Beschreibung (optional)</Label>
            <Input
              id="edit-description"
              value={formData.description}
              onChange={e => onFormDataChange({ ...formData, description: e.target.value })}
              placeholder="Kurze Beschreibung des Profils"
              className="mt-1"
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button onClick={onSubmit}>Änderungen speichern</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
