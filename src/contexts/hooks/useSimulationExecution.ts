import { useCallback } from 'react'
import type { SimulationAnnualType } from '../../utils/simulate'
import type { ReturnMode } from '../../utils/random-returns'
import type { SparplanElement } from '../../utils/sparplan-utils'
import type { BasiszinsConfiguration } from '../../services/bundesbank-api'
import type { SimulationData } from '../helpers/config-types'
import { buildFinalReturnConfig } from './execution/buildReturnConfiguration'
import { prepareInflationRates } from './execution/prepareSimulationParams'
import { runSimulation } from './execution/runSimulation'

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

function buildSimulationConfig(
  state: SimulationExecutionState,
  overwrite: { rendite?: number },
  yearToday: number,
) {
  const returnConfig = buildFinalReturnConfig(overwrite, {
    returnMode: state.returnMode,
    rendite: state.rendite,
    averageReturn: state.averageReturn,
    standardDeviation: state.standardDeviation,
    randomSeed: state.randomSeed,
    variableReturns: state.variableReturns,
    historicalIndex: state.historicalIndex,
    multiAssetConfig: state.multiAssetConfig,
    blackSwanReturns: state.blackSwanReturns,
    inflationScenarioReturnModifiers: state.inflationScenarioReturnModifiers,
  })

  const variableInflationRates = prepareInflationRates({
    inflationScenarioRates: state.inflationScenarioRates,
    inflationAktivSparphase: state.inflationAktivSparphase,
    inflationsrateSparphase: state.inflationsrateSparphase,
    yearToday,
    endYear: state.startEnd[0],
  })

  return { returnConfig, variableInflationRates }
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
      const { returnConfig, variableInflationRates } = buildSimulationConfig(state, overwrite, yearToday)

      const result = runSimulation({
        yearToday,
        endYear: state.startEnd[0],
        elements: state.sparplanElemente,
        returnConfig,
        simulationAnnual: state.simulationAnnual,
        steuerlast: state.steuerlast,
        teilfreistellungsquote: state.teilfreistellungsquote,
        freibetragPerYear: state.freibetragPerYear,
        basiszinsConfiguration: state.basiszinsConfiguration,
        steuerReduzierenEndkapitalSparphase: state.steuerReduzierenEndkapitalSparphase,
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
