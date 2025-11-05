import { useMemo } from 'react'
import type { MultiAssetPortfolioConfig } from '../../helpers/multi-asset-portfolio'

/**
 * Calculate portfolio metrics (expected return and risk) from enabled asset classes
 */
export function usePortfolioMetrics(config: MultiAssetPortfolioConfig) {
  const enabledAssets = useMemo(
    () =>
      Object.entries(config.assetClasses || {}).filter(([_, assetConfig]) => assetConfig?.enabled),
    [config.assetClasses],
  )

  const expectedPortfolioReturn = useMemo(
    () =>
      enabledAssets.reduce(
        (sum, [_, assetConfig]) => sum + assetConfig.expectedReturn * assetConfig.targetAllocation,
        0,
      ),
    [enabledAssets],
  )

  const expectedPortfolioRisk = useMemo(
    () =>
      Math.sqrt(
        enabledAssets.reduce(
          (sum, [_, assetConfig]) =>
            sum + Math.pow(assetConfig.volatility * assetConfig.targetAllocation, 2),
          0,
        ),
      ),
    [enabledAssets],
  )

  return {
    enabledAssets,
    expectedPortfolioReturn,
    expectedPortfolioRisk,
  }
}
