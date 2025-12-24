import { Button } from '../ui/button'
import { RotateCcw, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react'
import {
  type AssetClass,
  DEFAULT_ASSET_CLASSES,
  type MultiAssetPortfolioConfig,
} from '../../../helpers/multi-asset-portfolio'
import { AssetClassEditor } from './AssetClassEditor'
import { AlternativeInvestmentsInfo } from './AlternativeInvestmentsInfo'
import { useMemo, useState } from 'react'

interface AssetClassesConfigurationProps {
  /** Current multi-asset portfolio configuration */
  config: MultiAssetPortfolioConfig
  /** Number of enabled asset classes */
  enabledAssetsCount: number
  /** Callback when an asset class configuration changes */
  onAssetClassChange: (
    assetClass: AssetClass,
    updates: Partial<MultiAssetPortfolioConfig['assetClasses'][AssetClass]>,
  ) => void
  /** Callback to normalize allocations to sum to 100% */
  onNormalizeAllocations: () => void
  /** Callback to reset all settings to defaults */
  onResetToDefaults: () => void
}

/**
 * Determine if an asset class is an alternative investment
 */
function isAlternativeInvestment(assetClass: AssetClass): boolean {
  return assetClass === 'real_estate' || assetClass === 'commodities'
}

/**
 * Toggle button for alternative investments info
 */
function AlternativeInvestmentsToggle({ showInfo, onToggle }: { showInfo: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-md hover:bg-amber-100 transition-colors"
    >
      <span className="text-sm font-semibold text-amber-900">ℹ️ Alternative Investments: REITs & Rohstoffe</span>
      {showInfo ? <ChevronUp className="h-4 w-4 text-amber-700" /> : <ChevronDown className="h-4 w-4 text-amber-700" />}
    </button>
  )
}

/**
 * Hint shown when alternative investments are enabled
 */
function EnabledAlternativesHint({ onShowInfo }: { onShowInfo: () => void }) {
  return (
    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
      <p className="text-xs text-blue-800">
        💡 Sie haben alternative Investments aktiviert.{' '}
        <button onClick={onShowInfo} className="underline font-semibold hover:text-blue-900">
          Mehr erfahren
        </button>
      </p>
    </div>
  )
}

/**
 * Render asset class editors with alternative investments info
 */
function AssetClassEditorsList({
  config,
  showAlternativeInfo,
  onToggleAlternativeInfo,
  onAssetClassChange,
}: {
  config: MultiAssetPortfolioConfig
  showAlternativeInfo: boolean
  onToggleAlternativeInfo: () => void
  onAssetClassChange: (
    assetClass: AssetClass,
    updates: Partial<MultiAssetPortfolioConfig['assetClasses'][AssetClass]>,
  ) => void
}) {
  return (
    <>
      {Object.entries(DEFAULT_ASSET_CLASSES).map(([assetClass, defaultConfig]) => {
        const currentConfig = config.assetClasses[assetClass as AssetClass]
        const assetClassKey = assetClass as AssetClass
        const isAlternative = isAlternativeInvestment(assetClassKey)
        const showInfoBefore = isAlternative && assetClass === 'real_estate'

        return (
          <div key={assetClass}>
            {showInfoBefore && (
              <div className="mb-4">
                <AlternativeInvestmentsToggle showInfo={showAlternativeInfo} onToggle={onToggleAlternativeInfo} />
                {showAlternativeInfo && (
                  <div className="mt-2">
                    <AlternativeInvestmentsInfo />
                  </div>
                )}
              </div>
            )}

            <AssetClassEditor
              assetClass={assetClassKey}
              name={defaultConfig.name}
              description={defaultConfig.description}
              config={currentConfig}
              onChange={onAssetClassChange}
            />
          </div>
        )
      })}
    </>
  )
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
  const [showAlternativeInfo, setShowAlternativeInfo] = useState(false)

  // Check if any alternative investments are enabled
  const hasEnabledAlternatives = useMemo(() => {
    return config.assetClasses.real_estate.enabled || config.assetClasses.commodities.enabled
  }, [config.assetClasses.real_estate.enabled, config.assetClasses.commodities.enabled])

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

      <AssetClassEditorsList
        config={config}
        showAlternativeInfo={showAlternativeInfo}
        onToggleAlternativeInfo={() => setShowAlternativeInfo(!showAlternativeInfo)}
        onAssetClassChange={onAssetClassChange}
      />

      {hasEnabledAlternatives && !showAlternativeInfo && (
        <EnabledAlternativesHint onShowInfo={() => setShowAlternativeInfo(true)} />
      )}
    </div>
  )
}
