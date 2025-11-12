import { Switch } from '../ui/switch'
import { Label } from '../ui/label'
import { GlossaryTerm } from '../GlossaryTerm'

interface GuenstigerpruefungSectionProps {
  guenstigerPruefungAktiv: boolean
  onGuenstigerPruefungAktivChange: (value: boolean) => void
}

export function GuenstigerpruefungSection({
  guenstigerPruefungAktiv,
  onGuenstigerPruefungAktivChange,
}: GuenstigerpruefungSectionProps) {
  return (
    <div className="space-y-4 border rounded-lg p-4 bg-blue-50/50">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Label className="text-base font-medium">
            🔍 <GlossaryTerm term="guenstigerpruefung">Günstigerprüfung</GlossaryTerm>
          </Label>
          <p className="text-sm text-muted-foreground">
            Automatische Wahl zwischen Abgeltungssteuer und progressivem Einkommensteuertarif
          </p>
        </div>
        <Switch
          id="guenstigerPruefungAktiv"
          checked={guenstigerPruefungAktiv}
          onCheckedChange={onGuenstigerPruefungAktivChange}
        />
      </div>
    </div>
  )
}
