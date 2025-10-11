import { Label } from './ui/label'
import { RadioTileGroup, RadioTile } from './ui/radio-tile'
import type { BucketSubStrategy } from '../../helpers/withdrawal'

interface SubStrategySelectorProps {
  value: BucketSubStrategy
  onChange: (value: BucketSubStrategy) => void
  idPrefix?: string
}

export function SubStrategySelector({
  value,
  onChange,
  idPrefix = 'bucket-sub-strategy',
}: SubStrategySelectorProps) {
  return (
    <div className="space-y-2">
      <Label>Entnahme-Strategie</Label>
      <RadioTileGroup
        value={value}
        idPrefix={idPrefix}
        onValueChange={(newValue: string) => {
          onChange(newValue as BucketSubStrategy)
        }}
      >
        <RadioTile value="4prozent" label="4% Regel">
          Jährliche Entnahme von 4% des Startkapitals
        </RadioTile>
        <RadioTile value="3prozent" label="3% Regel">
          Jährliche Entnahme von 3% des Startkapitals
        </RadioTile>
        <RadioTile value="variabel_prozent" label="Variable Prozent">
          Benutzerdefinierter Entnahme-Prozentsatz
        </RadioTile>
        <RadioTile value="monatlich_fest" label="Monatlich fest">
          Fester monatlicher Betrag
        </RadioTile>
        <RadioTile value="dynamisch" label="Dynamische Strategie">
          Renditebasierte Anpassung
        </RadioTile>
      </RadioTileGroup>
      <div className="text-sm text-muted-foreground mt-1">
        Wählen Sie die Entnahme-Strategie, die innerhalb der Drei-Eimer-Strategie verwendet wird.
      </div>
    </div>
  )
}
