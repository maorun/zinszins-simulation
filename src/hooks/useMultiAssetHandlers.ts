import { useCallback } from 'react'
import type {
  MultiAssetPortfolioConfig,
  AssetClass,
} from '../../helpers/multi-asset-portfolio'
import { createDefaultMultiAssetConfig } from '../../helpers/multi-asset-portfolio'

interface UseMultiAssetHandlersProps {
  config: MultiAssetPortfolioConfig
  onChange: (config: MultiAssetPortfolioConfig) => void
}

/**
 * Custom hook providing event handlers for multi-asset portfolio configuration
 */
export function useMultiAssetHandlers({ config, onChange }: UseMultiAssetHandlersProps) {
  const handleConfigChange = useCallback(
    (updates: Partial<MultiAssetPortfolioConfig>) => {
      onChange({ ...config, ...updates })
    },
    [config, onChange],
  )

  const handleAssetClassChange = useCallback(
    (assetClass: AssetClass, updates: Partial<typeof config.assetClasses[AssetClass]>) => {
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

  const resetToDefaults = useCallback(() => {
    const defaultConfig = createDefaultMultiAssetConfig()
    defaultConfig.enabled = config.enabled // Preserve enabled state
    onChange(defaultConfig)
  }, [config.enabled, onChange])

  const normalizeAllocations = useCallback(() => {
    const enabledAssetClasses = Object.entries(config.assetClasses).filter(
      ([_, assetConfig]) => assetConfig.enabled,
    )

    if (enabledAssetClasses.length === 0) return

    const totalAllocation = enabledAssetClasses.reduce(
      (sum, [_, assetConfig]) => sum + assetConfig.targetAllocation,
      0,
    )

    if (totalAllocation === 0) return

    const normalizedAssetClasses = { ...config.assetClasses }
    for (const [assetClass, assetConfig] of enabledAssetClasses) {
      normalizedAssetClasses[assetClass as AssetClass] = {
        ...assetConfig,
        targetAllocation: assetConfig.targetAllocation / totalAllocation,
      }
    }

    onChange({
      ...config,
      assetClasses: normalizedAssetClasses,
    })
  }, [config, onChange])

  return {
    handleConfigChange,
    handleAssetClassChange,
    handleRebalancingChange,
    handleSimulationChange,
    resetToDefaults,
    normalizeAllocations,
  }
}
