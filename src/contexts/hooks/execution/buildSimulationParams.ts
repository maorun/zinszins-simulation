import type { SimulationAnnualType } from '../../../utils/simulate'
import type { ReturnConfiguration } from '../../../utils/random-returns'
import type { SparplanElement } from '../../../utils/sparplan-utils'
import type { BasiszinsConfiguration } from '../../../services/bundesbank-api'
import type { SimulationExecutionState } from '../useSimulationExecution'
import { buildFinalReturnConfig } from './buildReturnConfiguration'
import { prepareInflationRates } from './prepareSimulationParams'

export interface SimulationConfig {
  returnConfig: ReturnConfiguration
  variableInflationRates: Record<number, number> | undefined
}

export interface RunSimulationParams {
  yearToday: number
  endYear: number
  elements: SparplanElement[]
  returnConfig: ReturnConfiguration
  simulationAnnual: SimulationAnnualType
  steuerlast: number
  teilfreistellungsquote: number
  freibetragPerYear: { [year: number]: number }
  basiszinsConfiguration: BasiszinsConfiguration
  steuerReduzierenEndkapitalSparphase: boolean
  inflationAktivSparphase: boolean
  inflationsrateSparphase: number
  inflationAnwendungSparphase: 'sparplan' | 'gesamtmenge'
  variableInflationRates: Record<number, number>
  guenstigerPruefungAktiv: boolean
  personalTaxRate: number
}

export function buildSimulationConfig(
  state: SimulationExecutionState,
  overwrite: { rendite?: number },
  yearToday: number,
): SimulationConfig {
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

export function buildRunSimulationParams(
  state: SimulationExecutionState,
  yearToday: number,
  returnConfig: ReturnConfiguration,
  variableInflationRates: Record<number, number> | undefined,
): RunSimulationParams {
  return {
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
    variableInflationRates: variableInflationRates || {},
    guenstigerPruefungAktiv: state.guenstigerPruefungAktiv,
    personalTaxRate: state.personalTaxRate,
  }
}
