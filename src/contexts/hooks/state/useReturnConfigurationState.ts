import { useState } from 'react'
import type { ReturnMode } from '../../../utils/random-returns'
import type { SavedConfiguration } from '../../../utils/config-storage'
import type { ExtendedSavedConfiguration } from '../../helpers/config-types'

export interface ReturnConfigurationStateConfig {
  initialConfig: SavedConfiguration
  extendedInitialConfig: ExtendedSavedConfiguration
  defaultConfig: { historicalIndex: string }
}

export function useReturnConfigurationState(config: ReturnConfigurationStateConfig) {
  const { initialConfig, extendedInitialConfig, defaultConfig } = config

  const [returnMode, setReturnMode] = useState<ReturnMode>(initialConfig.returnMode)
  const [averageReturn, setAverageReturn] = useState(initialConfig.averageReturn)
  const [standardDeviation, setStandardDeviation] = useState(initialConfig.standardDeviation)
  const [randomSeed, setRandomSeed] = useState<number | undefined>(initialConfig.randomSeed)
  const [variableReturns, setVariableReturns] = useState<Record<number, number>>(initialConfig.variableReturns)
  const [historicalIndex, setHistoricalIndex] = useState<string>(
    extendedInitialConfig.historicalIndex || defaultConfig.historicalIndex,
  )

  return {
    returnMode,
    setReturnMode,
    averageReturn,
    setAverageReturn,
    standardDeviation,
    setStandardDeviation,
    randomSeed,
    setRandomSeed,
    variableReturns,
    setVariableReturns,
    historicalIndex,
    setHistoricalIndex,
  }
}
