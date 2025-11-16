import type { OptimizationResult } from '../../utils/portfolio-optimization'
import type { MultiAssetPortfolioConfig, AssetClass } from '../../../helpers/multi-asset-portfolio'

interface AllocationsListProps {
  result: OptimizationResult
  config: MultiAssetPortfolioConfig
}

/**
 * Display optimized allocations list
 */
export function AllocationsList({ result, config }: AllocationsListProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-gray-700">Optimierte Allokationen:</p>
      {Object.entries(result.allocations)
        .filter(([_, allocation]) => allocation > 0.001)
        .sort(([, a], [, b]) => b - a)
        .map(([asset, allocation]) => {
          const assetConfig = config.assetClasses[asset as AssetClass]
          return (
            <div key={asset} className="flex items-center justify-between text-sm">
              <span className="text-gray-700">{assetConfig.name}</span>
              <span className="font-medium">{(allocation * 100).toFixed(1)}%</span>
            </div>
          )
        })}
    </div>
  )
}
