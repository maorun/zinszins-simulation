import { Label } from '../ui/label'
import { RadioTileGroup, RadioTile } from '../ui/radio-tile'
import { HISTORICAL_INDICES } from '../../utils/historical-data'

interface IndexSelectionRadioGroupProps {
  selectedIndexId: string
  onIndexChange: (indexId: string) => void
}

export const IndexSelectionRadioGroup = ({ selectedIndexId, onIndexChange }: IndexSelectionRadioGroupProps) => (
  <div className="space-y-3">
    <Label>Historischer Index für Backtesting</Label>
    <RadioTileGroup value={selectedIndexId} onValueChange={onIndexChange}>
      {HISTORICAL_INDICES.map((index) => (
        <RadioTile key={index.id} value={index.id} label={index.name}>
          <div className="space-y-1">
            <div className="text-xs">{index.description}</div>
            <div className="text-xs text-muted-foreground">
              {index.startYear}-{index.endYear} •{index.currency} • Ø{(index.averageReturn * 100).toFixed(1)}% p.a.
            </div>
          </div>
        </RadioTile>
      ))}
    </RadioTileGroup>
  </div>
)
