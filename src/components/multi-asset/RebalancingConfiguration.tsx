import { Switch } from '../ui/switch'
import { Label } from '../ui/label'
import { Slider } from '../ui/slider'
import { RadioTileGroup, RadioTile } from '../ui/radio-tile'

interface RebalancingConfig {
  frequency: 'never' | 'monthly' | 'quarterly' | 'annually'
  useThreshold: boolean
  threshold: number
}

interface RebalancingConfigurationProps {
  /** Current rebalancing configuration */
  config: RebalancingConfig
  /** Callback when configuration changes */
  onChange: (updates: Partial<RebalancingConfig>) => void
}

/**
 * Configuration component for portfolio rebalancing settings.
 * Allows users to set rebalancing frequency and optional threshold-based rebalancing.
 */
export function RebalancingConfiguration({
  config,
  onChange,
}: RebalancingConfigurationProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700">Rebalancing</h3>

      <div className="space-y-3">
        <Label className="text-sm font-medium">Rebalancing-Häufigkeit</Label>
        <RadioTileGroup
          value={config.frequency}
          onValueChange={frequency =>
            onChange({ frequency: frequency as typeof config.frequency })}
        >
          <RadioTile value="never" label="Nie">
            Nie
          </RadioTile>
          <RadioTile value="annually" label="Jährlich">
            Jährlich
          </RadioTile>
          <RadioTile value="quarterly" label="Quartalsweise">
            Quartalsweise
          </RadioTile>
          <RadioTile value="monthly" label="Monatlich">
            Monatlich
          </RadioTile>
        </RadioTileGroup>
      </div>

      {config.frequency !== 'never' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Switch
              checked={config.useThreshold}
              onCheckedChange={useThreshold => onChange({ useThreshold })}
            />
            <Label className="text-sm">Schwellenwert-basiertes Rebalancing</Label>
          </div>

          {config.useThreshold && (
            <div className="space-y-2">
              <Label className="text-xs font-medium text-gray-700">
                Drift-Schwellenwert:
                {' '}
                {(config.threshold * 100).toFixed(1)}
                %
              </Label>
              <Slider
                value={[config.threshold * 100]}
                onValueChange={([value]) => onChange({ threshold: value / 100 })}
                min={1}
                max={20}
                step={0.5}
                className="w-full"
              />
              <p className="text-xs text-gray-600">
                Rebalancing erfolgt wenn eine Anlageklasse um mehr als diesen Wert von der
                Zielallokation abweicht
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
