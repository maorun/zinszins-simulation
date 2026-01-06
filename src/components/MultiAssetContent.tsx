import { CardContent } from './ui/card'
import { MultiAssetConfigurationContent } from './multi-asset/MultiAssetConfigurationContent'
import type { MultiAssetPortfolioConfig, AssetClass } from '../../helpers/multi-asset-portfolio'
import type { VolatilityTargetingConfig } from '../../helpers/volatility-targeting'
import type { GlidePathConfig } from '../../helpers/glide-path'
import type { Currency, CurrencyHedgingConfig } from '../../helpers/currency-risk'
import type { ESGFilterConfig } from '../../helpers/esg-scoring'
import type { GeographicDiversificationConfig } from '../../helpers/geographic-diversification'

interface MultiAssetContentProps {
  enabled: boolean
  config: MultiAssetPortfolioConfig
  expectedPortfolioReturn: number
  expectedPortfolioRisk: number
  enabledAssetsCount: number
  validationErrors: string[]
  nestingLevel: number
  onAssetClassChange: (
    assetClass: AssetClass,
    updates: Partial<MultiAssetPortfolioConfig['assetClasses'][AssetClass]>,
  ) => void
  onNormalizeAllocations: () => void
  onResetToDefaults: () => void
  onRebalancingChange: (updates: Partial<MultiAssetPortfolioConfig['rebalancing']>) => void
  onSimulationChange: (updates: Partial<MultiAssetPortfolioConfig['simulation']>) => void
  onVolatilityTargetingChange: (updates: Partial<VolatilityTargetingConfig>) => void
  onGlidePathChange: (updates: Partial<GlidePathConfig>) => void
  onApplyOptimizedAllocations: (allocations: Record<AssetClass, number>) => void
  onCurrencyRiskChange?: (updates: {
    enabled?: boolean
    currencyAllocations?: Array<{ currency: Currency; allocation: number }>
    hedging?: Partial<CurrencyHedgingConfig>
  }) => void
  onESGFilterChange?: (updates: Partial<ESGFilterConfig>) => void
  onGeographicDiversificationChange?: (updates: Partial<GeographicDiversificationConfig>) => void
}

/**
 * Render multi-asset portfolio configuration content
 */
export function MultiAssetContent({
  enabled,
  config,
  expectedPortfolioReturn,
  expectedPortfolioRisk,
  enabledAssetsCount,
  validationErrors,
  nestingLevel,
  onAssetClassChange,
  onNormalizeAllocations,
  onResetToDefaults,
  onRebalancingChange,
  onSimulationChange,
  onVolatilityTargetingChange,
  onGlidePathChange,
  onApplyOptimizedAllocations,
  onCurrencyRiskChange,
  onESGFilterChange,
  onGeographicDiversificationChange,
}: MultiAssetContentProps) {
  if (!enabled) return null

  return (
    <CardContent nestingLevel={nestingLevel}>
      <MultiAssetConfigurationContent
        config={config}
        expectedPortfolioReturn={expectedPortfolioReturn}
        expectedPortfolioRisk={expectedPortfolioRisk}
        enabledAssetsCount={enabledAssetsCount}
        validationErrors={validationErrors}
        onAssetClassChange={onAssetClassChange}
        onNormalizeAllocations={onNormalizeAllocations}
        onResetToDefaults={onResetToDefaults}
        onRebalancingChange={onRebalancingChange}
        onSimulationChange={onSimulationChange}
        onVolatilityTargetingChange={onVolatilityTargetingChange}
        onGlidePathChange={onGlidePathChange}
        onApplyOptimizedAllocations={onApplyOptimizedAllocations}
        onCurrencyRiskChange={onCurrencyRiskChange}
        onESGFilterChange={onESGFilterChange}
        onGeographicDiversificationChange={onGeographicDiversificationChange}
      />
    </CardContent>
  )
}
