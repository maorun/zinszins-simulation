import { Switch } from '../ui/switch'
import { Label } from '../ui/label'

interface SteuerReduziertEndkapitalSectionProps {
  steuerReduzierenEndkapitalSparphase: boolean
  steuerReduzierenEndkapitalEntspharphase: boolean
  onSteuerReduzierenSparphaseChange: (value: boolean) => void
  onSteuerReduzierenEntspharphaseChange: (value: boolean) => void
}

export function SteuerReduziertEndkapitalSection({
  steuerReduzierenEndkapitalSparphase,
  steuerReduzierenEndkapitalEntspharphase,
  onSteuerReduzierenSparphaseChange,
  onSteuerReduzierenEntspharphaseChange,
}: SteuerReduziertEndkapitalSectionProps) {
  return (
    <div className="space-y-4">
      <Label className="text-base font-medium">Steuer reduziert Endkapital</Label>
      <p className="text-sm text-muted-foreground">
        Konfigurieren Sie für jede Phase, ob die Steuer vom Endkapital abgezogen wird oder über ein separates
        Verrechnungskonto bezahlt wird.
      </p>

      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="space-y-1">
            <Label htmlFor="steuerReduzierenEndkapitalSparphase" className="font-medium">
              Sparphase
            </Label>
            <p className="text-sm text-muted-foreground">Während der Ansparphase vom Kapital abziehen</p>
          </div>
          <Switch
            id="steuerReduzierenEndkapitalSparphase"
            checked={steuerReduzierenEndkapitalSparphase}
            onCheckedChange={onSteuerReduzierenSparphaseChange}
          />
        </div>

        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="space-y-1">
            <Label htmlFor="steuerReduzierenEndkapitalEntspharphase" className="font-medium">
              Entsparphase
            </Label>
            <p className="text-sm text-muted-foreground">Während der Entnahmephase vom Kapital abziehen</p>
          </div>
          <Switch
            id="steuerReduzierenEndkapitalEntspharphase"
            checked={steuerReduzierenEndkapitalEntspharphase}
            onCheckedChange={onSteuerReduzierenEntspharphaseChange}
          />
        </div>
      </div>
    </div>
  )
}
