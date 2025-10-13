import type { ReturnMode, ReturnConfiguration } from '../../../utils/random-returns'
import { buildReturnConfig, applyBlackSwanReturns, applyInflationScenarioModifiers } from '../../helpers/simulation-helpers'

export interface ReturnConfigParams {
  returnMode: ReturnMode
  rendite: number
  averageReturn: number
  standardDeviation: number
  randomSeed: number | undefined
  variableReturns: Record<number, number>
  historicalIndex: string
  multiAssetConfig: import('../../../../helpers/multi-asset-portfolio').MultiAssetPortfolioConfig
  blackSwanReturns: Record<number, number> | null
  inflationScenarioReturnModifiers: Record<number, number> | null
}

export function buildFinalReturnConfig(
  overwrite: { rendite?: number },
  params: ReturnConfigParams,
): ReturnConfiguration {
  let returnConfig: ReturnConfiguration

  if (overwrite.rendite !== undefined) {
    returnConfig = { mode: 'fixed', fixedRate: overwrite.rendite / 100 }
  }
  else {
    returnConfig = buildReturnConfig(
      params.returnMode,
      params.rendite,
      params.averageReturn,
      params.standardDeviation,
      params.randomSeed,
      params.variableReturns,
      params.historicalIndex,
      params.multiAssetConfig,
    )
  }

  returnConfig = applyBlackSwanReturns(returnConfig, params.blackSwanReturns, params.returnMode)
  returnConfig = applyInflationScenarioModifiers(
    returnConfig,
    params.inflationScenarioReturnModifiers,
    params.returnMode,
    params.rendite,
  )

  return returnConfig
}
