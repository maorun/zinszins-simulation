import type { ReturnMode, ReturnConfiguration } from '../../utils/random-returns'
import type { MultiAssetPortfolioConfig } from '../../../helpers/multi-asset-portfolio'
import { mergeBlackSwanReturns } from '../../../helpers/black-swan-events'
import { mergeInflationWithBaseRate } from '../../../helpers/inflation-scenarios'

/**
 * Build return configuration based on return mode
 */
export function buildReturnConfig(
  returnMode: ReturnMode,
  rendite: number,
  averageReturn: number,
  standardDeviation: number,
  randomSeed: number | undefined,
  variableReturns: Record<number, number>,
  historicalIndex: string,
  multiAssetConfig: MultiAssetPortfolioConfig,
): ReturnConfiguration {
  if (returnMode === 'random') {
    return {
      mode: 'random',
      randomConfig: {
        averageReturn: averageReturn / 100 || 0.07,
        standardDeviation: standardDeviation / 100 || 0.15,
        seed: randomSeed,
      },
    }
  }
  
  if (returnMode === 'variable') {
    const baseReturns = Object.fromEntries(
      Object.entries(variableReturns).map(([year, rate]) => [parseInt(year), rate / 100]),
    )
    return {
      mode: 'variable',
      variableConfig: {
        yearlyReturns: baseReturns,
      },
    }
  }
  
  if (returnMode === 'historical') {
    return {
      mode: 'historical',
      historicalConfig: {
        indexId: historicalIndex,
      },
    }
  }
  
  if (returnMode === 'multiasset') {
    return {
      mode: 'multiasset',
      multiAssetConfig: multiAssetConfig,
    }
  }
  
  return {
    mode: 'fixed',
    fixedRate: rendite / 100 || 0.05,
  }
}

/**
 * Apply Black Swan event returns to configuration
 */
export function applyBlackSwanReturns(
  returnConfig: ReturnConfiguration,
  blackSwanReturns: Record<number, number> | null,
  returnMode: ReturnMode,
): ReturnConfiguration {
  if (!blackSwanReturns || Object.keys(blackSwanReturns).length === 0 || returnMode !== 'variable') {
    return returnConfig
  }
  
  const baseReturns = (returnConfig.mode === 'variable' && returnConfig.variableConfig?.yearlyReturns) || {}
  const finalReturns = mergeBlackSwanReturns(baseReturns, blackSwanReturns)
  
  return {
    mode: 'variable',
    variableConfig: {
      yearlyReturns: finalReturns,
    },
  }
}

/**
 * Apply inflation scenario return modifiers
 */
export function applyInflationScenarioModifiers(
  returnConfig: ReturnConfiguration,
  inflationScenarioReturnModifiers: Record<number, number> | null,
  returnMode: ReturnMode,
  rendite: number,
): ReturnConfiguration {
  if (!inflationScenarioReturnModifiers || Object.keys(inflationScenarioReturnModifiers).length === 0 || returnMode !== 'variable') {
    return returnConfig
  }
  
  const baseReturns = (returnConfig.mode === 'variable' && returnConfig.variableConfig?.yearlyReturns) || {}
  const modifiedReturns: Record<number, number> = { ...baseReturns }
  
  // Apply return modifiers
  for (const [yearStr, modifier] of Object.entries(inflationScenarioReturnModifiers)) {
    const year = Number(yearStr)
    const baseReturn = modifiedReturns[year] || (rendite / 100)
    modifiedReturns[year] = baseReturn + modifier
  }
  
  return {
    mode: 'variable',
    variableConfig: {
      yearlyReturns: modifiedReturns,
    },
  }
}

/**
 * Prepare variable inflation rates for simulation
 */
export function prepareVariableInflationRates(
  inflationScenarioRates: Record<number, number> | null,
  inflationAktivSparphase: boolean,
  inflationsrateSparphase: number,
  yearToday: number,
  endYear: number,
): Record<number, number> | undefined {
  if (!inflationScenarioRates || Object.keys(inflationScenarioRates).length === 0) {
    return undefined
  }
  
  const baseInflationRate = inflationAktivSparphase ? (inflationsrateSparphase / 100) : 0
  return mergeInflationWithBaseRate(
    baseInflationRate,
    inflationScenarioRates,
    yearToday,
    endYear,
  )
}
