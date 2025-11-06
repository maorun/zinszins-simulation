import { Label } from '../ui/label'
import { RadioTile, RadioTileGroup } from '../ui/radio-tile'
import type { WithdrawalReturnMode } from '../../utils/config-storage'

interface ReturnModeSelectorProps {
  withdrawalReturnMode: WithdrawalReturnMode
  onWithdrawalReturnModeChange: (mode: WithdrawalReturnMode) => void
}

export function ReturnModeSelector({ withdrawalReturnMode, onWithdrawalReturnModeChange }: ReturnModeSelectorProps) {
  return (
    <div className="mb-4 space-y-2">
      <Label>Rendite-Konfiguration (Entnahme-Phase)</Label>
      <RadioTileGroup
        value={withdrawalReturnMode}
        onValueChange={(value: string) => {
          onWithdrawalReturnModeChange(value as WithdrawalReturnMode)
        }}
      >
        <RadioTile value="fixed" label="Feste Rendite">
          Konstante jährliche Rendite für die gesamte Entnahme-Phase
        </RadioTile>
        <RadioTile value="random" label="Zufällige Rendite">
          Monte Carlo Simulation mit Durchschnitt und Volatilität
        </RadioTile>
        <RadioTile value="variable" label="Variable Rendite">
          Jahr-für-Jahr konfigurierbare Renditen
        </RadioTile>
        <RadioTile value="multiasset" label="Multi-Asset Portfolio">
          Diversifiziertes Portfolio mit automatischem Rebalancing
        </RadioTile>
      </RadioTileGroup>
      <div className="text-sm text-muted-foreground mt-1">
        Konfiguration der erwarteten Rendite während der Entnahme-Phase (unabhängig von der Sparphase-Rendite).
      </div>
    </div>
  )
}
