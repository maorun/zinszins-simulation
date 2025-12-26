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

/**
 * Custom hook to set up multi-asset configuration and handlers
 */
function useMultiAssetSetup(
  safeValues: MultiAssetPortfolioConfig,
  onChange: (config: MultiAssetPortfolioConfig) => void,
) {
  const { enabledAssets, expectedPortfolioReturn, expectedPortfolioRisk } = usePortfolioMetrics(safeValues)

  const handlers = useMultiAssetHandlers({
    config: safeValues,
    onChange,
  })

  const validationErrors = validateMultiAssetConfig(safeValues)

  return {
    enabledAssets,
    expectedPortfolioReturn,
    expectedPortfolioRisk,
    validationErrors,
    ...handlers,
  }
}

export function MultiAssetPortfolioConfiguration({
  values,
  onChange,
  nestingLevel = 0,
}: MultiAssetPortfolioConfigurationProps) {
  const safeValues = useSafeMultiAssetConfig(values, onChange)

  const setup = useMultiAssetSetup(safeValues || createDefaultMultiAssetConfig(), onChange)

  // Show loading state if configuration is being initialized
  if (!safeValues) {
    return <MultiAssetLoadingState nestingLevel={nestingLevel} />
  }

  return (
    <Card nestingLevel={nestingLevel} className="mb-4">
      <MultiAssetHeader
        enabled={safeValues.enabled}
        onEnabledChange={enabled => setup.handleConfigChange({ enabled })}
        nestingLevel={nestingLevel}
      />
      <MultiAssetContent
        enabled={safeValues.enabled}
        config={safeValues}
        expectedPortfolioReturn={setup.expectedPortfolioReturn}
        expectedPortfolioRisk={setup.expectedPortfolioRisk}
        enabledAssetsCount={setup.enabledAssets.length}
        validationErrors={setup.validationErrors}
        nestingLevel={nestingLevel}
        onAssetClassChange={setup.handleAssetClassChange}
        onNormalizeAllocations={setup.normalizeAllocations}
        onResetToDefaults={setup.resetToDefaults}
        onRebalancingChange={setup.handleRebalancingChange}
        onSimulationChange={setup.handleSimulationChange}
        onVolatilityTargetingChange={setup.handleVolatilityTargetingChange}
        onApplyOptimizedAllocations={setup.applyOptimizedAllocations}
        onCurrencyRiskChange={setup.handleCurrencyRiskChange}
        onESGFilterChange={setup.handleESGFilterChange}
      />
    </Card>
  )
}

export default MultiAssetPortfolioConfiguration
