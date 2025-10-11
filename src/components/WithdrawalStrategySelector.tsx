import { Label } from './ui/label'
import { RadioTile, RadioTileGroup } from './ui/radio-tile'
import type { WithdrawalStrategy } from '../../helpers/withdrawal'

interface WithdrawalStrategySelectorProps {
  strategie: WithdrawalStrategy
  onStrategyChange: (strategy: WithdrawalStrategy) => void
}

export function WithdrawalStrategySelector({
  strategie,
  onStrategyChange,
}: WithdrawalStrategySelectorProps) {
  return (
    <div className="mb-4 space-y-2">
      <Label>Strategie</Label>
      <RadioTileGroup
        value={strategie}
        onValueChange={(value) => {
          onStrategyChange(value as WithdrawalStrategy)
        }}
      >
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
          Renditebasierte Anpassung
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
      </RadioTileGroup>
    </div>
  )
}
