import { Card } from './ui/card'
import {
  type MultiAssetPortfolioConfig,
  createDefaultMultiAssetConfig,
  validateMultiAssetConfig,
} from '../../helpers/multi-asset-portfolio'
import { MultiAssetHeader } from './multi-asset/MultiAssetHeader'
import { MultiAssetLoadingState } from './multi-asset/MultiAssetLoadingState'
import { MultiAssetContent } from './MultiAssetContent'
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
 * Validate and return safe configuration with fallback
 */
function useSafeMultiAssetConfig(
  values: MultiAssetPortfolioConfig | undefined,
  onChange: (config: MultiAssetPortfolioConfig) => void,
): MultiAssetPortfolioConfig | null {
  const safeValues = values || createDefaultMultiAssetConfig()

  if (!safeValues || typeof safeValues !== 'object' || !safeValues.assetClasses) {
    console.warn('MultiAssetPortfolioConfiguration received invalid values, using default config')
    const fallbackConfig = createDefaultMultiAssetConfig()
    onChange?.(fallbackConfig)
    return null
  }

  return safeValues
}

export function MultiAssetPortfolioConfiguration({
  values,
  onChange,
  nestingLevel = 0,
}: MultiAssetPortfolioConfigurationProps) {
  const safeValues = useSafeMultiAssetConfig(values, onChange)

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
    applyOptimizedAllocations,
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
      <MultiAssetContent
        enabled={safeValues.enabled}
        config={safeValues}
        expectedPortfolioReturn={expectedPortfolioReturn}
        expectedPortfolioRisk={expectedPortfolioRisk}
        enabledAssetsCount={enabledAssets.length}
        validationErrors={validationErrors}
        nestingLevel={nestingLevel}
        onAssetClassChange={handleAssetClassChange}
        onNormalizeAllocations={normalizeAllocations}
        onResetToDefaults={resetToDefaults}
        onRebalancingChange={handleRebalancingChange}
        onSimulationChange={handleSimulationChange}
        onApplyOptimizedAllocations={applyOptimizedAllocations}
      />
    </Card>
  )
}

export default MultiAssetPortfolioConfiguration
