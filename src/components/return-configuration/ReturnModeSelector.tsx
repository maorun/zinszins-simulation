import type { ReturnMode } from '../../utils/random-returns'
import { Label } from '../ui/label'
import { RadioTile, RadioTileGroup } from '../ui/radio-tile'

interface ReturnModeSelectorProps {
  returnMode: ReturnMode
  onReturnModeChange: (mode: ReturnMode) => void
}

const ReturnModeSelector = ({ returnMode, onReturnModeChange }: ReturnModeSelectorProps) => {
  return (
    <div className="space-y-3">
      <Label>Rendite-Modus für Sparphase</Label>
      <RadioTileGroup
        value={returnMode}
        onValueChange={(value: string) => {
          const mode = value as ReturnMode
          onReturnModeChange(mode)
        }}
      >
        <RadioTile value="fixed" label="Feste Rendite">
          Konstante jährliche Rendite für die gesamte Sparphase
        </RadioTile>
        <RadioTile value="random" label="Zufällige Rendite">
          Monte Carlo Simulation mit Durchschnitt und Volatilität
        </RadioTile>
        <RadioTile value="variable" label="Variable Rendite">
          Jahr-für-Jahr konfigurierbare Renditen für realistische Szenarien
        </RadioTile>
        <RadioTile value="historical" label="Historische Daten">
          Backtesting mit echten historischen Marktdaten (Vergangenheit ≠ Zukunft!)
        </RadioTile>
        <RadioTile value="multiasset" label="Multi-Asset Portfolio">
          Diversifiziertes Portfolio mit automatischem Rebalancing
        </RadioTile>
      </RadioTileGroup>
      <p className="text-sm text-muted-foreground">
        Konfiguration der erwarteten Rendite während der Ansparphase (bis zum Beginn der Entnahme).
      </p>
    </div>
  )
}

export default ReturnModeSelector
