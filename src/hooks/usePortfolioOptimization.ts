import { useState, useMemo, useCallback } from 'react'
import {
  optimizePortfolio,
  type OptimizationObjective,
  type OptimizationConfig,
  type OptimizationResult,
} from '../utils/portfolio-optimization'
import type { MultiAssetPortfolioConfig } from '../../helpers/multi-asset-portfolio'

/**
 * Hook for portfolio optimization logic
 */
export function usePortfolioOptimization(config: MultiAssetPortfolioConfig) {
  const [selectedObjective, setSelectedObjective] = useState<OptimizationObjective>('max-sharpe')
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null)
  const [isOptimizing, setIsOptimizing] = useState(false)

  const canOptimize = useMemo(() => {
    const enabledAssets = Object.values(config.assetClasses).filter(asset => asset.enabled)
    return enabledAssets.length >= 2
  }, [config])

  const handleOptimize = useCallback(() => {
    if (!canOptimize) return

    setIsOptimizing(true)

    try {
      const optimizationConfig: OptimizationConfig = {
        objective: selectedObjective,
        riskFreeRate: 0.01,
        minAllocation: 0.0,
        maxAllocation: 1.0,
        maxIterations: 1000,
        tolerance: 0.0001,
      }

      const result = optimizePortfolio(config, optimizationConfig)
      setOptimizationResult(result)
    } catch (error) {
      console.error('Optimization failed:', error)
      setOptimizationResult(null)
    } finally {
      setIsOptimizing(false)
    }
  }, [config, selectedObjective, canOptimize])

  return {
    selectedObjective,
    setSelectedObjective,
    optimizationResult,
    isOptimizing,
    canOptimize,
    handleOptimize,
  }
}
