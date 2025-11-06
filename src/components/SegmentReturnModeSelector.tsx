import { Label } from './ui/label'
import { RadioTileGroup, RadioTile } from './ui/radio-tile'
import type { WithdrawalReturnMode } from './SegmentReturnConfiguration'

interface SegmentReturnModeSelectorProps {
  currentMode: WithdrawalReturnMode
  onModeChange: (mode: WithdrawalReturnMode) => void
}

export function SegmentReturnModeSelector({ currentMode, onModeChange }: SegmentReturnModeSelectorProps) {
  return (
    <div className="mb-4 space-y-2">
      <Label>Rendite-Modus</Label>
      <RadioTileGroup value={currentMode} onValueChange={value => onModeChange(value as WithdrawalReturnMode)}>
        <RadioTile value="fixed" label="Feste Rendite">
          Konstante jährliche Rendite für diese Phase
        </RadioTile>
        <RadioTile value="random" label="Zufällige Rendite">
          Monte Carlo Simulation mit Volatilität
        </RadioTile>
        <RadioTile value="variable" label="Variable Rendite">
          Jahr-für-Jahr konfigurierbare Renditen
        </RadioTile>
        <RadioTile value="multiasset" label="Multi-Asset Portfolio">
          Diversifiziertes Portfolio mit automatischem Rebalancing
        </RadioTile>
      </RadioTileGroup>
    </div>
  )
}
