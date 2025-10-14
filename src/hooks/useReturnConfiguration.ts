import { useMemo } from 'react'
import type { ReturnConfiguration, ReturnMode } from '../utils/random-returns'
import type { MultiAssetPortfolioConfig } from '../../helpers/multi-asset-portfolio'

interface ReturnConfigurationParams {
  returnMode: ReturnMode
  rendite: number
  averageReturn: number
  standardDeviation: number
  randomSeed?: number
  variableReturns: Record<number, number>
  historicalIndex: string
  multiAssetConfig: MultiAssetPortfolioConfig
}

/**
 * Hook to build return configuration from context properties
 * Extracted from HomePageContent to reduce complexity
 */
export function useReturnConfiguration(params: ReturnConfigurationParams): ReturnConfiguration {
  const {
    returnMode,
    rendite,
    averageReturn,
    standardDeviation,
    randomSeed,
    variableReturns,
    historicalIndex,
    multiAssetConfig,
  } = params

  const returnConfig = useMemo(() => {
    const config: ReturnConfiguration = { mode: returnMode }

    switch (returnMode) {
      case 'fixed':
        config.fixedRate = rendite / 100
        break
      case 'random':
        config.randomConfig = {
          averageReturn: averageReturn / 100,
          standardDeviation: standardDeviation / 100,
          seed: randomSeed,
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
        config.multiAssetConfig = multiAssetConfig
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

  return returnConfig
}
