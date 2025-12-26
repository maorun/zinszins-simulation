import { DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog'

interface DialogHeaderSectionProps {
  visibleCount: number
}

export function DialogHeaderSection({ visibleCount }: DialogHeaderSectionProps) {
  return (
    <DialogHeader>
      <DialogTitle>Dashboard-Ansicht anpassen</DialogTitle>

      <DialogDescription>
        Wählen Sie aus, welche Bereiche Sie sehen möchten und in welcher Reihenfolge sie angezeigt werden sollen.

        {visibleCount === 0 && (
          <span className="text-destructive font-medium block mt-2">
            ⚠️ Mindestens ein Bereich muss sichtbar sein.
          </span>
        )}
      </DialogDescription>
    </DialogHeader>
  )
}
