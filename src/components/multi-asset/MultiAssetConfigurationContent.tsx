import type { MultiAssetPortfolioConfig, AssetClass } from '../../../helpers/multi-asset-portfolio'
import type { VolatilityTargetingConfig } from '../../../helpers/volatility-targeting'
import { AssetAllocationSummary } from './AssetAllocationSummary'
import { AssetClassesConfiguration } from './AssetClassesConfiguration'
import { RebalancingConfiguration } from './RebalancingConfiguration'
import { AdvancedSimulationSettings } from './AdvancedSimulationSettings'
import { VolatilityTargetingConfiguration } from './VolatilityTargetingConfiguration'
import { CorrelationMatrixHeatmap } from './CorrelationMatrixHeatmap'
import { PortfolioOptimizer } from './PortfolioOptimizer'
import { Info } from 'lucide-react'

/** Information section component for multi-asset portfolio hints */
function MultiAssetInfoSection() {
  return (
    <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
      <div className="flex items-start gap-2 text-gray-700 text-sm">
        <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium mb-1">Hinweise zum Multi-Asset Portfolio:</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>Basiert auf historischen deutschen/europäischen Marktdaten</li>
            <li>Berücksichtigt deutsche Steuerregeln (Teilfreistellung für Aktien/REITs)</li>
            <li>Automatisches Rebalancing reduziert Portfoliorisiko</li>
            <li>Korrelationen verbessern die Realitätsnähe der Simulation</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

interface MultiAssetConfigurationContentProps {
  config: MultiAssetPortfolioConfig
  expectedPortfolioReturn: number
  expectedPortfolioRisk: number
  enabledAssetsCount: number
  validationErrors: string[]
  onAssetClassChange: (
    assetClass: AssetClass,
    updates: Partial<MultiAssetPortfolioConfig['assetClasses'][AssetClass]>,
  ) => void
  onNormalizeAllocations: () => void
  onResetToDefaults: () => void
  onRebalancingChange: (updates: Partial<MultiAssetPortfolioConfig['rebalancing']>) => void
  onSimulationChange: (updates: Partial<MultiAssetPortfolioConfig['simulation']>) => void
  onVolatilityTargetingChange: (updates: Partial<VolatilityTargetingConfig>) => void
  onApplyOptimizedAllocations: (allocations: Record<AssetClass, number>) => void
}

/**
 * Main configuration content when multi-asset portfolio is enabled
 */
export function MultiAssetConfigurationContent({
  config,
  expectedPortfolioReturn,
  expectedPortfolioRisk,
  enabledAssetsCount,
  validationErrors,
  onAssetClassChange,
  onNormalizeAllocations,
  onResetToDefaults,
  onRebalancingChange,
  onSimulationChange,
  onVolatilityTargetingChange,
  onApplyOptimizedAllocations,
}: MultiAssetConfigurationContentProps) {
  return (
    <div className="space-y-6">
      <AssetAllocationSummary
        expectedReturn={expectedPortfolioReturn}
        expectedRisk={expectedPortfolioRisk}
        enabledAssetsCount={enabledAssetsCount}
        validationErrors={validationErrors}
      />

      <PortfolioOptimizer config={config} onApplyAllocations={onApplyOptimizedAllocations} />

      <AssetClassesConfiguration
        config={config}
        enabledAssetsCount={enabledAssetsCount}
        onAssetClassChange={onAssetClassChange}
        onNormalizeAllocations={onNormalizeAllocations}
        onResetToDefaults={onResetToDefaults}
      />

      <RebalancingConfiguration config={config.rebalancing} onChange={onRebalancingChange} />

      <VolatilityTargetingConfiguration config={config.volatilityTargeting} onChange={onVolatilityTargetingChange} />

      <AdvancedSimulationSettings config={config.simulation} onChange={onSimulationChange} />

      {config.simulation.useCorrelation && <CorrelationMatrixHeatmap config={config} />}

      <MultiAssetInfoSection />
    </div>
  )
}
