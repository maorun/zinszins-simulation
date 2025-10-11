import { Label } from './ui/label'
import { Switch } from './ui/switch'

interface SegmentTaxReductionConfigProps {
  steuerReduzierenEndkapital: boolean | undefined
  onSteuerReduzierenEndkapitalChange: (value: boolean) => void
}

export function SegmentTaxReductionConfig({
  steuerReduzierenEndkapital,
  onSteuerReduzierenEndkapitalChange,
}: SegmentTaxReductionConfigProps) {
  const isEnabled = steuerReduzierenEndkapital ?? true

  return (
    <div className="mb-4 space-y-2">
      <Label>Steuer reduziert Endkapital</Label>
      <div className="flex items-center space-x-3 mt-2">
        <Switch
          checked={isEnabled}
          onCheckedChange={onSteuerReduzierenEndkapitalChange}
        />
        <span className="text-sm">
          {isEnabled
            ? 'Steuern werden vom Kapital abgezogen'
            : 'Steuern werden separat bezahlt'}
        </span>
      </div>
      <div className="text-sm text-muted-foreground mt-1">
        Bestimmt, ob Vorabpauschale-Steuern das Endkapital dieser Phase
        reduzieren oder über ein separates Verrechnungskonto bezahlt werden.
      </div>
    </div>
  )
}
