import { useCallback } from 'react'
import type { SimulationAnnualType } from '../../utils/simulate'
import type { ReturnMode } from '../../utils/random-returns'
import type { SparplanElement } from '../../utils/sparplan-utils'
import type { BasiszinsConfiguration } from '../../services/bundesbank-api'
import type { SimulationData } from '../helpers/config-types'
import { buildSimulationConfig, buildRunSimulationParams } from './execution/buildSimulationParams'
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

export function useSimulationExecution(
  state: SimulationExecutionState,
  setIsLoading: (loading: boolean) => void,
  setSimulationData: (data: SimulationData | null) => void,
) {
  const yearToday = new Date().getFullYear()

  const performSimulation = useCallback(
    async (overwrite: { rendite?: number } = {}) => {
      setIsLoading(true)
      try {
        const { returnConfig, variableInflationRates } = buildSimulationConfig(state, overwrite, yearToday)
        const simulationParams = buildRunSimulationParams(state, yearToday, returnConfig, variableInflationRates)
        const result = runSimulation(simulationParams)
        setSimulationData({ sparplanElements: result })
      }
      catch (error) {
        console.error('Simulation error:', error)
      }
      finally {
        setIsLoading(false)
      }
    },
    // Using individual state properties to avoid unnecessary re-renders
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.rendite, state.returnMode, state.averageReturn, state.standardDeviation, state.randomSeed,
      state.variableReturns, state.historicalIndex, state.blackSwanReturns, state.inflationScenarioRates,
      state.inflationScenarioReturnModifiers, state.multiAssetConfig, state.simulationAnnual,
      state.sparplanElemente, state.startEnd, yearToday, state.steuerlast, state.teilfreistellungsquote,
      state.freibetragPerYear, state.basiszinsConfiguration, state.steuerReduzierenEndkapitalSparphase,
      state.inflationAktivSparphase, state.inflationsrateSparphase, state.inflationAnwendungSparphase,
      state.guenstigerPruefungAktiv, state.personalTaxRate, setIsLoading, setSimulationData],
  )

  return { performSimulation }
}
