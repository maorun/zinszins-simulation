import { Switch } from '../ui/switch'
import { Label } from '../ui/label'
import { Slider } from '../ui/slider'
import type { AssetClass } from '../../../helpers/multi-asset-portfolio'

interface AssetClassConfig {
  enabled: boolean
  targetAllocation: number
  expectedReturn: number
  volatility: number
}

interface AssetClassEditorProps {
  /** The asset class key */
  assetClass: AssetClass
  /** Display name of the asset class */
  name: string
  /** Description of the asset class */
  description: string
  /** Current configuration of the asset class */
  config: AssetClassConfig
  /** Callback when configuration changes */
  onChange: (assetClass: AssetClass, updates: Partial<AssetClassConfig>) => void
}

/**
 * Editor component for a single asset class in the multi-asset portfolio.
 * Allows enabling/disabling and configuring allocation, expected return, and volatility.
 */
// eslint-disable-next-line max-lines-per-function -- Large component function
export function AssetClassEditor({
  assetClass,
  name,
  description,
  config,
  onChange,
}: AssetClassEditorProps) {
  const isEnabled = config.enabled

  return (
    <div
      className={`p-4 border rounded-md ${
        isEnabled ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Switch
              checked={isEnabled}
              onCheckedChange={enabled => onChange(assetClass, { enabled })}
            />
            <Label className="text-sm font-medium">{name}</Label>
          </div>
          <p className="text-xs text-gray-600">{description}</p>
        </div>
      </div>

      {isEnabled && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Target Allocation */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-gray-700">
              Zielallokation:
              {' '}
              {(config.targetAllocation * 100).toFixed(1)}
              %
            </Label>
            <Slider
              value={[config.targetAllocation * 100]}
              onValueChange={([value]) =>
                onChange(assetClass, { targetAllocation: value / 100 })}
              max={100}
              step={1}
              className="w-full"
            />
          </div>

          {/* Expected Return */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-gray-700">
              Erwartete Rendite:
              {' '}
              {(config.expectedReturn * 100).toFixed(1)}
              %
            </Label>
            <Slider
              value={[config.expectedReturn * 100]}
              onValueChange={([value]) =>
                onChange(assetClass, { expectedReturn: value / 100 })}
              min={-10}
              max={20}
              step={0.5}
              className="w-full"
            />
          </div>

          {/* Volatility */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-gray-700">
              Volatilität:
              {' '}
              {(config.volatility * 100).toFixed(1)}
              %
            </Label>
            <Slider
              value={[config.volatility * 100]}
              onValueChange={([value]) =>
                onChange(assetClass, { volatility: value / 100 })}
              min={0}
              max={50}
              step={1}
              className="w-full"
            />
          </div>
        </div>
      )}
    </div>
  )
}
