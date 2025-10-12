import { Label } from '../ui/label'
import { RadioTileGroup, RadioTile } from '../ui/radio-tile'
import { formatCurrency } from '../../utils/currency'
import {
  type CareLevel,
  DEFAULT_CARE_LEVELS,
} from '../../../helpers/care-cost-simulation'

interface CareLevelSelectorProps {
  careLevel: CareLevel
  onChange: (level: CareLevel) => void
}

export function CareLevelSelector({ careLevel, onChange }: CareLevelSelectorProps) {
  return (
    <div className="space-y-3">
      <Label>Erwarteter Pflegegrad</Label>
      <RadioTileGroup
        value={careLevel.toString()}
        onValueChange={value => onChange(Number(value) as CareLevel)}
      >
        {[1, 2, 3, 4, 5].map((level) => {
          const careLevelInfo = DEFAULT_CARE_LEVELS[level as CareLevel]
          return (
            <RadioTile
              key={level}
              value={level.toString()}
              label={careLevelInfo.name}
            >
              <div className="text-sm text-muted-foreground mt-1">
                {careLevelInfo.description}
              </div>
              <div className="text-sm mt-2">
                <div className="flex justify-between items-center">
                  <span>Pflegegeld:</span>
                  <span className="font-medium">
                    {careLevelInfo.careAllowance > 0
                      ? formatCurrency(careLevelInfo.careAllowance)
                      : 'Kein Pflegegeld'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Typische Kosten:</span>
                  <span className="font-medium">
                    {formatCurrency(careLevelInfo.typicalMonthlyCost)}
                    /Monat
                  </span>
                </div>
              </div>
            </RadioTile>
          )
        })}
      </RadioTileGroup>
    </div>
  )
}
