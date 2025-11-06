import { Card, CardContent } from './ui/card'
import {
  type MultiAssetPortfolioConfig,
  createDefaultMultiAssetConfig,
  validateMultiAssetConfig,
} from '../../helpers/multi-asset-portfolio'
import { MultiAssetHeader } from './multi-asset/MultiAssetHeader'
import { MultiAssetConfigurationContent } from './multi-asset/MultiAssetConfigurationContent'
import { MultiAssetLoadingState } from './multi-asset/MultiAssetLoadingState'
import { usePortfolioMetrics } from '../hooks/usePortfolioMetrics'
import { useMultiAssetHandlers } from '../hooks/useMultiAssetHandlers'

interface MultiAssetPortfolioConfigurationProps {
  /** Current multi-asset portfolio configuration */
  values: MultiAssetPortfolioConfig
  /** Callback when configuration changes */
  onChange: (config: MultiAssetPortfolioConfig) => void
  /** Card nesting level for proper styling */
  nestingLevel?: number
}

/**
 * Validate and get safe configuration values
 */
function getSafeMultiAssetConfig(
  values: MultiAssetPortfolioConfig | undefined,
  onChange: (config: MultiAssetPortfolioConfig) => void,
): MultiAssetPortfolioConfig | null {
  // Ensure we have a valid configuration object
  const safeValues = values || createDefaultMultiAssetConfig()

  // Additional safety check - if safeValues is still undefined or malformed, create a minimal valid config
  if (!safeValues || typeof safeValues !== 'object' || !safeValues.assetClasses) {
    console.warn('MultiAssetPortfolioConfiguration received invalid values, using default config')
    const fallbackConfig = createDefaultMultiAssetConfig()
    onChange?.(fallbackConfig)
    return null // Signal that fallback UI should be shown
  }

  return safeValues
}

export function MultiAssetPortfolioConfiguration({
  values,
  onChange,
  nestingLevel = 0,
}: MultiAssetPortfolioConfigurationProps) {
  const safeValues = getSafeMultiAssetConfig(values, onChange)

  // Use custom hooks for metrics and handlers - must be called unconditionally
  const { enabledAssets, expectedPortfolioReturn, expectedPortfolioRisk } = usePortfolioMetrics(
    safeValues || createDefaultMultiAssetConfig(),
  )

  const {
    handleConfigChange,
    handleAssetClassChange,
    handleRebalancingChange,
    handleSimulationChange,
    resetToDefaults,
    normalizeAllocations,
  } = useMultiAssetHandlers({
    config: safeValues || createDefaultMultiAssetConfig(),
    onChange,
  })

  // Show loading state if configuration is being initialized
  if (!safeValues) {
    return <MultiAssetLoadingState nestingLevel={nestingLevel} />
  }

  // Validate configuration
  const validationErrors = validateMultiAssetConfig(safeValues)

  return (
    <Card nestingLevel={nestingLevel} className="mb-4">
      <MultiAssetHeader
        enabled={safeValues.enabled}
        onEnabledChange={enabled => handleConfigChange({ enabled })}
        nestingLevel={nestingLevel}
      />
      <CardContent nestingLevel={nestingLevel}>
        {safeValues.enabled && (
          <MultiAssetConfigurationContent
            config={safeValues}
            expectedPortfolioReturn={expectedPortfolioReturn}
            expectedPortfolioRisk={expectedPortfolioRisk}
            enabledAssetsCount={enabledAssets.length}
            validationErrors={validationErrors}
            onAssetClassChange={handleAssetClassChange}
            onNormalizeAllocations={normalizeAllocations}
            onResetToDefaults={resetToDefaults}
            onRebalancingChange={handleRebalancingChange}
            onSimulationChange={handleSimulationChange}
          />
        )}
      </CardContent>
    </Card>
  )
}

export default MultiAssetPortfolioConfiguration
