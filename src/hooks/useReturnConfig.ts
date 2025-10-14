import { useMemo } from 'react'
import type { ReturnMode, ReturnConfiguration } from '../utils/random-returns'
import type { MultiAssetPortfolioConfig } from '../../helpers/multi-asset-portfolio'

interface UseReturnConfigProps {
  returnMode: ReturnMode
  rendite: number
  averageReturn: number
  standardDeviation: number
  randomSeed: number | undefined
  variableReturns: Record<number, number>
  historicalIndex: string
  multiAssetConfig: MultiAssetPortfolioConfig | null
}

/**
 * Custom hook for building return configuration from context properties
 */
export function useReturnConfig({
  returnMode,
  rendite,
  averageReturn,
  standardDeviation,
  randomSeed,
  variableReturns,
  historicalIndex,
  multiAssetConfig,
}: UseReturnConfigProps): ReturnConfiguration {
  return useMemo(() => {
    const config: ReturnConfiguration = { mode: returnMode }

    switch (returnMode) {
      case 'fixed':
        config.fixedRate = rendite / 100
        break
      case 'random':
        config.randomConfig = {
          averageReturn: averageReturn / 100,
          standardDeviation: standardDeviation / 100,
          seed: randomSeed ?? Date.now(),
        }
        break
      case 'variable':
        config.variableConfig = {
          yearlyReturns: variableReturns,
        }
        break
      case 'historical':
        config.historicalConfig = {
          indexId: historicalIndex,
        }
        break
      case 'multiasset':
        config.multiAssetConfig = multiAssetConfig || undefined
        break
    }

    return config
  }, [
    returnMode,
    rendite,
    averageReturn,
    standardDeviation,
    randomSeed,
    variableReturns,
    historicalIndex,
    multiAssetConfig,
  ])
}
