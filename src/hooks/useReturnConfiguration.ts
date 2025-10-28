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
 * Build return configuration based on mode and parameters
 */
function buildReturnConfig(params: ReturnConfigurationParams): ReturnConfiguration {
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
      config.variableConfig = { yearlyReturns: variableReturns }
      break
    case 'historical':
      config.historicalConfig = { indexId: historicalIndex }
      break
    case 'multiasset':
      config.multiAssetConfig = multiAssetConfig
      break
  }

  return config
}

/**
 * Hook to build return configuration from context properties
 * Extracted from HomePageContent to reduce complexity
 */
export function useReturnConfiguration({
  returnMode,
  rendite,
  averageReturn,
  standardDeviation,
  randomSeed,
  variableReturns,
  historicalIndex,
  multiAssetConfig,
}: ReturnConfigurationParams): ReturnConfiguration {
  return useMemo(
    () =>
      buildReturnConfig({
        returnMode,
        rendite,
        averageReturn,
        standardDeviation,
        randomSeed,
        variableReturns,
        historicalIndex,
        multiAssetConfig,
      }),
    [
      returnMode,
      rendite,
      averageReturn,
      standardDeviation,
      randomSeed,
      variableReturns,
      historicalIndex,
      multiAssetConfig,
    ],
  )
}
