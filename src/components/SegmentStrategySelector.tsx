import { Label } from './ui/label'
import { RadioTileGroup, RadioTile } from './ui/radio-tile'
import type { WithdrawalSegment } from '../utils/segmented-withdrawal'
import type { WithdrawalStrategy } from '../../helpers/withdrawal'
import { getStrategyDefaults } from '../utils/withdrawal-strategy-defaults'

interface SegmentStrategySelectorProps {
  segment: WithdrawalSegment
  onStrategyChange: (updates: Partial<WithdrawalSegment>) => void
}

/**
 * List of available withdrawal strategies as radio tiles
 */
function StrategyRadioTiles() {
  return (
    <>
      <RadioTile value="4prozent" label="4% Regel">
        4% Entnahme
      </RadioTile>
      <RadioTile value="3prozent" label="3% Regel">
        3% Entnahme
      </RadioTile>
      <RadioTile value="variabel_prozent" label="Variable Prozent">
        Anpassbare Entnahme
      </RadioTile>
      <RadioTile value="monatlich_fest" label="Monatlich fest">
        Fester monatlicher Betrag
      </RadioTile>
      <RadioTile value="dynamisch" label="Dynamische Strategie">
        Rendite-abhängige Anpassung
      </RadioTile>
      <RadioTile value="bucket_strategie" label="Drei-Eimer-Strategie">
        Cash-Polster bei negativen Renditen
      </RadioTile>
      <RadioTile value="rmd" label="RMD (Lebenserwartung)">
        Entnahme basierend auf Alter und Lebenserwartung
      </RadioTile>
      <RadioTile value="steueroptimiert" label="Steueroptimierte Entnahme">
        Automatische Optimierung zur Steuerminimierung
      </RadioTile>
    </>
  )
}

export function SegmentStrategySelector({
  segment,
  onStrategyChange,
}: SegmentStrategySelectorProps) {
  const handleStrategyChange = (value: string) => {
    const newStrategy = value as WithdrawalStrategy
    const defaults = getStrategyDefaults({
      strategy: newStrategy,
      currentSegment: segment,
    })

    onStrategyChange({
      strategy: newStrategy,
      ...defaults,
    })
  }

  return (
    <div className="mb-4 space-y-2">
      <Label>Entnahme-Strategie</Label>
      <RadioTileGroup
        value={segment.strategy}
        idPrefix={`segment-${segment.id}-strategy`}
        onValueChange={handleStrategyChange}
      >
        <StrategyRadioTiles />
      </RadioTileGroup>
    </div>
  )
}
