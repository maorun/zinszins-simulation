import { Label } from '../ui/label'
import { Switch } from '../ui/switch'
import { GlossaryTerm } from '../GlossaryTerm'

interface GrundfreibetragToggleProps {
  grundfreibetragAktiv: boolean
  onGrundfreibetragAktivChange: (value: boolean) => void
}

export function GrundfreibetragToggle({
  grundfreibetragAktiv,
  onGrundfreibetragAktivChange,
}: GrundfreibetragToggleProps) {
  return (
    <div className="flex items-center justify-between p-3 border rounded-lg">
      <div className="space-y-1">
        <Label htmlFor="grundfreibetragAktiv" className="font-medium">
          <GlossaryTerm term="grundfreibetrag">Grundfreibetrag</GlossaryTerm> berücksichtigen
        </Label>
        <p className="text-sm text-muted-foreground">
          Berücksichtigt den Grundfreibetrag für die Einkommensteuer bei Entnahmen (relevant für Rentner ohne weiteres
          Einkommen)
        </p>
      </div>
      <Switch id="grundfreibetragAktiv" checked={grundfreibetragAktiv} onCheckedChange={onGrundfreibetragAktivChange} />
    </div>
  )
}
