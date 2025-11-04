import { Button } from '../ui/button'
import { RotateCcw, TrendingUp } from 'lucide-react'
import {
  type AssetClass,
  DEFAULT_ASSET_CLASSES,
  type MultiAssetPortfolioConfig,
} from '../../helpers/multi-asset-portfolio'
import { AssetClassEditor } from './AssetClassEditor'

interface AssetClassesConfigurationProps {
  /** Current multi-asset portfolio configuration */
  config: MultiAssetPortfolioConfig
  /** Number of enabled asset classes */
  enabledAssetsCount: number
  /** Callback when an asset class configuration changes */
  onAssetClassChange: (
    assetClass: AssetClass,
    updates: Partial<typeof config.assetClasses[AssetClass]>,
  ) => void
  /** Callback to normalize allocations to sum to 100% */
  onNormalizeAllocations: () => void
  /** Callback to reset all settings to defaults */
  onResetToDefaults: () => void
}

/**
 * Asset classes configuration section with individual asset editors and control buttons
 */
export function AssetClassesConfiguration({
  config,
  enabledAssetsCount,
  onAssetClassChange,
  onNormalizeAllocations,
  onResetToDefaults,
}: AssetClassesConfigurationProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">Anlageklassen</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onNormalizeAllocations}
            className="text-xs"
            disabled={enabledAssetsCount === 0}
          >
            <TrendingUp className="h-3 w-3 mr-1" />
            Normalisieren
          </Button>
          <Button variant="outline" size="sm" onClick={onResetToDefaults} className="text-xs">
            <RotateCcw className="h-3 w-3 mr-1" />
            Zurücksetzen
          </Button>
        </div>
      </div>

      {Object.entries(DEFAULT_ASSET_CLASSES).map(([assetClass, defaultConfig]) => {
        const currentConfig = config.assetClasses[assetClass as AssetClass]

        return (
          <AssetClassEditor
            key={assetClass}
            assetClass={assetClass as AssetClass}
            name={defaultConfig.name}
            description={defaultConfig.description}
            config={currentConfig}
            onChange={onAssetClassChange}
          />
        )
      })}
    </div>
  )
}
