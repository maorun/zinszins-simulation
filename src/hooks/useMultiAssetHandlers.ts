import { useCallback } from 'react'
import {
  type MultiAssetPortfolioConfig,
  type AssetClass,
  createDefaultMultiAssetConfig,
} from '../../helpers/multi-asset-portfolio'
import type { VolatilityTargetingConfig } from '../../helpers/volatility-targeting'
import type { Currency, CurrencyHedgingConfig } from '../../helpers/currency-risk'
import type { ESGFilterConfig } from '../../helpers/esg-scoring'
import {
  type GeographicDiversificationConfig,
  createDefaultGeographicDiversificationConfig,
} from '../../helpers/geographic-diversification'

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
 * Apply optimized allocations from portfolio optimizer
 */
function applyAllocationsToConfig(
  config: MultiAssetPortfolioConfig,
  allocations: Record<AssetClass, number>,
): MultiAssetPortfolioConfig {
  const updatedAssetClasses = { ...config.assetClasses }

  for (const [asset, allocation] of Object.entries(allocations)) {
    if (updatedAssetClasses[asset as AssetClass]) {
      updatedAssetClasses[asset as AssetClass] = {
        ...updatedAssetClasses[asset as AssetClass],
        targetAllocation: allocation,
      }
    }
  }

  return {
    ...config,
    assetClasses: updatedAssetClasses,
  }
}

function useCurrencyRiskHandler({ config, onChange }: UseMultiAssetHandlersProps) {
  return useCallback(
    (updates: {
      enabled?: boolean
      currencyAllocations?: Array<{ currency: Currency; allocation: number }>
      hedging?: Partial<CurrencyHedgingConfig>
    }) => {
      const currentCurrencyRisk = config.currencyRisk || {
        enabled: false,
        currencyAllocations: [],
        hedging: { strategy: 'unhedged' as const, hedgingRatio: 0.5, hedgingCostPercent: 0.01 },
      }

      onChange({
        ...config,
        currencyRisk: {
          ...currentCurrencyRisk,
          ...updates,
          hedging: updates.hedging
            ? { ...currentCurrencyRisk.hedging, ...updates.hedging }
            : currentCurrencyRisk.hedging,
        },
      })
    },
    [config, onChange],
  )
}

function useESGFilterHandler({ config, onChange }: UseMultiAssetHandlersProps) {
  return useCallback(
    (updates: Partial<ESGFilterConfig>) => {
      const currentESGFilter = config.esgFilter || {
        enabled: false,
        minimumOverallScore: 6,
        environmentalWeight: 1 / 3,
        socialWeight: 1 / 3,
        governanceWeight: 1 / 3,
      }

      onChange({
        ...config,
        esgFilter: {
          ...currentESGFilter,
          ...updates,
        },
      })
    },
    [config, onChange],
  )
}

function useGeographicDiversificationHandler({ config, onChange }: UseMultiAssetHandlersProps) {
  return useCallback(
    (updates: Partial<GeographicDiversificationConfig>) => {
      const currentGeoDiversification =
        config.geographicDiversification || createDefaultGeographicDiversificationConfig()

      onChange({
        ...config,
        geographicDiversification: {
          ...currentGeoDiversification,
          ...updates,
          regions: updates.regions
            ? { ...currentGeoDiversification.regions, ...updates.regions }
            : currentGeoDiversification.regions,
        },
      })
    },
    [config, onChange],
  )
}

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

  const handleVolatilityTargetingChange = useCallback(
    (updates: Partial<VolatilityTargetingConfig>) => {
      onChange({ ...config, volatilityTargeting: { ...config.volatilityTargeting, ...updates } })
    },
    [config, onChange],
  )

  return {
    handleConfigChange,
    handleRebalancingChange,
    handleSimulationChange,
    handleVolatilityTargetingChange,
    handleCurrencyRiskChange: useCurrencyRiskHandler({ config, onChange }),
    handleESGFilterChange: useESGFilterHandler({ config, onChange }),
    handleGeographicDiversificationChange: useGeographicDiversificationHandler({ config, onChange }),
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

  const applyOptimizedAllocations = useCallback(
    (allocations: Record<AssetClass, number>) => {
      onChange(applyAllocationsToConfig(config, allocations))
    },
    [config, onChange],
  )

  return {
    ...basicHandlers,
    handleAssetClassChange,
    resetToDefaults,
    normalizeAllocations,
    applyOptimizedAllocations,
  }
}
