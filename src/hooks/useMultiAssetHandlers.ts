import { useCallback } from 'react'
import {
  type MultiAssetPortfolioConfig,
  type AssetClass,
  createDefaultMultiAssetConfig,
} from '../../helpers/multi-asset-portfolio'

interface UseMultiAssetHandlersProps {
  config: MultiAssetPortfolioConfig
  onChange: (config: MultiAssetPortfolioConfig) => void
}

/**
 * Normalize asset allocations to sum to 100%
 */
function normalizeAssetAllocations(config: MultiAssetPortfolioConfig): MultiAssetPortfolioConfig {
  const enabledAssetClasses = Object.entries(config.assetClasses).filter(([_, assetConfig]) => assetConfig.enabled)

  if (enabledAssetClasses.length === 0) return config

  const totalAllocation = enabledAssetClasses.reduce((sum, [_, assetConfig]) => sum + assetConfig.targetAllocation, 0)

  if (totalAllocation === 0) return config

  const normalizedAssetClasses = { ...config.assetClasses }
  for (const [assetClass, assetConfig] of enabledAssetClasses) {
    normalizedAssetClasses[assetClass as AssetClass] = {
      ...assetConfig,
      targetAllocation: assetConfig.targetAllocation / totalAllocation,
    }
  }

  return {
    ...config,
    assetClasses: normalizedAssetClasses,
  }
}

/**
 * Hook for basic config change handlers
 */
function useBasicConfigHandlers({ config, onChange }: UseMultiAssetHandlersProps) {
  const handleConfigChange = useCallback(
    (updates: Partial<MultiAssetPortfolioConfig>) => {
      onChange({ ...config, ...updates })
    },
    [config, onChange],
  )

  const handleRebalancingChange = useCallback(
    (updates: Partial<typeof config.rebalancing>) => {
      onChange({
        ...config,
        rebalancing: {
          ...config.rebalancing,
          ...updates,
        },
      })
    },
    [config, onChange],
  )

  const handleSimulationChange = useCallback(
    (updates: Partial<typeof config.simulation>) => {
      onChange({
        ...config,
        simulation: {
          ...config.simulation,
          ...updates,
        },
      })
    },
    [config, onChange],
  )

  return {
    handleConfigChange,
    handleRebalancingChange,
    handleSimulationChange,
  }
}

/**
 * Custom hook providing event handlers for multi-asset portfolio configuration
 */
export function useMultiAssetHandlers({ config, onChange }: UseMultiAssetHandlersProps) {
  const basicHandlers = useBasicConfigHandlers({ config, onChange })

  const handleAssetClassChange = useCallback(
    (assetClass: AssetClass, updates: Partial<(typeof config.assetClasses)[AssetClass]>) => {
      onChange({
        ...config,
        assetClasses: {
          ...config.assetClasses,
          [assetClass]: {
            ...config.assetClasses[assetClass],
            ...updates,
          },
        },
      })
    },
    [config, onChange],
  )

  const resetToDefaults = useCallback(() => {
    const defaultConfig = createDefaultMultiAssetConfig()
    defaultConfig.enabled = config.enabled
    onChange(defaultConfig)
  }, [config.enabled, onChange])

  const normalizeAllocations = useCallback(() => {
    onChange(normalizeAssetAllocations(config))
  }, [config, onChange])

  return {
    ...basicHandlers,
    handleAssetClassChange,
    resetToDefaults,
    normalizeAllocations,
  }
}
