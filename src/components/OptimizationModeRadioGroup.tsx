import { RadioTileGroup, RadioTile } from './ui/radio-tile'
import { Label } from './ui/label'

interface OptimizationModeRadioGroupProps {
  value: 'minimize_taxes' | 'maximize_after_tax' | 'balanced'
  onChange: (value: 'minimize_taxes' | 'maximize_after_tax' | 'balanced') => void
}

export function OptimizationModeRadioGroup({ value, onChange }: OptimizationModeRadioGroupProps) {
  return (
    <div className="space-y-2">
      <Label>Optimierungsstrategie</Label>
      <RadioTileGroup
        value={value}
        onValueChange={(newValue) => {
          onChange(newValue as 'minimize_taxes' | 'maximize_after_tax' | 'balanced')
        }}
      >
        <RadioTile value="minimize_taxes" label="Steuerminimierung">
          Minimiere die Gesamtsteuerlast
        </RadioTile>
        <RadioTile value="maximize_after_tax" label="Netto-Maximierung">
          Maximiere das Netto-Einkommen
        </RadioTile>
        <RadioTile value="balanced" label="Ausgewogen">
          Balance zwischen Steueroptimierung und stabilen Entnahmen
        </RadioTile>
      </RadioTileGroup>
      <div className="text-sm text-muted-foreground">
        Bestimmt das Hauptziel der Steueroptimierung.
      </div>
    </div>
  )
}
