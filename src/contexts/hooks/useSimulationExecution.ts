import { useCallback } from 'react'
import { simulate, type SimulationAnnualType } from '../../utils/simulate'
import type { ReturnMode, ReturnConfiguration } from '../../utils/random-returns'
import type { SparplanElement } from '../../utils/sparplan-utils'
import type { BasiszinsConfiguration } from '../../services/bundesbank-api'
import type { SimulationData } from '../helpers/config-types'
import {
  buildReturnConfig,
  applyBlackSwanReturns,
  applyInflationScenarioModifiers,
  prepareVariableInflationRates,
} from '../helpers/simulation-helpers'

export interface SimulationExecutionState {
  rendite: number
  returnMode: ReturnMode
  averageReturn: number
  standardDeviation: number
  randomSeed: number | undefined
  variableReturns: Record<number, number>
  historicalIndex: string
  blackSwanReturns: Record<number, number> | null
  inflationScenarioRates: Record<number, number> | null
  inflationScenarioReturnModifiers: Record<number, number> | null
  multiAssetConfig: import('../../../helpers/multi-asset-portfolio').MultiAssetPortfolioConfig
  simulationAnnual: SimulationAnnualType
  sparplanElemente: SparplanElement[]
  startEnd: [number, number]
  steuerlast: number
  teilfreistellungsquote: number
  freibetragPerYear: { [year: number]: number }
  basiszinsConfiguration: BasiszinsConfiguration
  steuerReduzierenEndkapitalSparphase: boolean
  inflationAktivSparphase: boolean
  inflationsrateSparphase: number
  inflationAnwendungSparphase: 'sparplan' | 'gesamtmenge'
  guenstigerPruefungAktiv: boolean
  personalTaxRate: number
}

export function useSimulationExecution(
  state: SimulationExecutionState,
  setIsLoading: (loading: boolean) => void,
  setSimulationData: (data: SimulationData | null) => void,
) {
  const yearToday = new Date().getFullYear()

  const performSimulation = useCallback(async (overwrite: { rendite?: number } = {}) => {
    setIsLoading(true)
    try {
      let returnConfig: ReturnConfiguration

      // Build base return configuration
      if (overwrite.rendite !== undefined) {
        returnConfig = { mode: 'fixed', fixedRate: overwrite.rendite / 100 }
      }
      else {
        returnConfig = buildReturnConfig(
          state.returnMode,
          state.rendite,
          state.averageReturn,
          state.standardDeviation,
          state.randomSeed,
          state.variableReturns,
          state.historicalIndex,
          state.multiAssetConfig,
        )
      }

      // Apply Black Swan returns if active
      returnConfig = applyBlackSwanReturns(returnConfig, state.blackSwanReturns, state.returnMode)

      // Apply inflation scenario return modifiers
      returnConfig = applyInflationScenarioModifiers(
        returnConfig,
        state.inflationScenarioReturnModifiers,
        state.returnMode,
        state.rendite,
      )

      // Prepare variable inflation rates
      const variableInflationRates = prepareVariableInflationRates(
        state.inflationScenarioRates,
        state.inflationAktivSparphase,
        state.inflationsrateSparphase,
        yearToday,
        state.startEnd[0],
      )

      const result = simulate({
        startYear: yearToday,
        endYear: state.startEnd[0],
        elements: state.sparplanElemente,
        returnConfig,
        steuerlast: state.steuerlast / 100,
        simulationAnnual: state.simulationAnnual,
        teilfreistellungsquote: state.teilfreistellungsquote / 100,
        freibetragPerYear: state.freibetragPerYear,
        steuerReduzierenEndkapital: state.steuerReduzierenEndkapitalSparphase,
        basiszinsConfiguration: state.basiszinsConfiguration,
        inflationAktivSparphase: state.inflationAktivSparphase,
        inflationsrateSparphase: state.inflationsrateSparphase,
        inflationAnwendungSparphase: state.inflationAnwendungSparphase,
        variableInflationRates,
        guenstigerPruefungAktiv: state.guenstigerPruefungAktiv,
        personalTaxRate: state.personalTaxRate,
      })

      setSimulationData({
        sparplanElements: result.map(element => ({
          ...element,
        })),
      })
    }
    catch (error) {
      console.error('Simulation error:', error)
    }
    finally {
      setIsLoading(false)
    }
  }, [
    state.rendite,
    state.returnMode,
    state.averageReturn,
    state.standardDeviation,
    state.randomSeed,
    state.variableReturns,
    state.historicalIndex,
    state.blackSwanReturns,
    state.inflationScenarioRates,
    state.inflationScenarioReturnModifiers,
    state.multiAssetConfig,
    state.simulationAnnual,
    state.sparplanElemente,
    state.startEnd,
    yearToday,
    state.steuerlast,
    state.teilfreistellungsquote,
    state.freibetragPerYear,
    state.basiszinsConfiguration,
    state.steuerReduzierenEndkapitalSparphase,
    state.inflationAktivSparphase,
    state.inflationsrateSparphase,
    state.inflationAnwendungSparphase,
    state.guenstigerPruefungAktiv,
    state.personalTaxRate,
    setIsLoading,
    setSimulationData,
  ])

  return { performSimulation }
}
