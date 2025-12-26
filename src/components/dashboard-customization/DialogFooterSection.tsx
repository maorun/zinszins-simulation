import { RotateCcw } from 'lucide-react'
import { Button } from '../ui/button'
import { DialogFooter } from '../ui/dialog'

interface DialogFooterSectionProps {
  onReset: () => void
  onClose: () => void
}

export function DialogFooterSection({ onReset, onClose }: DialogFooterSectionProps) {
  return (
    <DialogFooter className="flex-col sm:flex-row gap-2">
      <Button variant="outline" onClick={onReset} className="gap-2">
        <RotateCcw className="h-4 w-4" />
        Zurücksetzen
      </Button>

      <Button onClick={onClose}>Fertig</Button>
    </DialogFooter>
  )
}
