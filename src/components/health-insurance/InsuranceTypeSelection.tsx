import { Label } from '../ui/label'
import { RadioTile, RadioTileGroup } from '../ui/radio-tile'

interface InsuranceTypeSelectionProps {
  insuranceType: 'statutory' | 'private'
  onInsuranceTypeChange: (type: 'statutory' | 'private') => void
}

export function InsuranceTypeSelection({ insuranceType, onInsuranceTypeChange }: InsuranceTypeSelectionProps) {
  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Versicherungsart</Label>
      <RadioTileGroup
        value={insuranceType}
        onValueChange={value => onInsuranceTypeChange(value as 'statutory' | 'private')}
        className="grid grid-cols-1 md:grid-cols-2 gap-3"
      >
        <RadioTile value="statutory" label="Gesetzliche Krankenversicherung">
          Prozentuale Beiträge basierend auf Einkommen mit festen Sätzen
        </RadioTile>
        <RadioTile value="private" label="Private Krankenversicherung">
          Feste monatliche Beiträge mit Inflationsanpassung
        </RadioTile>
      </RadioTileGroup>
    </div>
  )
}
