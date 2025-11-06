import type { AssetClass } from '../../../helpers/multi-asset-portfolio'
import { AssetClassHeader } from './AssetClassHeader'
import { ConfigurationSliders } from './ConfigurationSliders'

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
export function AssetClassEditor({ assetClass, name, description, config, onChange }: AssetClassEditorProps) {
  const isEnabled = config.enabled

  return (
    <div className={`p-4 border rounded-md ${isEnabled ? 'border-blue-200 bg-blue-50' : 'border-gray-200'}`}>
      <AssetClassHeader
        name={name}
        description={description}
        isEnabled={isEnabled}
        onEnabledChange={enabled => onChange(assetClass, { enabled })}
      />

      {isEnabled && <ConfigurationSliders config={config} onConfigChange={updates => onChange(assetClass, updates)} />}
    </div>
  )
}
