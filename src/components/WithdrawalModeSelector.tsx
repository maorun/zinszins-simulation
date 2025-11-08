import { Label } from './ui/label'
import { RadioTile, RadioTileGroup } from './ui/radio-tile'

type WithdrawalMode = 'single' | 'segmented' | 'comparison' | 'segmented-comparison'

interface WithdrawalModeSelectorProps {
  useSegmentedWithdrawal: boolean
  useComparisonMode: boolean
  useSegmentedComparisonMode: boolean
  onModeChange: (mode: WithdrawalMode) => void
}

export function WithdrawalModeSelector({
  useSegmentedWithdrawal,
  useComparisonMode,
  useSegmentedComparisonMode,
  onModeChange,
}: WithdrawalModeSelectorProps) {
  const currentMode: WithdrawalMode = useSegmentedComparisonMode
    ? 'segmented-comparison'
    : useComparisonMode
      ? 'comparison'
      : useSegmentedWithdrawal
        ? 'segmented'
        : 'single'

  const modeDescription = useSegmentedComparisonMode
    ? 'Vergleiche verschiedene geteilte Entnahme-Phasen miteinander.'
    : useComparisonMode
      ? 'Vergleiche verschiedene Entnahmestrategien miteinander.'
      : useSegmentedWithdrawal
        ? 'Teile die Entnahme-Phase in verschiedene Zeiträume mit unterschiedlichen Strategien auf.'
        : 'Verwende eine einheitliche Strategie für die gesamte Entnahme-Phase.'

  return (
    <div className="mb-4 space-y-2">
      <Label>Entnahme-Modus</Label>
      <RadioTileGroup
        name="withdrawal-mode"
        value={currentMode}
        onValueChange={(value: string) => {
          onModeChange(value as WithdrawalMode)
        }}
      >
        <RadioTile value="single" label="Einheitliche Strategie">
          Verwende eine einheitliche Strategie für die gesamte Entnahme-Phase
        </RadioTile>
        <RadioTile value="segmented" label="Geteilte Phasen">
          Teile die Entnahme-Phase in verschiedene Zeiträume mit unterschiedlichen Strategien auf
        </RadioTile>
        <RadioTile value="comparison" label="Strategien-Vergleich">
          Vergleiche verschiedene Entnahmestrategien miteinander
        </RadioTile>
        <RadioTile value="segmented-comparison" label="Geteilte Phasen Vergleich">
          Vergleiche verschiedene geteilte Entnahme-Phasen miteinander
        </RadioTile>
      </RadioTileGroup>
      <div className="text-sm text-muted-foreground mt-1">{modeDescription}</div>
    </div>
  )
}
