import { Switch } from '../ui/switch'
import { Label } from '../ui/label'
import { Input } from '../ui/input'

interface SimulationConfig {
  useCorrelation: boolean
  seed?: number
}

interface AdvancedSimulationSettingsProps {
  /** Current simulation configuration */
  config: SimulationConfig
  /** Callback when configuration changes */
  onChange: (updates: Partial<SimulationConfig>) => void
}

/**
 * Advanced simulation settings for multi-asset portfolio.
 * Controls correlation usage and optional random seed for reproducibility.
 */
export function AdvancedSimulationSettings({ config, onChange }: AdvancedSimulationSettingsProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700">Erweiterte Einstellungen</h3>

      <div className="flex items-center gap-2">
        <Switch checked={config.useCorrelation} onCheckedChange={(useCorrelation) => onChange({ useCorrelation })} />
        <Label className="text-sm">Historische Korrelationen verwenden</Label>
      </div>
      <p className="text-xs text-gray-600">
        Berücksichtigt die historischen Korrelationen zwischen den Anlageklassen für realistischere
        Simulationsergebnisse
      </p>

      <div className="space-y-2">
        <Label htmlFor="multiasset-seed" className="text-sm font-medium">
          Zufalls-Seed (optional)
        </Label>
        <Input
          id="multiasset-seed"
          type="number"
          value={config.seed || ''}
          onChange={(e) => {
            const seed = e.target.value ? parseInt(e.target.value) : undefined
            onChange({ seed })
          }}
          placeholder="Für reproduzierbare Ergebnisse"
          className="text-sm"
        />
        <p className="text-xs text-gray-600">Optionale Zahl für reproduzierbare Zufallsrenditen</p>
      </div>
    </div>
  )
}
