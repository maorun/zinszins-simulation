import { useCallback } from 'react'
import { Button } from '../ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'
import { Sparkles } from 'lucide-react'
import type { MultiAssetPortfolioConfig, AssetClass } from '../../../helpers/multi-asset-portfolio'
import { OptimizationInfoBox } from './OptimizationInfoBox'
import { ObjectiveSelector } from './ObjectiveSelector'
import { OptimizationResultDisplay } from './OptimizationResultDisplay'
import { usePortfolioOptimization } from '../../hooks/usePortfolioOptimization'

interface PortfolioOptimizerProps {
  config: MultiAssetPortfolioConfig
  onApplyAllocations: (allocations: Record<AssetClass, number>) => void
}

/**
 * Portfolio Optimizer Component
 */
export function PortfolioOptimizer({ config, onApplyAllocations }: PortfolioOptimizerProps) {
  const {
    selectedObjective,
    setSelectedObjective,
    optimizationResult,
    isOptimizing,
    canOptimize,
    handleOptimize,
  } = usePortfolioOptimization(config)

  const handleApplyAllocations = useCallback(() => {
    if (!optimizationResult) return
    onApplyAllocations(optimizationResult.allocations)
  }, [optimizationResult, onApplyAllocations])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Portfolio-Optimierung
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <OptimizationInfoBox />

        <ObjectiveSelector selectedObjective={selectedObjective} onSelect={setSelectedObjective} />

        <Button onClick={handleOptimize} disabled={!canOptimize || isOptimizing} className="w-full">
          <Sparkles className="h-4 w-4 mr-2" />
          {isOptimizing ? 'Optimiere...' : 'Portfolio optimieren'}
        </Button>

        {!canOptimize && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              Mindestens 2 Anlageklassen müssen aktiviert sein, um eine Optimierung durchzuführen.
            </p>
          </div>
        )}

        {optimizationResult && (
          <OptimizationResultDisplay
            result={optimizationResult}
            config={config}
            onApplyAllocations={handleApplyAllocations}
          />
        )}
      </CardContent>
    </Card>
  )
}
