import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Button } from '../ui/button'

interface ProfileFormData {
  name: string
  description: string
}

interface CreateProfileDialogProps {
  isOpen: boolean
  formData: ProfileFormData
  onOpenChange: (open: boolean) => void
  onFormDataChange: (data: ProfileFormData) => void
  onSubmit: () => void
}

/** Create Profile Dialog Component */
export function CreateProfileDialog({
  isOpen,
  formData,
  onOpenChange,
  onFormDataChange,
  onSubmit,
}: CreateProfileDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Neues Profil erstellen</DialogTitle>
          <DialogDescription>
            Erstellen Sie ein neues Profil um Ihre Finanzsimulation zu speichern und später wieder zu laden.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="create-name">Profilname *</Label>
            <Input
              id="create-name"
              value={formData.name}
              onChange={e => onFormDataChange({ ...formData, name: e.target.value })}
              placeholder="z.B. Familie Müller, Test Szenario 1"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="create-description">Beschreibung (optional)</Label>
            <Input
              id="create-description"
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
            <Button onClick={onSubmit}>Profil erstellen</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
