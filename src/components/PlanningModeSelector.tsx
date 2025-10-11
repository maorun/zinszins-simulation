import { Label } from './ui/label'
import { RadioTileGroup, RadioTile } from './ui/radio-tile'

interface PlanningModeSelectorProps {
  planningMode: 'individual' | 'couple'
  onChange: (mode: 'individual' | 'couple') => void
}

export function PlanningModeSelector({ planningMode, onChange }: PlanningModeSelectorProps) {
  return (
    <div className="space-y-2">
      <Label>Planungsmodus</Label>
      <RadioTileGroup
        value={planningMode}
        onValueChange={(value: string) => onChange(value as 'individual' | 'couple')}
      >
        <RadioTile value="individual" label="Einzelperson">
          Planung für eine Person mit individueller Lebenserwartung
        </RadioTile>
        <RadioTile value="couple" label="Ehepaar/Partner">
          Planung für zwei Personen mit gemeinsamer Lebenserwartung (längerer überlebender Partner)
        </RadioTile>
      </RadioTileGroup>
    </div>
  )
}
